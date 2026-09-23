'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Product = { serial_number: string; model_code: string; product_name: string; capacity_kw: number; warranty_months: number; manufacturing_date: string | null; product_image: string | null }
const fmt = (v: string) => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
function productImageUrl(value: string | null | undefined) {
  const raw = value?.trim()
  if (!raw) return '/olitec-generated-hero.jpg'
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (!supabaseUrl) return '/olitec-generated-hero.jpg'
  if (raw.startsWith('storage/v1/')) return `${supabaseUrl}/${raw}`
  if (raw.includes('/')) return `${supabaseUrl}/storage/v1/object/public/${raw}`
  return `${supabaseUrl}/storage/v1/object/public/products/${encodeURIComponent(raw)}`
}

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const params = useParams<{ identifier: string }>()
  const serial = decodeURIComponent(params.identifier)
  const [product, setProduct] = useState<Product | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [warrantyStart, setWarrantyStart] = useState('')
  const [warrantyEnd, setWarrantyEnd] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const query = new URLSearchParams(window.location.search)
        const registration = query.get('registration') || ''
        const start = query.get('start') || ''
        const end = query.get('end') || ''
        if (!active) return
        setRegistrationNumber(registration); setWarrantyStart(start); setWarrantyEnd(end)
        const { data } = await supabase.rpc('get_product_for_registration', { identifier: serial })
        const p = data?.[0] as Product | undefined
        if (active && p) setProduct(p)
        if (registration && active) {
          const QRCode = (await import('qrcode')).default
          const url = `${window.location.origin}/warranty/${encodeURIComponent(registration)}`
          const qr = await QRCode.toDataURL(url, { width: 420, margin: 2, errorCorrectionLevel: 'M' })
          if (active) setQrDataUrl(qr)
        }
      } catch (error) { console.error('Warranty card initialization failed:', error) }
      finally { if (active) setLoading(false) }
    }
    load(); return () => { active = false }
  }, [serial])

  async function downloadWarrantyCard() {
    if (!qrDataUrl || !registrationNumber) return
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })
      doc.setFillColor(255, 255, 255); doc.rect(0, 0, 210, 148, 'F')
      doc.setDrawColor(232, 158, 20); doc.setLineWidth(1.2); doc.roundedRect(8, 8, 194, 132, 6, 6, 'S')
      doc.setTextColor(23, 32, 51); doc.setFont('helvetica', 'bold'); doc.setFontSize(23); doc.text('OLITEC', 16, 23)
      doc.setFontSize(10); doc.setTextColor(90, 99, 115); doc.setFont('helvetica', 'normal'); doc.text('SOLAR INVERTER WARRANTY CARD', 16, 30)
      doc.setTextColor(23, 32, 51); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text(product?.model_code || 'OLITEC Solar Inverter', 16, 45)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
      doc.text(`Product: ${product?.product_name || 'OLITEC Solar Inverter'}`, 16, 53)
      doc.text(`Capacity: ${product?.capacity_kw ?? '—'} kW`, 16, 60)
      doc.text(`Serial Number: ${product?.serial_number || serial}`, 16, 67)
      doc.text(`Registration Number: ${registrationNumber}`, 16, 74)
      doc.text(`Warranty: ${fmt(warrantyStart)} to ${fmt(warrantyEnd)}`, 16, 81)
      doc.text(`Manufacturing Date: ${product?.manufacturing_date ? fmt(product.manufacturing_date) : '—'}`, 16, 88)
      doc.setDrawColor(225, 225, 225); doc.line(16, 96, 128, 96)
      doc.setFontSize(8.5); doc.setTextColor(105, 112, 125); doc.text('Scan the QR code to verify this registration.', 16, 105); doc.text('Keep this warranty card and your purchase invoice safely.', 16, 111)
      doc.setFont('helvetica', 'bold'); doc.setTextColor(23, 32, 51); doc.text('OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow', 16, 129)
      doc.addImage(qrDataUrl, 'PNG', 153, 42, 38, 38); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(105, 112, 125); doc.text('Registration QR', 172, 85, { align: 'center' })
      doc.save(`${registrationNumber}-OLITEC-Warranty-Card.pdf`)
    } catch (error) { console.error('Warranty card download failed:', error); alert('Unable to create the warranty card. Please try again.') }
    finally { setDownloading(false) }
  }

  if (loading) return <div className="app customerPage"><main className="customerMain"><section className="customerSection cleanPageCard"><p className="customerStatus">Preparing your warranty registration…</p></section></main></div>
  if (!registrationNumber) return <div className="app customerPage"><main className="customerMain"><section className="customerSection cleanPageCard"><span className="customerBadge customerBadgeWarning">Registration details unavailable</span><h2>Please complete registration again.</h2><button className="customerButton customerButtonPrimary" type="button" onClick={() => router.push(`/register/${encodeURIComponent(serial)}/purchase`)}>Register Product <span>→</span></button></section></main></div>

  return <div className="app customerPage cleanPortalPage">
    <main className="customerMain cleanMain">
      <section className="customerSection customerSuccess cleanPageCard">
        <div className="customerCheck">✓</div>
        <span className="customerBadge customerBadgeSuccess">Registration received</span>
        <h1>Thank you.</h1>
        <p>Your OLITEC product has been registered successfully.</p>

        <div className="customerNumberBox cleanNumberBox">
          <span>Registration Number</span><strong>{registrationNumber}</strong><small>Keep this number for future warranty and service requests.</small>
        </div>

        {product && <div className="cleanProductCard">
          <div className="cleanProductImage"><img src={productImageUrl(product.product_image)} alt={`${product.model_code} solar inverter`} onError={event => { event.currentTarget.src = '/olitec-generated-hero.jpg' }} /></div>
          <div className="cleanProductText"><strong>{product.model_code}</strong><span>{product.product_name || `${product.capacity_kw} kW OLITEC Solar Inverter`}</span><span>Serial number: <b>{product.serial_number}</b></span></div>
        </div>}

        <div className="cleanWarrantyBox">
          <div><span>Warranty from</span><strong>{fmt(warrantyStart)}</strong></div>
          <div><span>Warranty till</span><strong>{fmt(warrantyEnd)}</strong></div>
        </div>

        {qrDataUrl && <div className="customerQr cleanQr"><img src={qrDataUrl} alt="Registration QR code"/><span>Scan to verify your warranty registration</span></div>}

        <div className="cleanActionStack">
          <button className="customerButton customerButtonPrimary" type="button" disabled={!qrDataUrl || downloading} onClick={downloadWarrantyCard}>{downloading ? 'Preparing Warranty Card…' : 'Download Warranty Card (PDF)'} <span>↓</span></button>
          <button className="customerButton customerButtonSecondary" type="button" onClick={() => router.push('/')}>Back to OLITEC <span>→</span></button>
        </div>
      </section>
    </main>
  </div>
}
