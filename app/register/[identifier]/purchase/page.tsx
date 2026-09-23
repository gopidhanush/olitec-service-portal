'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PortalFooter, PortalHeader } from '@/components/PortalChrome'

type Product = { product_id: string; serial_number: string; model_code: string; product_name: string; capacity_kw: number; warranty_months: number; product_image: string | null }
type RegistrationForm = {
  full_name: string; mobile: string; email: string; address: string; city: string; state: string; pin_code: string
  purchase_date: string; invoice_number: string; dealer_name: string; purchase_type: string; invoice_path: string; invoice_name: string
  installation_date: string; installation_type: string; installer_name: string; installer_mobile: string
  installation_address: string; installation_city: string; installation_state: string; installation_pin: string
}

function productImageUrl(value: string | null | undefined) {
  const raw = value?.trim()
  if (!raw) return '/olitec-generated-hero.jpg'
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (!supabaseUrl) return '/olitec-generated-hero.jpg'
  if (raw.startsWith('storage/v1/')) return `${supabaseUrl}/${raw}`
  if (raw.includes('/')) return `${supabaseUrl}/storage/v1/object/public/${raw}`
  return `${supabaseUrl}/storage/v1/object/public/products/${encodeURIComponent(raw)}`
}

async function getProduct(identifier: string): Promise<Product> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !publishableKey) throw new Error('Product verification is not configured.')
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_product_for_registration`, {
    method: 'POST', headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }), cache: 'no-store',
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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState<RegistrationForm>({
    full_name: '', mobile: '', email: '', address: '', city: '', state: '', pin_code: '',
    purchase_date: '', invoice_number: '', dealer_name: '', purchase_type: 'Dealer', invoice_path: '', invoice_name: '',
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
        try { setForm(prev => ({ ...prev, ...(JSON.parse(saved) as Partial<RegistrationForm>) })) }
        catch { localStorage.removeItem(storageKey) }
      }
      try { const item = await getProduct(serial); if (!cancelled) setProduct(item) }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Product could not be verified.') }
      finally { if (!cancelled) setLoading(false) }
    }
    load(); return () => { cancelled = true }
  }, [serial, storageKey])

  const update = (key: keyof RegistrationForm, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleInvoiceChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError('')
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setUploadError('Please upload a PDF, JPG or PNG file.')
      event.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Invoice must be 10 MB or smaller.')
      event.target.value = ''
      return
    }

    setUploading(true)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120)
      const path = `${serial}/${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('invoices').upload(path, file, {
        cacheControl: '3600', upsert: false, contentType: file.type,
      })
      if (uploadError) throw new Error(uploadError.message)
      setForm(prev => ({ ...prev, invoice_path: path, invoice_name: file.name }))
    } catch (reason) {
      setUploadError(reason instanceof Error ? `Invoice upload failed: ${reason.message}` : 'Invoice upload failed. Please try again.')
      event.target.value = ''
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!product) return
    setError(''); setSaving(true)
    localStorage.setItem(storageKey, JSON.stringify(form))
    setSaving(false)
    router.push(`/register/${encodeURIComponent(product.serial_number)}/review`)
  }

  if (loading) return <div className="app customerPage"><PortalHeader /><main className="customerMain"><section className="customerSection"><p className="customerStatus">Loading registration…</p></section></main><PortalFooter /></div>
  if (error || !product) return <div className="app customerPage"><PortalHeader /><main className="customerMain"><section className="customerSection"><span className="customerBadge customerBadgeWarning">Unable to continue</span><h2>Product verification failed.</h2><p>{error}</p><button className="customerButton customerButtonPrimary" type="button" onClick={() => router.back()}>Go Back <span>→</span></button></section></main><PortalFooter /></div>

  return (
    <div className="app customerPage">
      <PortalHeader />
      <main className="customerMain">
        <button className="customerBack" type="button" onClick={() => router.back()}>← Product Verification</button>
        <div className="customerSteps"><span className="active">1 Product</span><span className="active">2 Details</span><span>3 Review</span><span>4 Complete</span></div>

        <section className="customerHero compactHero">
          <span className="customerEyebrow">PRODUCT REGISTRATION</span>
          <h1>Register your purchase.</h1>
          <p>Enter your purchase and installation details to activate your OLITEC warranty.</p>
        </section>

        <section className="customerSection customerProductSummary">
          <div className="customerProductImage">
            <img src={productImageUrl(product.product_image)} alt={`${product.model_code} solar inverter`} onError={event => { event.currentTarget.src = '/olitec-generated-hero.jpg' }} />
          </div>
          <span className="customerBadge customerBadgeSuccess">✓ {product.model_code}</span>
          <h2>{product.serial_number}</h2>
          <p>{product.capacity_kw} kW {product.product_name}</p>
        </section>

        <form onSubmit={submit}>
          <section className="customerSection">
            <span className="customerBadge">Customer details</span>
            <h2>About you</h2>
            <label>Full name <span className="req">*</span></label><input className="customerInput" required value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Enter your full name" />
            <label>Mobile number <span className="req">*</span></label><input className="customerInput" required type="tel" inputMode="numeric" pattern="[0-9]{10}" value={form.mobile} onChange={e => update('mobile', e.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" />
            <label>Email</label><input className="customerInput" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="name@example.com" />
            <label>Address <span className="req">*</span></label><textarea className="customerInput customerTextarea" required value={form.address} onChange={e => update('address', e.target.value)} placeholder="House / Flat, Street, Area" />
            <div className="customerFormGrid"><div><label>City <span className="req">*</span></label><input className="customerInput" required value={form.city} onChange={e => update('city', e.target.value)} /></div><div><label>PIN code <span className="req">*</span></label><input className="customerInput" required inputMode="numeric" pattern="[0-9]{6}" value={form.pin_code} onChange={e => update('pin_code', e.target.value.replace(/\D/g, ''))} /></div></div>
            <label>State <span className="req">*</span></label><input className="customerInput" required value={form.state} onChange={e => update('state', e.target.value)} placeholder="State" />
          </section>

          <section className="customerSection">
            <span className="customerBadge">Purchase details</span>
            <h2>Where and when did you buy it?</h2>
            <label>Purchase date <span className="req">*</span></label><input className="customerInput" required type="date" value={form.purchase_date} onChange={e => update('purchase_date', e.target.value)} />
            <label>Dealer / seller name <span className="req">*</span></label><input className="customerInput" required value={form.dealer_name} onChange={e => update('dealer_name', e.target.value)} placeholder="Dealer or store name" />
            <label>Invoice number</label><input className="customerInput" value={form.invoice_number} onChange={e => update('invoice_number', e.target.value)} placeholder="Invoice number" />
            <label>Purchase type</label><select className="customerInput" value={form.purchase_type} onChange={e => update('purchase_type', e.target.value)}><option>Dealer</option><option>Distributor</option><option>Online</option><option>Other</option></select>
            <label>Invoice upload</label>
            <div className="customerUploadBox">
              <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={handleInvoiceChange} disabled={uploading} aria-label="Upload invoice" />
              <div className="customerUploadContent">
                <div className="customerUploadIcon">↥</div>
                <div className="customerUploadText"><strong>{uploading ? 'Uploading invoice…' : 'Upload invoice'}</strong><span>Click or tap to choose a PDF, JPG or PNG</span><small>Maximum file size: 10 MB</small></div>
              </div>
              {form.invoice_name && <div className="customerUploadFile">✓ {form.invoice_name}</div>}
            </div>
            {uploadError && <div className="customerUploadError">{uploadError}</div>}
          </section>

          <section className="customerSection">
            <span className="customerBadge">Installation</span>
            <h2>Installation details</h2>
            <label>Installation date</label><input className="customerInput" type="date" value={form.installation_date} onChange={e => update('installation_date', e.target.value)} />
            <label>Installation type</label><select className="customerInput" value={form.installation_type} onChange={e => update('installation_type', e.target.value)}><option>Professional</option><option>Self installation</option><option>Dealer installation</option></select>
            <label>Installer name</label><input className="customerInput" value={form.installer_name} onChange={e => update('installer_name', e.target.value)} />
            <label>Installer mobile</label><input className="customerInput" type="tel" inputMode="numeric" value={form.installer_mobile} onChange={e => update('installer_mobile', e.target.value.replace(/\D/g, ''))} />
            <label>Installation address</label><textarea className="customerInput customerTextarea" value={form.installation_address} onChange={e => update('installation_address', e.target.value)} placeholder="If different from customer address" />
          </section>

          {error && <div className="customerError">{error}</div>}
          <button className="customerButton customerButtonPrimary customerSubmit" disabled={saving || uploading}>{saving ? 'Saving…' : uploading ? 'Uploading invoice…' : 'Continue to Review'} <span>→</span></button>
        </form>
      </main>
      <PortalFooter />
    </div>
  )
}
