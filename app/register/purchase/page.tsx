'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Product = { product_id: string; serial_number: string; model_code: string; product_name: string; capacity_kw: number; warranty_months: number }
type RegistrationForm = {
  full_name:string; mobile:string; email:string; address:string; city:string; state:string; pin_code:string
  purchase_date:string; invoice_number:string; dealer_name:string; purchase_type:string
  installation_date:string; installation_type:string; installer_name:string; installer_mobile:string
  installation_address:string; installation_city:string; installation_state:string; installation_pin:string
}
const emptyForm:RegistrationForm={full_name:'',mobile:'',email:'',address:'',city:'',state:'',pin_code:'',purchase_date:'',invoice_number:'',dealer_name:'',purchase_type:'Dealer',installation_date:'',installation_type:'Professional',installer_name:'',installer_mobile:'',installation_address:'',installation_city:'',installation_state:'',installation_pin:''}

async function getProduct(identifier:string):Promise<Product>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url||!key) throw new Error('Product verification is not configured.')
  const r=await fetch(`${url}/rest/v1/rpc/get_product_for_registration`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({identifier}),cache:'no-store'})
  const text=await r.text(); if(!r.ok) throw new Error(`Product verification failed (${r.status}).`)
  const data=text?JSON.parse(text) as Product[]:[]; if(!data.length) throw new Error('Product could not be verified. Please go back and scan again.')
  return data[0]
}

function StepBar(){return <div className="regSteps"><div className="regStep active"><div className="regStepDot">✓</div>Product</div><div className="regStep active"><div className="regStepDot">2</div>Details</div><div className="regStep"><div className="regStepDot">3</div>Review</div><div className="regStep"><div className="regStepDot">4</div>Complete</div></div>}
function SectionTitle({children}:{children:React.ReactNode}){return <h2 className="regSectionTitle">{children}</h2>}

export default function PurchaseRegistrationPage(){
  const router=useRouter(); const [serial,setSerial]=useState(''); const [product,setProduct]=useState<Product|null>(null); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState(''); const [form,setForm]=useState<RegistrationForm>(emptyForm)
  useEffect(()=>{let cancelled=false;const identifier=new URLSearchParams(window.location.search).get('identifier')?.trim()||'';setSerial(identifier);if(!identifier){setError('No product identifier was received.');setLoading(false);return};const key=`olitec-registration-${identifier}`;const saved=localStorage.getItem(key);if(saved){try{setForm({...emptyForm,...JSON.parse(saved)})}catch{localStorage.removeItem(key)}};getProduct(identifier).then(p=>{if(!cancelled)setProduct(p)}).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:'Product could not be verified.')}).finally(()=>{if(!cancelled)setLoading(false)});return()=>{cancelled=true}},[])
  const update=(key:keyof RegistrationForm,value:string)=>setForm(prev=>({...prev,[key]:value}))
  function submit(e:FormEvent){e.preventDefault();if(!product||!serial)return;setSaving(true);localStorage.setItem(`olitec-registration-${serial}`,JSON.stringify(form));router.push(`/register/review?identifier=${encodeURIComponent(serial)}`)}
  if(loading)return <div className="registrationPage"><main className="regMain"><div className="regLoading">Preparing your registration…</div></main></div>
  if(error||!product)return <div className="registrationPage"><main className="regMain"><div className="regCard regError"><h2>Unable to continue</h2><p>{error}</p><button className="regButton primary" onClick={()=>router.push(`/register?identifier=${encodeURIComponent(serial)}`)}>Go Back</button></div></main></div>
  return <div className="registrationPage">
    <header className="regHeader"><a className="regLogo" href="/"><img src="/olitec-logo.svg" alt="OLITEC"/></a><button className="regHome" type="button" onClick={()=>router.push('/')}>⌂&nbsp; Home</button></header>
    <main className="regMain">
      <div className="regTop"><button className="regBack" type="button" onClick={()=>router.push(`/register?identifier=${encodeURIComponent(serial)}`)}>← Product Verification</button><StepBar/></div>
      <section className="regIntro"><span className="regEyebrow">PRODUCT REGISTRATION</span><h1>Register your purchase.</h1><p>Enter your purchase and installation details to activate your OLITEC warranty.</p></section>
      <section className="regProduct">
        <div className="regProductImage"><img src="/olitec-generated-hero.jpg" alt="OLITEC solar inverter"/></div>
        <div className="regProductInfo"><span className="regBadge">✓ {product.model_code}</span><h2>{product.serial_number}</h2><p>{product.capacity_kw} kW {product.product_name}</p><div className="regProductMeta"><div className="regMetaItem"><small>Model</small><strong>{product.model_code}</strong></div><div className="regMetaItem"><small>Warranty</small><strong>{product.warranty_months/12} Years</strong></div><div className="regMetaItem"><small>Serial number</small><strong>{product.serial_number}</strong></div></div></div>
      </section>
      <form onSubmit={submit}>
        <section className="regCard"><SectionTitle>Customer details</SectionTitle><div className="regGrid">
          <div className="regField"><label>Full name <span className="req">*</span></label><input required value={form.full_name} onChange={e=>update('full_name',e.target.value)} placeholder="Enter your full name"/></div>
          <div className="regField"><label>Mobile number <span className="req">*</span></label><input required type="tel" inputMode="numeric" pattern="[0-9]{10}" value={form.mobile} onChange={e=>update('mobile',e.target.value.replace(/\D/g,''))} placeholder="10-digit mobile number"/></div>
          <div className="regField"><label>Email</label><input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="name@example.com"/></div>
          <div className="regField"><label>Address <span className="req">*</span></label><input required value={form.address} onChange={e=>update('address',e.target.value)} placeholder="House / Flat, Street, Area"/></div>
        </div><div className="regGrid three" style={{marginTop:18}}>
          <div className="regField"><label>City <span className="req">*</span></label><input required value={form.city} onChange={e=>update('city',e.target.value)} placeholder="City"/></div>
          <div className="regField"><label>State <span className="req">*</span></label><select required value={form.state} onChange={e=>update('state',e.target.value)}><option value="">Select state</option><option>Tamil Nadu</option><option>Kerala</option><option>Karnataka</option><option>Andhra Pradesh</option><option>Telangana</option><option>Maharashtra</option><option>Other</option></select></div>
          <div className="regField"><label>PIN code <span className="req">*</span></label><input required inputMode="numeric" pattern="[0-9]{6}" value={form.pin_code} onChange={e=>update('pin_code',e.target.value.replace(/\D/g,''))} placeholder="6-digit PIN"/></div>
        </div></section>
        <section className="regCard"><SectionTitle>Purchase details</SectionTitle><div className="regGrid">
          <div className="regField"><label>Purchase date <span className="req">*</span></label><input required type="date" value={form.purchase_date} onChange={e=>update('purchase_date',e.target.value)}/></div>
          <div className="regField"><label>Dealer / seller name <span className="req">*</span></label><input required value={form.dealer_name} onChange={e=>update('dealer_name',e.target.value)} placeholder="Dealer or store name"/></div>
          <div className="regField"><label>Invoice number</label><input value={form.invoice_number} onChange={e=>update('invoice_number',e.target.value)} placeholder="Invoice number"/></div>
          <div className="regField"><label>Purchase type</label><select value={form.purchase_type} onChange={e=>update('purchase_type',e.target.value)}><option>Dealer</option><option>Distributor</option><option>Online</option><option>Other</option></select></div>
          <div className="regField full"><label>Upload invoice</label><div className="regUpload"><div><strong>Choose a file</strong> or drag and drop<br/><small>PDF, JPG or PNG · Maximum 10 MB</small></div></div></div>
        </div></section>
        <section className="regCard"><SectionTitle>Installation details</SectionTitle><div className="regGrid">
          <div className="regField"><label>Installation date</label><input type="date" value={form.installation_date} onChange={e=>update('installation_date',e.target.value)}/></div>
          <div className="regField"><label>Installation type</label><select value={form.installation_type} onChange={e=>update('installation_type',e.target.value)}><option>Professional</option><option>Self installation</option><option>Dealer installation</option></select></div>
          <div className="regField"><label>Installer name</label><input value={form.installer_name} onChange={e=>update('installer_name',e.target.value)} placeholder="Installer name"/></div>
          <div className="regField"><label>Installer mobile</label><input type="tel" inputMode="numeric" value={form.installer_mobile} onChange={e=>update('installer_mobile',e.target.value.replace(/\D/g,''))} placeholder="Mobile number"/></div>
          <div className="regField full"><label>Installation address</label><textarea value={form.installation_address} onChange={e=>update('installation_address',e.target.value)} placeholder="If different from customer address"/></div>
          <div className="regField"><label>City</label><input value={form.installation_city} onChange={e=>update('installation_city',e.target.value)} placeholder="City"/></div>
          <div className="regField"><label>State</label><select value={form.installation_state} onChange={e=>update('installation_state',e.target.value)}><option value="">Select state</option><option>Tamil Nadu</option><option>Kerala</option><option>Karnataka</option><option>Andhra Pradesh</option><option>Telangana</option><option>Maharashtra</option><option>Other</option></select></div>
          <div className="regField"><label>PIN code</label><input inputMode="numeric" value={form.installation_pin} onChange={e=>update('installation_pin',e.target.value.replace(/\D/g,''))} placeholder="6-digit PIN"/></div>
        </div></section>
        {error&&<div className="regNote">{error}</div>}
        <div className="regActions"><button className="regButton primary" disabled={saving}>{saving?'Saving…':'Continue to Review →'}</button></div>
      </form>
      <div className="regFooter">OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</div>
    </main>
  </div>
}
