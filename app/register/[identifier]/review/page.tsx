'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PortalFooter, PortalHeader } from '@/components/PortalChrome'

type Product = { model_code: string; serial_number: string; warranty_months: number }
type RegistrationForm = {
  full_name: string; mobile: string; email: string; address: string; city: string; state: string; pin_code: string
  purchase_date: string; invoice_number: string; dealer_name: string; purchase_type: string
  installation_date: string; installation_type: string; installer_name: string; installer_mobile: string
  installation_address: string; installation_city: string; installation_state: string; installation_pin: string
}
const emptyForm: RegistrationForm = { full_name:'', mobile:'', email:'', address:'', city:'', state:'', pin_code:'', purchase_date:'', invoice_number:'', dealer_name:'', purchase_type:'Dealer', installation_date:'', installation_type:'Professional', installer_name:'', installer_mobile:'', installation_address:'', installation_city:'', installation_state:'', installation_pin:'' }

async function getProduct(identifier: string): Promise<Product> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !publishableKey) throw new Error('Product verification is not configured.')
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_product_for_registration`, { method:'POST', headers:{apikey:publishableKey,Authorization:`Bearer ${publishableKey}`,'Content-Type':'application/json'}, body:JSON.stringify({identifier}), cache:'no-store' })
  const body = await response.text(); if (!response.ok) throw new Error(`Product verification failed (${response.status}).`)
  const data = body ? JSON.parse(body) as Product[] : []; if (!data.length) throw new Error('Product could not be verified.'); return data[0]
}

async function registerPurchase(identifier: string, registration: RegistrationForm) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !publishableKey) throw new Error('Registration service is not configured.')
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/register_product_purchase`, { method:'POST', headers:{apikey:publishableKey,Authorization:`Bearer ${publishableKey}`,'Content-Type':'application/json'}, body:JSON.stringify({identifier,registration}), cache:'no-store' })
  const body = await response.text(); let data:any=[]; try { data = body ? JSON.parse(body) : [] } catch { data=[] }
  if (!response.ok) throw new Error(typeof data?.message === 'string' ? data.message : `Registration failed (${response.status}).`)
  return Array.isArray(data) ? data[0] : data
}

const displayDate = (value:string) => value ? new Date(value+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'
function Row({label,value}:{label:string;value:string}) { return <div className="customerInfoListRow"><span>{label}</span><strong>{value || '—'}</strong></div> }

export default function RegistrationReviewPage() {
  const params = useParams<{ identifier:string }>(); const router = useRouter(); const serial = decodeURIComponent(params.identifier); const storageKey=`olitec-registration-${serial}`
  const [product,setProduct]=useState<Product|null>(null); const [form,setForm]=useState<RegistrationForm>(emptyForm); const [loading,setLoading]=useState(true); const [submitting,setSubmitting]=useState(false); const [error,setError]=useState('')

  useEffect(()=>{ let cancelled=false; async function load(){ const saved=localStorage.getItem(storageKey); if(saved){try{setForm({...emptyForm,...JSON.parse(saved)})}catch{localStorage.removeItem(storageKey)}} try{const item=await getProduct(serial);if(!cancelled)setProduct(item)}catch(e){if(!cancelled)setError(e instanceof Error?e.message:'Unable to verify product.')}finally{if(!cancelled)setLoading(false)} } load(); return()=>{cancelled=true} },[serial,storageKey])

  async function confirmRegistration(){ if(!product)return; setSubmitting(true);setError('');try{const result=await registerPurchase(serial,form);if(!result?.registration_number)throw new Error('Registration was not completed. Please try again.');localStorage.removeItem(storageKey);router.push(`/register/${encodeURIComponent(serial)}/success?registration=${encodeURIComponent(result.registration_number)}&start=${encodeURIComponent(result.warranty_start_date)}&end=${encodeURIComponent(result.warranty_end_date)}`)}catch(e){const message=e instanceof Error?e.message:'';if(message.includes('PRODUCT_ALREADY_REGISTERED:'))setError(`This product is already registered. Registration number: ${message.split('PRODUCT_ALREADY_REGISTERED:')[1]}`);else if(message.includes('PRODUCT_NOT_FOUND'))setError('The product could not be verified. Please scan the product QR code again.');else if(message.includes('REQUIRED_CUSTOMER_FIELDS_MISSING'))setError('Please return to the form and complete all required customer and dealer details.');else setError(message||'Registration could not be completed. Please try again.');setSubmitting(false)}}

  if(loading)return <div className="app customerPage"><PortalHeader/><main className="customerMain"><section className="customerSection"><p className="customerStatus">Loading review…</p></section></main><PortalFooter/></div>
  if(error&&!product)return <div className="app customerPage"><PortalHeader/><main className="customerMain"><section className="customerSection"><span className="customerBadge customerBadgeWarning">Unable to continue</span><h2>Review could not be loaded.</h2><p>{error}</p><button className="customerButton customerButtonPrimary" type="button" onClick={()=>router.back()}>Go Back <span>→</span></button></section></main><PortalFooter/></div>

  return <div className="app customerPage">
    <PortalHeader/>
    <main className="customerMain">
      <button className="customerBack" type="button" onClick={()=>router.push(`/register/${encodeURIComponent(serial)}/purchase`)}>← Edit details</button>
      <div className="customerSteps"><span className="active">1 Product</span><span className="active">2 Details</span><span className="active">3 Review</span><span>4 Complete</span></div>
      <section className="customerHero compactHero"><span className="customerEyebrow">FINAL REVIEW</span><h1>Almost complete.</h1><p>Review the information you entered before activating your OLITEC warranty.</p></section>

      <section className="customerSection"><span className="customerBadge customerBadgeSuccess">Product verified</span><h2>{product?.model_code}</h2><p>Serial number: {product?.serial_number || serial}</p><div className="customerInfoList"><div><span>Warranty</span><strong>{product?.warranty_months ? `${product.warranty_months / 12} years` : '—'}</strong></div></div></section>
      <section className="customerSection"><span className="customerBadge">Customer</span><h2>{form.full_name}</h2><div className="customerInfoList"><Row label="Mobile" value={form.mobile}/><Row label="Email" value={form.email}/><Row label="Address" value={form.address}/><Row label="City" value={form.city}/><Row label="State" value={form.state}/><Row label="PIN code" value={form.pin_code}/></div></section>
      <section className="customerSection"><span className="customerBadge">Purchase</span><h2>{form.dealer_name}</h2><div className="customerInfoList"><Row label="Purchase date" value={displayDate(form.purchase_date)}/><Row label="Invoice number" value={form.invoice_number}/><Row label="Purchase type" value={form.purchase_type}/><Row label="Invoice" value="Will be uploaded with registration"/></div></section>
      <section className="customerSection"><span className="customerBadge">Installation</span><h2>{form.installation_type}</h2><div className="customerInfoList"><Row label="Installation date" value={displayDate(form.installation_date)}/><Row label="Installer" value={form.installer_name}/><Row label="Installer mobile" value={form.installer_mobile}/><Row label="Installation address" value={form.installation_address}/></div></section>
      {error&&<div className="customerError">{error}</div>}
      <button className="customerButton customerButtonPrimary customerSubmit" type="button" disabled={submitting} onClick={confirmRegistration}>{submitting?'Registering…':'Confirm Registration'} <span>→</span></button>
    </main>
    <PortalFooter/>
  </div>
}
