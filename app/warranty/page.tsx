'use client'

import { FormEvent, useState } from 'react'
import { PortalFooter, PortalHeader } from '@/components/PortalChrome'

export default function WarrantyLookupPage() {
  const [registration, setRegistration] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = registration.trim().toUpperCase()
    if (!value) return
    window.location.href = `/warranty/${encodeURIComponent(value)}`
  }

  return (
    <div className="app customerPage">
      <PortalHeader />
      <main className="customerMain">
        <button className="customerBack" type="button" onClick={() => (window.location.href = '/')}>← OLITEC Home</button>
        <section className="customerHero compactHero">
          <span className="customerEyebrow">WARRANTY</span>
          <h1>Warranty status.</h1>
          <p>Check the current warranty status of your registered OLITEC inverter.</p>
        </section>

        <section className="customerSection">
          <span className="customerBadge">Warranty lookup</span>
          <h2>Enter registration number</h2>
          <p>Use the registration number shown on your warranty card.</p>
          <form onSubmit={submit}>
            <label>Registration number</label>
            <input
              className="customerInput"
              required
              autoCapitalize="characters"
              autoComplete="off"
              value={registration}
              onChange={e => setRegistration(e.target.value.toUpperCase())}
              placeholder="e.g. OLR-2026-000002"
            />
            <button className="customerButton customerButtonPrimary" type="submit">
              Check Warranty <span>→</span>
            </button>
          </form>
        </section>
      </main>
      <PortalFooter />
    </div>
  )
}
