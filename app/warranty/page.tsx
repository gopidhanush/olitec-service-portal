'use client'

import { FormEvent, useState } from 'react'
import { PortalFooter, PortalHeader, PortalIcon } from '@/components/PortalChrome'

export default function WarrantyLookupPage() {
  const [registration,setRegistration]=useState('')
  function submit(event:FormEvent){event.preventDefault();const value=registration.trim().toUpperCase();if(value)window.location.href=`/warranty/${encodeURIComponent(value)}`}
  return <div className="app customerPage portalWarrantyPage"><PortalHeader/><main className="customerMain"><div className="customerSplitLayout">
    <section className="customerHero customerHeroVisual"><div className="customerHeroCopy"><div className="customerHeroIcon"><PortalIcon type="shield"/></div><span className="customerEyebrow">WARRANTY STATUS</span><h1>Check Your<br/>Warranty</h1><p>Enter your registration number to view warranty details and coverage period.</p><div className="customerHeroPoints"><span>✓ Check warranty period</span><span>✓ View product information</span><span>✓ Ensure peace of mind</span></div></div><div className="customerHeroImage"><img src="/olitec-warranty-visual.svg" alt="Warranty protection shield"/></div></section>
    <section className="customerSection customerFormPanel"><span className="customerBadge">Warranty</span><h2>Enter registration number</h2><form onSubmit={submit}><label>Registration number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={registration} onChange={e=>setRegistration(e.target.value.toUpperCase())} placeholder="Enter Registration Number"/><button className="customerButton customerButtonPrimary" type="submit">Check Warranty <span>→</span></button></form></section>
  </div></main><PortalFooter/></div>
}
