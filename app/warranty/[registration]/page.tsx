'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PortalHeader } from '@/components/PortalChrome'

type Warranty = { registration_number: string; serial_number: string; model_code: string; product_name: string | null; capacity_kw: number; warranty_start_date: string; warranty_end_date: string; status: string }
async function getWarranty(identifier: string): Promise<Warranty | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase configuration is missing')
  const response = await fetch(`${url}/rest/v1/rpc/get_warranty_verification`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_registration_number: identifier }), cache: 'no-store' })
  if (!response.ok) throw new Error(`Warranty verification failed (${response.status})`)
  const data = await response.json(); return data?.[0] ?? null
}
const fmt = (v: string) => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function WarrantyVerificationPage() {
  const params = useParams<{ registration: string }>(); const identifier = decodeURIComponent(params.registration)
  const [data, setData] = useState<Warranty | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  useEffect(() => { let active = true; getWarranty(identifier).then(result => { if (active) setData(result) }).catch(err => { console.error(err); if (active) setError('We could not verify this warranty registration right now. Please try again.') }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [identifier])

  return <div className="app customerPage portalWarrantyPage cleanPortalPage">
    <PortalHeader />
    <main className="customerMain cleanMain">
      <button className="customerBack cleanBack" type="button" onClick={() => { window.location.href = '/warranty' }}>← Warranty Lookup</button>
      <section className="customerHero compactHero cleanHeroBanner"><span className="customerEyebrow">WARRANTY STATUS</span><h1>Warranty status.</h1><p>Current warranty information for this OLITEC registration.</p></section>

      {loading && <section className="customerSection cleanPageCard"><p className="customerStatus">Checking warranty details…</p></section>}
      {!loading && error && <section className="customerSection cleanPageCard"><span className="customerBadge customerBadgeWarning">Verification unavailable</span><h2>We could not verify this warranty.</h2><p>{error}</p><button className="customerButton customerButtonPrimary" type="button" onClick={() => window.location.reload()}>Try Again <span>→</span></button></section>}
      {!loading && !error && !data && <section className="customerSection cleanPageCard"><span className="customerBadge customerBadgeWarning">Not found</span><h2>No warranty registration found.</h2><p>Check the registration number or serial number and try again.</p><button className="customerButton customerButtonPrimary" type="button" onClick={() => { window.location.href = '/warranty' }}>Check Again <span>→</span></button></section>}

      {!loading && !error && data && <section className="customerSection warrantyResult cleanPageCard">
        <div className="customerCheck">✓</div><span className="customerBadge customerBadgeSuccess">Verified OLITEC Registration</span><h2>Warranty verified</h2><p>Your registration is recorded in the OLITEC warranty system.</p>
        <div className="cleanWarrantySummary"><div><span>Warranty from</span><strong>{fmt(data.warranty_start_date)}</strong></div><div><span>Warranty till</span><strong>{fmt(data.warranty_end_date)}</strong></div></div>
        <div className="customerInfoList cleanInfoList"><div><span>Registration number</span><strong>{data.registration_number}</strong></div><div><span>Serial number</span><strong>{data.serial_number}</strong></div><div><span>Model</span><strong>{data.model_code}</strong></div><div><span>Product</span><strong>{data.product_name || 'OLITEC Solar Inverter'}</strong></div><div><span>Capacity</span><strong>{data.capacity_kw} kW</strong></div><div><span>Status</span><strong className="statusActive">{data.status === 'active' ? 'Active' : data.status}</strong></div></div>
        <button className="customerButton customerButtonPrimary" type="button" onClick={() => { window.location.href = `/service/complaint?identifier=${encodeURIComponent(data.registration_number)}` }}>Register a Service Complaint <span>→</span></button>
      </section>}
    </main>
  </div>
}
