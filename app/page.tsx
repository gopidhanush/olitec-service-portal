'use client'

import { useRouter } from 'next/navigation'
import { PortalHeader } from '@/components/PortalChrome'

function ServiceIcon({ type }: { type: 'scan' | 'shield' | 'wrench' | 'document' }) {
  if (type === 'scan') {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 8H11a3 3 0 0 0-3 3v6M31 8h6a3 3 0 0 1 3 3v6M17 40h-6a3 3 0 0 1-3-3v-6M31 40h6a3 3 0 0 0 3-3v-6" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/><rect x="18" y="18" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M22 14v4M26 14v4M22 30v4M26 30v4M14 22h4M30 22h4M14 26h4M30 26h4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
  }
  if (type === 'shield') {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6 39 12v10c0 10-6.3 16.7-15 20-8.7-3.3-15-10-15-20V12L24 6Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="m17 24 5 5 10-11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  }
  if (type === 'wrench') {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M29 10a10 10 0 0 0-8 15L10 36a4 4 0 1 0 6 6l11-11a10 10 0 0 0 13-11l-7 7-6-2-2-6 7-7a10 10 0 0 0-3-2Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  }
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 6h15l7 7v29H14Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M29 6v9h9M20 23h10M20 29h10M20 35h7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
}

function HeadsetIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 25a16 16 0 0 1 32 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M8 25v8a4 4 0 0 0 4 4h3V25h-3a4 4 0 0 0-4 4M40 25v8a4 4 0 0 1-4 4h-3V25h3a4 4 0 0 1 4 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M32 37c0 3-2 5-6 5h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
}

function Feature({ type, children }: { type: 'shield' | 'wrench' | 'headset'; children: string }) {
  return <div className="portalFeature"><span className="portalFeatureIcon">{type === 'headset' ? <HeadsetIcon /> : <ServiceIcon type={type} />}</span><span>{children}</span></div>
}

export default function HomePage() {
  const router = useRouter()

  const services = [
    { className: 'portalTileGreen', icon: 'scan' as const, title: 'Product Registration', text: 'Scan the QR code on your inverter to register and activate warranty.', href: '/register' },
    { className: 'portalTileBlue', icon: 'shield' as const, title: 'Warranty Status', text: 'Check your product warranty status using your registration number.', href: '/warranty' },
    { className: 'portalTileOrange', icon: 'wrench' as const, title: 'Register Complaint', text: 'Report a problem with your registered OLITEC product.', href: '/service/complaint/start' },
    { className: 'portalTilePurple', icon: 'document' as const, title: 'Complaint Status', text: 'Track the latest status of your service complaint.', href: '/service/track' },
  ]

  return (
    <div className="app customerPage customerHome">
      <PortalHeader />
      <main className="customerMain">
        <section className="portalHomeHero" aria-labelledby="portal-home-title">
          <div className="portalHomeCopy">
            <span className="portalEyebrow">SERVICE PORTAL</span>
            <h1 id="portal-home-title">Your OLITEC<br />Inverter Support</h1>
            <p>Register, check warranty and get service support — all in one place.</p>
            <span className="portalAccent" />
            <div className="portalFeatures">
              <Feature type="shield">Genuine Support</Feature>
              <Feature type="wrench">Quick Service</Feature>
              <Feature type="headset">Reliable Assistance</Feature>
            </div>
          </div>
          <div className="portalProductVisual">
            <img src="/olitec-inverter-hero.svg" alt="OLITEC solar inverter" />
          </div>
        </section>

        <section className="portalHomeCards" aria-label="OLITEC customer services">
          {services.map((service) => (
            <button key={service.title} className={`portalTile ${service.className}`} type="button" onClick={() => router.push(service.href)}>
              <span className="portalTileIcon"><ServiceIcon type={service.icon} /></span>
              <h2>{service.title}</h2>
              <p>{service.text}</p>
              <span className="portalTileArrow" aria-hidden="true">→</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
