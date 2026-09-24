'use client'

import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PortalHeader } from '@/components/PortalChrome'

type ServiceContext = {
  registration_number: string
  serial_number: string
  model_code: string
  product_name: string
  capacity_kw: number
  full_name: string
  mobile: string
  email: string
  address: string
  city: string
  state: string
  pin_code: string
  purchase_date: string
  warranty_start_date: string
  warranty_end_date: string
  warranty_status: string
  complaint_number: string | null
  complaint_status: string | null
  complaint_created_at: string | null
}

type ComplaintForm = {
  serial_number: string
  complaint_type: string
  problem_description: string
  preferred_visit_date: string
  preferred_contact_time: string
  service_address: string
  service_city: string
  service_state: string
  service_pin: string
}

type SubmittedComplaint = {
  complaint_number: string
  registration_number: string
  serial_number: string
  status: string
}

async function getServiceContext(identifier: string): Promise<ServiceContext[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Service portal is not configured.')

  const response = await fetch(`${url}/rest/v1/rpc/get_service_context`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_registration_number: identifier }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Warranty lookup failed (${response.status}).`)
  return ((await response.json()) || []) as ServiceContext[]
}

async function createComplaint(identifier: string, form: ComplaintForm): Promise<SubmittedComplaint> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Service portal is not configured.')

  const response = await fetch(`${url}/rest/v1/rpc/create_service_complaint`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_registration_number: identifier, p_complaint: form }),
    cache: 'no-store',
  })
  const body = await response.text()
  if (!response.ok) throw new Error(body || `Complaint submission failed (${response.status}).`)
  const data = body ? JSON.parse(body) : []
  if (!data?.[0]) throw new Error('Complaint number was not returned. Please try again.')
  return data[0] as SubmittedComplaint
}

const fmt = (value: string) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

const normalStatus = (value?: string | null) => (value || '').trim().toLowerCase()
const hasOpenComplaint = (context: ServiceContext) => Boolean(context.complaint_number && normalStatus(context.complaint_status) !== 'closed')

function ComplaintStatusModal({ context, onClose }: { context: ServiceContext; onClose: () => void }) {
  const status = context.complaint_status || 'received'
  return (
    <div
      role="presentation"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4, 20, 43, .48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="complaint-status-title" style={{ width: 'min(460px, 100%)', background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 24px 80px rgba(4,20,43,.25)' }}>
        <span className="customerBadge customerBadgeWarning">Complaint already registered</span>
        <h2 id="complaint-status-title" style={{ marginTop: 18, marginBottom: 10 }}>Service request in progress</h2>
        <p style={{ margin: 0, lineHeight: 1.6 }}>A service complaint is already registered for this inverter. A new complaint can be registered only after the existing complaint is <strong>closed</strong>.</p>
        <div className="customerInfoList cleanInfoList" style={{ marginTop: 20 }}>
          <div><span>Serial number</span><strong>{context.serial_number}</strong></div>
          <div><span>Complaint number</span><strong>{context.complaint_number}</strong></div>
          <div><span>Current status</span><strong style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</strong></div>
        </div>
        <button className="customerButton customerButtonPrimary" type="button" onClick={onClose} style={{ marginTop: 20 }}>Close <span>×</span></button>
      </div>
    </div>
  )
}

function ComplaintPageContent() {
  const params = useSearchParams()
  const identifier = params.get('identifier') || params.get('registration') || ''
  const requestedSerial = params.get('serial') || ''
  const [contexts, setContexts] = useState<ServiceContext[]>([])
  const [selectedSerial, setSelectedSerial] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState<SubmittedComplaint | null>(null)
  const [complaintAlert, setComplaintAlert] = useState<ServiceContext | null>(null)
  const [form, setForm] = useState<ComplaintForm>({
    serial_number: '', complaint_type: 'Product not working', problem_description: '',
    preferred_visit_date: '', preferred_contact_time: 'Any time', service_address: '',
    service_city: '', service_state: '', service_pin: '',
  })

  useEffect(() => {
    if (!identifier) { setError('Registration number or serial number is missing.'); setLoading(false); return }
    getServiceContext(identifier)
      .then(data => {
        if (!data.length) throw new Error('Registered OLITEC product not found.')
        setContexts(data)
        const requested = data.find(item => item.serial_number.toUpperCase() === requestedSerial.toUpperCase())
        const firstAvailable = data.find(item => !hasOpenComplaint(item))
        const chosen = requested && !hasOpenComplaint(requested) ? requested : firstAvailable
        if (requested && hasOpenComplaint(requested)) setComplaintAlert(requested)
        if (chosen) {
          setSelectedSerial(chosen.serial_number)
          setForm(previous => ({ ...previous, serial_number: chosen.serial_number, service_address: chosen.address || '', service_city: chosen.city || '', service_state: chosen.state || '', service_pin: chosen.pin_code || '' }))
        } else {
          setSelectedSerial('')
          setForm(previous => ({ ...previous, serial_number: '' }))
        }
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Unable to load warranty details.'))
      .finally(() => setLoading(false))
  }, [identifier, requestedSerial])

  const selectedContext = contexts.find(item => item.serial_number === selectedSerial) || contexts.find(item => !hasOpenComplaint(item)) || contexts[0]
  const availableCount = contexts.filter(item => !hasOpenComplaint(item)).length
  const update = (key: keyof ComplaintForm, value: string) => setForm(previous => ({ ...previous, [key]: value }))

  function chooseDevice(context: ServiceContext) {
    if (hasOpenComplaint(context)) { setComplaintAlert(context); return }
    setSelectedSerial(context.serial_number)
    setForm(previous => ({ ...previous, serial_number: context.serial_number, service_address: context.address || '', service_city: context.city || '', service_state: context.state || '', service_pin: context.pin_code || '' }))
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedSerial || !selectedContext || hasOpenComplaint(selectedContext)) {
      if (selectedContext && hasOpenComplaint(selectedContext)) setComplaintAlert(selectedContext)
      else setError('Please select an inverter that does not have an open service complaint.')
      return
    }
    setError('')
    setSaving(true)
    try {
      setSubmitted(await createComplaint(identifier, { ...form, serial_number: selectedSerial }))
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to register complaint.'
      if (message.includes('COMPLAINT_ALREADY_OPEN')) {
        const current = contexts.find(item => item.serial_number === selectedSerial)
        if (current) setComplaintAlert({ ...current, complaint_number: current.complaint_number || 'Existing complaint', complaint_status: current.complaint_status || 'received' })
        setError('This serial number already has an open service complaint. Please wait until it is closed.')
      } else setError(message)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="app customerPage portalComplaintPage cleanPortalPage"><PortalHeader /><main className="customerMain cleanMain"><section className="customerSection cleanPageCard"><p className="customerStatus">Loading registered product…</p></section></main></div>

  if (submitted) return <div className="app customerPage customerComplaintSuccessPage portalComplaintPage cleanPortalPage"><PortalHeader /><main className="customerMain cleanMain"><section className="customerSection customerSuccess cleanPageCard"><div className="customerCheck">✓</div><span className="customerBadge customerBadgeSuccess">Complaint received</span><h1>We're on it.</h1><p>Your service complaint has been registered successfully.</p><div className="customerNumberBox cleanNumberBox"><span>Complaint Number</span><strong>{submitted.complaint_number}</strong><small>Keep this number for tracking and future communication.</small></div><div className="customerInfoList cleanInfoList"><div><span>Registration number</span><strong>{submitted.registration_number}</strong></div><div><span>Fault device serial</span><strong>{submitted.serial_number}</strong></div><div><span>Status</span><strong>{submitted.status || 'Received'}</strong></div></div><button className="customerButton customerButtonPrimary" type="button" onClick={() => { window.location.href = `/service/track?complaint=${encodeURIComponent(submitted.complaint_number)}` }}>Track Complaint <span>→</span></button><button className="customerButton customerButtonSecondary" type="button" onClick={() => { window.location.href = `/warranty/${encodeURIComponent(submitted.registration_number)}` }}>Back to Warranty <span>→</span></button></section></main></div>

  if (error && !selectedContext) return <div className="app customerPage portalComplaintPage cleanPortalPage"><PortalHeader /><main className="customerMain cleanMain"><section className="customerSection cleanPageCard"><span className="customerBadge customerBadgeWarning">Service Support</span><h1>Unable to continue.</h1><p>{error}</p><button className="customerButton customerButtonPrimary" type="button" onClick={() => window.location.reload()}>Try Again <span>→</span></button></section></main></div>

  return (
    <div className="app customerPage portalComplaintPage cleanPortalPage">
      <PortalHeader />
      <main className="customerMain cleanMain">
        <button className="customerBack cleanBack" type="button" onClick={() => window.history.back()}>← Back</button>
        <section className="customerHero compactHero cleanHeroBanner"><span className="customerEyebrow">SERVICE COMPLAINT</span><h1>Register a complaint.</h1><p>Tell us what is happening and our service team will follow up.</p></section>

        <section className="customerSection cleanPageCard">
          <span className="customerBadge customerBadgeSuccess">✓ Warranty verified</span>
          <h2>Select the fault device</h2>
          <p>{contexts.length > 1 ? 'Select the exact inverter with the fault. An inverter with an open complaint cannot be selected until that complaint is closed.' : 'This serial number is the device for this complaint.'}</p>
          {contexts.length > 1 && <div className="complaintDeviceSelector">
            <label>Registered inverter</label>
            <div className="complaintDeviceGrid">
              {contexts.map(context => {
                const blocked = hasOpenComplaint(context)
                return (
                  <label
                    className="complaintDeviceOption"
                    key={context.serial_number}
                    aria-disabled={blocked}
                    onClick={event => { if (blocked) { event.preventDefault(); setComplaintAlert(context) } }}
                    style={blocked ? { opacity: .62, cursor: 'not-allowed', background: '#fff7f5', borderColor: '#f0c6be' } : undefined}
                  >
                    <input type="radio" name="faultDevice" checked={selectedSerial === context.serial_number} disabled={blocked} onChange={() => chooseDevice(context)} />
                    <strong>{context.model_code}</strong>
                    <span>{context.serial_number} · {context.capacity_kw} kW</span>
                    {blocked ? <small style={{ display: 'block', marginTop: 8, color: '#b33a2d', fontWeight: 700 }}>Complaint {context.complaint_number} · {normalStatus(context.complaint_status).replace(/_/g, ' ')}</small> : <small style={{ display: 'block', marginTop: 8, color: '#16874b', fontWeight: 700 }}>Available for service</small>}
                  </label>
                )
              })}
            </div>
          </div>}

          {availableCount === 0 && <div className="customerError" style={{ marginTop: 16 }}>All registered inverters currently have open service complaints. A new complaint can be raised after the relevant complaint is closed.</div>}

          {selectedContext && <>
            <div className="cleanWarrantySummary"><div><span>Warranty from</span><strong>{fmt(selectedContext.warranty_start_date)}</strong></div><div><span>Warranty till</span><strong>{fmt(selectedContext.warranty_end_date)}</strong></div></div>
            <div className="customerInfoList cleanInfoList"><div><span>Registration number</span><strong>{selectedContext.registration_number}</strong></div><div><span>Fault device serial</span><strong>{selectedContext.serial_number}</strong></div><div><span>Model</span><strong>{selectedContext.model_code}</strong></div><div><span>Capacity</span><strong>{selectedContext.capacity_kw} kW</strong></div></div>
          </>}
        </section>

        <form onSubmit={submit}>
          <section className="customerSection cleanPageCard"><span className="customerBadge">Complaint details</span><h2>What is the problem?</h2><label>Complaint type <span className="req">*</span></label><select className="customerInput" required value={form.complaint_type} onChange={event => update('complaint_type', event.target.value)}><option>Product not working</option><option>Low / no output</option><option>Charging problem</option><option>Display / indicator issue</option><option>Noise / overheating</option><option>Installation issue</option><option>Physical damage</option><option>Other</option></select><label>Describe the problem <span className="req">*</span></label><textarea className="customerInput customerTextarea" required minLength={10} value={form.problem_description} onChange={event => update('problem_description', event.target.value)} placeholder="Describe the issue, when it started and any error indication..." /><label>Preferred service visit date</label><input className="customerInput" type="date" value={form.preferred_visit_date} onChange={event => update('preferred_visit_date', event.target.value)} /><label>Preferred contact time</label><select className="customerInput" value={form.preferred_contact_time} onChange={event => update('preferred_contact_time', event.target.value)}><option>Any time</option><option>9 AM – 12 PM</option><option>12 PM – 3 PM</option><option>3 PM – 6 PM</option><option>6 PM – 8 PM</option></select></section>
          <section className="customerSection cleanPageCard"><span className="customerBadge">Service location</span><h2>Where should we visit?</h2><p>Your registered address is pre-filled. Change it if the product is elsewhere.</p><label>Address <span className="req">*</span></label><textarea className="customerInput customerTextarea" required value={form.service_address} onChange={event => update('service_address', event.target.value)} /><div className="customerFormGrid"><div><label>City <span className="req">*</span></label><input className="customerInput" required value={form.service_city} onChange={event => update('service_city', event.target.value)} /></div><div><label>PIN code <span className="req">*</span></label><input className="customerInput" required inputMode="numeric" pattern="[0-9]{6}" value={form.service_pin} onChange={event => update('service_pin', event.target.value.replace(/\D/g, ''))} /></div></div><label>State <span className="req">*</span></label><input className="customerInput" required value={form.service_state} onChange={event => update('service_state', event.target.value)} /></section>
          {error && <div className="customerError">{error}</div>}
          <button className="customerButton customerButtonPrimary customerSubmit" disabled={saving || !selectedSerial || availableCount === 0} type="submit">{saving ? 'Registering complaint…' : 'Submit Service Complaint'} <span>→</span></button>
        </form>
      </main>
      {complaintAlert && <ComplaintStatusModal context={complaintAlert} onClose={() => setComplaintAlert(null)} />}
    </div>
  )
}

function ComplaintPageFallback() { return <div className="app customerPage portalComplaintPage cleanPortalPage"><PortalHeader /><main className="customerMain cleanMain"><section className="customerSection cleanPageCard"><p className="customerStatus">Loading service complaint form…</p></section></main></div> }
export default function ComplaintPage() { return <Suspense fallback={<ComplaintPageFallback />}><ComplaintPageContent /></Suspense> }
