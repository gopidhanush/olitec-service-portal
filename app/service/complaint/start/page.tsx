'use client'

import { FormEvent, useState } from 'react'
import QRScanner from '@/components/QRScanner'
import { PortalIcon, PortalHeader } from '@/components/PortalChrome'

export default function ComplaintStartPage(){
  const [identifier,setIdentifier]=useState('')
  const [scannerOpen,setScannerOpen]=useState(false)

  function submit(event:FormEvent){
    event.preventDefault()
    const value=identifier.trim().toUpperCase()
    if(value)window.location.href=`/service/complaint?identifier=${encodeURIComponent(value)}`
  }

  function handleScan(value:string){
    const cleaned=value.trim().toUpperCase()
    setIdentifier(cleaned)
    setScannerOpen(false)
    if(cleaned)window.location.href=`/service/complaint?identifier=${encodeURIComponent(cleaned)}`
  }

  return <div className="app customerPage portalComplaintPage cleanPortalPage">
    <PortalHeader/>
    <main className="customerMain cleanMain"><div className="customerSplitLayout cleanSplitLayout">
      <section className="customerHero customerHeroVisual cleanHero"><div className="customerHeroCopy"><div className="customerHeroIcon"><PortalIcon type="wrench"/></div><span className="customerEyebrow">SERVICE SUPPORT</span><h1>Report a<br/>Problem</h1><p>Use your OLITEC registration number or product serial number to register a service complaint.</p><div className="customerHeroPoints"><span>✓ Quick complaint registration</span><span>✓ Warranty-linked service</span><span>✓ Track your request</span></div></div><div className="customerHeroImage"><img src="/olitec-service-visual.svg" alt="OLITEC service support"/></div></section>
      <section className="customerSection customerFormPanel cleanFormPanel"><span className="customerBadge">Service Complaint</span><h2>Find your product</h2><p>Scan the product QR code or enter either the registration number or serial number of your registered OLITEC product.</p>
        {!scannerOpen ? <button className="customerButton customerQrLookupButton" type="button" onClick={()=>setScannerOpen(true)}>Scan QR Code <span>⌁</span></button> : <div className="customerLookupScanner"><QRScanner onScan={handleScan} onClose={()=>setScannerOpen(false)}/></div>}
        {!scannerOpen && <div className="customerDivider"><span>OR</span></div>}
        {!scannerOpen && <form onSubmit={submit}><label>Registration number or serial number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={identifier} onChange={e=>setIdentifier(e.target.value.toUpperCase())} placeholder="Enter registration or serial number"/><button className="customerButton customerButtonPrimary" type="submit">Continue <span>→</span></button></form>}
      </section>
    </div></main>
  </div>
}
