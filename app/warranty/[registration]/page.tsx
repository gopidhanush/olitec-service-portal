'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PortalFooter, PortalHeader } from '@/components/PortalChrome'

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

  return (
    <div className="app customerPage">
      <PortalHeader />
      <main className="customerMain">
        <button className="customerBack" type="button" onClick={() => (window.location.href = '/warranty')}>← Warranty Lookup</button>
        <section className="customerHero compactHero">
          <span className="customerEyebrow">WARRANTY VERIFICATION</span>
          <h1>Warranty status.</h1>
          <p>Here is the current warranty information for this OLITEC registration.</p>
        </section>

        {loading && <section className="customerSection"><p className="customerStatus">Verifying warranty registration…</p></section>}

        {!loading && error && (
          <section className="customerSection">
            <span className="customerBadge customerBadgeWarning">Verification unavailable</span>
            <h2>We could not verify this registration.</h2>
            <p>{error}</p>
            <button className="customerButton customerButtonPrimary" type="button" onClick={() => window.location.reload()}>Try Again <span>→</span></button>
          </section>
        )}

        {!loading && !error && !data && (
          <section className="customerSection">
            <span className="customerBadge">Not verified</span>
            <h2>Registration not found.</h2>
            <p>Please check the QR code or registration number and try again.</p>
            <button className="customerButton customerButtonPrimary" type="button" onClick={() => (window.location.href = '/warranty')}>Check Another Registration <span>→</span></button>
          </section>
        )}

        {!loading && !error && data && (
          <>
            <section className="customerSection warrantyResult">
              <div className="customerCheck">✓</div>
              <span className="customerBadge customerBadgeSuccess">Verified OLITEC Registration</span>
              <h2>Warranty verified</h2>
              <p>Your registration is recorded in the OLITEC warranty system.</p>

              <div className="customerInfoList">
                <div><span>Registration</span><strong>{data.registration_number}</strong></div>
                <div><span>Serial number</span><strong>{data.serial_number}</strong></div>
                <div><span>Model</span><strong>{data.model_code}</strong></div>
                <div><span>Capacity</span><strong>{data.capacity_kw} kW</strong></div>
                <div><span>Warranty period</span><strong>{fmt(data.warranty_start_date)} – {fmt(data.warranty_end_date)}</strong></div>
                <div><span>Status</span><strong className="statusActive">{data.status === 'active' ? 'Active' : data.status}</strong></div>
              </div>

              <button className="customerButton customerButtonPrimary" type="button" onClick={() => window.location.href = `/service/complaint?registration=${encodeURIComponent(data.registration_number)}`}>
                Register a Service Complaint <span>→</span>
              </button>
            </section>
          </>
        )}
      </main>
      <PortalFooter />
    </div>
  )
}
