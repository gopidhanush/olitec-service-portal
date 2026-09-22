'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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

async function getProduct(identifier: string): Promise<Product> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !publishableKey) throw new Error('Product verification is not configured.')
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_product_for_registration`, {
    method: 'POST', headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }), cache: 'no-store'
  })
  const body = await response.text()
  if (!response.ok) throw new Error(`Product verification failed (${response.status}).`)
  const data = body ? JSON.parse(body) as Product[] : []
  if (!data.length) throw new Error('Product could not be verified.')
  return data[0]
}

async function registerPurchase(identifier: string, registration: RegistrationForm) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !publishableKey) throw new Error('Registration service is not configured.')
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/register_product_purchase`, {
    method: 'POST', headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, registration }), cache: 'no-store'
  })
  const body = await response.text()
  let data: any = []
  try { data = body ? JSON.parse(body) : [] } catch { data = [] }
  if (!response.ok) throw new Error(typeof data?.message === 'string' ? data.message : `Registration failed (${response.status}).`)
  return Array.isArray(data) ? data[0] : data
}

const displayDate = (value: string) => value ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'
function Row({label, value}: {label:string; value:string}) { return <div className="reviewRow"><span>{label}</span><b>{value || '—'}</b></div> }

export default function RegistrationReviewPage() {
  const params = useParams<{ identifier: string }>()
  const router = useRouter()
  const serial = decodeURIComponent(params.identifier)
  const storageKey = `olitec-registration-${serial}`
  const [product, setProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<RegistrationForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try { setForm({ ...emptyForm, ...JSON.parse(saved) }) } catch { localStorage.removeItem(storageKey) }
      }
      try {
        const item = await getProduct(serial)
        if (!cancelled) setProduct(item)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to verify product.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [serial, storageKey])

  async function confirmRegistration() {
    if (!product) return
    setSubmitting(true); setError('')
    try {
      const result = await registerPurchase(serial, form)
      if (!result?.registration_number) throw new Error('Registration was not completed. Please try again.')
      localStorage.removeItem(storageKey)
      router.push(`/register/${encodeURIComponent(serial)}/success?registration=${encodeURIComponent(result.registration_number)}&start=${encodeURIComponent(result.warranty_start_date)}&end=${encodeURIComponent(result.warranty_end_date)}`)
    } catch (e) {
      const message = e instanceof Error ? e.message : ''
      if (message.includes('PRODUCT_ALREADY_REGISTERED:')) setError(`This product is already registered. Registration number: ${message.split('PRODUCT_ALREADY_REGISTERED:')[1]}`)
      else if (message.includes('PRODUCT_NOT_FOUND')) setError('The product could not be verified. Please scan the product QR code again.')
      else if (message.includes('REQUIRED_CUSTOMER_FIELDS_MISSING')) setError('Please return to the form and complete all required customer and dealer details.')
      else setError(message || 'Registration could not be completed. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) return <div className="app"><main><section className="card"><p>Loading review…</p></section></main></div>
  if (error && !product) return <div className="app"><main><section className="card"><h2>Unable to load review</h2><p>{error}</p><button className="btn secondary" onClick={() => router.back()}>Go Back</button></section></main></div>

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
      {error && <div className="note" style={{marginTop:12,color:'#9d2d22'}}>{error}</div>}
      <button className="btn primary" style={{marginTop:12}} disabled={submitting} onClick={confirmRegistration}>{submitting ? 'Registering…' : 'Confirm Registration →'}</button>
    </main>
    <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
  </div>
}
