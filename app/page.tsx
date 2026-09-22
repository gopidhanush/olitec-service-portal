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
        <section className="olitecDesktopLayout" aria-label="OLITEC service portal">
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
              <button key={service.title} type="button" className={`olitecServiceCard ${service.tone}`} onClick={() => router.push(service.href)}>
                <span className="olitecServiceIcon"><ServiceIcon type={service.icon} /></span>
                <span className="olitecServiceContent">
                  <strong>{service.title}</strong>
                  <span>{service.text}</span>
                </span>
                <span className="olitecServiceArrow" aria-hidden="true">→</span>
              </button>
            ))}
          </section>
        </section>
      </main>

      <style jsx global>{`
        html, body { margin: 0; padding: 0; background: #fff; }
        *, *::before, *::after { box-sizing: border-box; }

        .olitecPortalPage {
          width: 100%;
          min-height: 100svh;
          color: #0b1d3d;
          background: #fff;
          overflow-x: hidden;
        }

        .olitecPortalHeader {
          width: min(1380px, 100%);
          margin: 0 auto;
          padding: clamp(14px, 2vw, 24px) clamp(20px, 3.5vw, 52px) clamp(9px, 1vw, 14px);
        }

        .olitecBrand {
          display: inline-flex;
          flex-direction: column;
          color: #0b1d3d;
          text-decoration: none;
        }

        .olitecBrandName {
          font-size: clamp(27px, 2.2vw, 34px);
          line-height: .92;
          font-weight: 800;
          letter-spacing: -.035em;
        }

        .olitecBrandTagline {
          margin-top: 6px;
          font-size: clamp(6px, .55vw, 8px);
          line-height: 1;
          letter-spacing: .27em;
          font-weight: 700;
          color: #657691;
          white-space: nowrap;
        }

        .olitecPortalMain {
          width: min(1380px, 100%);
          margin: 0 auto;
          padding: 0 clamp(20px, 3.5vw, 52px) clamp(18px, 2vw, 28px);
        }

        .olitecDesktopLayout {
          display: grid;
          grid-template-columns: minmax(0, 1.18fr) minmax(400px, .82fr);
          gap: clamp(14px, 1.5vw, 22px);
          height: min(680px, calc(100svh - 108px));
          min-height: 560px;
        }

        .olitecHero {
          position: relative;
          min-width: 0;
          min-height: 0;
          display: grid;
          grid-template-columns: 53% 47%;
          overflow: hidden;
          border: 1px solid #edf1f3;
          border-radius: clamp(20px, 2vw, 28px);
          background: linear-gradient(105deg, #fff 0%, #fbfcfd 58%, #eef2f3 100%);
          box-shadow: 0 18px 44px rgba(21,39,65,.08);
        }

        .olitecHeroCopy {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          padding: clamp(28px, 4vw, 58px);
        }

        .olitecEyebrow {
          margin-bottom: clamp(12px, 1.3vw, 18px);
          font-size: clamp(9px, .8vw, 12px);
          line-height: 1;
          font-weight: 700;
          letter-spacing: .34em;
          color: #63758f;
        }

        .olitecHero h1 {
          margin: 0;
          font-size: clamp(38px, 4.1vw, 66px);
          line-height: .97;
          letter-spacing: -.05em;
          font-weight: 800;
          color: #071a3b;
        }

        .olitecHeroCopy > p {
          max-width: 520px;
          margin: clamp(14px, 1.8vw, 24px) 0 0;
          color: #536985;
          font-size: clamp(15px, 1.35vw, 21px);
          line-height: 1.38;
        }

        .olitecHeroAccent {
          display: block;
          width: 56px;
          height: 4px;
          margin-top: clamp(18px, 2vw, 28px);
          border-radius: 999px;
          background: #2caf5b;
        }

        .olitecFeatures {
          display: flex;
          flex-wrap: wrap;
          gap: clamp(12px, 2vw, 30px);
          margin-top: clamp(20px, 2.5vw, 34px);
        }

        .olitecFeature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #5b6e89;
          font-size: clamp(10px, .9vw, 14px);
          line-height: 1.2;
        }

        .olitecFeatureIcon {
          width: clamp(23px, 2vw, 30px);
          height: clamp(23px, 2vw, 30px);
          flex: 0 0 auto;
          color: #647994;
        }

        .olitecFeatureIcon svg { display: block; width: 100%; height: 100%; }

        .olitecHeroVisual {
          position: relative;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          display: grid;
          place-items: center;
          background: linear-gradient(120deg, #f3f6f7, #e5eaec);
        }

        .olitecHeroVisual img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .olitecServiceGrid {
          min-width: 0;
          min-height: 0;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: repeat(4, minmax(0, 1fr));
          gap: clamp(12px, 1.35vw, 18px);
        }

        .olitecServiceCard {
          min-width: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: clamp(52px, 4.5vw, 68px) minmax(0, 1fr) 42px;
          align-items: center;
          gap: clamp(10px, 1vw, 16px);
          padding: clamp(16px, 1.8vw, 25px);
          border: 1px solid transparent;
          border-radius: clamp(18px, 1.8vw, 24px);
          text-align: left;
          color: #0b1d3d;
          cursor: pointer;
          transition: transform .16s ease, box-shadow .16s ease;
        }

        .olitecServiceCard:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(15,36,66,.08); }
        .olitecServiceCard.green { background: linear-gradient(135deg,#f0fbf4,#f8fdf9); border-color:#e3f1e7; }
        .olitecServiceCard.blue { background: linear-gradient(135deg,#f0f6ff,#f7faff); border-color:#e1eafa; }
        .olitecServiceCard.orange { background: linear-gradient(135deg,#fff6ec,#fffbf6); border-color:#f5e9dc; }
        .olitecServiceCard.purple { background: linear-gradient(135deg,#f6f0ff,#fbf9ff); border-color:#ebe3f8; }

        .olitecServiceIcon {
          display: grid;
          place-items: center;
          width: clamp(48px, 4.3vw, 62px);
          height: clamp(48px, 4.3vw, 62px);
          border-radius: 50%;
        }

        .olitecServiceIcon svg { width: 52%; height: 52%; }
        .green .olitecServiceIcon { background:#d5f4df; color:#16a34a; }
        .blue .olitecServiceIcon { background:#dceaff; color:#1667d9; }
        .orange .olitecServiceIcon { background:#ffe5c7; color:#ea6b00; }
        .purple .olitecServiceIcon { background:#ead8ff; color:#7032cf; }

        .olitecServiceContent { display:flex; flex-direction:column; min-width:0; }
        .olitecServiceContent strong {
          font-size: clamp(17px, 1.45vw, 24px);
          line-height: 1.08;
          letter-spacing: -.03em;
          font-weight: 800;
        }
        .olitecServiceContent span {
          margin-top: 7px;
          color:#566b88;
          font-size: clamp(11px, .9vw, 15px);
          line-height:1.35;
        }

        .olitecServiceArrow {
          display:grid;
          place-items:center;
          width:42px;
          height:42px;
          border-radius:50%;
          background:rgba(255,255,255,.76);
          font-size:27px;
          line-height:1;
          font-weight:500;
        }
        .green .olitecServiceArrow { color:#16a34a; }
        .blue .olitecServiceArrow { color:#1667d9; }
        .orange .olitecServiceArrow { color:#ea6b00; }
        .purple .olitecServiceArrow { color:#7032cf; }

        @media (max-width: 900px) {
          .olitecPortalHeader { padding-left:20px; padding-right:20px; }
          .olitecPortalMain { padding-left:20px; padding-right:20px; }
          .olitecDesktopLayout {
            grid-template-columns: 1fr;
            grid-template-rows: minmax(310px, 48svh) minmax(0, 1fr);
            height: auto;
            min-height: calc(100svh - 88px);
          }
          .olitecHero { grid-template-columns: 55% 45%; }
          .olitecServiceGrid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            min-height: 310px;
          }
          .olitecServiceCard { min-height: 0; }
        }

        @media (max-width: 600px) {
          .olitecPortalHeader { padding: 17px 20px 9px; }
          .olitecBrandName { font-size: 28px; }
          .olitecBrandTagline { font-size: 6px; letter-spacing: .25em; margin-top:5px; }
          .olitecPortalMain { padding: 0 12px 12px; }
          .olitecDesktopLayout {
            grid-template-rows: 42svh minmax(0, 1fr);
            gap: 10px;
            min-height: calc(100svh - 76px);
          }
          .olitecHero {
            grid-template-columns: 58% 42%;
            border-radius: 18px;
          }
          .olitecHeroCopy { padding: 22px 10px 20px 18px; }
          .olitecEyebrow { margin-bottom: 12px; font-size: 8px; letter-spacing:.3em; }
          .olitecHero h1 { font-size: clamp(29px, 8.2vw, 39px); line-height:.98; }
          .olitecHeroCopy > p { margin-top: 13px; font-size: 13px; line-height:1.28; }
          .olitecHeroAccent { width:48px; height:4px; margin-top:14px; }
          .olitecFeatures { gap: 10px; margin-top: 15px; justify-content: space-between; }
          .olitecFeature { gap:5px; font-size: 8px; }
          .olitecFeatureIcon { width:20px; height:20px; }
          .olitecHeroVisual img { object-fit: cover; object-position: center; }
          .olitecServiceGrid { gap:10px; min-height:0; }
          .olitecServiceCard {
            grid-template-columns: 42px minmax(0,1fr) 28px;
            gap: 7px;
            padding: 13px 12px;
            border-radius: 17px;
          }
          .olitecServiceIcon { width:40px; height:40px; }
          .olitecServiceContent strong { font-size: 15px; line-height:1.02; }
          .olitecServiceContent span { margin-top:5px; font-size:10px; line-height:1.18; }
          .olitecServiceArrow { width:28px; height:28px; font-size:21px; }
        }

        @media (max-width: 390px) {
          .olitecPortalMain { padding-left:10px; padding-right:10px; }
          .olitecDesktopLayout { grid-template-rows: 40svh minmax(0,1fr); }
          .olitecHeroCopy { padding-left:15px; padding-right:7px; }
          .olitecHero h1 { font-size: 27px; }
          .olitecHeroCopy > p { font-size:12px; }
          .olitecFeature { font-size:7px; }
          .olitecServiceCard { grid-template-columns: 38px minmax(0,1fr) 25px; padding:11px 9px; }
          .olitecServiceIcon { width:36px; height:36px; }
          .olitecServiceContent strong { font-size:14px; }
          .olitecServiceContent span { font-size:9px; }
          .olitecServiceArrow { width:25px; height:25px; font-size:19px; }
        }
      `}</style>
    </div>
  )
}
