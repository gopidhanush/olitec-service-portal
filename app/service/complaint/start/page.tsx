'use client'

import { FormEvent, useState } from 'react'
import { PortalFooter, PortalHeader, PortalIcon } from '@/components/PortalChrome'

export default function ComplaintStartPage(){
  const [registration,setRegistration]=useState('')
  function submit(event:FormEvent){event.preventDefault();const value=registration.trim().toUpperCase();if(value)window.location.href=`/service/complaint?registration=${encodeURIComponent(value)}`}
  return <div className="app customerPage portalComplaintPage"><PortalHeader/><main className="customerMain">
    <button className="customerBack" type="button" onClick={()=>window.location.href='/'}>← OLITEC Home</button>
    <section className="customerHero compactHero"><div className="customerHeroIcon"><PortalIcon type="wrench"/></div><span className="customerEyebrow">SERVICE SUPPORT</span><h1>Register Complaint</h1><p>Enter your registration number to report a problem with your product.</p></section>
    <section className="customerSection"><span className="customerBadge">Service</span><h2>Enter registration number</h2><p>Use the registration number from your OLITEC warranty card.</p><form onSubmit={submit}><label>Registration number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={registration} onChange={e=>setRegistration(e.target.value.toUpperCase())} placeholder="Enter Registration Number"/><button className="customerButton customerButtonPrimary" type="submit">Continue <span>→</span></button></form></section>
  </main><PortalFooter/></div>
}
