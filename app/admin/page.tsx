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

  if (loading) return <main className="adminPage" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>Loading…</main>

  if (!loggedIn) {
    return (
      <main className="adminPage adminLoginPage">
        <section className="adminLoginCard" style={{ maxWidth: 700 }}>
          <img src="/olitec-logo.svg" alt="OLITEC" style={{ width: 190, height: 'auto', margin: '0 auto 14px', display: 'block' }} />
          <div className="adminSubtitle" style={{ textAlign: 'center' }}>Administration</div>
          <h1 style={{ textAlign: 'center' }}>Service &amp; Product Management</h1>
          <p style={{ textAlign: 'center' }}>Sign in through either administration module to continue.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
            <button className="adminPrimaryButton" onClick={() => { window.location.href = '/admin/service' }}>Service Admin →</button>
            <button className="adminSecondaryButton" onClick={() => { window.location.href = '/admin/products' }}>Product Admin →</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="adminPage">
      <div className="adminShell">
        <header className="adminHeader">
          <div>
            <img src="/olitec-logo.svg" alt="OLITEC" style={{ width: 170, height: 'auto', display: 'block' }} />
            <div className="adminSubtitle">Administration</div>
          </div>
          <button className="adminDarkButton" onClick={async () => { await supabase.auth.signOut(); setLoggedIn(false) }}>Sign out</button>
        </header>
        <section className="adminPanel" style={{ marginTop: 24 }}>
          <div className="adminPanelHead">
            <div><h2>Service &amp; Product Management</h2><p>Choose the administration area you need.</p></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, padding: 18 }}>
            <button className="adminComplaintRow" onClick={() => { window.location.href = '/admin/service' }} style={{ textAlign: 'left' }}>
              <div><strong>Service Complaints</strong><small>Receive, assign, track and close customer complaints.</small></div>
              <div><span className="statusPill status-received">Open Service Admin →</span></div>
            </button>
            <button className="adminComplaintRow" onClick={() => { window.location.href = '/admin/products' }} style={{ textAlign: 'left' }}>
              <div><strong>Product Master</strong><small>Create products separately from production serial-number batches.</small></div>
              <div><span className="statusPill status-resolved">Open Product Admin →</span></div>
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
