'use client'

import { FormEvent, useEffect, useState } from 'react'
import { PortalFooter, PortalHeader } from '@/components/PortalChrome'

type Complaint = {
  complaint_number: string
  registration_number: string
  serial_number: string
  model_code: string
  product_name: string
  complaint_type: string
  problem_description: string
  status: string
  preferred_visit_date: string | null
  preferred_contact_time: string | null
  service_city: string | null
  service_state: string | null
  created_at: string
}

async function getComplaint(complaintNumber: string): Promise<Complaint | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Service portal is not configured.')
  const response = await fetch(`${url}/rest/v1/rpc/get_complaint_tracking`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_complaint_number: complaintNumber }), cache: 'no-store',
  })
  const body = await response.text()
  if (!response.ok) throw new Error(body || `Complaint lookup failed (${response.status}).`)
  const data = body ? JSON.parse(body) : []
  return data?.[0] ?? null
}

const fmt = (value: string | null | undefined) => value ? new Date(value.includes('T') ? value : `${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const statusLabel: Record<string, string> = { received: 'Received', assigned: 'Assigned', technician_visit: 'Technician Visit', under_service: 'Under Service', resolved: 'Resolved', closed: 'Closed' }
const statusSteps = ['received', 'assigned', 'technician_visit', 'under_service', 'resolved', 'closed']

function ComplaintTimeline({ status }: { status: string }) {
  const current = statusSteps.indexOf(status)
  const activeIndex = current < 0 ? 0 : current
  return (
    <div className="customerTimeline">
      {statusSteps.map((step, index) => (
        <div className={`customerTimelineStep ${index <= activeIndex ? 'active' : ''}`} key={step}>
          <div className="customerTimelineDot">{index <= activeIndex ? '✓' : index + 1}</div>
          <span>{statusLabel[step]}</span>
        </div>
      ))}
    </div>
  )
}

export default function ComplaintTrackingPage() {
  const [number, setNumber] = useState('')
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get('complaint') || ''
    if (!preset) return
    setNumber(preset)
    void lookup(preset)
  }, [])

  async function lookup(value: string) {
    const cleaned = value.trim().toUpperCase()
    if (!cleaned) { setError('Enter your complaint number.'); setComplaint(null); return }
    setLoading(true); setError(''); setComplaint(null)
    try {
      const result = await getComplaint(cleaned)
      if (!result) throw new Error('Complaint not found. Please check the complaint number and try again.')
      setComplaint(result)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to retrieve complaint details.') }
    finally { setLoading(false) }
  }

  function submit(event: FormEvent) { event.preventDefault(); void lookup(number) }

  return (
    <div className="app customerPage">
      <PortalHeader />
      <main className="customerMain">
        <button className="customerBack" type="button" onClick={() => (window.location.href = '/')}>← OLITEC Home</button>
        <section className="customerHero compactHero">
          <span className="customerEyebrow">SERVICE SUPPORT</span>
          <h1>Complaint status.</h1>
          <p>Track the latest status of your OLITEC service request.</p>
        </section>

        <section className="customerSection">
          <span className="customerBadge">Complaint tracking</span>
          <h2>Enter complaint number</h2>
          <form onSubmit={submit}>
            <label>Complaint number</label>
            <input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={number} onChange={e => setNumber(e.target.value.toUpperCase())} placeholder="e.g. OLC-2026-000001" />
            <button className="customerButton customerButtonPrimary" disabled={loading} type="submit">{loading ? 'Checking complaint…' : 'Track Complaint'} <span>→</span></button>
          </form>
        </section>

        {error && <section className="customerSection"><span className="customerBadge customerBadgeWarning">Service Support</span><h2>Unable to find complaint.</h2><p>{error}</p></section>}

        {complaint && (
          <>
            <section className="customerSection customerStatusCard">
              <div className="customerCheck">✓</div>
              <span className="customerBadge customerBadgeSuccess">Complaint found</span>
              <h2>{statusLabel[complaint.status] || complaint.status}</h2>
              <p>Latest status recorded for your OLITEC service request.</p>
              <div className="customerNumberBox"><span>Complaint Number</span><strong>{complaint.complaint_number}</strong></div>
              <ComplaintTimeline status={complaint.status} />
            </section>

            <section className="customerSection">
              <span className="customerBadge">Product</span>
              <h2>{complaint.model_code || 'OLITEC Product'}</h2>
              <div className="customerInfoList">
                <div><span>Product</span><strong>{complaint.product_name || '—'}</strong></div>
                <div><span>Serial number</span><strong>{complaint.serial_number}</strong></div>
                <div><span>Registration</span><strong>{complaint.registration_number || '—'}</strong></div>
              </div>
            </section>

            <section className="customerSection">
              <span className="customerBadge">Complaint details</span>
              <h2>{complaint.complaint_type}</h2>
              <div className="customerInfoList">
                <div><span>Registered</span><strong>{fmt(complaint.created_at)}</strong></div>
                <div><span>Preferred visit</span><strong>{fmt(complaint.preferred_visit_date)}</strong></div>
                <div><span>Contact time</span><strong>{complaint.preferred_contact_time || '—'}</strong></div>
              </div>
              <div className="customerDescription"><span>Problem description</span><p>{complaint.problem_description}</p></div>
            </section>

            <section className="customerSection">
              <span className="customerBadge">Service location</span>
              <p>{[complaint.service_city, complaint.service_state].filter(Boolean).join(', ') || 'Service location will be confirmed by the service team.'}</p>
            </section>
          </>
        )}
      </main>
      <PortalFooter />
    </div>
  )
}
