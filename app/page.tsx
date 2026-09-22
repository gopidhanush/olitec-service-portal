'use client'

import Link from 'next/link'

function ServiceIcon({ type }: { type: 'scan' | 'shield' | 'wrench' | 'document' }) {
  if (type === 'scan') {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 8H11a3 3 0 0 0-3 3v6M31 8h6a3 3 0 0 1 3 3v6M17 40h-6a3 3 0 0 1-3-3v-6M31 40h6a3 3 0 0 1 3-3v-6" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/><rect x="18" y="18" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M22 14v4M26 14v4M22 30v4M26 30v4M14 22h4M30 22h4M14 26h4M30 26h4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
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

const services = [
  { tone: 'green', icon: 'scan' as const, title: 'Product Registration', text: 'Scan QR code or enter your serial number.', href: '/register' },
  { tone: 'blue', icon: 'shield' as const, title: 'Warranty Status', text: 'Check your product warranty details.', href: '/warranty' },
  { tone: 'orange', icon: 'wrench' as const, title: 'Register Complaint', text: 'Report a problem with your registered product.', href: '/service/complaint/start' },
  { tone: 'purple', icon: 'document' as const, title: 'Complaint Status', text: 'Track the latest status of your service complaint.', href: '/service/track' },
]

export default function HomePage() {
  return (
    <div className="olitecHome">
      <header className="olitecHomeHeader">
        <Link href="/" className="olitecBrand" aria-label="OLITEC home">
          <span className="olitecBrandName">OLITEC</span>
          <span className="olitecBrandTagline">POWERING A BETTER TOMORROW</span>
        </Link>
      </header>

      <main className="olitecHomeMain">
        <div className="olitecHomeLayout">
          <section className="olitecHero" aria-labelledby="hero-title">
            <div className="olitecHeroCopy">
              <span className="olitecEyebrow">SERVICE PORTAL</span>
              <h1 id="hero-title">Your OLITEC<br />Inverter Support</h1>
              <p>Register, check warranty and get service support — all in one place.</p>
              <span className="olitecAccent" aria-hidden="true" />
              <div className="olitecFeatures">
                <Feature type="shield">Genuine Support</Feature>
                <Feature type="wrench">Quick Service</Feature>
                <Feature type="headset">Reliable Assistance</Feature>
              </div>
            </div>
            <div className="olitecHeroImage" aria-hidden="true">
              <img src="/olitec-inverter-hero.svg" alt="" />
            </div>
          </section>

          <section className="olitecServices" aria-label="OLITEC customer services">
            {services.map((service) => (
              <Link key={service.title} href={service.href} className={`olitecServiceCard ${service.tone}`}>
                <span className="olitecServiceIcon"><ServiceIcon type={service.icon} /></span>
                <span className="olitecServiceBody">
                  <strong>{service.title}</strong>
                  <span>{service.text}</span>
                </span>
                <span className="olitecArrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </section>
        </div>
      </main>

      <style jsx global>{`
        html, body { margin: 0; padding: 0; background: #fff; }
        *, *::before, *::after { box-sizing: border-box; }
        a { -webkit-tap-highlight-color: transparent; }

        .olitecHome {
          min-height: 100svh;
          width: 100%;
          overflow-x: hidden;
          background: #fff;
          color: #081b3d;
          font-family: Arial, Helvetica, sans-serif;
        }

        .olitecHomeHeader,
        .olitecHomeMain {
          width: min(1480px, calc(100% - 44px));
          margin-inline: auto;
        }

        .olitecHomeHeader {
          padding: 15px 0 10px;
        }

        .olitecBrand {
          display: inline-flex;
          flex-direction: column;
          text-decoration: none;
          color: #081b3d;
        }

        .olitecBrandName {
          font-size: clamp(27px, 2.1vw, 37px);
          line-height: .9;
          font-weight: 800;
          letter-spacing: -.045em;
        }

        .olitecBrandTagline {
          margin-top: 5px;
          color: #657791;
          font-size: clamp(6px, .46vw, 8px);
          line-height: 1;
          font-weight: 700;
          letter-spacing: .29em;
          white-space: nowrap;
        }

        .olitecHomeMain { padding-bottom: 14px; }

        .olitecHomeLayout {
          display: grid;
          grid-template-columns: minmax(0, 1.47fr) minmax(460px, 1fr);
          gap: 14px;
          height: min(560px, calc(100svh - 82px));
          min-height: 500px;
        }

        .olitecHero {
          position: relative;
          min-width: 0;
          min-height: 0;
          display: grid;
          grid-template-columns: 53% 47%;
          overflow: hidden;
          border: 1px solid #e7edf0;
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 14px 36px rgba(19, 40, 66, .075);
        }

        .olitecHeroCopy {
          position: relative;
          z-index: 2;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(28px, 3vw, 46px);
          background: linear-gradient(105deg, #fff 0%, #fff 82%, rgba(255,255,255,.93) 100%);
        }

        .olitecEyebrow {
          margin-bottom: 13px;
          color: #637590;
          font-size: clamp(9px, .66vw, 12px);
          line-height: 1;
          font-weight: 700;
          letter-spacing: .34em;
        }

        .olitecHero h1 {
          margin: 0;
          color: #071a3d;
          font-size: clamp(39px, 3.35vw, 58px);
          line-height: .94;
          letter-spacing: -.055em;
          font-weight: 800;
        }

        .olitecHeroCopy > p {
          max-width: 500px;
          margin: 17px 0 0;
          color: #566b87;
          font-size: clamp(15px, 1.05vw, 18px);
          line-height: 1.34;
        }

        .olitecAccent {
          width: 45px;
          height: 4px;
          margin-top: 20px;
          display: block;
          border-radius: 999px;
          background: #2caf5b;
        }

        .olitecFeatures {
          display: flex;
          align-items: center;
          gap: clamp(13px, 1.35vw, 23px);
          margin-top: 22px;
        }

        .olitecFeature {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          color: #5e718c;
          font-size: clamp(9px, .68vw, 12px);
          line-height: 1.15;
        }

        .olitecFeatureIcon {
          width: clamp(23px, 1.55vw, 28px);
          height: clamp(23px, 1.55vw, 28px);
          flex: 0 0 auto;
          color: #687d98;
        }

        .olitecFeatureIcon svg { width: 100%; height: 100%; display: block; }

        .olitecHeroImage {
          position: relative;
          min-width: 0;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #eef2f3;
        }

        .olitecHeroImage::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(100deg, rgba(255,255,255,.52), transparent 24%, transparent 72%, rgba(215,226,220,.18));
          z-index: 2;
          pointer-events: none;
        }

        .olitecHeroImage img {
          display: block;
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }

        .olitecServices {
          min-width: 0;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .olitecServiceCard {
          position: relative;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 19px 18px 17px;
          border-radius: 21px;
          border: 1px solid;
          text-decoration: none;
          color: #081b3d;
          transition: transform .16s ease, box-shadow .16s ease;
        }

        .olitecServiceCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(18, 42, 70, .09);
        }

        .olitecServiceCard.green { background: linear-gradient(145deg, #eefaf2, #f8fcf9); border-color: #dcefe3; }
        .olitecServiceCard.blue { background: linear-gradient(145deg, #eef5ff, #f7faff); border-color: #dfe8f7; }
        .olitecServiceCard.orange { background: linear-gradient(145deg, #fff5ea, #fffbf6); border-color: #f4e7da; }
        .olitecServiceCard.purple { background: linear-gradient(145deg, #f5efff, #fbf9ff); border-color: #e9e1f7; }

        .olitecServiceIcon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex: 0 0 auto;
          border-radius: 50%;
        }

        .olitecServiceIcon svg { width: 54%; height: 54%; }
        .green .olitecServiceIcon { background: #d3f3df; color: #12a64b; }
        .blue .olitecServiceIcon { background: #d8e8ff; color: #1469d8; }
        .orange .olitecServiceIcon { background: #ffe2c1; color: #e96900; }
        .purple .olitecServiceIcon { background: #e8d5ff; color: #7130d0; }

        .olitecServiceBody {
          display: flex;
          flex-direction: column;
          min-width: 0;
          margin-top: 13px;
          padding-right: 26px;
        }

        .olitecServiceBody strong {
          color: #081b3d;
          font-size: clamp(16px, 1.35vw, 21px);
          line-height: 1.04;
          letter-spacing: -.035em;
          font-weight: 800;
        }

        .olitecServiceBody > span {
          margin-top: 8px;
          color: #5b708e;
          font-size: clamp(11px, .78vw, 13px);
          line-height: 1.28;
        }

        .olitecArrow {
          position: absolute;
          right: 16px;
          bottom: 16px;
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255,255,255,.7);
          font-size: 23px;
          line-height: 1;
          font-weight: 400;
        }

        .green .olitecArrow { color: #159f48; }
        .blue .olitecArrow { color: #1769d7; }
        .orange .olitecArrow { color: #e96b00; }
        .purple .olitecArrow { color: #7130cf; }

        @media (min-width: 1250px) {
          .olitecHomeHeader { padding-top: 12px; padding-bottom: 8px; }
          .olitecHomeLayout { height: min(570px, calc(100svh - 76px)); }
          .olitecHeroCopy { padding-left: 40px; padding-right: 34px; }
        }

        @media (max-width: 1050px) and (min-width: 701px) {
          .olitecHomeHeader, .olitecHomeMain { width: min(960px, calc(100% - 28px)); }
          .olitecHomeLayout { grid-template-columns: minmax(0, 1.25fr) minmax(390px, 1fr); height: min(540px, calc(100svh - 74px)); }
          .olitecHero { grid-template-columns: 55% 45%; }
          .olitecHero h1 { font-size: clamp(35px, 4vw, 48px); }
          .olitecFeature { font-size: 9px; }
          .olitecFeatures { gap: 10px; }
        }

        @media (max-width: 700px) {
          .olitecHomeHeader, .olitecHomeMain { width: calc(100% - 28px); }
          .olitecHomeHeader { padding: 14px 0 9px; }
          .olitecBrandName { font-size: 30px; }
          .olitecBrandTagline { font-size: 6px; letter-spacing: .28em; }
          .olitecHomeMain { padding-bottom: 12px; }

          .olitecHomeLayout {
            display: block;
            height: auto;
            min-height: 0;
          }

          .olitecHero {
            height: 305px;
            grid-template-columns: 56% 44%;
            border-radius: 0;
            border-left: 0;
            border-right: 0;
            box-shadow: none;
          }

          .olitecHeroCopy {
            padding: 23px 8px 20px 7px;
          }

          .olitecEyebrow { margin-bottom: 12px; font-size: 8px; letter-spacing: .3em; }
          .olitecHero h1 { font-size: clamp(29px, 8vw, 39px); line-height: .94; }
          .olitecHeroCopy > p { margin-top: 12px; font-size: 13px; line-height: 1.28; }
          .olitecAccent { width: 40px; height: 4px; margin-top: 14px; }
          .olitecFeatures { gap: 7px; margin-top: 14px; }
          .olitecFeature { gap: 4px; font-size: 8px; }
          .olitecFeatureIcon { width: 22px; height: 22px; }
          .olitecHeroImage img { object-fit: contain; }

          .olitecServices {
            margin-top: 12px;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(2, 164px);
            gap: 10px;
          }

          .olitecServiceCard {
            padding: 15px 13px 13px;
            border-radius: 18px;
          }

          .olitecServiceIcon { width: 40px; height: 40px; }
          .olitecServiceBody { margin-top: 10px; padding-right: 19px; }
          .olitecServiceBody strong { font-size: 17px; line-height: .99; }
          .olitecServiceBody > span { margin-top: 6px; font-size: 11px; line-height: 1.22; }
          .olitecArrow { width: 32px; height: 32px; right: 11px; bottom: 11px; font-size: 21px; }
        }

        @media (max-width: 430px) {
          .olitecHomeHeader, .olitecHomeMain { width: calc(100% - 22px); }
          .olitecHero { height: 292px; grid-template-columns: 55% 45%; }
          .olitecHeroCopy { padding-left: 5px; }
          .olitecHero h1 { font-size: 29px; }
          .olitecHeroCopy > p { font-size: 12px; }
          .olitecFeatures { gap: 4px; }
          .olitecFeature { font-size: 7px; }
          .olitecFeatureIcon { width: 20px; height: 20px; }
          .olitecServices { grid-template-rows: repeat(2, 157px); gap: 8px; margin-top: 9px; }
          .olitecServiceCard { padding: 13px 11px 11px; border-radius: 16px; }
          .olitecServiceIcon { width: 37px; height: 37px; }
          .olitecServiceBody { margin-top: 9px; padding-right: 15px; }
          .olitecServiceBody strong { font-size: 15px; }
          .olitecServiceBody > span { font-size: 10px; }
          .olitecArrow { width: 29px; height: 29px; right: 9px; bottom: 9px; font-size: 19px; }
        }
      `}</style>
    </div>
  )
}
