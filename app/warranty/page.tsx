'use client'

import { FormEvent, useState } from 'react'

export default function WarrantyLookupPage() {
  const [registration, setRegistration] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = registration.trim().toUpperCase()
    if (!value) return
    window.location.href = `/warranty/${encodeURIComponent(value)}`
  }

  return (
    <div className="app">
      <header>
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 1 }}>OLITEC</div>
        <div className="lang">Warranty</div>
      </header>
      <main>
        <button className="back" onClick={() => (window.location.href = '/')}>← OLITEC Home</button>
        <section className="hero">
          <div className="heroText">
            <h1>Warranty Status</h1>
            <p>Check your OLITEC warranty using your registration number.</p>
          </div>
        </section>
        <section className="card">
          <label>Registration number <span className="req">*</span></label>
          <input
            required
            autoCapitalize="characters"
            autoComplete="off"
            value={registration}
            onChange={e => setRegistration(e.target.value.toUpperCase())}
            placeholder="e.g. OLR-2026-000002"
          />
          <button className="btn primary" style={{ marginTop: 14 }} onClick={submit}>
            Check Warranty →
          </button>
        </section>
      </main>
      <footer>OLITEC · Clean Energy · Reliable Performance</footer>
    </div>
  )
}
