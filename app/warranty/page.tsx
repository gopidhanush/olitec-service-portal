'use client'

import { FormEvent, useState } from 'react'
import { PortalFooter, PortalHeader, PortalIcon } from '@/components/PortalChrome'

export default function WarrantyLookupPage() {
  const [registration,setRegistration]=useState('')
  function submit(event:FormEvent){event.preventDefault();const value=registration.trim().toUpperCase();if(value)window.location.href=`/warranty/${encodeURIComponent(value)}`}
  return <div className="app customerPage portalWarrantyPage"><PortalHeader/><main className="customerMain">
    <button className="customerBack" type="button" onClick={()=>window.location.href='/'}>← OLITEC Home</button>
    <section className="customerHero compactHero"><div className="customerHeroIcon"><PortalIcon type="shield"/></div><span className="customerEyebrow">WARRANTY</span><h1>Warranty Status</h1><p>Enter your registration number to check warranty details.</p></section>
    <section className="customerSection"><span className="customerBadge">Warranty</span><h2>Enter registration number</h2><p>Find this number on your warranty card or registration confirmation.</p><form onSubmit={submit}><label>Registration number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={registration} onChange={e=>setRegistration(e.target.value.toUpperCase())} placeholder="Enter Registration Number"/><button className="customerButton customerButtonPrimary" type="submit">Check Warranty <span>→</span></button></form></section>
  </main><PortalFooter/></div>
}
