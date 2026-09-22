'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QRScanner from '@/components/QRScanner'

export default function HomePage() {
  const router = useRouter()
  const [scannerOpen, setScannerOpen] = useState(false)

  return (
    <div className="app">
      <header>
        <div style={{fontWeight:800,fontSize:28,letterSpacing:1,color:'#172033'}}>OLITEC</div>
        <div className="lang">English⌄</div>
      </header>
      <main>
        <section className="hero">
          <div className="heroText">
            <h1>Register your OLITEC product</h1>
            <p>Scan the QR code on your inverter to verify the product and activate your warranty.</p>
          </div>
        </section>

        {!scannerOpen ? (
          <section className="scanCard">
            <h2>Register by QR Code</h2>
            <p>Scan the QR code printed on your OLITEC inverter to automatically identify your product.</p>
            <button className="scanBtn" onClick={() => setScannerOpen(true)}>▣ Scan QR Code</button>
          </section>
        ) : (
          <QRScanner onClose={() => setScannerOpen(false)} />
        )}

        <section className="card">
          <span className="badge">✓ OLITEC Product Registration</span>
          <h2 style={{marginTop:12}}>Protect your product</h2>
          <p>Register your purchase to keep your warranty and service information connected to your inverter serial number.</p>
        </section>
      </main>
      <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
    </div>
  )
}
