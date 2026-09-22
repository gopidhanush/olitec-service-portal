'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Warranty = {
  registration_number: string
  serial_number: string
  model_code: string
  capacity_kw: number
  warranty_start_date: string
  warranty_end_date: string
  status: string
}

async function getWarranty(registration: string): Promise<Warranty | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase configuration is missing')
  const response = await fetch(`${url}/rest/v1/rpc/get_warranty_verification`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_registration_number: registration }), cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Warranty verification failed (${response.status})`)
  const data = await response.json()
  return data?.[0] ?? null
}

const fmt = (v: string) => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function WarrantyVerificationPage() {
  const params = useParams<{ registration: string }>()
  const registration = decodeURIComponent(params.registration)
  const [data, setData] = useState<Warranty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getWarranty(registration).then(result => { if (active) setData(result) }).catch(err => { console.error(err); if (active) setError('We could not verify this warranty registration right now. Please try again.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [registration])

  return <div className="app"><header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div><div className="lang">Warranty Verification</div></header><main>
    {loading ? <section className="card"><p>Verifying warranty registration…</p></section> : error ? <section className="card"><span className="badge">Verification unavailable</span><h1 style={{marginTop:14}}>Please try again</h1><p>{error}</p></section> : !data ? <section className="card"><span className="badge">Not verified</span><h1 style={{marginTop:14}}>Registration not found</h1><p>Please check the QR code or registration number and try again.</p></section> : <section className="card success">
      <div className="check">✓</div><span className="badge">Verified OLITEC Registration</span><h1 style={{marginTop:16}}>Warranty verified</h1>
      <div className="note" style={{marginTop:18,textAlign:'left'}}><div className="reviewRow"><span>Registration</span><b>{data.registration_number}</b></div><div className="reviewRow"><span>Serial number</span><b>{data.serial_number}</b></div><div className="reviewRow"><span>Model</span><b>{data.model_code}</b></div><div className="reviewRow"><span>Capacity</span><b>{data.capacity_kw} kW</b></div><div className="reviewRow"><span>Warranty period</span><b>{fmt(data.warranty_start_date)} – {fmt(data.warranty_end_date)}</b></div><div className="reviewRow"><span>Status</span><b>{data.status === 'active' ? 'Active' : data.status}</b></div></div>
      <p style={{marginTop:18}}>This page verifies that the registration number is recorded in the OLITEC warranty system.</p>
      <button className="btn primary" style={{marginTop:10}} onClick={() => window.location.href = `/service/complaint?registration=${encodeURIComponent(data.registration_number)}`}>Register a Service Complaint →</button>
    </section>}
  </main><footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer></div>
}
