'use client'

import Link from 'next/link'

function ServiceIcon({ type }: { type: 'scan' | 'shield' | 'wrench' | 'document' }) {
  if (type === 'scan') return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 8H11a3 3 0 0 0-3 3v6M31 8h6a3 3 0 0 1 3 3v6M17 40h-6a3 3 0 0 1-3-3v-6M31 40h6a3 3 0 0 1 3-3v-6" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/><rect x="18" y="18" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M22 14v4M26 14v4M22 30v4M26 30v4M14 22h4M30 22h4M14 26h4M30 26h4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
  if (type === 'shield') return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6 39 12v10c0 10-6.3 16.7-15 20-8.7-3.3-15-10-15-20V12L24 6Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="m17 24 5 5 10-11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (type === 'wrench') return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M29 10a10 10 0 0 0-8 15L10 36a4 4 0 1 0 6 6l11-11a10 10 0 0 0 13-11l-7 7-6-2-2-6 7-7a10 10 0 0 0-3-2Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
          <img src="/olitec-logo.svg" alt="OLITEC" />
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
                <span className="olitecServiceBody"><strong>{service.title}</strong><span>{service.text}</span></span>
                <span className="olitecArrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </section>
        </div>
      </main>

      <style jsx global>{`
        html, body { margin:0; padding:0; background:#fff; }
        *, *::before, *::after { box-sizing:border-box; }
        a { -webkit-tap-highlight-color:transparent; }
        .olitecHome { min-height:100svh; width:100%; overflow-x:hidden; background:#fff; color:#081b3d; font-family:Arial,Helvetica,sans-serif; }
        .olitecHomeHeader, .olitecHomeMain { width:min(1360px,calc(100% - 48px)); margin:0 auto; }
        .olitecHomeHeader { height:72px; display:flex; align-items:center; }
        .olitecBrand { display:block; width:158px; line-height:0; }
        .olitecBrand img { display:block; width:100%; height:auto; }
        .olitecHomeMain { padding-bottom:28px; }
        .olitecHomeLayout { display:grid; grid-template-columns:minmax(0,1.48fr) minmax(430px,.92fr); gap:18px; height:calc(100svh - 100px); min-height:620px; max-height:760px; }
        .olitecHero { min-width:0; min-height:0; display:grid; grid-template-columns:1fr .93fr; overflow:hidden; border:1px solid #e3eaee; border-radius:28px; background:#fff; box-shadow:0 18px 50px rgba(19,40,66,.08); }
        .olitecHeroCopy { min-width:0; display:flex; flex-direction:column; justify-content:center; padding:56px 42px; background:linear-gradient(105deg,#fff 0%,#fff 76%,rgba(255,255,255,.92) 100%); }
        .olitecEyebrow { margin-bottom:16px; color:#637590; font-size:11px; line-height:1; font-weight:700; letter-spacing:.36em; }
        .olitecHero h1 { margin:0; color:#071a3d; font-size:clamp(48px,4vw,64px); line-height:.92; letter-spacing:-.06em; font-weight:800; }
        .olitecHeroCopy > p { max-width:500px; margin:20px 0 0; color:#566b87; font-size:17px; line-height:1.42; }
        .olitecAccent { width:45px; height:4px; margin-top:22px; display:block; border-radius:999px; background:#2caf5b; }
        .olitecFeatures { display:flex; align-items:center; gap:26px; margin-top:24px; }
        .olitecFeature { display:flex; align-items:center; gap:7px; min-width:0; color:#5e718c; font-size:11px; line-height:1.15; }
        .olitecFeatureIcon { width:27px; height:27px; flex:0 0 auto; color:#687d98; }
        .olitecFeatureIcon svg { width:100%; height:100%; display:block; }
        .olitecHeroImage { position:relative; min-width:0; min-height:0; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#eef2f3; }
        .olitecHeroImage:before { content:''; position:absolute; inset:0; background:linear-gradient(100deg,rgba(255,255,255,.45),transparent 25%,transparent 72%,rgba(215,226,220,.18)); pointer-events:none; }
        .olitecHeroImage img { width:100%; height:100%; object-fit:contain; object-position:center; display:block; }
        .olitecServices { min-width:0; min-height:0; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:repeat(2,minmax(0,1fr)); gap:18px; }
        .olitecServiceCard { position:relative; min-width:0; min-height:0; overflow:hidden; display:flex; flex-direction:column; align-items:flex-start; padding:24px 22px; border:1px solid; border-radius:23px; text-decoration:none; color:#081b3d; transition:transform .16s ease,box-shadow .16s ease; }
        .olitecServiceCard:hover { transform:translateY(-2px); box-shadow:0 14px 30px rgba(18,42,70,.10); }
        .olitecServiceCard.green { background:linear-gradient(145deg,#eefaf2,#f8fcf9); border-color:#dcefe3; }
        .olitecServiceCard.blue { background:linear-gradient(145deg,#eef5ff,#f7faff); border-color:#dfe8f7; }
        .olitecServiceCard.orange { background:linear-gradient(145deg,#fff5ea,#fffbf6); border-color:#f4e7da; }
        .olitecServiceCard.purple { background:linear-gradient(145deg,#f5efff,#fbf9ff); border-color:#e9e1f7; }
        .olitecServiceIcon { display:grid; place-items:center; width:44px; height:44px; flex:0 0 auto; border-radius:50%; }
        .olitecServiceIcon svg { width:55%; height:55%; }
        .green .olitecServiceIcon { background:#d3f3df; color:#12a64b; }
        .blue .olitecServiceIcon { background:#d8e8ff; color:#1469d8; }
        .orange .olitecServiceIcon { background:#ffe2c1; color:#e96900; }
        .purple .olitecServiceIcon { background:#e8d5ff; color:#7130d0; }
        .olitecServiceBody { display:flex; flex-direction:column; min-width:0; margin-top:15px; padding-right:30px; }
        .olitecServiceBody strong { color:#081b3d; font-size:clamp(17px,1.5vw,22px); line-height:1.03; letter-spacing:-.04em; font-weight:800; }
        .olitecServiceBody > span { margin-top:8px; color:#5b708e; font-size:12px; line-height:1.32; }
        .olitecArrow { position:absolute; right:16px; bottom:16px; width:36px; height:36px; display:grid; place-items:center; border-radius:50%; background:rgba(255,255,255,.78); font-size:23px; line-height:1; }
        .green .olitecArrow { color:#159f48; } .blue .olitecArrow { color:#1769d7; } .orange .olitecArrow { color:#e96b00; } .purple .olitecArrow { color:#7130cf; }

        @media (max-width:1100px) and (min-width:701px) {
          .olitecHomeHeader,.olitecHomeMain { width:calc(100% - 32px); }
          .olitecHomeLayout { grid-template-columns:minmax(0,1.25fr) minmax(360px,.9fr); gap:14px; min-height:570px; }
          .olitecHero { grid-template-columns:1fr .82fr; }
          .olitecHeroCopy { padding:40px 30px; }
          .olitecHero h1 { font-size:clamp(40px,4.4vw,54px); }
          .olitecFeatures { gap:12px; }
          .olitecFeature { font-size:9px; }
        }

        @media (max-width:700px) {
          .olitecHomeHeader,.olitecHomeMain { width:calc(100% - 24px); }
          .olitecHomeHeader { height:64px; }
          .olitecBrand { width:142px; }
          .olitecHomeMain { padding-bottom:20px; }
          .olitecHomeLayout { display:flex; flex-direction:column; gap:12px; height:auto; min-height:0; max-height:none; }
          .olitecHero { display:flex; flex-direction:column; min-height:0; border-radius:24px; }
          .olitecHeroCopy { order:1; padding:30px 24px 24px; }
          .olitecHeroImage { order:2; height:270px; min-height:270px; }
          .olitecEyebrow { margin-bottom:13px; font-size:9px; letter-spacing:.30em; }
          .olitecHero h1 { font-size:clamp(36px,10vw,46px); line-height:.94; }
          .olitecHeroCopy > p { margin-top:14px; font-size:14px; line-height:1.4; }
          .olitecAccent { margin-top:16px; }
          .olitecFeatures { gap:10px; margin-top:18px; flex-wrap:wrap; }
          .olitecFeature { font-size:9px; }
          .olitecFeatureIcon { width:22px; height:22px; }
          .olitecServices { grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:repeat(2,155px); gap:10px; }
          .olitecServiceCard { padding:16px 14px; border-radius:18px; }
          .olitecServiceIcon { width:38px; height:38px; }
          .olitecServiceBody { margin-top:10px; padding-right:17px; }
          .olitecServiceBody strong { font-size:16px; }
          .olitecServiceBody > span { margin-top:6px; font-size:10px; }
          .olitecArrow { width:30px; height:30px; right:10px; bottom:10px; font-size:19px; }
        }

        @media (max-width:390px) {
          .olitecHomeHeader,.olitecHomeMain { width:calc(100% - 18px); }
          .olitecBrand { width:132px; }
          .olitecHeroCopy { padding:26px 20px 22px; }
          .olitecHero h1 { font-size:34px; }
          .olitecHeroImage { height:245px; min-height:245px; }
          .olitecServices { grid-template-rows:repeat(2,150px); gap:8px; }
          .olitecServiceCard { padding:14px 12px; }
          .olitecServiceBody strong { font-size:15px; }
        }
      `}</style>
    </div>
  )
}
