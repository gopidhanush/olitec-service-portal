'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRScanner from '@/components/QRScanner'
import { PortalFooter, PortalHeader, PortalIcon } from '@/components/PortalChrome'

type Product = { product_id: string; serial_number: string; qr_code: string; model_code: string; product_name: string; capacity_kw: number; manufacturing_date: string | null; warranty_months: number }

function normalizeIdentifier(value: string) {
  const raw = value.trim()
  if (!raw) return ''

  try {
    const url = new URL(raw)
    const queryIdentifier = url.searchParams.get('identifier') || url.searchParams.get('serial') || url.searchParams.get('qr')
    if (queryIdentifier?.trim()) return queryIdentifier.trim().toUpperCase()

    const parts = url.pathname.split('/').filter(Boolean)
    const registerIndex = parts.findIndex(part => part.toLowerCase() === 'register')
    if (registerIndex >= 0 && parts[registerIndex + 1]) {
      return decodeURIComponent(parts[registerIndex + 1]).trim().toUpperCase()
    }
  } catch {
    // QR content is often a plain serial number rather than a URL.
  }

  return raw.toUpperCase()
}

async function lookupProduct(identifier: string): Promise<Product | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Product verification is not configured.')

  const response = await fetch(`${url}/rest/v1/rpc/get_product_for_registration`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier: identifier.trim().toUpperCase() }),
    cache: 'no-store',
  })

  const body = await response.text()
  let data: Product[] = []
  try {
    data = body ? JSON.parse(body) : []
  } catch {
    throw new Error('Product verification returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(`Product verification failed (${response.status}).`)
  }

  return data?.[0] ?? null
}

export default function RegisterLookupPage() {
  const router = useRouter()
  const [serial, setSerial] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [error, setError] = useState('')

  const verifyProduct = useCallback(async (rawIdentifier: string) => {
    const identifier = normalizeIdentifier(rawIdentifier)
    if (!identifier) return

    setSerial(identifier)
    setProduct(null)
    setError('')
    setLoading(true)
    setScannerOpen(false)

    try {
      const item = await lookupProduct(identifier)
      if (!item) {
        throw new Error('Product not found. Please check the serial number or QR code and try again.')
      }
      setProduct(item)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to verify this product.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const identifier = new URLSearchParams(window.location.search).get('identifier')
    if (identifier) verifyProduct(identifier)
  }, [verifyProduct])

  function submit(event: FormEvent) {
    event.preventDefault()
    verifyProduct(serial)
  }

  return <div className="app customerPage portalProductPage"><PortalHeader/><main className="customerMain"><div className="customerSplitLayout">
    <section className="customerHero customerHeroVisual"><div className="customerHeroCopy"><div className="customerHeroIcon"><PortalIcon type="scan"/></div><span className="customerEyebrow">PRODUCT REGISTRATION</span><h1>Register Your<br/>OLITEC Inverter</h1><p>Scan the QR code or enter the serial number to register your product and activate warranty.</p><div className="customerHeroPoints"><span>✓ Activate your warranty</span><span>✓ Get genuine support</span><span>✓ Access faster service</span></div></div><div className="customerHeroImage"><img src="/olitec-generated-hero.jpg" alt="OLITEC solar inverter"/></div></section>
    {!product&&<section className="customerSection customerFormPanel"><span className="customerBadge">Identify your product</span><h2>Choose how to continue</h2>
      {scannerOpen?<div className="customerScannerWrap"><QRScanner onScan={verifyProduct} onClose={()=>setScannerOpen(false)}/></div>:<button className="customerButton customerButtonPrimary" type="button" onClick={()=>{setError('');setScannerOpen(true)}}>Scan QR Code <span>→</span></button>}
      <div className="customerDivider"><span>OR</span></div>
      <form onSubmit={submit}><label>Serial number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={serial} onChange={e=>{setSerial(e.target.value.toUpperCase());setError('')}} placeholder="Enter Serial Number"/><button className="customerButton customerButtonSecondary" type="submit" disabled={loading}>{loading?'Verifying…':<>Continue <span>→</span></>}</button></form>
      {loading&&<p className="customerStatus">Verifying product…</p>}{error&&<div className="customerError">{error}</div>}
    </section>}
    {product&&!loading&&<section className="customerSection customerFormPanel"><span className="customerBadge customerBadgeSuccess">✓ Genuine OLITEC Product</span><h2>{product.model_code}</h2><p>{product.capacity_kw} kW {product.product_name}</p><div className="customerInfoList"><div><span>Serial number</span><strong>{product.serial_number}</strong></div><div><span>Manufactured</span><strong>{product.manufacturing_date?new Date(product.manufacturing_date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</strong></div><div><span>Warranty</span><strong>{product.warranty_months/12} Years</strong></div></div><div className="customerNote">Your product has been verified. Continue to register your purchase and activate the warranty.</div><button className="customerButton customerButtonPrimary" type="button" onClick={()=>router.push(`/register/${encodeURIComponent(product.serial_number)}/purchase`)}>Register Purchase <span>→</span></button><button className="customerTextButton" type="button" onClick={()=>{setProduct(null);setError('');setSerial('');router.replace('/register')}}>Use another product</button></section>}
  </div></main><PortalFooter/></div>
}
