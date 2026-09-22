'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Product = { product_id: string; serial_number: string; model_code: string; product_name: string; capacity_kw: number; warranty_months: number }

type RegistrationForm = {
  full_name: string; mobile: string; email: string; address: string; city: string; state: string; pin_code: string
  purchase_date: string; invoice_number: string; dealer_name: string; purchase_type: string
  installation_date: string; installation_type: string; installer_name: string; installer_mobile: string
  installation_address: string; installation_city: string; installation_state: string; installation_pin: string
}

async function getProduct(identifier: string): Promise<Product> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !publishableKey) throw new Error('Product verification is not configured.')
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_product_for_registration`, {
    method: 'POST',
    headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
    cache: 'no-store',
  })
  const body = await response.text()
  if (!response.ok) throw new Error(`Product verification failed (${response.status}).`)
  const data = body ? JSON.parse(body) as Product[] : []
  if (!data.length) throw new Error('Product could not be verified. Please go back and scan again.')
  return data[0]
}

export default function PurchaseRegistrationPage() {
  const params = useParams<{ identifier: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<RegistrationForm>({
    full_name: '', mobile: '', email: '', address: '', city: '', state: '', pin_code: '',
    purchase_date: '', invoice_number: '', dealer_name: '', purchase_type: 'Dealer',
    installation_date: '', installation_type: 'Professional', installer_name: '', installer_mobile: '',
    installation_address: '', installation_city: '', installation_state: '', installation_pin: ''
  })

  const serial = decodeURIComponent(params.identifier)
  const storageKey = `olitec-registration-${serial}`

  useEffect(() => {
    let cancelled = false
    async function load() {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try { setForm(JSON.parse(saved) as RegistrationForm) } catch { localStorage.removeItem(storageKey) }
      }
      try {
        const item = await getProduct(serial)
        if (!cancelled) setProduct(item)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Product could not be verified.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [serial, storageKey])

  const update = (key: keyof RegistrationForm, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!product) return
    setError('')
    setSaving(true)
    localStorage.setItem(storageKey, JSON.stringify(form))
    setSaving(false)
    router.push(`/register/${encodeURIComponent(product.serial_number)}/review`)
  }

  if (loading) return <div className="app"><main><section className="card"><p>Loading registration…</p></section></main></div>
  if (error || !product) return <div className="app"><main><section className="card"><h2>Unable to continue</h2><p>{error}</p><button className="btn secondary" onClick={() => router.back()}>Go Back</button></section></main></div>

  return <div className="app">
    <header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div><div className="lang">English⌄</div></header>
    <main>
      <button className="back" onClick={() => router.back()}>← Product Verification</button>
      <div className="steps"><div className="step active"><div className="dot">1</div>Product</div><div className="step active"><div className="dot">2</div>Details</div><div className="step"><div className="dot">3</div>Review</div><div className="step"><div className="dot">4</div>Complete</div></div>
      <section className="card"><span className="badge">✓ {product.model_code} · {product.serial_number}</span><h2 style={{marginTop:12}}>Register your purchase</h2><p>Enter your purchase and installation details to activate your OLITEC warranty.</p></section>

      <form onSubmit={submit}>
        <section className="card"><h2>Customer details</h2>
          <label>Full name <span className="req">*</span></label><input required value={form.full_name} onChange={e=>update('full_name',e.target.value)} placeholder="Enter your full name" />
          <label>Mobile number <span className="req">*</span></label><input required type="tel" inputMode="numeric" pattern="[0-9]{10}" value={form.mobile} onChange={e=>update('mobile',e.target.value.replace(/\D/g,''))} placeholder="10-digit mobile number" />
          <label>Email</label><input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="name@example.com" />
          <label>Address <span className="req">*</span></label><textarea required value={form.address} onChange={e=>update('address',e.target.value)} placeholder="House / Flat, Street, Area" />
          <div className="meta"><div><label>City <span className="req">*</span></label><input required value={form.city} onChange={e=>update('city',e.target.value)} /></div><div><label>PIN code <span className="req">*</span></label><input required inputMode="numeric" pattern="[0-9]{6}" value={form.pin_code} onChange={e=>update('pin_code',e.target.value.replace(/\D/g,''))} /></div></div>
          <label>State <span className="req">*</span></label><input required value={form.state} onChange={e=>update('state',e.target.value)} placeholder="State" />
        </section>

        <section className="card"><h2>Purchase details</h2>
          <label>Purchase date <span className="req">*</span></label><input required type="date" value={form.purchase_date} onChange={e=>update('purchase_date',e.target.value)} />
          <label>Dealer / seller name <span className="req">*</span></label><input required value={form.dealer_name} onChange={e=>update('dealer_name',e.target.value)} placeholder="Dealer or store name" />
          <label>Invoice number</label><input value={form.invoice_number} onChange={e=>update('invoice_number',e.target.value)} placeholder="Invoice number" />
          <label>Purchase type</label><select value={form.purchase_type} onChange={e=>update('purchase_type',e.target.value)}><option>Dealer</option><option>Distributor</option><option>Online</option><option>Other</option></select>
          <label>Invoice upload</label><div className="upload">📄<br/>Upload invoice<br/><small>PDF, JPG or PNG</small></div>
        </section>

        <section className="card"><h2>Installation details</h2>
          <label>Installation date</label><input type="date" value={form.installation_date} onChange={e=>update('installation_date',e.target.value)} />
          <label>Installation type</label><select value={form.installation_type} onChange={e=>update('installation_type',e.target.value)}><option>Professional</option><option>Self installation</option><option>Dealer installation</option></select>
          <label>Installer name</label><input value={form.installer_name} onChange={e=>update('installer_name',e.target.value)} />
          <label>Installer mobile</label><input type="tel" inputMode="numeric" value={form.installer_mobile} onChange={e=>update('installer_mobile',e.target.value.replace(/\D/g,''))} />
          <label>Installation address</label><textarea value={form.installation_address} onChange={e=>update('installation_address',e.target.value)} placeholder="If different from customer address" />
        </section>

        {error && <div className="note">{error}</div>}
        <button className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Continue to Review →'}</button>
      </form>
    </main>
    <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
  </div>
}
