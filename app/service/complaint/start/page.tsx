'use client'

import { FormEvent, useState } from 'react'
import { PortalFooter, PortalHeader } from '@/components/PortalChrome'

export default function ComplaintStartPage() {
  const [registration, setRegistration] = useState('')
  function submit(event: FormEvent) { event.preventDefault(); const value=registration.trim().toUpperCase(); if(value) window.location.href=`/service/complaint?registration=${encodeURIComponent(value)}` }

  return <div className="app customerPage"><PortalHeader/><main className="customerMain">
    <button className="customerBack" type="button" onClick={()=>window.location.href='/'}>← OLITEC Home</button>
    <section className="customerHero compactHero"><span className="customerEyebrow">SERVICE SUPPORT</span><h1>Register a complaint.</h1><p>Enter the registration number from your OLITEC warranty card to continue.</p></section>
    <section className="customerSection"><span className="customerBadge">Warranty registration</span><h2>Enter registration number</h2><form onSubmit={submit}><label>Registration number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={registration} onChange={e=>setRegistration(e.target.value.toUpperCase())} placeholder="e.g. OLR-2026-000002"/><button className="customerButton customerButtonPrimary" type="submit">Continue <span>→</span></button></form></section>
  </main><PortalFooter/></div>
}
