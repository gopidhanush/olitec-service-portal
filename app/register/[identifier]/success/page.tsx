'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Product = { serial_number: string; model_code: string; product_name: string; capacity_kw: number; warranty_months: number; manufacturing_date: string | null }
const fmt = (v: string) => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const params = useParams<{ identifier: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [warrantyStart, setWarrantyStart] = useState('')
  const [warrantyEnd, setWarrantyEnd] = useState('')
  const [loading, setLoading] = useState(true)
  const serial = decodeURIComponent(params.identifier)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const params = new URLSearchParams(window.location.search)
        const registration = params.get('registration') || ''
        const start = params.get('start') || ''
        const end = params.get('end') || ''
        if (!active) return
        setRegistrationNumber(registration)
        setWarrantyStart(start)
        setWarrantyEnd(end)

        const { data } = await supabase.rpc('get_product_for_registration', { identifier: serial })
        const p = data?.[0] as Product | undefined
        if (active && p) setProduct(p)

        if (registration && active) {
          const QRCode = (await import('qrcode')).default
          const url = `${window.location.origin}/warranty/${encodeURIComponent(registration)}`
          const qr = await QRCode.toDataURL(url, { width: 420, margin: 2, errorCorrectionLevel: 'M' })
          if (active) setQrDataUrl(qr)
        }
      } catch (error) {
        console.error('Warranty card initialization failed:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [serial])

  async function downloadWarrantyCard() {
    if (!qrDataUrl || !registrationNumber) return
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })
      doc.setFillColor(255,255,255); doc.rect(0,0,210,148,'F')
      doc.setDrawColor(232,158,20); doc.setLineWidth(1.2); doc.roundedRect(8,8,194,132,6,6,'S')
      doc.setTextColor(23,32,51); doc.setFont('helvetica','bold'); doc.setFontSize(23); doc.text('OLITEC',16,23)
      doc.setFontSize(10); doc.setTextColor(90,99,115); doc.setFont('helvetica','normal'); doc.text('SOLAR INVERTER WARRANTY CARD',16,30)
      doc.setTextColor(23,32,51); doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.text(product?.model_code || 'OLITEC Solar Inverter',16,45)
      doc.setFont('helvetica','normal'); doc.setFontSize(10)
      doc.text(`Product: ${product?.product_name || 'OLITEC Solar Inverter'}`,16,53)
      doc.text(`Capacity: ${product?.capacity_kw ?? '—'} kW`,16,60)
      doc.text(`Serial Number: ${product?.serial_number || serial}`,16,67)
      doc.text(`Registration Number: ${registrationNumber}`,16,74)
      doc.text(`Warranty: ${warrantyStart ? `${fmt(warrantyStart)} to ${fmt(warrantyEnd)}` : `${product?.warranty_months ? product.warranty_months / 12 : '—'} years`}`,16,81)
      doc.text(`Manufacturing Date: ${product?.manufacturing_date || '—'}`,16,88)
      doc.setDrawColor(225,225,225); doc.line(16,96,128,96)
      doc.setFontSize(8.5); doc.setTextColor(105,112,125); doc.text('Scan the QR code to verify this registration.',16,105); doc.text('Keep this warranty card and your purchase invoice safely.',16,111)
      doc.setFont('helvetica','bold'); doc.setTextColor(23,32,51); doc.text('OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow',16,129)
      doc.addImage(qrDataUrl,'PNG',153,42,38,38); doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(105,112,125); doc.text('Registration QR',172,85,{align:'center'})
      doc.save(`${registrationNumber}-OLITEC-Warranty-Card.pdf`)
    } catch (error) {
      console.error('Warranty card download failed:', error)
      alert('Unable to create the warranty card. Please try again.')
    } finally { setDownloading(false) }
  }

  if (loading) return <div className="app"><main><section className="card"><p>Preparing your warranty registration…</p></section></main></div>
  if (!registrationNumber) return <div className="app"><main><section className="card"><h2>Registration details unavailable</h2><p>Please complete the registration again.</p><button className="btn primary" onClick={() => router.push(`/register/${encodeURIComponent(serial)}/purchase`)}>Register Product</button></section></main></div>

  return <div className="app"><header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div></header><main>
    <section className="card success"><div className="check">✓</div><span className="badge">Registration received</span><h1 style={{marginTop:16}}>Thank you!</h1><p>Your OLITEC product has been registered successfully.</p>
      <div className="note"><b>Registration Number</b><br/><strong>{registrationNumber}</strong><br/><small>Keep this number for future warranty and service requests.</small></div>
      {product && <div className="note" style={{marginTop:12,textAlign:'left'}}><b>{product.model_code} · {product.serial_number}</b><br/>{product.capacity_kw} kW<br/>Warranty: {fmt(warrantyStart)} to {fmt(warrantyEnd)}</div>}
      {qrDataUrl && <div style={{marginTop:16}}><img src={qrDataUrl} alt="Registration QR code" style={{width:150,height:150,margin:'0 auto',display:'block'}}/><small>Scan to verify your warranty registration</small></div>}
      <button className="btn primary" style={{marginTop:18}} disabled={!qrDataUrl || downloading} onClick={downloadWarrantyCard}>{downloading ? 'Preparing Warranty Card…' : 'Download Warranty Card (PDF)'}</button>
      <button className="btn secondary" style={{marginTop:10}} onClick={() => router.push('/')}>Back to OLITEC</button>
    </section>
  </main><footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer></div>
}
