'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Product = { model_code: string; serial_number: string; warranty_months: number }
type RegistrationForm = {
  full_name: string; mobile: string; email: string; address: string; city: string; state: string; pin_code: string
  purchase_date: string; invoice_number: string; dealer_name: string; purchase_type: string
  installation_date: string; installation_type: string; installer_name: string; installer_mobile: string
  installation_address: string; installation_city: string; installation_state: string; installation_pin: string
}

const emptyForm: RegistrationForm = {
  full_name:'', mobile:'', email:'', address:'', city:'', state:'', pin_code:'', purchase_date:'', invoice_number:'', dealer_name:'', purchase_type:'Dealer',
  installation_date:'', installation_type:'Professional', installer_name:'', installer_mobile:'', installation_address:'', installation_city:'', installation_state:'', installation_pin:''
}

const displayDate = (value: string) => value ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'

function Row({label, value}: {label:string; value:string}) {
  return <div className="reviewRow"><span>{label}</span><b>{value || '—'}</b></div>
}

export default function RegistrationReviewPage() {
  const params = useParams<{ identifier: string }>()
  const router = useRouter()
  const serial = decodeURIComponent(params.identifier)
  const storageKey = `olitec-registration-${serial}`
  const [product, setProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<RegistrationForm>(emptyForm)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try { setForm({ ...emptyForm, ...JSON.parse(saved) }) } catch { localStorage.removeItem(storageKey) }
    }
    supabase.rpc('get_product_for_registration', { identifier: serial }).then(({data}) => {
      setProduct(data?.[0] || null)
      setLoading(false)
    })
  }, [serial, storageKey])

  if (loading) return <div className="app"><main><section className="card"><p>Loading review…</p></section></main></div>

  return <div className="app">
    <header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div><div className="lang">English⌄</div></header>
    <main>
      <button className="back" onClick={() => router.push(`/register/${encodeURIComponent(serial)}/purchase`)}>← Edit details</button>
      <div className="steps"><div className="step active"><div className="dot">✓</div>Product</div><div className="step active"><div className="dot">✓</div>Details</div><div className="step active"><div className="dot">3</div>Review</div><div className="step"><div className="dot">4</div>Complete</div></div>

      <section className="card"><span className="badge">Review before submission</span><h2 style={{marginTop:12}}>Check your details</h2><p>Please confirm that the information below is correct before completing your OLITEC registration.</p></section>

      <section className="card"><h2>Product</h2><Row label="Model" value={product?.model_code || ''}/><Row label="Serial number" value={product?.serial_number || serial}/><Row label="Warranty" value={product?.warranty_months ? `${product.warranty_months / 12} years` : ''}/></section>

      <section className="card"><h2>Customer details</h2><Row label="Full name" value={form.full_name}/><Row label="Mobile" value={form.mobile}/><Row label="Email" value={form.email}/><Row label="Address" value={form.address}/><Row label="City" value={form.city}/><Row label="State" value={form.state}/><Row label="PIN code" value={form.pin_code}/></section>

      <section className="card"><h2>Purchase details</h2><Row label="Purchase date" value={displayDate(form.purchase_date)}/><Row label="Dealer / seller" value={form.dealer_name}/><Row label="Invoice number" value={form.invoice_number}/><Row label="Purchase type" value={form.purchase_type}/><Row label="Invoice" value="Will be uploaded with registration"/></section>

      <section className="card"><h2>Installation details</h2><Row label="Installation date" value={displayDate(form.installation_date)}/><Row label="Installation type" value={form.installation_type}/><Row label="Installer" value={form.installer_name}/><Row label="Installer mobile" value={form.installer_mobile}/><Row label="Installation address" value={form.installation_address}/></section>

      <div className="note">Your information will be used to create the product registration and warranty record. Final database submission will be enabled in the next backend step.</div>
      <button className="btn primary" style={{marginTop:12}} onClick={() => router.push(`/register/${encodeURIComponent(serial)}/success`)}>Confirm Registration →</button>
    </main>
    <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
  </div>
}
