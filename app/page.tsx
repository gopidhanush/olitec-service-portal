'use client'

import Link from 'next/link'

const services = [
  { tone: 'green', icon: '⌾', title: 'Product Registration', text: 'Scan QR code or enter your serial number.', href: '/register' },
  { tone: 'blue', icon: '♢', title: 'Warranty Status', text: 'Check your product warranty details.', href: '/warranty' },
  { tone: 'orange', icon: '⌕', title: 'Register Complaint', text: 'Report a problem with your registered product.', href: '/service/complaint/start' },
  { tone: 'purple', icon: '▤', title: 'Complaint Status', text: 'Track the latest status of your service complaint.', href: '/service/track' },
]

export default function HomePage() {
  return (
    <div className="olitecHomeExact">
      <header className="olitecExactHeader">
        <Link href="/" className="olitecExactLogo" aria-label="OLITEC home"><img src="/olitec-logo.svg" alt="OLITEC" /></Link>
        <div className="olitecExactHeaderRight">
          <span className="olitecExactPortal">Support Portal</span>
          <Link href="/" className="olitecExactHome"><span aria-hidden="true">⌂</span> Home</Link>
        </div>
      </header>

      <main className="olitecExactMain">
        <section className="olitecExactHero" aria-label="OLITEC Inverter Support">
          <img src="/olitec-generated-hero.jpg" alt="OLITEC solar inverter and home solar installation" />
        </section>

        <section className="olitecExactServices" aria-label="Customer services">
          {services.map((service) => (
            <Link key={service.title} href={service.href} className={`olitecExactService ${service.tone}`}>
              <span className="olitecExactServiceIcon" aria-hidden="true">{service.icon}</span>
              <strong>{service.title}</strong>
              <span className="olitecExactServiceText">{service.text}</span>
              <span className="olitecExactArrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}
