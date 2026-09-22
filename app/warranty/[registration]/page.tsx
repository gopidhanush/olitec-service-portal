'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function WarrantyVerificationPage() {
  const params = useParams<{ registration: string }>()
  const registration = decodeURIComponent(params.registration)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_warranty_verification', { p_registration_number: registration })
      .then(({ data }) => { setData(data?.[0] || null); setLoading(false) })
  }, [registration])

  const fmt = (v: string) => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'

  return <div className="app"><header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div><div className="lang">Warranty Verification</div></header><main>
    {loading ? <section className="card"><p>Verifying warranty registration…</p></section> : !data ? <section className="card"><span className="badge">Not verified</span><h1 style={{marginTop:14}}>Registration not found</h1><p>Please check the QR code or registration number and try again.</p></section> : <section className="card success">
      <div className="check">✓</div><span className="badge">Verified OLITEC Registration</span><h1 style={{marginTop:16}}>Warranty verified</h1>
      <div className="note" style={{marginTop:18,textAlign:'left'}}><div className="reviewRow"><span>Registration</span><b>{data.registration_number}</b></div><div className="reviewRow"><span>Serial number</span><b>{data.serial_number}</b></div><div className="reviewRow"><span>Model</span><b>{data.model_code}</b></div><div className="reviewRow"><span>Capacity</span><b>{data.capacity_kw} kW</b></div><div className="reviewRow"><span>Warranty period</span><b>{fmt(data.warranty_start_date)} – {fmt(data.warranty_end_date)}</b></div><div className="reviewRow"><span>Status</span><b>{data.status === 'active' ? 'Active' : data.status}</b></div></div>
      <p style={{marginTop:18}}>This page verifies that the registration number is recorded in the OLITEC warranty system.</p>
    </section>}
  </main><footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer></div>
}
