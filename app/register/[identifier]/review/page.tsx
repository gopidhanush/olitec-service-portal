'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegistrationReviewPage() {
  const params = useParams<{ identifier: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    supabase.rpc('get_product_for_registration', { identifier: decodeURIComponent(params.identifier) }).then(({data}) => setProduct(data?.[0] || null))
  }, [params.identifier])

  return <div className="app">
    <header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div><div className="lang">English⌄</div></header>
    <main>
      <button className="back" onClick={() => router.back()}>← Edit details</button>
      <div className="steps"><div className="step active"><div className="dot">✓</div>Product</div><div className="step active"><div className="dot">✓</div>Details</div><div className="step active"><div className="dot">3</div>Review</div><div className="step"><div className="dot">4</div>Complete</div></div>
      <section className="card"><span className="badge">Review before submission</span><h2 style={{marginTop:12}}>Almost complete</h2><p>Review the information you entered. The final database submission and invoice upload will be enabled after the protected registration backend is added.</p></section>
      <section className="card">
        <h2>Product</h2>
        <div className="reviewRow"><span>Model</span><b>{product?.model_code || '—'}</b></div>
        <div className="reviewRow"><span>Serial number</span><b>{product?.serial_number || '—'}</b></div>
        <div className="reviewRow"><span>Warranty</span><b>{product?.warranty_months ? `${product.warranty_months / 12} years` : '—'}</b></div>
      </section>
      <button className="btn primary" onClick={() => router.push(`/register/${encodeURIComponent(params.identifier)}/success`)}>Confirm Registration →</button>
    </main>
    <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
  </div>
}
