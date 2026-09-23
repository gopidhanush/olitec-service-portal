'use client'

import { FormEvent, useState } from 'react'
import { PortalFooter, PortalHeader, PortalIcon } from '@/components/PortalChrome'

export default function ComplaintStartPage(){
  const [registration,setRegistration]=useState('')
  function submit(event:FormEvent){event.preventDefault();const value=registration.trim().toUpperCase();if(value)window.location.href=`/service/complaint?registration=${encodeURIComponent(value)}`}
  return <div className="app customerPage portalComplaintPage"><PortalHeader/><main className="customerMain"><div className="customerSplitLayout">
    <section className="customerHero customerHeroVisual"><div className="customerHeroCopy"><div className="customerHeroIcon"><PortalIcon type="wrench"/></div><span className="customerEyebrow">SERVICE SUPPORT</span><h1>Register Complaint</h1><p>Tell us about a problem with your OLITEC inverter and our service team can take it forward.</p><div className="customerHeroPoints"><span>✓ Quick complaint registration</span><span>✓ Service request tracking</span><span>✓ Professional support</span></div></div><div className="customerHeroImage"><img src="/olitec-service-visual.svg" alt="OLITEC service support"/></div></section>
    <section className="customerSection customerFormPanel"><span className="customerBadge">Service</span><h2>Enter registration number</h2><p>Use the registration number from your OLITEC warranty card.</p><form onSubmit={submit}><label>Registration number</label><input className="customerInput" required autoCapitalize="characters" autoComplete="off" value={registration} onChange={e=>setRegistration(e.target.value.toUpperCase())} placeholder="Enter Registration Number"/><button className="customerButton customerButtonPrimary" type="submit">Continue <span>→</span></button></form><div className="customerMiniNote"><PortalIcon type="wrench"/><span>Have your product registration number ready before starting a service request.</span></div></section>
  </div></main><PortalFooter/></div>
}
