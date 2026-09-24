'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PortalHeader } from '@/components/PortalChrome'

type Product = { serial_number:string; model_code:string; product_name:string; capacity_kw:number; manufacturing_date:string|null; product_image:string|null }
type Warranty = { registration_number:string; serial_number:string; model_code:string; product_name:string|null; capacity_kw:number; warranty_start_date:string; warranty_end_date:string; status:string }
const fmt=(v:string)=>v?new Date(v+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'
function productImageUrl(value:string|null|undefined){const raw=value?.trim();if(!raw)return '/olitec-generated-hero.jpg';if(/^https?:\/\//i.test(raw)||raw.startsWith('/'))return raw;const base=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,'');if(!base)return '/olitec-generated-hero.jpg';if(raw.startsWith('storage/v1/'))return `${base}/${raw}`;if(raw.includes('/'))return `${base}/storage/v1/object/public/${raw}`;return `${base}/storage/v1/object/public/products/${encodeURIComponent(raw)}`}

export default function RegistrationSuccessPage(){
 const router=useRouter();const params=useParams<{identifier:string}>();const serial=decodeURIComponent(params.identifier)
 const [product,setProduct]=useState<Product|null>(null);const [warranties,setWarranties]=useState<Warranty[]>([]);const [qrDataUrl,setQrDataUrl]=useState('');const [downloading,setDownloading]=useState(false);const [registrationNumber,setRegistrationNumber]=useState('');const [loading,setLoading]=useState(true)
 useEffect(()=>{let active=true;async function load(){try{const query=new URLSearchParams(window.location.search);const registration=query.get('registration')||'';if(active)setRegistrationNumber(registration);const {data:pdata}=await supabase.rpc('get_product_for_registration',{identifier:serial});const p=pdata?.[0] as Product|undefined;if(active&&p)setProduct(p);if(registration){const {data:wdata}=await supabase.rpc('get_warranty_verification',{p_registration_number:registration});if(active)setWarranties((wdata||[]) as Warranty[]);const QRCode=(await import('qrcode')).default;const url=`${window.location.origin}/warranty/${encodeURIComponent(registration)}`;const qr=await QRCode.toDataURL(url,{width:420,margin:2,errorCorrectionLevel:'M'});if(active)setQrDataUrl(qr)}}catch(error){console.error('Warranty card initialization failed:',error)}finally{if(active)setLoading(false)}}load();return()=>{active=false}},[serial])
 async function downloadWarrantyCard(){
  if(!qrDataUrl||!registrationNumber||!warranties.length)return
  setDownloading(true)
  try{
   const {jsPDF}=await import('jspdf')
   const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a5'})
   const pageWidth=210
   const pageHeight=148
   const outerX=8,outerY=8,outerW=194,outerH=132
   const cardX=15,cardW=124,cardH=25
   const qrX=153,qrY=44,qrSize=38
   const perPage=3
   const totalPages=Math.ceil(warranties.length/perPage)

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
      doc.setFont('helvetica','bold');doc.setTextColor(25,139,77);doc.setFontSize(7.3);doc.text(`Warranty: ${fmt(w.warranty_start_date)} → ${fmt(w.warranty_end_date)}`,20,y+24,{maxWidth:114})
    })

    doc.addImage(qrDataUrl,'PNG',qrX,qrY,qrSize,qrSize)
    doc.setFont('helvetica','normal');doc.setTextColor(105,112,125);doc.setFontSize(7);doc.text('Registration QR',qrX+(qrSize/2),qrY+43,{align:'center'})
    doc.setFontSize(7.2);doc.text('Scan the QR code to verify this registration.',16,132)
    doc.text('Keep this warranty card and your purchase invoice safely.',16,137)
    doc.setFont('helvetica','bold');doc.setTextColor(23,32,51);doc.setFontSize(7.2);doc.text('OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow',16,142)
    if(totalPages>1){doc.setFont('helvetica','normal');doc.setTextColor(105,112,125);doc.setFontSize(7);doc.text(`Page ${pageIndex} of ${totalPages}`,190,142,{align:'right'})}
   }

   for(let page=0;page<totalPages;page++){if(page>0)doc.addPage();drawPage(warranties.slice(page*perPage,(page+1)*perPage),page+1)}
   doc.save(`${registrationNumber}-OLITEC-Warranty-Card.pdf`)
  }catch(error){console.error('Warranty card download failed:',error);alert('Unable to create the warranty card. Please try again.')}finally{setDownloading(false)}
 }
 if(loading)return <div className="app customerPage cleanPortalPage"><PortalHeader/><main className="customerMain cleanMain"><section className="customerSection cleanPageCard"><p className="customerStatus">Preparing your warranty registration…</p></section></main></div>
 if(!registrationNumber)return <div className="app customerPage cleanPortalPage"><PortalHeader/><main className="customerMain cleanMain"><section className="customerSection cleanPageCard"><span className="customerBadge customerBadgeWarning">Registration details unavailable</span><h2>Please complete registration again.</h2><button className="customerButton customerButtonPrimary" type="button" onClick={()=>router.push(`/register/${encodeURIComponent(serial)}/purchase`)}>Register Product <span>→</span></button></section></main></div>
 return <div className="app customerPage customerSuccessPage cleanPortalPage"><PortalHeader/><main className="customerMain cleanMain"><section className="customerSection customerSuccess cleanPageCard"><div className="customerCheck">✓</div><span className="customerBadge customerBadgeSuccess">Registration received</span><h1>Thank you.</h1><p>Your OLITEC product{warranties.length>1?'s':''} {warranties.length>1?'have':'has'} been registered successfully.</p><div className="customerNumberBox cleanNumberBox"><span>Registration Number</span><strong>{registrationNumber}</strong><small>Keep this number for future warranty and service requests.</small></div>
   <section className="registrationProductsSummary"><span className="customerBadge customerBadgeSuccess">Registered products</span>{warranties.map((w,index)=><div className="registrationProductsSummaryItem" key={w.serial_number}><div><strong>{index+1}. {w.model_code}</strong><span>{w.product_name||'OLITEC Solar Inverter'} · Serial number: <b>{w.serial_number}</b></span></div><span className="warrantyMini">Warranty: {fmt(w.warranty_start_date)} → {fmt(w.warranty_end_date)}</span></div>)}</section>
   {product&&<div className="cleanProductCard"><div className="cleanProductImage"><img src={productImageUrl(product.product_image)} alt={`${product.model_code} solar inverter`} onError={event=>{event.currentTarget.src='/olitec-generated-hero.jpg'}}/></div><div className="cleanProductText"><strong>{product.model_code}</strong><span>{product.product_name||`${product.capacity_kw} kW OLITEC Solar Inverter`}</span><span>{warranties.length>1?'All registered serial numbers are listed above.':'Serial number: '} {warranties.length===1&&<b>{product.serial_number}</b>}</span></div></div>}
   <div className="cleanWarrantyBox"><div><span>Registered products</span><strong>{warranties.length}</strong></div><div><span>Warranty period</span><strong>{warranties.length===1?`${fmt(warranties[0].warranty_start_date)} → ${fmt(warranties[0].warranty_end_date)}`:'As listed above'}</strong></div></div>
   {qrDataUrl&&<div className="customerQr cleanQr"><img src={qrDataUrl} alt="Registration QR code"/><span>Scan to verify this warranty registration</span></div>}
   <div className="cleanActionStack"><button className="customerButton customerButtonPrimary" type="button" disabled={!qrDataUrl||downloading} onClick={downloadWarrantyCard}>{downloading?'Preparing Warranty Card…':'Download Warranty Card (PDF)'} <span>↓</span></button><button className="customerButton customerButtonSecondary" type="button" onClick={()=>router.push('/')}>Back to OLITEC <span>→</span></button></div>
  </section></main></div>
}
