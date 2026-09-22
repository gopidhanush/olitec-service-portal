'use client'

import { useRouter } from 'next/navigation'

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const registrationNumber = `OLR-${new Date().getFullYear()}-TEST`
  return <div className="app">
    <header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div></header>
    <main><section className="card success"><div className="check">✓</div><span className="badge">Registration received</span><h1 style={{marginTop:16}}>Thank you!</h1><p>Your OLITEC product registration flow has been completed successfully.</p><div className="note"><b>Registration Number</b><br/><strong>{registrationNumber}</strong><br/><small>This is a test registration number until the protected database submission is enabled.</small></div><button className="btn primary" style={{marginTop:18}} onClick={() => router.push('/')}>Back to OLITEC</button></section></main>
    <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
  </div>
}
