import { createClient } from 'npm:@supabase/supabase-js@2'

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type, x-worker-token"}
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}})

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  const token=Deno.env.get('NOTIFICATION_WORKER_TOKEN')
  if(!token||req.headers.get('x-worker-token')!==token)return json({error:'Unauthorized'},401)
  const supabase=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const resendKey=Deno.env.get('RESEND_API_KEY')
  if(!resendKey)return json({error:'RESEND_API_KEY is not configured'},500)
  const from=Deno.env.get('EMAIL_FROM')||'OLITEC Service <connect@olitec.in>'
  const portal=Deno.env.get('CUSTOMER_PORTAL_URL')||'https://olitec-service-portal-weld.vercel.app'

  // Service-admin recipient is read from the database so it can be changed from
  // the admin configuration without rebuilding or redeploying the customer portal.
  let configuredAdminEmail:string|undefined
  try{
    const {data:setting}=await supabase.from('notification_settings').select('value').eq('key','service_admin_email').maybeSingle()
    configuredAdminEmail=typeof setting?.value==='string'&&setting.value.trim()?setting.value.trim():undefined
  }catch{}
  configuredAdminEmail ||= Deno.env.get('SERVICE_ADMIN_EMAIL')?.trim() || undefined

  const {data:events,error}=await supabase.from('notification_events').select('*').eq('status','pending').order('created_at').limit(20)
  if(error)return json({error:error.message},500)
  const results=[]
  for(const event of events||[]){
    await supabase.from('notification_events').update({status:'processing',attempts:(event.attempts||0)+1}).eq('id',event.id)
    try{
      let subject='',heading='',body='',cta='',ctaUrl=''
      if(event.event_type==='product_registered'){
        const {data:rows}=await supabase.from('warranty_registrations').select('registration_number,serial_number,model_code,product_name,warranty_start_date,warranty_end_date,full_name,email').eq('registration_number',event.registration_number).order('id')
        const first=rows?.[0]
        if(!first)throw new Error('Registration not found')
        subject=`OLITEC warranty registration confirmed — ${event.registration_number}`
        heading='Your OLITEC product is registered.'
        body=`<p>Hello ${first.full_name},</p><p>Your OLITEC product registration has been successfully completed.</p><p><b>Registration number:</b> ${event.registration_number}</p><table style="width:100%;border-collapse:collapse"><tr><th align="left">Model</th><th align="left">Serial number</th><th align="left">Warranty</th></tr>${(rows||[]).map(r=>`<tr><td style="padding:8px 0">${r.model_code||'OLITEC Product'}</td><td style="padding:8px 0">${r.serial_number}</td><td style="padding:8px 0">${r.warranty_start_date} to ${r.warranty_end_date}</td></tr>`).join('')}</table>`
        cta='View Warranty';ctaUrl=`${portal}/warranty/${encodeURIComponent(event.registration_number)}`
      }else{
        const {data:rows}=await supabase.from('service_complaints').select('*').eq('complaint_number',event.complaint_number).limit(1)
        const c=rows?.[0];if(!c)throw new Error('Complaint not found')
        const closed=event.event_type==='complaint_closed'
        subject=closed?`OLITEC service complaint closed — ${c.complaint_number}`:`OLITEC service complaint received — ${c.complaint_number}`
        heading=closed?'Your service complaint has been closed.':'Your service complaint has been received.'
        body=`<p>Hello ${c.full_name},</p><p>${closed?'Your OLITEC service complaint has been completed.':'We have received your OLITEC service complaint.'}</p><p><b>Complaint number:</b> ${c.complaint_number}<br><b>Registration:</b> ${c.registration_number||'—'}<br><b>Product:</b> ${c.model_code||'OLITEC Product'}<br><b>Serial number:</b> ${c.serial_number}<br><b>Status:</b> ${c.status}</p>${c.assigned_engineer_name?`<p><b>Engineer:</b> ${c.assigned_engineer_name}${c.assigned_engineer_mobile?` · ${c.assigned_engineer_mobile}`:''}</p>`:''}${closed&&c.action_taken?`<p><b>Action taken:</b> ${c.action_taken}</p>`:''}`
        cta=closed?'View Complaint & Feedback':'Track Complaint';ctaUrl=`${portal}/service/track?complaint=${encodeURIComponent(c.complaint_number)}`
      }
      const logo=Deno.env.get('LOGO_URL')||`${portal}/olitec-logo.svg`
      const html=`<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#17233b"><div style="padding:28px 0;border-bottom:1px solid #e8edf3"><img src="${logo}" style="width:150px;height:auto" /></div><div style="padding:28px 0"><h1 style="font-size:28px;margin:0 0 18px">${heading}</h1>${body}<p style="margin-top:26px"><a href="${ctaUrl}" style="display:inline-block;padding:13px 18px;border-radius:8px;background:#07183d;color:white;text-decoration:none;font-weight:bold">${cta} →</a></p></div></div>`
      const to=[event.recipient_email,configuredAdminEmail,event.admin_email].filter((value):value is string=>typeof value==='string'&&value.trim().length>0)
      const uniqueTo=[...new Set(to.map(value=>value.trim()))]
      if(!uniqueTo.length)throw new Error('No notification recipient configured')
      const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resendKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:uniqueTo,subject,html})})
      const rb=await response.text();if(!response.ok)throw new Error(rb||`Resend returned ${response.status}`)
      await supabase.from('notification_events').update({status:'sent',sent_at:new Date().toISOString(),last_error:null}).eq('id',event.id)
      results.push({id:event.id,status:'sent',recipients:uniqueTo})
    }catch(error){
      const message=error instanceof Error?error.message:String(error)
      await supabase.from('notification_events').update({status:'failed',last_error:message}).eq('id',event.id)
      results.push({id:event.id,status:'failed',error:message})
    }
  }
  return json({processed:results.length,results})
})
