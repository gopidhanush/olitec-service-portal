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
          width: min(1320px, 100%);
          margin: 0 auto;
          padding: 14px clamp(18px, 2.4vw, 34px) 10px;
        }

        .olitecBrand {
          display: inline-flex;
          flex-direction: column;
          color: #0b1d3d;
          text-decoration: none;
        }

        .olitecBrandName {
          font-size: clamp(27px, 2.05vw, 34px);
          line-height: .92;
          font-weight: 800;
          letter-spacing: -.035em;
        }

        .olitecBrandTagline {
          margin-top: 5px;
          font-size: clamp(6px, .5vw, 8px);
          line-height: 1;
          letter-spacing: .27em;
          font-weight: 700;
          color: #657691;
          white-space: nowrap;
        }

        .olitecPortalMain {
          width: min(1320px, 100%);
          margin: 0 auto;
          padding: 0 clamp(18px, 2.4vw, 34px) 14px;
        }

        /* Desktop: compact single-screen composition — hero on the left, four actions on the right. */
        .olitecDesktopLayout {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(430px, .88fr);
          gap: 14px;
          height: min(690px, calc(100svh - 82px));
          min-height: 560px;
        }

        .olitecHero {
          position: relative;
          min-width: 0;
          min-height: 0;
          display: grid;
          grid-template-columns: 57% 43%;
          overflow: hidden;
          border: 1px solid #edf1f3;
          border-radius: 24px;
          background: linear-gradient(105deg, #fff 0%, #fbfcfd 58%, #eef2f3 100%);
          box-shadow: 0 16px 38px rgba(21,39,65,.075);
        }

        .olitecHeroCopy {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          padding: clamp(26px, 3.2vw, 48px);
        }

        .olitecEyebrow {
          margin-bottom: 14px;
          font-size: clamp(9px, .72vw, 12px);
          line-height: 1;
          font-weight: 700;
          letter-spacing: .34em;
          color: #63758f;
        }

        .olitecHero h1 {
          margin: 0;
          font-size: clamp(40px, 3.65vw, 62px);
          line-height: .97;
          letter-spacing: -.052em;
          font-weight: 800;
          color: #071a3b;
        }

        .olitecHeroCopy > p {
          max-width: 500px;
          margin: 17px 0 0;
          color: #536985;
          font-size: clamp(15px, 1.15vw, 19px);
          line-height: 1.36;
        }

        .olitecHeroAccent {
          display: block;
          width: 48px;
          height: 4px;
          margin-top: 22px;
          border-radius: 999px;
          background: #2caf5b;
        }

        .olitecFeatures {
          display: flex;
          align-items: center;
          gap: clamp(12px, 1.5vw, 24px);
          margin-top: 24px;
        }

        .olitecFeature {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
          color: #5b6e89;
          font-size: clamp(9px, .72vw, 13px);
          line-height: 1.15;
        }

        .olitecFeatureIcon {
          width: clamp(23px, 1.7vw, 29px);
          height: clamp(23px, 1.7vw, 29px);
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

        .olitecHeroVisual::after {
          content: '';
          position: absolute;
          right: -8%;
          bottom: -12%;
          width: 42%;
          height: 55%;
          border-radius: 50%;
          background: rgba(137, 191, 124, .18);
          filter: blur(24px);
          pointer-events: none;
        }

        .olitecHeroVisual img {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        /* Four compact action cards fit into the right column without vertical scrolling. */
        .olitecServiceGrid {
          min-width: 0;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .olitecServiceCard {
          min-width: 0;
          min-height: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: 46px minmax(0, 1fr);
          grid-template-rows: auto 1fr auto;
          align-content: start;
          gap: 12px;
          padding: 22px 18px 18px;
          border: 1px solid transparent;
          border-radius: 22px;
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
          width: 46px;
          height: 46px;
          border-radius: 50%;
          grid-column: 1;
          grid-row: 1;
        }

        .olitecServiceIcon svg { width: 52%; height: 52%; }
        .green .olitecServiceIcon { background:#d5f4df; color:#16a34a; }
        .blue .olitecServiceIcon { background:#dceaff; color:#1667d9; }
        .orange .olitecServiceIcon { background:#ffe5c7; color:#ea6b00; }
        .purple .olitecServiceIcon { background:#ead8ff; color:#7032cf; }

        .olitecServiceContent {
          display:flex;
          flex-direction:column;
          min-width:0;
          grid-column: 1 / -1;
          grid-row: 2;
          align-self: start;
        }

        .olitecServiceContent strong {
          font-size: clamp(16px, 1.35vw, 22px);
          line-height: 1.08;
          letter-spacing: -.035em;
          font-weight: 800;
        }

        .olitecServiceContent span {
          max-width: 270px;
          margin-top: 8px;
          color:#566b88;
          font-size: clamp(10px, .82vw, 14px);
          line-height:1.34;
        }

        .olitecServiceArrow {
          display:grid;
          place-items:center;
          justify-self:end;
          align-self:end;
          width:38px;
          height:38px;
          grid-column: 2;
          grid-row: 3;
          border-radius:50%;
          background:rgba(255,255,255,.8);
          font-size:25px;
          line-height:1;
          font-weight:500;
        }
        .green .olitecServiceArrow { color:#16a34a; }
        .blue .olitecServiceArrow { color:#1667d9; }
        .orange .olitecServiceArrow { color:#ea6b00; }
        .purple .olitecServiceArrow { color:#7032cf; }

        @media (min-width: 901px) and (max-height: 760px) {
          .olitecPortalHeader { padding-top: 10px; padding-bottom: 7px; }
          .olitecDesktopLayout { height: calc(100svh - 66px); min-height: 500px; }
          .olitecHeroCopy { padding: 24px 30px; }
          .olitecHero h1 { font-size: clamp(36px, 3.5vw, 54px); }
          .olitecHeroCopy > p { margin-top: 14px; font-size: 15px; }
          .olitecHeroAccent { margin-top: 17px; }
          .olitecFeatures { margin-top: 18px; }
          .olitecServiceCard { padding: 17px 15px 14px; gap: 9px; border-radius: 19px; }
          .olitecServiceIcon { width: 42px; height: 42px; }
          .olitecServiceContent strong { font-size: 16px; }
          .olitecServiceContent span { margin-top: 6px; font-size: 10px; }
          .olitecServiceArrow { width: 34px; height: 34px; font-size: 22px; }
        }

        @media (max-width: 900px) {
          .olitecPortalHeader { padding-left:20px; padding-right:20px; }
          .olitecPortalMain { padding-left:20px; padding-right:20px; }
          .olitecDesktopLayout {
            grid-template-columns: 1fr;
            grid-template-rows: minmax(310px, 42svh) minmax(0, 1fr);
            height: auto;
            min-height: 0;
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
          .olitecPortalMain { padding: 0 12px 10px; }
          .olitecDesktopLayout {
            grid-template-rows: 40svh minmax(0, 1fr);
            gap: 10px;
            min-height: 0;
          }
          .olitecHero {
            grid-template-columns: 58% 42%;
            border-radius: 18px;
          }
          .olitecHeroCopy { padding: 20px 9px 18px 17px; }
          .olitecEyebrow { margin-bottom: 11px; font-size: 8px; letter-spacing:.3em; }
          .olitecHero h1 { font-size: clamp(29px, 8.2vw, 39px); line-height:.98; }
          .olitecHeroCopy > p { margin-top: 12px; font-size: 13px; line-height:1.28; }
          .olitecHeroAccent { width:48px; height:4px; margin-top:13px; }
          .olitecFeatures { gap: 8px; margin-top: 14px; justify-content: space-between; }
          .olitecFeature { gap:4px; font-size: 8px; }
          .olitecFeatureIcon { width:20px; height:20px; }
          .olitecHeroVisual img { object-fit: cover; object-position: center; }
          .olitecServiceGrid { gap:10px; min-height:0; }
          .olitecServiceCard {
            grid-template-columns: 40px minmax(0,1fr);
            grid-template-rows: auto 1fr auto;
            gap: 8px;
            padding: 13px 11px 11px;
            border-radius: 17px;
          }
          .olitecServiceIcon { width:40px; height:40px; }
          .olitecServiceContent strong { font-size: 15px; line-height:1.02; }
          .olitecServiceContent span { margin-top:5px; font-size:10px; line-height:1.18; }
          .olitecServiceArrow { width:28px; height:28px; font-size:21px; }
        }

        @media (max-width: 390px) {
          .olitecPortalMain { padding-left:10px; padding-right:10px; }
          .olitecDesktopLayout { grid-template-rows: 39svh minmax(0,1fr); }
          .olitecHeroCopy { padding-left:14px; padding-right:6px; }
          .olitecHero h1 { font-size: 27px; }
          .olitecHeroCopy > p { font-size:12px; }
          .olitecFeature { font-size:7px; }
          .olitecServiceCard { padding:10px 9px; }
          .olitecServiceIcon { width:36px; height:36px; }
          .olitecServiceContent strong { font-size:14px; }
          .olitecServiceContent span { font-size:9px; }
          .olitecServiceArrow { width:25px; height:25px; font-size:19px; }
        }
      `}</style>
    </div>
  )
}
