'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PortalHeader } from '@/components/PortalChrome'

type Warranty={registration_number:string;serial_number:string;model_code:string;product_name:string|null;capacity_kw:number;warranty_start_date:string;warranty_end_date:string;status:string}
async function getWarranty(identifier:string):Promise<Warranty[]>{const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new Error('Supabase configuration is missing');const response=await fetch(`${url}/rest/v1/rpc/get_warranty_verification`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({p_registration_number:identifier}),cache:'no-store'});if(!response.ok)throw new Error(`Warranty verification failed (${response.status})`);const data=await response.json();return (data||[]) as Warranty[]}
const fmt=(v:string)=>v?new Date(v+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'

async function createWarrantyPdf(registrationNumber:string,warranties:Warranty[],qrDataUrl:string){
 const {jsPDF}=await import('jspdf')
 const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a5'})
 const pageWidth=210,pageHeight=148,outerX=8,outerY=8,outerW=194,outerH=132
 const cardX=15,cardW=128,cardH=25,qrX=157,qrY=43,qrSize=36
 const perPage=3,totalPages=Math.max(1,Math.ceil(warranties.length/perPage))
 const drawPage=(items:Warranty[],pageIndex:number)=>{
  doc.setFillColor(255,255,255);doc.rect(0,0,pageWidth,pageHeight,'F')
  doc.setDrawColor(232,158,20);doc.setLineWidth(1.2);doc.roundedRect(outerX,outerY,outerW,outerH,6,6,'S')
  doc.setTextColor(23,32,51);doc.setFont('helvetica','bold');doc.setFontSize(23);doc.text('OLITEC',16,23)
  doc.setTextColor(90,99,115);doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.text('SOLAR INVERTER WARRANTY CARD',16,30)
  doc.setTextColor(23,32,51);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(`Registration: ${registrationNumber}`,16,40)
  items.forEach((w,index)=>{
   const y=47+(index*28)
   doc.setDrawColor(225,225,225);doc.setLineWidth(.8);doc.roundedRect(cardX,y,cardW,cardH,3,3,'S')
   doc.setTextColor(23,32,51);doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.text(`${index+1}. ${w.model_code}`,20,y+7)
   doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(70,82,101);doc.text(`${w.product_name||'OLITEC Solar Inverter'} · ${w.capacity_kw} kW`,20,y+13)
   doc.setTextColor(23,32,51);doc.setFontSize(7.8);doc.text(`Serial: ${w.serial_number}`,20,y+20)
   doc.setFont('helvetica','bold');doc.setTextColor(25,139,77);doc.setFontSize(7.1);doc.text(`Warranty: ${fmt(w.warranty_start_date)} → ${fmt(w.warranty_end_date)}`,20,y+24,{maxWidth:118})
  })
  if(qrDataUrl){doc.addImage(qrDataUrl,'PNG',qrX,qrY,qrSize,qrSize);doc.setFont('helvetica','normal');doc.setTextColor(105,112,125);doc.setFontSize(7);doc.text('Registration QR',qrX+(qrSize/2),qrY+42,{align:'center'})}
  doc.setFontSize(7.2);doc.setTextColor(105,112,125);doc.text('Scan the QR code to verify this registration.',16,132);doc.text('Keep this warranty card and your purchase invoice safely.',16,137);doc.setFont('helvetica','bold');doc.setTextColor(23,32,51);doc.text('OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow',16,142)
  if(totalPages>1){doc.setFont('helvetica','normal');doc.setTextColor(105,112,125);doc.setFontSize(7);doc.text(`Page ${pageIndex} of ${totalPages}`,190,142,{align:'right'})}
 }
 for(let page=0;page<totalPages;page++){if(page>0)doc.addPage();drawPage(warranties.slice(page*perPage,(page+1)*perPage),page+1)}
 doc.save(`${registrationNumber}-OLITEC-Warranty-Card.pdf`)
}

export default function WarrantyVerificationPage(){
 const params=useParams<{registration:string}>();const identifier=decodeURIComponent(params.registration)
 const [data,setData]=useState<Warranty[]>([]);const [selectedSerial,setSelectedSerial]=useState('');const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [downloading,setDownloading]=useState(false)
 useEffect(()=>{let active=true;getWarranty(identifier).then(result=>{if(active){setData(result);setSelectedSerial(result[0]?.serial_number||'')}}).catch(err=>{console.error(err);if(active)setError('We could not verify this warranty registration right now. Please try again.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[identifier])
 const selected=data.find(item=>item.serial_number===selectedSerial)||data[0]
 async function downloadWarrantyCard(){
  if(!data.length||!selected)return
  setDownloading(true)
  try{
   const QRCode=(await import('qrcode')).default
   const registrationNumber=data[0].registration_number
   const url=`${window.location.origin}/warranty/${encodeURIComponent(registrationNumber)}`
   const qr=await QRCode.toDataURL(url,{width:420,margin:2,errorCorrectionLevel:'M'})
   await createWarrantyPdf(registrationNumber,data,qr)
  }catch(err){console.error('Warranty card download failed:',err);alert('Unable to create the warranty card. Please try again.')}finally{setDownloading(false)}
 }
 return <div className="app customerPage portalWarrantyPage cleanPortalPage"><PortalHeader/><main className="customerMain cleanMain"><button className="customerBack cleanBack" type="button" onClick={()=>{window.location.href='/warranty'}}>← Warranty Lookup</button><section className="customerHero compactHero cleanHeroBanner"><span className="customerEyebrow">WARRANTY STATUS</span><h1>Warranty status.</h1><p>Current warranty information for this OLITEC registration or serial number.</p></section>{loading&&<section className="customerSection cleanPageCard"><p className="customerStatus">Checking warranty details…</p></section>}{!loading&&error&&<section className="customerSection cleanPageCard"><span className="customerBadge customerBadgeWarning">Verification unavailable</span><h2>We could not verify this warranty.</h2><p>{error}</p><button className="customerButton customerButtonPrimary" type="button" onClick={()=>window.location.reload()}>Try Again <span>→</span></button></section>}{!loading&&!error&&!data.length&&<section className="customerSection cleanPageCard"><span className="customerBadge customerBadgeWarning">Not found</span><h2>No warranty registration found.</h2><p>Check the registration number or serial number and try again.</p><button className="customerButton customerButtonPrimary" type="button" onClick={()=>{window.location.href='/warranty'}}>Check Again <span>→</span></button></section>}{!loading&&!error&&data.length>0&&<section className="customerSection warrantyResult cleanPageCard"><div className="customerCheck">✓</div><span className="customerBadge customerBadgeSuccess">Verified OLITEC Registration</span><h2>Warranty verified</h2><p>Your registration is recorded in the OLITEC warranty system.</p>{data.length>1&&<div className="warrantyDeviceSelector">{data.map(item=><label key={item.serial_number} className={`warrantyDeviceOption ${selected?.serial_number===item.serial_number?'selected':''}`}><input type="radio" name="warrantyDevice" checked={selected?.serial_number===item.serial_number} onChange={()=>setSelectedSerial(item.serial_number)}/><div><strong>{item.model_code}</strong><span>{item.serial_number} · {item.capacity_kw} kW</span></div><em>{item.status==='active'?'Active':item.status}</em></label>)}</div>}{selected&&<><div className="cleanWarrantySummary"><div><span>Warranty from</span><strong>{fmt(selected.warranty_start_date)}</strong></div><div><span>Warranty till</span><strong>{fmt(selected.warranty_end_date)}</strong></div></div><div className="customerInfoList cleanInfoList"><div><span>Registration number</span><strong>{selected.registration_number}</strong></div><div><span>Serial number</span><strong>{selected.serial_number}</strong></div><div><span>Model</span><strong>{selected.model_code}</strong></div><div><span>Product</span><strong>{selected.product_name||'OLITEC Solar Inverter'}</strong></div><div><span>Capacity</span><strong>{selected.capacity_kw} kW</strong></div><div><span>Status</span><strong className="statusActive">{selected.status==='active'?'Active':selected.status}</strong></div></div><div className="cleanActionStack"><button className="customerButton customerButtonPrimary" type="button" disabled={downloading} onClick={downloadWarrantyCard}>{downloading?'Preparing Warranty Card…':'Download Warranty Card (PDF)'} <span>↓</span></button><button className="customerButton customerButtonSecondary" type="button" onClick={()=>{window.location.href=`/service/complaint?identifier=${encodeURIComponent(selected.registration_number)}&serial=${encodeURIComponent(selected.serial_number)}`}}>Register a Service Complaint <span>→</span></button></div></>}</section>}</main></div>
}
