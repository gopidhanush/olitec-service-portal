'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRScanner from '@/components/QRScanner'
import { PortalFooter, PortalHeader, PortalIcon } from '@/components/PortalChrome'

type Product = { product_id: string; serial_number: string; qr_code: string; model_code: string; product_name: string; capacity_kw: number; manufacturing_date: string | null; warranty_months: number }

async function lookupProduct(identifier: string): Promise<Product | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Product verification is not configured.')
  const response = await fetch(`${url}/rest/v1/rpc/get_product_for_registration`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier }), cache: 'no-store' })
  const body = await response.text(); const data = body ? JSON.parse(body) : []
  if (!response.ok) throw new Error(`Product verification failed (${response.status}).`)
  return data?.[0] ?? null
}

export default function RegisterLookupPage() {
  const router = useRouter(); const [serial,setSerial]=useState(''); const [product,setProduct]=useState<Product|null>(null); const [loading,setLoading]=useState(false); const [scannerOpen,setScannerOpen]=useState(false); const [error,setError]=useState('')
  useEffect(()=>{const identifier=new URLSearchParams(window.location.search).get('identifier')?.trim();if(!identifier)return;setSerial(identifier);setLoading(true);setError('');lookupProduct(identifier).then(item=>{if(!item)throw new Error('Product not found. Please check the serial number or QR code and try again.');setProduct(item)}).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to verify this product.')).finally(()=>setLoading(false))},[])
  function submit(event:FormEvent){event.preventDefault();const value=serial.trim().toUpperCase();if(value)router.push(`/register?identifier=${encodeURIComponent(value)}`)}
  return <div className="app customerPage portalProductPage"><PortalHeader/><main className="customerMain"><div className="customerSplitLayout">
    <section className="customerHero customerHeroVisual"><div className="customerHeroCopy"><div className="customerHeroIcon"><PortalIcon type="scan"/></div><span className="customerEyebrow">PRODUCT REGISTRATION</span><h1>Product Registration</h1><p>Register your OLITEC inverter and activate your product warranty in a few simple steps.</p><div className="customerHeroPoints"><span>✓ Verify genuine product</span><span>✓ Activate warranty</span><span>✓ Keep service records</span></div></div><div className="customerHeroImage"><img src="/olitec-inverter-hero.svg" alt="OLITEC solar inverter"/></div></section>
    {!product&&<section className="customerSection customerFormPanel"><span className="customerBadge">Identify your product</span><h2>Choose how to continue</h2><p>Scan the QR code on your inverter or enter the serial number printed on the product.</p>
      {scannerOpen?<div className="customerScannerWrap"><QRScanner onClose={()=>setScannerOpen(false)}/></div>:<button className="customerButton customerButtonPrimary" type="button" onClick={()=>setScannerOpen(true)}>Scan QR Code <span>→</span></button>}
      <div className="customerDivider"><span>OR</span></div>
      <form onSubmit={submit}><label>Serial number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={serial} onChange={e=>setSerial(e.target.value.toUpperCase())} placeholder="Enter Serial Number"/><button className="customerButton customerButtonSecondary" type="submit">Continue <span>→</span></button></form>
      {loading&&<p className="customerStatus">Verifying product…</p>}{error&&<div className="customerError">{error}</div>}
    </section>}
    {product&&!loading&&<section className="customerSection customerFormPanel"><span className="customerBadge customerBadgeSuccess">✓ Genuine OLITEC Product</span><h2>{product.model_code}</h2><p>{product.capacity_kw} kW {product.product_name}</p><div className="customerInfoList"><div><span>Serial number</span><strong>{product.serial_number}</strong></div><div><span>Manufactured</span><strong>{product.manufacturing_date?new Date(product.manufacturing_date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</strong></div><div><span>Warranty</span><strong>{product.warranty_months/12} Years</strong></div></div><div className="customerNote">Your product has been verified. Continue to register your purchase and activate the warranty.</div><button className="customerButton customerButtonPrimary" type="button" onClick={()=>router.push(`/register/${encodeURIComponent(product.serial_number)}/purchase`)}>Register Purchase <span>→</span></button><button className="customerTextButton" type="button" onClick={()=>{setProduct(null);setError('');setSerial('');router.replace('/register')}}>Use another product</button></section>}
  </div></main><PortalFooter/></div>
}
