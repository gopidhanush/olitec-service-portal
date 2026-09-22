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
        <section className="portalHomeHero">
          <div className="portalHomeCopy">
            <h1>Your Inverter<br />Support Portal</h1>
            <p>Register, check warranty and get service support — all in one place.</p>
            <span className="portalAccent" />
          </div>
          <div className="portalProductVisual" aria-hidden="true">
            <div className="portalPlant" />
            <div className="portalInverter"><div className="portalScreen" /></div>
          </div>
        </section>

        <section className="portalHomeCards" aria-label="OLITEC customer services">
          <button className="portalTile portalTileGreen" type="button" onClick={() => router.push('/register')}>
            <span className="portalTileIcon">⌗</span>
            <h2>Product Registration</h2>
            <p>Scan QR code or enter serial number</p>
            <span className="portalTileArrow">→</span>
          </button>
          <button className="portalTile portalTileBlue" type="button" onClick={() => router.push('/warranty')}>
            <span className="portalTileIcon">♢</span>
            <h2>Warranty Status</h2>
            <p>Check your warranty details</p>
            <span className="portalTileArrow">→</span>
          </button>
          <button className="portalTile portalTileOrange" type="button" onClick={() => router.push('/service/complaint/start')}>
            <span className="portalTileIcon">⌁</span>
            <h2>Register Complaint</h2>
            <p>Report a problem with your product</p>
            <span className="portalTileArrow">→</span>
          </button>
          <button className="portalTile portalTilePurple" type="button" onClick={() => router.push('/service/track')}>
            <span className="portalTileIcon">▤</span>
            <h2>Complaint Status</h2>
            <p>Track your service complaint</p>
            <span className="portalTileArrow">→</span>
          </button>
        </section>

        {scannerOpen && (
          <section className="customerSection customerScannerWrap">
            <QRScanner onClose={() => setScannerOpen(false)} />
          </section>
        )}
      </main>
      <PortalFooter />
    </div>
  )
}
