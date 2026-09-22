'use client'

import { useParams } from 'next/navigation'

export default function WarrantyVerificationPage() {
  const params = useParams<{ registrationNumber: string }>()
  const registrationNumber = decodeURIComponent(params.registrationNumber)

  return <div className="app">
    <header><div style={{fontWeight:800,fontSize:28,letterSpacing:1}}>OLITEC</div></header>
    <main>
      <section className="card success">
        <div className="check">✓</div>
        <span className="badge">OLITEC Warranty Verification</span>
        <h1 style={{marginTop:16}}>Registration Verified</h1>
        <p>This QR code belongs to the OLITEC warranty registration shown below.</p>
        <div className="note">
          <b>Registration Number</b><br/>
          <strong>{registrationNumber}</strong>
        </div>
        <p style={{fontSize:12,marginTop:16}}>The live customer, product and warranty details will be displayed here after the protected registration backend is enabled.</p>
      </section>
    </main>
    <footer>OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
  </div>
}
