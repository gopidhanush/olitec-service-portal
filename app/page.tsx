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
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 1, color: '#172033' }}>OLITEC</div>
        <div className="lang">English⌄</div>
      </header>

      <main>
        <section className="hero">
          <div className="heroText">
            <h1>OLITEC Service Portal</h1>
            <p>Register your product, check warranty and get service support.</p>
          </div>
        </section>

        {!scannerOpen ? (
          <section className="card" style={{ marginBottom: 14 }}>
            <span className="badge">Product Registration</span>
            <h2 style={{ marginTop: 12 }}>Register your OLITEC product</h2>
            <p>Scan the QR code on your inverter to identify the product and activate your warranty.</p>
            <button className="btn primary" style={{ marginTop: 8 }} onClick={() => setScannerOpen(true)}>
              ▣ Scan QR Code
            </button>
          </section>
        ) : (
          <QRScanner onClose={() => setScannerOpen(false)} />
        )}

        <div className="homeActions">
          <section className="card homeActionCard">
            <span className="badge">Warranty</span>
            <h2 style={{ marginTop: 12 }}>Warranty Status</h2>
            <p>Check whether your OLITEC warranty is active.</p>
            <button className="btn secondary" onClick={() => router.push('/warranty')}>
              Check Warranty →
            </button>
          </section>

          <section className="card homeActionCard">
            <span className="badge">Service</span>
            <h2 style={{ marginTop: 12 }}>Register Complaint</h2>
            <p>Report a problem with your registered OLITEC product.</p>
            <button className="btn secondary" onClick={() => router.push('/service/complaint/start')}>
              Register Complaint →
            </button>
          </section>

          <section className="card homeActionCard">
            <span className="badge">Service Support</span>
            <h2 style={{ marginTop: 12 }}>Complaint Status</h2>
            <p>Track the latest status of an existing service complaint.</p>
            <button className="btn primary" onClick={() => router.push('/service/track')}>
              Track Complaint →
            </button>
          </section>
        </div>
      </main>

      <footer>OLITEC · Clean Energy · Reliable Performance</footer>
    </div>
  )
}
