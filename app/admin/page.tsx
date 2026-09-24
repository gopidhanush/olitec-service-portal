'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminHomePage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session))
      setLoading(false)
    })
  }, [])

  if (loading) return <main className="adminPage adminLoading"><div className="adminLoadingMark"><img src="/olitec-logo.svg" alt="OLITEC" /></div></main>

  if (!loggedIn) {
    return (
      <main className="adminPage adminLoginPage">
        <section className="adminLoginCard adminHomeLoginCard">
          <img src="/olitec-logo.svg" alt="OLITEC" className="adminHomeLogo" />
          <div className="adminSubtitle adminHomeSubtitle">Administration</div>
          <div className="adminEyebrow adminHomeEyebrow">OLITEC ADMINISTRATION</div>
          <h1>Service &amp; Product Management</h1>
          <p>Choose the administration area you need.</p>
          <div className="adminHomeChoices">
            <button className="adminHomeChoice adminHomeChoiceService" onClick={() => { window.location.href = '/admin/service' }}>
              <span className="adminHomeChoiceIcon">✓</span>
              <span className="adminHomeChoiceText"><strong>Service Complaints</strong><small>Receive, assign, track and close customer complaints.</small></span>
              <span className="adminHomeChoiceArrow">→</span>
            </button>
            <button className="adminHomeChoice adminHomeChoiceProduct" onClick={() => { window.location.href = '/admin/products' }}>
              <span className="adminHomeChoiceIcon">▣</span>
              <span className="adminHomeChoiceText"><strong>Product Master</strong><small>Create products separately from production serial-number batches.</small></span>
              <span className="adminHomeChoiceArrow">→</span>
            </button>
          </div>
        </section>
        <div className="adminFooter">OLITEC · Administration</div>
      </main>
    )
  }

  return (
    <main className="adminPage adminHomePage">
      <div className="adminShell adminHomeShell">
        <header className="adminHeader adminHomeHeader">
          <div className="adminBrandBlock">
            <img src="/olitec-logo.svg" alt="OLITEC" className="adminHomeLogo" />
            <div className="adminSubtitle">Administration</div>
          </div>
          <button className="adminDarkButton" onClick={async () => { await supabase.auth.signOut(); setLoggedIn(false) }}>Sign out</button>
        </header>

        <section className="adminHomeHero">
          <div>
            <div className="adminEyebrow">OLITEC ADMINISTRATION</div>
            <h1>Service &amp; Product Management</h1>
            <p>Choose the administration area you need.</p>
          </div>
          <div className="adminHomeHeroMark">OLITEC</div>
        </section>

        <section className="adminHomeModules" aria-label="Administration modules">
          <button className="adminHomeModule service" onClick={() => { window.location.href = '/admin/service' }}>
            <div className="adminModuleTop"><span className="adminModuleIcon">✓</span><span className="adminModuleLabel">SERVICE</span></div>
            <h2>Service Complaints</h2>
            <p>Receive, assign, track and close customer complaints from one service dashboard.</p>
            <span className="adminModuleAction">Open Service Admin <b>→</b></span>
          </button>
          <button className="adminHomeModule product" onClick={() => { window.location.href = '/admin/products' }}>
            <div className="adminModuleTop"><span className="adminModuleIcon">▣</span><span className="adminModuleLabel">PRODUCT</span></div>
            <h2>Product Master</h2>
            <p>Manage product models, MRP and warranty details, then generate controlled production serial batches.</p>
            <span className="adminModuleAction">Open Product Admin <b>→</b></span>
          </button>
        </section>

        <div className="adminHomeFooterRow"><span>OLITEC Administration</span><span>Service &amp; Product Management</span></div>
      </div>
    </main>
  )
}
