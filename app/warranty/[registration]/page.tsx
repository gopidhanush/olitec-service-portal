'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PortalHeader } from '@/components/PortalChrome'
import { createWarrantyPdf } from '@/lib/warranty-pdf'
import type { WarrantyPdfItem } from '@/lib/warranty-pdf'
import { supabase } from '@/lib/supabase'

type Warranty={registration_number:string;serial_number:string;model_code:string;product_name:string|null;capacity_kw:number;warranty_months:number;warranty_start_date:string;warranty_end_date:string;status:string;product_image:string|null}

function imageUrl(value:string|null|undefined){
  const raw=value?.trim()
  if(!raw)return '/olitec-generated-hero.jpg'
  if(/^https?:\/\//i.test(raw)||raw.startsWith('/'))return raw
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,'')
  if(!base)return '/olitec-generated-hero.jpg'
  if(raw.startsWith('storage/v1/'))return `${base}/${raw}`
  if(raw.includes('/'))return `${base}/storage/v1/object/public/${raw}`
  return `${base}/storage/v1/object/public/products/${encodeURIComponent(raw)}`
}

async function getWarranty(identifier:string):Promise<Warranty[]>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url||!key)throw new Error('Supabase configuration is missing')
  const response=await fetch(`${url}/rest/v1/rpc/get_warranty_verification`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({p_registration_number:identifier}),cache:'no-store'})
  if(!response.ok)throw new Error(`Warranty verification failed (${response.status})`)
  const data=await response.json()
  return (data||[]) as Warranty[]
}

const fmt=(v:string)=>v?new Date(v+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'

async function hydrateMissingImages(items:Warranty[]) {
  return Promise.all(items.map(async item=>{
    if(item.product_image)return item
    const {data}=await supabase.rpc('get_product_for_registration',{identifier:item.serial_number})
    const product=data?.[0] as {product_image?:string|null}|undefined
    return product?.product_image ? {...item,product_image:product.product_image} : item
  }))
}

export default function WarrantyVerificationPage(){
 const params=useParams<{registration:string}>();const identifier=decodeURIComponent(params.registration)
 const [data,setData]=useState<Warranty[]>([]);const [selectedSerial,setSelectedSerial]=useState('');const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [downloading,setDownloading]=useState(false)
 useEffect(()=>{let active=true;getWarranty(identifier).then(async result=>{const hydrated=await hydrateMissingImages(result);if(active){setData(hydrated);setSelectedSerial(hydrated[0]?.serial_number||'')}}).catch(err=>{console.error(err);if(active)setError('We could not verify this warranty registration right now. Please try again.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[identifier])
 const selected=data.find(item=>item.serial_number===selectedSerial)||data[0]
 async function downloadWarrantyCard(){
   if(!data.length||!selected)return
   setDownloading(true)
   try{
     const QRCode=(await import('qrcode')).default
     const registrationNumber=data[0].registration_number
     const url=`${window.location.origin}/warranty/${encodeURIComponent(registrationNumber)}`
     const qr=await QRCode.toDataURL(url,{width:420,margin:2,errorCorrectionLevel:'M'})
     await createWarrantyPdf(registrationNumber,data as WarrantyPdfItem[],qr)
   }catch(err){console.error('Warranty card download failed:',err);alert('Unable to create the warranty card. Please try again.')}finally{setDownloading(false)}
 }
 return <div className="app customerPage portalWarrantyPage cleanPortalPage"><PortalHeader/><main className="customerMain cleanMain"><button className="customerBack cleanBack" type="button" onClick={()=>{window.location.href='/warranty'}}>← Warranty Lookup</button><section className="customerHero compactHero cleanHeroBanner"><span className="customerEyebrow">WARRANTY STATUS</span><h1>Warranty status.</h1><p>Current warranty information for this OLITEC registration or serial number.</p></section>{loading&&<section className="customerSection cleanPageCard"><p className="customerStatus">Checking warranty details…</p></section>}{!loading&&error&&<section className="customerSection cleanPageCard"><span className="customerBadge customerBadgeWarning">Verification unavailable</span><h2>We could not verify this warranty.</h2><p>{error}</p><button className="customerButton customerButtonPrimary" type="button" onClick={()=>window.location.reload()}>Try Again <span>→</span></button></section>}{!loading&&!error&&!data.length&&<section className="customerSection cleanPageCard"><span className="customerBadge customerBadgeWarning">Not found</span><h2>No warranty registration found.</h2><p>Check the registration number or serial number and try again.</p><button className="customerButton customerButtonPrimary" type="button" onClick={()=>{window.location.href='/warranty'}}>Check Again <span>→</span></button></section>}{!loading&&!error&&data.length>0&&<section className="customerSection warrantyResult cleanPageCard">
 {selected&&<div style={{display:'flex',justifyContent:'center',marginBottom:22}}><div style={{width:180,height:180,border:'1px solid #dfe6ee',borderRadius:22,background:'#f8fafc',display:'grid',placeItems:'center',overflow:'hidden'}}><img src={imageUrl(selected.product_image)} alt={`${selected.model_code} solar inverter`} style={{width:'100%',height:'100%',objectFit:'contain',display:'block'}} onError={e=>{e.currentTarget.src='/olitec-generated-hero.jpg'}} /></div></div>}
 <div className="customerCheck">✓</div><span className="customerBadge customerBadgeSuccess">Verified OLITEC Registration</span><h2>Warranty verified</h2><p>Your registration is recorded in the OLITEC warranty system.</p>{data.length>1&&<div className="warrantyDeviceSelector">{data.map(item=><label key={item.serial_number} className={`warrantyDeviceOption ${selected?.serial_number===item.serial_number?'selected':''}`}><input type="radio" name="warrantyDevice" checked={selected?.serial_number===item.serial_number} onChange={()=>setSelectedSerial(item.serial_number)}/><div><strong>{item.model_code}</strong><span>{item.serial_number} · {item.capacity_kw} kW</span></div><em>{item.status==='active'?'Active':item.status}</em></label>)}</div>}{selected&&<><div className="cleanWarrantySummary"><div><span>Warranty from</span><strong>{fmt(selected.warranty_start_date)}</strong></div><div><span>Warranty till</span><strong>{fmt(selected.warranty_end_date)}</strong></div></div><div className="customerInfoList cleanInfoList"><div><span>Registration number</span><strong>{selected.registration_number}</strong></div><div><span>Serial number</span><strong>{selected.serial_number}</strong></div><div><span>Model</span><strong>{selected.model_code}</strong></div><div><span>Product</span><strong>{selected.product_name||'OLITEC Solar Inverter'}</strong></div><div><span>Capacity</span><strong>{selected.capacity_kw} kW</strong></div><div><span>Status</span><strong className="statusActive">{selected.status==='active'?'Active':selected.status}</strong></div></div><div className="cleanActionStack"><button className="customerButton customerButtonPrimary" type="button" disabled={downloading} onClick={downloadWarrantyCard}>{downloading?'Preparing Warranty Card…':'Download Warranty Card (PDF)'} <span>↓</span></button><button className="customerButton customerButtonSecondary" type="button" onClick={()=>{window.location.href=`/service/complaint?identifier=${encodeURIComponent(selected.registration_number)}&serial=${encodeURIComponent(selected.serial_number)}`}}>Register a Service Complaint <span>→</span></button></div></>}</section>}</main></div>
}
