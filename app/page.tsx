'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QRScanner from '@/components/QRScanner'
import { PortalFooter, PortalHeader } from '@/components/PortalChrome'

export default function HomePage() {
  const router = useRouter()
  const [scannerOpen, setScannerOpen] = useState(false)

  return (
    <div className="app customerPage customerHome">
      <PortalHeader />
      <main className="customerMain">
        <section className="customerHero">
          <span className="customerEyebrow">OLITEC SERVICE PORTAL</span>
          <h1>Product care, made simple.</h1>
          <p>Register your inverter, check warranty and get service support in a few simple steps.</p>
        </section>
        <section className="customerSection customerRegistrationCard">
          <span className="customerBadge">Product Registration</span>
          <h2>Register your OLITEC product</h2>
          <p>Scan the QR code on your inverter to identify your product and activate warranty.</p>
          {scannerOpen ? <div className="customerScannerWrap"><QRScanner onClose={() => setScannerOpen(false)} /></div> : <button className="customerButton customerButtonPrimary" type="button" onClick={() => setScannerOpen(true)}>Scan QR Code <span>→</span></button>}
          <button className="customerTextButton" type="button" onClick={() => router.push('/register')}>Enter serial number manually</button>
        </section>
        <div className="customerGrid">
          <button className="customerSection customerActionCard" type="button" onClick={() => router.push('/warranty')}>
            <span className="customerBadge">Warranty</span><h2>Warranty Status</h2><p>Check whether your OLITEC warranty is active.</p><span className="customerButton customerButtonSecondary">Check Warranty <span>→</span></span>
          </button>
          <button className="customerSection customerActionCard" type="button" onClick={() => router.push('/service/complaint/start')}>
            <span className="customerBadge">Service</span><h2>Register Complaint</h2><p>Report a problem with your registered OLITEC product.</p><span className="customerButton customerButtonSecondary">Register Complaint <span>→</span></span>
          </button>
          <button className="customerSection customerActionCard customerActionWide" type="button" onClick={() => router.push('/service/track')}>
            <span className="customerBadge">Service Support</span><h2>Complaint Status</h2><p>Track the latest status of an existing service complaint.</p><span className="customerButton customerButtonPrimary">Track Complaint <span>→</span></span>
          </button>
        </div>
      </main>
      <PortalFooter />
    </div>
  )
}
