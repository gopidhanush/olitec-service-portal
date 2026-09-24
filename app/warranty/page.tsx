'use client'

import { FormEvent, useState } from 'react'
import QRScanner from '@/components/QRScanner'
import { PortalIcon, PortalHeader } from '@/components/PortalChrome'

export default function WarrantyLookupPage() {
  const [identifier, setIdentifier] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = identifier.trim().toUpperCase()
    if (value) window.location.href = `/warranty/${encodeURIComponent(value)}`
  }

  function handleScan(value: string) {
    const cleaned = value.trim().toUpperCase()
    setIdentifier(cleaned)
    setScannerOpen(false)
    if (cleaned) window.location.href = `/warranty/${encodeURIComponent(cleaned)}`
  }

  return <div className="app customerPage portalWarrantyPage cleanPortalPage">
    <PortalHeader />
    <main className="customerMain cleanMain"><div className="customerSplitLayout cleanSplitLayout">
      <section className="customerHero customerHeroVisual cleanHero">
        <div className="customerHeroCopy"><div className="customerHeroIcon"><PortalIcon type="shield" /></div><span className="customerEyebrow">WARRANTY STATUS</span><h1>Check Your<br />Warranty</h1><p>Enter your registration number or product serial number to view the warranty period and coverage.</p><div className="customerHeroPoints"><span>✓ Check warranty period</span><span>✓ View product information</span><span>✓ Register a service complaint</span></div></div>
        <div className="customerHeroImage"><img src="/olitec-warranty-visual.svg" alt="Warranty protection shield" /></div>
      </section>
      <section className="customerSection customerFormPanel cleanFormPanel">
        <span className="customerBadge">Warranty Status</span><h2>Find your warranty</h2><p>Scan the product QR code or use the registration number or serial number printed on your OLITEC inverter.</p>
        {!scannerOpen ? <button className="customerButton customerQrLookupButton" type="button" onClick={() => setScannerOpen(true)}>Scan QR Code <span>⌁</span></button> : <div className="customerLookupScanner"><QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} /></div>}
        {!scannerOpen && <div className="customerDivider"><span>OR</span></div>}
        {!scannerOpen && <form onSubmit={submit}><label>Registration number or serial number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={identifier} onChange={e => setIdentifier(e.target.value.toUpperCase())} placeholder="e.g. OLR-2026-000006 or OL5K2609001234" /><button className="customerButton customerButtonPrimary" type="submit">Check Warranty <span>→</span></button></form>}
      </section>
    </div></main>
  </div>
}
