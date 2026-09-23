'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PortalHeader } from '@/components/PortalChrome'

type Product = { model_code: string; serial_number: string; warranty_months: number; capacity_kw?: number; product_name?: string; product_image: string | null; manufacturing_date?: string | null }
type RegistrationForm = {
  full_name: string; mobile: string; email: string; address: string; city: string; state: string; pin_code: string
  purchase_date: string; invoice_number: string; dealer_name: string; purchase_type: string; invoice_path: string; invoice_name: string
  installation_date: string; installation_type: string; installer_name: string; installer_mobile: string
  installation_address: string; installation_city: string; installation_state: string; installation_pin: string
}
const emptyForm: RegistrationForm = { full_name:'', mobile:'', email:'', address:'', city:'', state:'', pin_code:'', purchase_date:'', invoice_number:'', dealer_name:'', purchase_type:'Dealer', invoice_path:'', invoice_name:'', installation_date:'', installation_type:'Professional', installer_name:'', installer_mobile:'', installation_address:'', installation_city:'', installation_state:'', installation_pin:'' }

function productImageUrl(value: string | null | undefined) {
  const raw = value?.trim()
  if (!raw) return '/olitec-generated-hero.jpg'
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (!base) return '/olitec-generated-hero.jpg'
  if (raw.startsWith('storage/v1/')) return `${base}/${raw}`
  if (raw.includes('/')) return `${base}/storage/v1/object/public/${raw}`
  return `${base}/storage/v1/object/public/products/${encodeURIComponent(raw)}`
}

async function getProduct(identifier: string): Promise<Product> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Product verification is not configured.')
  const response = await fetch(`${url}/rest/v1/rpc/get_product_for_registration`, { method:'POST', headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'}, body:JSON.stringify({identifier}), cache:'no-store' })
  const body = await response.text()
  if (!response.ok) throw new Error(`Product verification failed (${response.status}).`)
  const data = body ? JSON.parse(body) as Product[] : []
  if (!data.length) throw new Error('Product could not be verified.')
  return data[0]
}

async function registerPurchase(identifier: string, registration: RegistrationForm) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Registration service is not configured.')
  const response = await fetch(`${url}/rest/v1/rpc/register_product_purchase`, { method:'POST', headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'}, body:JSON.stringify({identifier,registration}), cache:'no-store' })
  const body = await response.text(); let data:any=[]
  try { data = body ? JSON.parse(body) : [] } catch { data=[] }
  if (!response.ok) throw new Error(typeof data?.message === 'string' ? data.message : `Registration failed (${response.status}).`)
  return Array.isArray(data) ? data[0] : data
}

const displayDate = (value:string) => value ? new Date(value+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'
function ReviewRow({label,value}:{label:string;value:string}) { return <div className="rrRow"><span>{label}</span><strong>{value || '—'}</strong></div> }

export default function RegistrationReviewPage() {
  const params = useParams<{ identifier:string }>()
  const router = useRouter()
  const serial = decodeURIComponent(params.identifier)
  const storageKey = `olitec-registration-${serial}`
  const [product,setProduct] = useState<Product|null>(null)
  const [form,setForm] = useState<RegistrationForm>(emptyForm)
  const [loading,setLoading] = useState(true)
  const [submitting,setSubmitting] = useState(false)
  const [error,setError] = useState('')

  useEffect(()=>{
    let cancelled=false
    async function load(){
      const saved=localStorage.getItem(storageKey)
      if(saved){try{setForm({...emptyForm,...JSON.parse(saved)})}catch{localStorage.removeItem(storageKey)}}
      try{const item=await getProduct(serial);if(!cancelled)setProduct(item)}catch(e){if(!cancelled)setError(e instanceof Error?e.message:'Unable to verify product.')}finally{if(!cancelled)setLoading(false)}
    }
    load(); return()=>{cancelled=true}
  },[serial,storageKey])

  async function confirmRegistration(){
    if(!product)return
    setSubmitting(true); setError('')
    try{
      const result=await registerPurchase(serial,form)
      if(!result?.registration_number) throw new Error('Registration was not completed. Please try again.')
      localStorage.removeItem(storageKey)
      router.push(`/register/${encodeURIComponent(serial)}/success?registration=${encodeURIComponent(result.registration_number)}&start=${encodeURIComponent(result.warranty_start_date)}&end=${encodeURIComponent(result.warranty_end_date)}`)
    }catch(e){
      const message=e instanceof Error?e.message:''
      if(message.includes('PRODUCT_ALREADY_REGISTERED:'))setError(`This product is already registered. Registration number: ${message.split('PRODUCT_ALREADY_REGISTERED:')[1]}`)
      else if(message.includes('PRODUCT_NOT_FOUND'))setError('The product could not be verified. Please scan the product QR code again.')
      else if(message.includes('REQUIRED_CUSTOMER_FIELDS_MISSING'))setError('Please return to the form and complete all required customer and dealer details.')
      else setError(message||'Registration could not be completed. Please try again.')
      setSubmitting(false)
    }
  }

  if(loading) return <div className="rrPage"><PortalHeader/><main className="rrMain"><div className="rrCard rrLoading">Loading review…</div></main></div>
  if(error&&!product) return <div className="rrPage"><PortalHeader/><main className="rrMain"><section className="rrCard"><span className="rrBadge rrBadgeWarn">Unable to continue</span><h2>Review could not be loaded.</h2><p>{error}</p><button className="rrConfirm" onClick={()=>router.back()}>Go Back <span>→</span></button></section></main></div>

  return <div className="rrPage">
    <PortalHeader/>
    <main className="rrMain">
      <div className="rrBackRow"><button type="button" className="rrBack" onClick={()=>router.push(`/register/${encodeURIComponent(serial)}/purchase`)}>← Edit details</button></div>
      <section className="rrIntro"><span>FINAL REVIEW</span><h1>Almost complete.</h1><p>Review your details before activating your OLITEC warranty.</p></section>

      <section className="rrCard rrProductCard">
        <div className="rrProductImage"><img src={productImageUrl(product?.product_image)} alt={`${product?.model_code || 'OLITEC'} solar inverter`} onError={e=>{e.currentTarget.src='/olitec-generated-hero.jpg'}}/></div>
        <div className="rrProductInfo">
          <span className="rrBadge">✓ Product verified</span>
          <h2>{product?.model_code}</h2>
          <p>{product?.capacity_kw ? `${product.capacity_kw} kW ` : ''}{product?.product_name || 'OLITEC Solar Inverter'}</p>
          <div className="rrProductRows">
            <ReviewRow label="Serial number" value={product?.serial_number || serial}/>
            <ReviewRow label="Manufactured" value={product?.manufacturing_date ? displayDate(product.manufacturing_date) : '—'}/>
            <ReviewRow label="Warranty" value={product?.warranty_months ? `${product.warranty_months / 12} Years` : '—'}/>
          </div>
        </div>
      </section>

      <section className="rrCard"><span className="rrSectionLabel">Customer details</span><h2>About you</h2><div className="rrRows">
        <ReviewRow label="Full name" value={form.full_name}/><ReviewRow label="Mobile number" value={form.mobile}/><ReviewRow label="Email" value={form.email}/><ReviewRow label="Address" value={form.address}/><ReviewRow label="City" value={form.city}/><ReviewRow label="State" value={form.state}/><ReviewRow label="PIN code" value={form.pin_code}/>
      </div></section>

      <section className="rrCard"><span className="rrSectionLabel">Purchase details</span><h2>Where and when did you buy it?</h2><div className="rrRows">
        <ReviewRow label="Purchase date" value={displayDate(form.purchase_date)}/><ReviewRow label="Dealer / seller" value={form.dealer_name}/><ReviewRow label="Invoice number" value={form.invoice_number}/><ReviewRow label="Purchase type" value={form.purchase_type}/><ReviewRow label="Invoice" value={form.invoice_name || 'Not uploaded'}/>
      </div></section>

      <section className="rrCard"><span className="rrSectionLabel">Installation details</span><h2>Where is it installed?</h2><div className="rrRows">
        <ReviewRow label="Installation date" value={displayDate(form.installation_date)}/><ReviewRow label="Installation type" value={form.installation_type}/><ReviewRow label="Installer" value={form.installer_name}/><ReviewRow label="Installer mobile" value={form.installer_mobile}/><ReviewRow label="Installation address" value={form.installation_address}/><ReviewRow label="City" value={form.installation_city}/><ReviewRow label="State" value={form.installation_state}/><ReviewRow label="PIN code" value={form.installation_pin}/>
      </div></section>

      {error&&<div className="rrError">{error}</div>}
      <button className="rrConfirm" type="button" disabled={submitting} onClick={confirmRegistration}>{submitting?'Registering…':'Confirm Registration'} <span>→</span></button>
    </main>
  </div>
}
