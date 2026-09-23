'use client'

import { FormEvent, useState } from 'react'
import { PortalFooter, PortalHeader, PortalIcon } from '@/components/PortalChrome'

export default function WarrantyLookupPage() {
  const [registration,setRegistration]=useState('')
  function submit(event:FormEvent){event.preventDefault();const value=registration.trim().toUpperCase();if(value)window.location.href=`/warranty/${encodeURIComponent(value)}`}
  return <div className="app customerPage portalWarrantyPage"><PortalHeader/><main className="customerMain"><div className="customerSplitLayout">
    <section className="customerHero customerHeroVisual"><div className="customerHeroCopy"><div className="customerHeroIcon"><PortalIcon type="shield"/></div><span className="customerEyebrow">WARRANTY</span><h1>Warranty Status</h1><p>Check your OLITEC inverter warranty, coverage period and product protection details.</p><div className="customerHeroPoints"><span>✓ Genuine product coverage</span><span>✓ Warranty period</span><span>✓ Product protection details</span></div></div><div className="customerHeroImage"><img src="/olitec-generated-hero.jpg" alt="OLITEC solar inverter and solar home"/></div></section>
    <section className="customerSection customerFormPanel"><span className="customerBadge">Warranty</span><h2>Enter registration number</h2><p>Find this number on your OLITEC warranty card or registration confirmation.</p><form onSubmit={submit}><label>Registration number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={registration} onChange={e=>setRegistration(e.target.value.toUpperCase())} placeholder="Enter Registration Number"/><button className="customerButton customerButtonPrimary" type="submit">Check Warranty <span>→</span></button></form><div className="customerMiniNote"><PortalIcon type="shield"/><span>Your warranty information is linked to your registered product.</span></div></section>
  </div></main><PortalFooter/></div>
}
