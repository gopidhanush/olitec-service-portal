'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PortalHeader } from '@/components/PortalChrome'

type Product = { product_id: string; serial_number: string; model_code: string; product_name: string; capacity_kw: number; warranty_months: number; product_image: string | null }
type RegistrationForm = {
  full_name:string; mobile:string; email:string; address:string; city:string; state:string; pin_code:string
  purchase_date:string; invoice_number:string; dealer_name:string; purchase_type:string; invoice_path:string; invoice_name:string
  installation_date:string; installation_type:string; installer_name:string; installer_mobile:string
  installation_address:string; installation_city:string; installation_state:string; installation_pin:string
}

const blank:RegistrationForm={full_name:'',mobile:'',email:'',address:'',city:'',state:'',pin_code:'',purchase_date:'',invoice_number:'',dealer_name:'',purchase_type:'Dealer',invoice_path:'',invoice_name:'',installation_date:'',installation_type:'Professional',installer_name:'',installer_mobile:'',installation_address:'',installation_city:'',installation_state:'',installation_pin:''}

function imageUrl(value:string|null|undefined){
  const raw=value?.trim(); if(!raw)return '/olitec-generated-hero.jpg'
  if(/^https?:\/\//i.test(raw)||raw.startsWith('/'))return raw
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,''); if(!base)return '/olitec-generated-hero.jpg'
  if(raw.startsWith('storage/v1/'))return `${base}/${raw}`
  if(raw.includes('/'))return `${base}/storage/v1/object/public/${raw}`
  return `${base}/storage/v1/object/public/products/${encodeURIComponent(raw)}`
}

async function getProduct(identifier:string):Promise<Product>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url||!key)throw new Error('Product verification is not configured.')
  const r=await fetch(`${url}/rest/v1/rpc/get_product_for_registration`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({identifier}),cache:'no-store'})
  const body=await r.text(); if(!r.ok)throw new Error(`Product verification failed (${r.status}).`)
  const data=body?JSON.parse(body) as Product[]:[]; if(!data.length)throw new Error('Product could not be verified. Please go back and scan again.')
  return data[0]
}

function Steps(){return <div className="rfSteps"><div className="rfStep active"><span className="rfDot">✓</span>1 Product</div><div className="rfStep active"><span className="rfDot">2</span>2 Details</div><div className="rfStep"><span className="rfDot">3</span>3 Review</div><div className="rfStep"><span className="rfDot">4</span>4 Complete</div></div>}

export default function PurchaseRegistrationPage(){
  const params=useParams<{identifier:string}>(); const router=useRouter(); const serial=decodeURIComponent(params.identifier); const storageKey=`olitec-registration-${serial}`
  const [product,setProduct]=useState<Product|null>(null); const [form,setForm]=useState<RegistrationForm>(blank); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [uploading,setUploading]=useState(false); const [error,setError]=useState(''); const [uploadError,setUploadError]=useState('')

  useEffect(()=>{let cancelled=false;(async()=>{const saved=localStorage.getItem(storageKey);if(saved){try{setForm({...blank,...JSON.parse(saved)})}catch{localStorage.removeItem(storageKey)}}try{const item=await getProduct(serial);if(!cancelled)setProduct(item)}catch(e){if(!cancelled)setError(e instanceof Error?e.message:'Product could not be verified.')}finally{if(!cancelled)setLoading(false)}})();return()=>{cancelled=true}},[serial,storageKey])
  const update=(key:keyof RegistrationForm,value:string)=>setForm(prev=>({...prev,[key]:value}))
  async function invoiceChange(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;setUploadError('');if(!['application/pdf','image/jpeg','image/png'].includes(file.type)){setUploadError('Please upload a PDF, JPG or PNG file.');e.target.value='';return}if(file.size>10*1024*1024){setUploadError('Invoice must be 10 MB or smaller.');e.target.value='';return}setUploading(true);try{const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-120);const path=`${serial}/${crypto.randomUUID()}-${safe}`;const {error:err}=await supabase.storage.from('invoices').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(err)throw new Error(err.message);setForm(p=>({...p,invoice_path:path,invoice_name:file.name}))}catch(err){setUploadError(err instanceof Error?`Invoice upload failed: ${err.message}`:'Invoice upload failed. Please try again.');e.target.value=''}finally{setUploading(false)}}
  function submit(e:FormEvent){e.preventDefault();if(!product)return;setSaving(true);localStorage.setItem(storageKey,JSON.stringify(form));router.push(`/register/${encodeURIComponent(product.serial_number)}/review`)}

  if(loading)return <div className="rfPage"><PortalHeader/><main className="rfMain"><div className="rfLoading">Preparing your registration…</div></main></div>
  if(error||!product)return <div className="rfPage"><PortalHeader/><main className="rfMain"><section className="rfCard"><span className="rfSectionLabel">Unable to continue</span><h2 className="rfSectionTitle">Product verification failed.</h2><p>{error}</p><button className="rfButton primary" onClick={()=>router.back()}>Go back</button></section></main></div>

  return <div className="rfPage"><PortalHeader/><main className="rfMain">
    <div className="rfTop"><button className="rfBack" type="button" onClick={()=>router.back()}>← Product Verification</button></div>
    <Steps/>
    <section className="rfHero"><span className="rfEyebrow">PRODUCT REGISTRATION</span><h1>Register your purchase.</h1><p>Enter your purchase and installation details to activate your OLITEC warranty.</p></section>

    <section className="rfCard rfProduct">
      <div className="rfProductImage"><img src={imageUrl(product.product_image)} alt={`${product.model_code} solar inverter`} onError={e=>{e.currentTarget.src='/olitec-generated-hero.jpg'}}/></div>
      <div className="rfProductText"><span className="rfBadge">✓ {product.model_code}</span><h2>{product.serial_number}</h2><p>{product.capacity_kw} kW {product.product_name}</p></div>
      <div className="rfMeta"><div className="rfMetaItem"><small>Model</small><strong>{product.model_code}</strong></div><div className="rfMetaItem"><small>Warranty</small><strong>{product.warranty_months/12} years</strong></div><div className="rfMetaItem"><small>Serial number</small><strong>{product.serial_number}</strong></div></div>
    </section>

    <form onSubmit={submit}>
      <section className="rfCard"><div className="rfSectionHead"><div><span className="rfSectionLabel">Customer details</span><h2 className="rfSectionTitle">About you</h2></div></div><div className="rfGrid">
        <div className="rfField"><label>Full name <span className="rfReq">*</span></label><input required value={form.full_name} onChange={e=>update('full_name',e.target.value)} placeholder="Enter your full name"/></div>
        <div className="rfField"><label>Mobile number <span className="rfReq">*</span></label><input required type="tel" inputMode="numeric" pattern="[0-9]{10}" value={form.mobile} onChange={e=>update('mobile',e.target.value.replace(/\D/g,''))} placeholder="10-digit mobile number"/></div>
        <div className="rfField"><label>Email</label><input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="name@example.com"/></div>
        <div className="rfField"><label>Address <span className="rfReq">*</span></label><input required value={form.address} onChange={e=>update('address',e.target.value)} placeholder="House / Flat, Street, Area"/></div>
      </div><div className="rfGrid three" style={{marginTop:20}}>
        <div className="rfField"><label>City <span className="rfReq">*</span></label><input required value={form.city} onChange={e=>update('city',e.target.value)} placeholder="City"/></div>
        <div className="rfField"><label>State <span className="rfReq">*</span></label><select required value={form.state} onChange={e=>update('state',e.target.value)}><option value="">Select state</option><option>Tamil Nadu</option><option>Kerala</option><option>Karnataka</option><option>Andhra Pradesh</option><option>Telangana</option><option>Maharashtra</option><option>Other</option></select></div>
        <div className="rfField"><label>PIN code <span className="rfReq">*</span></label><input required inputMode="numeric" pattern="[0-9]{6}" value={form.pin_code} onChange={e=>update('pin_code',e.target.value.replace(/\D/g,''))} placeholder="6-digit PIN"/></div>
      </div></section>

      <section className="rfCard"><span className="rfSectionLabel">Purchase details</span><h2 className="rfSectionTitle">Where and when did you buy it?</h2><div className="rfGrid" style={{marginTop:22}}>
        <div className="rfField"><label>Purchase date <span className="rfReq">*</span></label><input required type="date" value={form.purchase_date} onChange={e=>update('purchase_date',e.target.value)}/></div>
        <div className="rfField"><label>Dealer / seller name <span className="rfReq">*</span></label><input required value={form.dealer_name} onChange={e=>update('dealer_name',e.target.value)} placeholder="Dealer or store name"/></div>
        <div className="rfField"><label>Invoice number</label><input value={form.invoice_number} onChange={e=>update('invoice_number',e.target.value)} placeholder="Invoice number"/></div>
        <div className="rfField"><label>Purchase type</label><select value={form.purchase_type} onChange={e=>update('purchase_type',e.target.value)}><option>Dealer</option><option>Distributor</option><option>Online</option><option>Other</option></select></div>
        <div className="rfField full"><label>Invoice upload</label><div className="rfUpload"><input type="file" accept="application/pdf,image/jpeg,image/png" onChange={invoiceChange} disabled={uploading}/><div className="rfUploadText"><strong>{uploading?'Uploading invoice…':'Choose invoice file'}</strong><span>PDF, JPG or PNG · Maximum 10 MB</span></div>{form.invoice_name&&<div className="rfFile">✓ {form.invoice_name}</div>}</div>{uploadError&&<div className="rfError">{uploadError}</div>}</div>
      </div></section>

      <section className="rfCard"><span className="rfSectionLabel">Installation details</span><h2 className="rfSectionTitle">Where is it installed?</h2><div className="rfGrid" style={{marginTop:22}}>
        <div className="rfField"><label>Installation date</label><input type="date" value={form.installation_date} onChange={e=>update('installation_date',e.target.value)}/></div>
        <div className="rfField"><label>Installation type</label><select value={form.installation_type} onChange={e=>update('installation_type',e.target.value)}><option>Professional</option><option>Self installation</option><option>Dealer installation</option></select></div>
        <div className="rfField"><label>Installer name</label><input value={form.installer_name} onChange={e=>update('installer_name',e.target.value)} placeholder="Installer name"/></div>
        <div className="rfField"><label>Installer mobile</label><input type="tel" inputMode="numeric" value={form.installer_mobile} onChange={e=>update('installer_mobile',e.target.value.replace(/\D/g,''))} placeholder="Mobile number"/></div>
        <div className="rfField full"><label>Installation address</label><textarea value={form.installation_address} onChange={e=>update('installation_address',e.target.value)} placeholder="If different from customer address"/></div>
        <div className="rfField"><label>City</label><input value={form.installation_city} onChange={e=>update('installation_city',e.target.value)} placeholder="City"/></div>
        <div className="rfField"><label>State</label><select value={form.installation_state} onChange={e=>update('installation_state',e.target.value)}><option value="">Select state</option><option>Tamil Nadu</option><option>Kerala</option><option>Karnataka</option><option>Andhra Pradesh</option><option>Telangana</option><option>Maharashtra</option><option>Other</option></select></div>
        <div className="rfField"><label>PIN code</label><input inputMode="numeric" value={form.installation_pin} onChange={e=>update('installation_pin',e.target.value.replace(/\D/g,''))} placeholder="6-digit PIN"/></div>
      </div></section>

      {error&&<div className="rfError">{error}</div>}
      <div className="rfActions"><button className="rfButton primary" disabled={saving||uploading}>{saving?'Saving…':uploading?'Uploading invoice…':'Continue to Review →'}</button></div>
    </form>
    <div className="rfFooter">OLITEC · Product Registration</div>
  </main></div>
}
