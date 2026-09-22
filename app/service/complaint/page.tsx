'use client'

import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type ServiceContext = {
  registration_number: string; serial_number: string; model_code: string; product_name: string
  capacity_kw: number; full_name: string; mobile: string; email: string; address: string
  city: string; state: string; pin_code: string; purchase_date: string
  warranty_start_date: string; warranty_end_date: string; warranty_status: string
}

type ComplaintForm = {
  complaint_type: string; problem_description: string; preferred_visit_date: string
  preferred_contact_time: string; service_address: string; service_city: string
  service_state: string; service_pin: string
}

async function getServiceContext(registration: string): Promise<ServiceContext | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Service portal is not configured.')
  const response = await fetch(`${url}/rest/v1/rpc/get_service_context`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_registration_number: registration }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Warranty lookup failed (${response.status}).`)
  const data = await response.json()
  return data?.[0] ?? null
}

async function createComplaint(registration: string, form: ComplaintForm) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Service portal is not configured.')
  const response = await fetch(`${url}/rest/v1/rpc/create_service_complaint`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_registration_number: registration, p_complaint: form }),
    cache: 'no-store',
  })
  const body = await response.text()
  if (!response.ok) throw new Error(body || `Complaint submission failed (${response.status}).`)
  const data = body ? JSON.parse(body) : []
  if (!data?.[0]) throw new Error('Complaint number was not returned. Please try again.')
  return data[0] as { complaint_number: string; registration_number: string; serial_number: string; status: string }
}

const fmt = (v: string) => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

function ComplaintPageContent() {
  const params = useSearchParams()
  const registration = params.get('registration') || ''
  const [context, setContext] = useState<ServiceContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState<{ complaint_number: string; status: string } | null>(null)
  const [form, setForm] = useState<ComplaintForm>({
    complaint_type: 'Product not working', problem_description: '', preferred_visit_date: '',
    preferred_contact_time: 'Any time', service_address: '', service_city: '', service_state: '', service_pin: ''
  })

  useEffect(() => {
    if (!registration) { setError('Warranty registration number is missing.'); setLoading(false); return }
    getServiceContext(registration).then((data) => {
      if (!data) throw new Error('Warranty registration not found.')
      setContext(data)
      setForm(prev => ({ ...prev, service_address: data.address, service_city: data.city, service_state: data.state, service_pin: data.pin_code }))
    }).catch((e) => setError(e instanceof Error ? e.message : 'Unable to load warranty details.')).finally(() => setLoading(false))
  }, [registration])

  const update = (key: keyof ComplaintForm, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const result = await createComplaint(registration, form)
      setSubmitted(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to register complaint.')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="app"><main><section className="card"><p>Loading warranty details…</p></section></main></div>

  if (submitted) return <div className="app"><header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div><div className="lang">Service Support</div></header><main><section className="card success"><div className="check">✓</div><span className="badge">Complaint received</span><h1 style={{marginTop:16}}>We're on it</h1><p>Your service complaint has been registered successfully.</p><div className="note" style={{marginTop:18}}><b>Complaint Number</b><br/><strong style={{fontSize:24}}>{submitted.complaint_number}</strong><br/><small>Keep this number for tracking and future communication.</small></div><div className="note" style={{marginTop:12,textAlign:'left'}}><div className="reviewRow"><span>Registration</span><b>{registration}</b></div><div className="reviewRow"><span>Serial number</span><b>{context?.serial_number}</b></div><div className="reviewRow"><span>Status</span><b>Received</b></div></div><button className="btn primary" style={{marginTop:18}} onClick={() => window.location.href = `/warranty/${encodeURIComponent(registration)}`}>Back to Warranty</button></section></main><footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer></div>

  if (error || !context) return <div className="app"><main><section className="card"><span className="badge">Service Support</span><h1 style={{marginTop:14}}>Unable to continue</h1><p>{error}</p></section></main></div>

  return <div className="app"><header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div><div className="lang">Service Support</div></header><main>
    <button className="back" onClick={() => window.history.back()}>← Warranty Verification</button>
    <div className="steps"><div className="step active"><div className="dot">1</div>Product</div><div className="step active"><div className="dot">2</div>Complaint</div><div className="step"><div className="dot">3</div>Submitted</div></div>
    <section className="card"><span className="badge">✓ Warranty registration verified</span><h2 style={{marginTop:12}}>Register a service complaint</h2><p>Tell us what is happening and our service team can follow up.</p><div className="note" style={{marginTop:14,textAlign:'left'}}><div className="reviewRow"><span>Product</span><b>{context.model_code}</b></div><div className="reviewRow"><span>Serial number</span><b>{context.serial_number}</b></div><div className="reviewRow"><span>Warranty</span><b>{fmt(context.warranty_start_date)} – {fmt(context.warranty_end_date)}</b></div></div></section>

    <form onSubmit={submit}><section className="card"><h2>Complaint details</h2>
      <label>Complaint type <span className="req">*</span></label><select required value={form.complaint_type} onChange={e=>update('complaint_type',e.target.value)}><option>Product not working</option><option>Low / no output</option><option>Charging problem</option><option>Display / indicator issue</option><option>Noise / overheating</option><option>Installation issue</option><option>Physical damage</option><option>Other</option></select>
      <label>Describe the problem <span className="req">*</span></label><textarea required minLength={10} value={form.problem_description} onChange={e=>update('problem_description',e.target.value)} placeholder="Please describe the issue, when it started and any error indication..." />
      <label>Preferred service visit date</label><input type="date" value={form.preferred_visit_date} onChange={e=>update('preferred_visit_date',e.target.value)} />
      <label>Preferred contact time</label><select value={form.preferred_contact_time} onChange={e=>update('preferred_contact_time',e.target.value)}><option>Any time</option><option>9 AM – 12 PM</option><option>12 PM – 3 PM</option><option>3 PM – 6 PM</option><option>6 PM – 8 PM</option></select>
    </section>

    <section className="card"><h2>Service location</h2><p>We have pre-filled the registered address. Change it if the product is currently at another location.</p>
      <label>Address <span className="req">*</span></label><textarea required value={form.service_address} onChange={e=>update('service_address',e.target.value)} />
      <div className="meta"><div><label>City <span className="req">*</span></label><input required value={form.service_city} onChange={e=>update('service_city',e.target.value)} /></div><div><label>PIN code <span className="req">*</span></label><input required inputMode="numeric" pattern="[0-9]{6}" value={form.service_pin} onChange={e=>update('service_pin',e.target.value.replace(/\D/g,''))} /></div></div>
      <label>State <span className="req">*</span></label><input required value={form.service_state} onChange={e=>update('service_state',e.target.value)} />
    </section>

    {error && <div className="note">{error}</div>}<button className="btn primary" disabled={saving}>{saving ? 'Registering complaint…' : 'Submit Service Complaint →'}</button>
    </form>
  </main><footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer></div>
}

function ComplaintPageFallback() {
  return <div className="app"><main><section className="card"><p>Loading service complaint form…</p></section></main></div>
}

export default function ComplaintPage() {
  return <Suspense fallback={<ComplaintPageFallback />}><ComplaintPageContent /></Suspense>
}
