import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-worker-token',
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // The worker token can be stored either as a Supabase secret or in the
  // notification settings table. The database value takes precedence.
  let expectedToken = Deno.env.get('NOTIFICATION_WORKER_TOKEN') || ''

  try {
    const { data } = await supabase.rpc('get_olitec_notification_worker_token')
    if (typeof data === 'string' && data) {
      expectedToken = data
    }
  } catch {
    // Fall back to the environment variable when the RPC is unavailable.
  }

  if (!expectedToken || request.headers.get('x-worker-token') !== expectedToken) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    return jsonResponse({ error: 'RESEND_API_KEY is not configured' }, 500)
  }

  const from =
    Deno.env.get('EMAIL_FROM') || 'OLITEC Service <connect@olitec.in>'
  const portal =
    Deno.env.get('CUSTOMER_PORTAL_URL') ||
    'https://olitec-service-portal-weld.vercel.app'

  const getSetting = async (key: string) => {
    try {
      const { data: setting } = await supabase
        .from('notification_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle()

      return typeof setting?.value === 'string' && setting.value.trim()
        ? setting.value.trim()
        : undefined
    } catch {
      return undefined
    }
  }

  // Notification recipients can be changed from notification_settings.
  // Environment variables are kept as a fallback for deployment changes.
  const serviceAdminEmail =
    (await getSetting('service_admin_email')) ||
    Deno.env.get('SERVICE_ADMIN_EMAIL')?.trim() ||
    undefined

  const productManagerEmail =
    (await getSetting('product_manager_email')) ||
    Deno.env.get('PRODUCT_MANAGER_EMAIL')?.trim() ||
    'admin@olitec.in'

  const serviceInchargeEmail =
    (await getSetting('service_incharge_email')) ||
    Deno.env.get('SERVICE_INCHARGE_EMAIL')?.trim() ||
    'service@olitec.in'

  const { data: events, error } = await supabase
    .from('notification_events')
    .select('*')
    .eq('status', 'pending')
    .order('created_at')
    .limit(20)

  if (error) {
    return jsonResponse({ error: error.message }, 500)
  }

  const results = []

  for (const event of events || []) {
    await supabase
      .from('notification_events')
      .update({
        status: 'processing',
        attempts: (event.attempts || 0) + 1,
      })
      .eq('id', event.id)

    try {
      let subject = ''
      let heading = ''
      let body = ''
      let cta = ''
      let ctaUrl = ''
      let additionalRecipient: string | undefined

      if (event.event_type === 'staff_registered') {
        const staffEmail = String(
          event.staff_email || event.recipient_email || '',
        ).trim()

        if (!staffEmail) {
          throw new Error('Staff email not found')
        }

        subject = `New OLITEC staff account registered — ${staffEmail}`
        heading = 'New staff account requires approval.'
        body = `
          <p>A new staff administration account has been registered for the OLITEC Service &amp; Product Management portal.</p>
          <p><b>Staff email:</b> ${escapeHtml(staffEmail)}</p>
          <p>The account is currently inactive and will remain locked until the Super Admin approves it and assigns the required module access.</p>
        `
        cta = 'Open Admin Portal'
        ctaUrl = `${portal}/admin`
      } else if (event.event_type === 'product_registered') {
        const { data: rows } = await supabase
          .from('warranty_registrations')
          .select(
            'registration_number,serial_number,model_code,product_name,warranty_start_date,warranty_end_date,full_name,email',
          )
          .eq('registration_number', event.registration_number)
          .order('id')

        const first = rows?.[0]
        if (!first) {
          throw new Error('Registration not found')
        }

        subject = `OLITEC warranty registration confirmed — ${event.registration_number}`
        heading = 'Your OLITEC product is registered.'
        body = `
          <p>Hello ${escapeHtml(first.full_name)},</p>
          <p>Your OLITEC product registration has been successfully completed.</p>
          <p><b>Registration number:</b> ${escapeHtml(event.registration_number)}</p>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <th align="left">Model</th>
              <th align="left">Serial number</th>
              <th align="left">Warranty</th>
            </tr>
            ${(rows || [])
              .map(
                (row) => `
                  <tr>
                    <td style="padding:8px 0">${escapeHtml(row.model_code || 'OLITEC Product')}</td>
                    <td style="padding:8px 0">${escapeHtml(row.serial_number)}</td>
                    <td style="padding:8px 0">${escapeHtml(row.warranty_start_date)} to ${escapeHtml(row.warranty_end_date)}</td>
                  </tr>
                `,
              )
              .join('')}
          </table>
        `
        cta = 'View Warranty'
        ctaUrl = `${portal}/warranty/${encodeURIComponent(event.registration_number)}`
        additionalRecipient = productManagerEmail
      } else {
        const { data: rows } = await supabase
          .from('service_complaints')
          .select('*')
          .eq('complaint_number', event.complaint_number)
          .limit(1)

        const complaint = rows?.[0]
        if (!complaint) {
          throw new Error('Complaint not found')
        }

        const closed = event.event_type === 'complaint_closed'

        subject = closed
          ? `OLITEC service complaint closed — ${event.complaint_number}`
          : `OLITEC service complaint received — ${event.complaint_number}`
        heading = closed
          ? 'Your service complaint has been closed.'
          : 'Your service complaint has been received.'

        body = `
          <p>Hello ${escapeHtml(complaint.full_name)},</p>
          <p>${
            closed
              ? 'Your OLITEC service complaint has been completed.'
              : 'We have received your OLITEC service complaint.'
          }</p>
          <p>
            <b>Complaint number:</b> ${escapeHtml(complaint.complaint_number)}<br>
            <b>Registration:</b> ${escapeHtml(complaint.registration_number || '—')}<br>
            <b>Product:</b> ${escapeHtml(complaint.model_code || 'OLITEC Product')}<br>
            <b>Serial number:</b> ${escapeHtml(complaint.serial_number)}<br>
            <b>Status:</b> ${escapeHtml(complaint.status)}
          </p>
          ${
            complaint.assigned_engineer_name
              ? `<p><b>Engineer:</b> ${escapeHtml(complaint.assigned_engineer_name)}${
                  complaint.assigned_engineer_mobile
                    ? ` · ${escapeHtml(complaint.assigned_engineer_mobile)}`
                    : ''
                }</p>`
              : ''
          }
          ${
            closed && complaint.action_taken
              ? `<p><b>Action taken:</b> ${escapeHtml(complaint.action_taken)}</p>`
              : ''
          }
        `

        cta = closed ? 'View Complaint & Feedback' : 'Track Complaint'
        ctaUrl = `${portal}/service/track?complaint=${encodeURIComponent(
          complaint.complaint_number,
        )}`
        additionalRecipient = serviceInchargeEmail
      }

      const logo =
        Deno.env.get('LOGO_URL') || `${portal}/olitec-logo.svg`

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#17233b">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
            <tr>
              <td style="padding:24px 0;border-bottom:1px solid #e8edf3">
                <img src="${escapeHtml(logo)}" alt="OLITEC" width="120" height="32" style="display:block;width:120px;height:32px;max-width:120px;object-fit:contain;border:0" />
              </td>
            </tr>
          </table>
          <div style="padding:28px 0">
            <h1 style="font-size:28px;line-height:1.2;margin:0 0 18px">${escapeHtml(heading)}</h1>
            ${body}
            <p style="margin-top:26px">
              <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:13px 18px;border-radius:8px;background:#07183d;color:white;text-decoration:none;font-weight:bold">${escapeHtml(cta)} →</a>
            </p>
          </div>
        </div>
      `

      const recipients = [
        event.recipient_email,
        serviceAdminEmail,
        additionalRecipient,
        event.admin_email,
      ].filter(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0,
      )

      const uniqueRecipients = [
        ...new Set(recipients.map((value) => value.trim().toLowerCase())),
      ]

      if (!uniqueRecipients.length) {
        throw new Error('No notification recipient configured')
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: uniqueRecipients,
          subject,
          html,
        }),
      })

      const responseBody = await response.text()
      if (!response.ok) {
        throw new Error(responseBody || `Resend returned ${response.status}`)
      }

      await supabase
        .from('notification_events')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', event.id)

      results.push({
        id: event.id,
        status: 'sent',
        recipients: uniqueRecipients,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      await supabase
        .from('notification_events')
        .update({
          status: 'failed',
          last_error: message,
        })
        .eq('id', event.id)

      results.push({
        id: event.id,
        status: 'failed',
        error: message,
      })
    }
  }

  return jsonResponse({
    processed: results.length,
    results,
  })
})
