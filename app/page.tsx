'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  return <div className="olitecFeature"><span className="olitecFeatureIcon">{type === 'headset' ? <HeadsetIcon /> : <ServiceIcon type={type} />}</span><span>{children}</span></div>
}

export default function HomePage() {
  const router = useRouter()

  const services = [
    { tone: 'green', icon: 'scan' as const, title: 'Product Registration', text: 'Scan QR code or enter your serial number.', href: '/register' },
    { tone: 'blue', icon: 'shield' as const, title: 'Warranty Status', text: 'Check your product warranty details.', href: '/warranty' },
    { tone: 'orange', icon: 'wrench' as const, title: 'Register Complaint', text: 'Report a problem with your registered product.', href: '/service/complaint/start' },
    { tone: 'purple', icon: 'document' as const, title: 'Complaint Status', text: 'Track the latest status of your service complaint.', href: '/service/track' },
  ]

  return (
    <div className="olitecPortalPage">
      <header className="olitecPortalHeader">
        <Link href="/" className="olitecBrand" aria-label="OLITEC home">
          <span className="olitecBrandName">OLITEC</span>
          <span className="olitecBrandTagline">POWERING A BETTER TOMORROW</span>
        </Link>
      </header>

      <main className="olitecPortalMain">
        <section className="olitecHero" aria-labelledby="olitecHeroTitle">
          <div className="olitecHeroCopy">
            <span className="olitecEyebrow">SERVICE PORTAL</span>
            <h1 id="olitecHeroTitle">Your OLITEC<br />Inverter Support</h1>
            <p>Register, check warranty and get service support — all in one place.</p>
            <span className="olitecHeroAccent" aria-hidden="true" />
            <div className="olitecFeatures">
              <Feature type="shield">Genuine Support</Feature>
              <Feature type="wrench">Quick Service</Feature>
              <Feature type="headset">Reliable Assistance</Feature>
            </div>
          </div>

          <div className="olitecHeroVisual" aria-hidden="true">
            <img src="/olitec-inverter-hero.svg" alt="" />
          </div>
        </section>

        <section className="olitecServiceGrid" aria-label="OLITEC customer services">
          {services.map((service) => (
            <button
              key={service.title}
              type="button"
              className={`olitecServiceCard ${service.tone}`}
              onClick={() => router.push(service.href)}
            >
              <span className="olitecServiceIcon"><ServiceIcon type={service.icon} /></span>
              <span className="olitecServiceContent">
                <strong>{service.title}</strong>
                <span>{service.text}</span>
              </span>
              <span className="olitecServiceArrow" aria-hidden="true">→</span>
            </button>
          ))}
        </section>
      </main>

      <style jsx global>{`
        .olitecPortalPage {
          width: 100%;
          max-width: 1180px;
          min-height: 100vh;
          margin: 0 auto;
          background: #fff;
          color: #0b1d3d;
          overflow-x: hidden;
        }

        .olitecPortalHeader {
          display: flex;
          align-items: flex-start;
          padding: 22px 48px 16px;
          background: #fff;
        }

        .olitecBrand {
          display: inline-flex;
          flex-direction: column;
          color: #0b1d3d;
          text-decoration: none;
        }

        .olitecBrandName {
          font-size: 30px;
          line-height: .95;
          font-weight: 800;
          letter-spacing: -.025em;
        }

        .olitecBrandTagline {
          margin-top: 7px;
          font-size: 8px;
          line-height: 1;
          letter-spacing: .27em;
          font-weight: 700;
          color: #657691;
          white-space: nowrap;
        }

        .olitecPortalMain {
          width: 100%;
          padding: 0 48px 34px;
        }

        .olitecHero {
          position: relative;
          display: grid;
          grid-template-columns: 54% 46%;
          min-height: 390px;
          overflow: hidden;
          border-radius: 24px;
          background: linear-gradient(100deg, #fff 0%, #fbfcfd 52%, #edf1f2 100%);
          border: 1px solid #eef1f3;
          box-shadow: 0 16px 40px rgba(21, 39, 65, .08);
        }

        .olitecHeroCopy {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 42px 18px 42px 54px;
        }

        .olitecEyebrow {
          margin-bottom: 18px;
          font-size: 12px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: .32em;
          color: #63758f;
        }

        .olitecHero h1 {
          margin: 0;
          font-size: clamp(42px, 4.6vw, 64px);
          line-height: .98;
          letter-spacing: -.045em;
          font-weight: 800;
          color: #071a3b;
        }

        .olitecHeroCopy > p {
          max-width: 500px;
          margin: 22px 0 0;
          color: #536985;
          font-size: 20px;
          line-height: 1.42;
        }

        .olitecHeroAccent {
          display: block;
          width: 56px;
          height: 4px;
          margin-top: 26px;
          border-radius: 999px;
          background: #2caf5b;
        }

        .olitecFeatures {
          display: flex;
          gap: 30px;
          margin-top: 32px;
        }

        .olitecFeature {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #5b6e89;
          font-size: 13px;
          line-height: 1.25;
        }

        .olitecFeatureIcon {
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          color: #647994;
        }

        .olitecFeatureIcon svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .olitecHeroVisual {
          position: relative;
          min-width: 0;
          overflow: hidden;
          background: linear-gradient(120deg, rgba(244,247,248,.8), rgba(224,231,233,.9));
        }

        .olitecHeroVisual::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(90deg, rgba(255,255,255,.16), transparent 28%, transparent 100%);
        }

        .olitecHeroVisual img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 56% center;
        }

        .olitecServiceGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 22px;
        }

        .olitecServiceCard {
          position: relative;
          display: grid;
          grid-template-columns: 68px 1fr 42px;
          align-items: center;
          min-height: 158px;
          width: 100%;
          padding: 25px 26px;
          border: 1px solid transparent;
          border-radius: 24px;
          text-align: left;
          color: #0b1d3d;
          cursor: pointer;
          transition: transform .16s ease, box-shadow .16s ease;
        }

        .olitecServiceCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(15, 36, 66, .08);
        }

        .olitecServiceCard.green { background: linear-gradient(135deg, #f0fbf4, #f8fdf9); border-color: #e3f1e7; }
        .olitecServiceCard.blue { background: linear-gradient(135deg, #f0f6ff, #f7faff); border-color: #e1eafa; }
        .olitecServiceCard.orange { background: linear-gradient(135deg, #fff6ec, #fffbf6); border-color: #f5e9dc; }
        .olitecServiceCard.purple { background: linear-gradient(135deg, #f6f0ff, #fbf9ff); border-color: #ebe3f8; }

        .olitecServiceIcon {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          border-radius: 50%;
        }

        .olitecServiceIcon svg { width: 30px; height: 30px; }
        .green .olitecServiceIcon { background: #d5f4df; color: #16a34a; }
        .blue .olitecServiceIcon { background: #dceaff; color: #1667d9; }
        .orange .olitecServiceIcon { background: #ffe5c7; color: #ea6b00; }
        .purple .olitecServiceIcon { background: #ead8ff; color: #7032cf; }

        .olitecServiceContent {
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding-right: 12px;
        }

        .olitecServiceContent strong {
          font-size: 24px;
          line-height: 1.1;
          letter-spacing: -.025em;
          font-weight: 800;
        }

        .olitecServiceContent span {
          margin-top: 8px;
          max-width: 430px;
          color: #566b88;
          font-size: 15px;
          line-height: 1.42;
        }

        .olitecServiceArrow {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255,255,255,.72);
          font-size: 28px;
          line-height: 1;
          font-weight: 500;
        }

        .green .olitecServiceArrow { color: #16a34a; }
        .blue .olitecServiceArrow { color: #1667d9; }
        .orange .olitecServiceArrow { color: #ea6b00; }
        .purple .olitecServiceArrow { color: #7032cf; }

        @media (max-width: 760px) {
          .olitecPortalPage {
            max-width: 100%;
          }

          .olitecPortalHeader {
            padding: 16px 20px 10px;
          }

          .olitecBrandName {
            font-size: 27px;
          }

          .olitecBrandTagline {
            font-size: 7px;
            letter-spacing: .25em;
          }

          .olitecPortalMain {
            padding: 0 16px 22px;
          }

          .olitecHero {
            grid-template-columns: 56% 44%;
            min-height: 220px;
            height: 220px;
            border-radius: 0;
            border-left: 0;
            border-right: 0;
            box-shadow: none;
            margin-left: -16px;
            margin-right: -16px;
          }

          .olitecHeroCopy {
            padding: 24px 4px 18px 24px;
            justify-content: center;
          }

          .olitecEyebrow {
            margin-bottom: 11px;
            font-size: 7px;
            letter-spacing: .28em;
          }

          .olitecHero h1 {
            font-size: clamp(24px, 7vw, 31px);
            line-height: .98;
            letter-spacing: -.045em;
          }

          .olitecHeroCopy > p {
            max-width: 205px;
            margin-top: 10px;
            font-size: 11px;
            line-height: 1.35;
          }

          .olitecHeroAccent {
            width: 35px;
            height: 3px;
            margin-top: 12px;
          }

          .olitecFeatures {
            gap: 8px;
            margin-top: 15px;
            padding-right: 2px;
          }

          .olitecFeature {
            gap: 4px;
            font-size: 7px;
            line-height: 1.15;
          }

          .olitecFeatureIcon {
            width: 16px;
            height: 16px;
            flex-basis: 16px;
          }

          .olitecHeroVisual img {
            object-fit: cover;
            object-position: 54% center;
            transform: scale(1.02);
          }

          .olitecServiceGrid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 16px;
          }

          .olitecServiceCard {
            grid-template-columns: 1fr 28px;
            grid-template-rows: auto 1fr;
            min-height: 148px;
            padding: 17px 14px 15px;
            border-radius: 18px;
          }

          .olitecServiceIcon {
            grid-column: 1 / -1;
            width: 43px;
            height: 43px;
            margin-bottom: 10px;
          }

          .olitecServiceIcon svg {
            width: 23px;
            height: 23px;
          }

          .olitecServiceContent {
            align-self: start;
            padding-right: 2px;
          }

          .olitecServiceContent strong {
            font-size: 16px;
            line-height: 1.08;
          }

          .olitecServiceContent span {
            margin-top: 5px;
            font-size: 10px;
            line-height: 1.28;
          }

          .olitecServiceArrow {
            align-self: end;
            width: 29px;
            height: 29px;
            font-size: 21px;
          }
        }

        @media (max-width: 390px) {
          .olitecHero {
            min-height: 205px;
            height: 205px;
          }

          .olitecHeroCopy {
            padding-left: 21px;
          }

          .olitecHero h1 {
            font-size: 23px;
          }

          .olitecHeroCopy > p {
            font-size: 10px;
            max-width: 180px;
          }

          .olitecFeature {
            font-size: 6.5px;
          }

          .olitecServiceCard {
            min-height: 142px;
            padding: 15px 12px 13px;
          }

          .olitecServiceContent strong {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  )
}
