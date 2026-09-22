'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Product = {
  product_id: string
  serial_number: string
  qr_code: string
  model_code: string
  product_name: string
  capacity_kw: number
  manufacturing_date: string | null
  warranty_months: number
}

export default function RegisterProductPage() {
  const params = useParams<{ identifier: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const identifier = decodeURIComponent(params.identifier)
    async function load() {
      const { data, error } = await supabase.rpc('get_product_for_registration', { identifier })
      if (error) {
        console.error(error)
        setError('We could not verify this product. Please try again.')
      } else if (!data?.length) {
        setError('Product not found. Please check the QR code and try again.')
      } else {
        setProduct(data[0] as Product)
      }
      setLoading(false)
    }
    load()
  }, [params.identifier])

  return (
    <div className="app">
      <header>
        <div style={{fontWeight:800,fontSize:28,letterSpacing:1,color:'#172033'}}>OLITEC</div>
        <div className="lang">English⌄</div>
      </header>
      <main>
        <button className="back" onClick={() => router.push('/')}>← Back</button>
        <div className="hero"><div className="heroText"><h1>Product Verification</h1><p>We are checking the OLITEC product linked to this QR code.</p></div></div>

        {loading && <section className="card"><p>Verifying product…</p></section>}
        {!loading && error && <section className="card"><h2>Product Not Verified</h2><p>{error}</p><button className="btn secondary" onClick={() => router.push('/')}>Scan Again</button></section>}
        {!loading && product && (
          <>
            <section className="card">
              <div className="product">
                <div className="productImg">OLITEC<br/>Solar<br/>Inverter</div>
                <div>
                  <span className="badge">✓ Genuine OLITEC Product</span>
                  <h2 style={{marginTop:10}}>{product.model_code}</h2>
                  <p>{product.capacity_kw} kW {product.product_name}</p>
                </div>
              </div>
              <div className="meta">
                <div><small>Serial Number</small><b>{product.serial_number}</b></div>
                <div><small>Manufactured</small><b>{product.manufacturing_date ? new Date(product.manufacturing_date + 'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</b></div>
              </div>
              <div className="note">This product was identified from its unique QR code. You do not need to enter the serial number manually.</div>
            </section>
            <button className="btn primary" onClick={() => router.push(`/register/${encodeURIComponent(product.serial_number)}/purchase`)}>Register Purchase →</button>
          </>
        )}
      </main>
      <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
    </div>
  )
}
