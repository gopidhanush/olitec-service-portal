'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PortalFooter, PortalHeader } from '@/components/PortalChrome'

type Product = {
  product_id:string
  serial_number:string
  qr_code:string
  model_code:string
  product_name:string
  capacity_kw:number
  manufacturing_date:string|null
  warranty_months:number
  product_image:string|null
}

function productImageUrl(value:string|null|undefined) {
  const raw=value?.trim()
  if (!raw) return '/olitec-generated-hero.jpg'
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,'')
  if (!base) return '/olitec-generated-hero.jpg'
  if (raw.startsWith('storage/v1/')) return `${base}/${raw}`
  if (raw.includes('/')) return `${base}/storage/v1/object/public/${raw}`
  return `${base}/storage/v1/object/public/products/${encodeURIComponent(raw)}`
}

export default function RegisterProductPage() {
  const params=useParams<{identifier:string}>()
  const router=useRouter()
  const [product,setProduct]=useState<Product|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    const identifier=decodeURIComponent(params.identifier)
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_product_for_registration`,{
      method:'POST',
      headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'',Authorization:`Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||''}`,'Content-Type':'application/json'},
      body:JSON.stringify({identifier}),
      cache:'no-store'
    }).then(async response=>{
      const body=await response.json().catch(()=>null)
      if(!response.ok || !Array.isArray(body) || !body.length) throw new Error('Product not found. Please check the QR code and try again.')
      setProduct(body[0] as Product)
    }).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to verify this product.')).finally(()=>setLoading(false))
  },[params.identifier])

  return <div className="app customerPage">
    <PortalHeader/>
    <main className="customerMain">
      {loading&&<section className="customerSection"><p className="customerStatus">Verifying product…</p></section>}

      {!loading&&error&&<section className="customerSection">
        <span className="customerBadge customerBadgeWarning">Product not verified</span>
        <h2>We could not verify this product.</h2>
        <p>{error}</p>
        <button className="customerButton customerButtonPrimary" type="button" onClick={()=>router.push('/')}>Scan Again <span>→</span></button>
      </section>}

      {!loading&&product&&<section className="customerSection customerVerifyCard">
        <div className="customerVerifyImage">
          <img src={productImageUrl(product.product_image)} alt={`${product.model_code} solar inverter`} onError={event=>{event.currentTarget.src='/olitec-generated-hero.jpg'}}/>
        </div>
        <span className="customerBadge customerBadgeSuccess">✓ Genuine OLITEC Product</span>
        <h2>{product.model_code}</h2>
        <p>{product.capacity_kw} kW {product.product_name}</p>
        <div className="customerInfoGrid">
          <div><small>Serial number</small><strong>{product.serial_number}</strong></div>
          <div><small>Manufactured</small><strong>{product.manufacturing_date?new Date(product.manufacturing_date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</strong></div>
          <div><small>Warranty</small><strong>{product.warranty_months ? `${product.warranty_months/12} Years` : '—'}</strong></div>
        </div>
        <button className="customerButton customerButtonPrimary" type="button" onClick={()=>router.push(`/register/${encodeURIComponent(product.serial_number)}/purchase`)}>Register Purchase <span>→</span></button>
      </section>}
    </main>
    <PortalFooter/>
  </div>
}
