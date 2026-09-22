'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QRScanner from '@/components/QRScanner'

export default function HomePage() {
  const router = useRouter()
  const [scannerOpen, setScannerOpen] = useState(false)

  return (
    <div className="app portalHome">
      <header className="portalHeader">
        <div>
          <div className="portalLogo">OLITEC</div>
          <div className="portalTagline">POWERING A BETTER TOMORROW</div>
        </div>
        <button className="lang" type="button">◎&nbsp; English⌄</button>
      </header>

      <main className="portalMain">
        <section className="portalHero">
          <div className="heroCopy">
            <span className="heroEyebrow">SERVICE PORTAL</span>
            <h1>Your OLITEC<br />Inverter Support</h1>
            <p>Register, check warranty and get service support — all in one place.</p>
            <span className="heroAccent" />
            <div className="heroBenefits">
              <span>✓ Genuine Support</span>
              <span>✓ Quick Service</span>
              <span>✓ Reliable Assistance</span>
            </div>
          </div>
          <div className="inverterVisual" aria-hidden="true">
            <div className="inverterBody">
              <div className="inverterBrand">OLITEC</div>
              <div className="inverterPanel"><span>◦</span><span>⌁</span><span>△</span></div>
              <div className="inverterText">CLEAN ENERGY<br /><small>BRIGHTER TOMORROW</small></div>
              <div className="inverterPorts"><i /><i /><i /></div>
            </div>
          </div>
        </section>

        {scannerOpen ? (
          <section className="portalScanner">
            <QRScanner onClose={() => setScannerOpen(false)} />
          </section>
        ) : null}

        <section className="portalActions">
          <button className="portalAction registration" type="button" onClick={() => setScannerOpen(true)}>
            <span className="actionIcon">⌗</span>
            <span className="actionContent">
              <strong>Product Registration</strong>
              <small>Scan the QR code on your inverter to register and activate warranty.</small>
            </span>
            <span className="actionArrow">→</span>
          </button>

          <button className="portalAction warranty" type="button" onClick={() => router.push('/warranty')}>
            <span className="actionIcon">♢</span>
            <span className="actionContent">
              <strong>Warranty Status</strong>
              <small>Check your product warranty using your registration number.</small>
            </span>
            <span className="actionArrow">→</span>
          </button>

          <button className="portalAction complaint" type="button" onClick={() => router.push('/service/complaint/start')}>
            <span className="actionIcon">⌕</span>
            <span className="actionContent">
              <strong>Register Complaint</strong>
              <small>Report a problem with your registered OLITEC product.</small>
            </span>
            <span className="actionArrow">→</span>
          </button>

          <button className="portalAction tracking" type="button" onClick={() => router.push('/service/track')}>
            <span className="actionIcon">≡</span>
            <span className="actionContent">
              <strong>Complaint Status</strong>
              <small>Track the latest status of your service complaint.</small>
            </span>
            <span className="actionArrow">→</span>
          </button>
        </section>

        <section className="portalHelp">
          <span className="helpIcon">♧</span>
          <div>
            <strong>Need Help?</strong>
            <p>Contact our service support team.</p>
          </div>
          <span className="helpArrow">View Support Details&nbsp; →</span>
        </section>
      </main>

      <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
    </div>
  )
}
