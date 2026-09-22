'use client'

import { FormEvent, useEffect, useState } from 'react'


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
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_complaint_number: complaintNumber }),
    cache: 'no-store',
  })

  const body = await response.text()
  if (!response.ok) throw new Error(body || `Complaint lookup failed (${response.status}).`)
  const data = body ? JSON.parse(body) : []
  return data?.[0] ?? null
}

const fmt = (value: string | null | undefined) =>
  value
    ? new Date(value.includes('T') ? value : `${value}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'

const statusLabel: Record<string, string> = {
  received: 'Received',
  assigned: 'Assigned',
  technician_visit: 'Technician Visit',
  under_service: 'Under Service',
  resolved: 'Resolved',
  closed: 'Closed',
}

const statusSteps = ['received', 'assigned', 'technician_visit', 'under_service', 'resolved', 'closed']

function ComplaintTimeline({ status }: { status: string }) {
  const current = statusSteps.indexOf(status)
  const activeIndex = current < 0 ? 0 : current

  return (
    <div className="steps" style={{ marginTop: 20 }}>
      {statusSteps.map((step, index) => (
        <div className={`step ${index <= activeIndex ? 'active' : ''}`} key={step}>
          <div className="dot">{index <= activeIndex ? '✓' : index + 1}</div>
          {statusLabel[step]}
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
    const params = new URLSearchParams(window.location.search)
    const preset = params.get('complaint') || ''
    if (!preset) return
    setNumber(preset)
    void lookup(preset)
  }, [])

  async function lookup(value: string) {
    const cleaned = value.trim().toUpperCase()
    if (!cleaned) {
      setError('Enter your complaint number.')
      setComplaint(null)
      return
    }

    setLoading(true)
    setError('')
    setComplaint(null)
    try {
      const result = await getComplaint(cleaned)
      if (!result) throw new Error('Complaint not found. Please check the complaint number and try again.')
      setComplaint(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to retrieve complaint details.')
    } finally {
      setLoading(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    void lookup(number)
  }

  return (
    <div className="app">
      <header>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 1 }}>OLITEC</div>
        <div className="lang">Service Support</div>
      </header>

      <main>
        <button className="back" onClick={() => (window.location.href = '/')}>← OLITEC Home</button>

        <section className="card">
          <span className="badge">Service Support</span>
          <h1 style={{ marginTop: 14 }}>Track your complaint</h1>
          <p>Enter the complaint number given after your service request was registered.</p>

          <form onSubmit={submit}>
            <label>Complaint number <span className="req">*</span></label>
            <input
              required
              autoCapitalize="characters"
              autoComplete="off"
              value={number}
              onChange={e => setNumber(e.target.value.toUpperCase())}
              placeholder="e.g. OLC-2026-000001"
            />
            <button className="btn primary" disabled={loading} style={{ marginTop: 14 }}>
              {loading ? 'Checking complaint…' : 'Track Complaint →'}
            </button>
          </form>
        </section>

        {error && (
          <section className="card">
            <span className="badge">Service Support</span>
            <h2 style={{ marginTop: 12 }}>Unable to find complaint</h2>
            <p>{error}</p>
          </section>
        )}

        {complaint && (
          <>
            <section className="card success">
              <div className="check">✓</div>
              <span className="badge">Complaint found</span>
              <h1 style={{ marginTop: 16 }}>{statusLabel[complaint.status] || complaint.status}</h1>
              <p>Here is the latest status recorded for your OLITEC service request.</p>
              <div className="note" style={{ marginTop: 18 }}>
                <b>Complaint Number</b><br />
                <strong style={{ fontSize: 24 }}>{complaint.complaint_number}</strong>
              </div>
              <ComplaintTimeline status={complaint.status} />
            </section>

            <section className="card">
              <h2>Product</h2>
              <div className="note" style={{ marginTop: 12, textAlign: 'left' }}>
                <div className="reviewRow"><span>Model</span><b>{complaint.model_code || '—'}</b></div>
                <div className="reviewRow"><span>Product</span><b>{complaint.product_name || '—'}</b></div>
                <div className="reviewRow"><span>Serial number</span><b>{complaint.serial_number}</b></div>
                <div className="reviewRow"><span>Registration</span><b>{complaint.registration_number || '—'}</b></div>
              </div>
            </section>

            <section className="card">
              <h2>Complaint details</h2>
              <div className="note" style={{ marginTop: 12, textAlign: 'left' }}>
                <div className="reviewRow"><span>Type</span><b>{complaint.complaint_type}</b></div>
                <div className="reviewRow"><span>Registered</span><b>{fmt(complaint.created_at)}</b></div>
                <div className="reviewRow"><span>Preferred visit</span><b>{fmt(complaint.preferred_visit_date)}</b></div>
                <div className="reviewRow"><span>Contact time</span><b>{complaint.preferred_contact_time || '—'}</b></div>
                <div style={{ paddingTop: 14 }}><span style={{ color: '#697386' }}>Problem description</span><p style={{ marginBottom: 0 }}>{complaint.problem_description}</p></div>
              </div>
            </section>

            <section className="card">
              <h2>Service location</h2>
              <p>{[complaint.service_city, complaint.service_state].filter(Boolean).join(', ') || 'Service location will be confirmed by the service team.'}</p>
            </section>
          </>
        )}
      </main>

      <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
    </div>
  )
}
