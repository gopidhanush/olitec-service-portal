'use client'

import Link from 'next/link'

const services = [
  { tone: 'green', title: 'Product Registration', text: 'Scan QR code or enter your serial number to register your product.', href: '/register', icon: 'scan' },
  { tone: 'blue', title: 'Warranty Status', text: 'Check your product warranty details anytime.', href: '/warranty', icon: 'shield' },
  { tone: 'orange', title: 'Register Complaint', text: 'Report a problem with your registered product.', href: '/service/complaint/start', icon: 'wrench' },
  { tone: 'purple', title: 'Complaint Status', text: 'Track the latest status of your service complaint.', href: '/service/track', icon: 'file' },
]

function ServiceIcon({ type }: { type: string }) {
  if (type === 'scan') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M3 17v2a2 2 0 0 0 2 2h2"/><circle cx="12" cy="12" r="3"/><path d="M8 12h1M15 12h1M12 8v1M12 15v1"/></svg>
  if (type === 'shield') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.3 8.6-8 10-4.7-1.4-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>
  if (type === 'wrench') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.1a5 5 0 0 0-6.2 6.2L3.8 17a2.1 2.1 0 1 0 3 3l4.7-4.7a5 5 0 0 0 6.2-6.2l-3.2 3.2-2.9-.9-.9-2.9 3.2-3.2Z"/></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M10 12h5M10 16h5"/></svg>
}

function FeatureIcon({ type }: { type: string }) {
  if (type === 'shield') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z"/><path d="m8.4 12 2.2 2.2 4.9-5"/></svg>
  if (type === 'bolt') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 2 5 13h5.8L10.8 22 19 10.5h-5.8L13.2 2Z"/></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><path d="M4 13h3v6H5a1 1 0 0 1-1-1v-5ZM20 13h-3v6h2a1 1 0 0 1 1-1v-5Z"/><path d="M17 19c-.8 1.1-2 2-4 2h-1"/></svg>
}

const features = [
  { icon: 'shield', label: <>Genuine<br />Support</> },
  { icon: 'bolt', label: <>Quick<br />Service</> },
  { icon: 'headset', label: <>Reliable<br />Assistance</> },
]

export default function HomePage() {
  return (
    <div className="olitecHomePage">
      <header className="olitecHeader">
        <Link href="/" className="olitecLogo" aria-label="OLITEC home">
          <img src="/olitec-logo.svg" alt="OLITEC" />
        </Link>
        <nav className="olitecNav" aria-label="Support navigation">
          <span className="portalLabel">Support Portal</span>
          <Link href="/" className="homeButton"><span className="homeIcon" aria-hidden="true">⌂</span> Home</Link>
        </nav>
      </header>

      <main className="olitecMain">
        <section className="olitecHero" aria-label="OLITEC Inverter Support">
          {/* The supplied photographic hero is used only as the scene/background. All copy and feature icons below are live HTML. */}
          <div className="heroPhoto" aria-hidden="true" />
          <div className="heroWash" aria-hidden="true" />
          <div className="heroCopy">
            <span className="heroEyebrow">OLITEC<br />customer support</span>
            <h1>Clean Energy<br /><span>For A Brighter Tomorrow</span></h1>
            <p>Register, check warranty and get<br className="desktopBreak" /> service support — all in one place.</p>
            <span className="heroAccent" />
            <div className="heroFeatures">
              {features.map((feature) => (
                <div className="heroFeature" key={feature.icon}>
                  <span className="heroFeatureIcon"><FeatureIcon type={feature.icon} /></span>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="olitecServices" aria-label="Customer services">
          {services.map((service) => (
            <Link key={service.title} href={service.href} className={`serviceCard ${service.tone}`}>
              <span className="serviceIcon"><ServiceIcon type={service.icon} /></span>
              <strong>{service.title}</strong>
              <span className="serviceText">{service.text}</span>
              <span className="serviceArrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </section>
      </main>

      <style jsx global>{`
        :root{--navy:#071a3d;--muted:#4e6685;--green:#16aa50;--blue:#2078e8;--orange:#ff8500;--purple:#7333e6}
        html,body{margin:0;padding:0;background:#fff}
        *{box-sizing:border-box}
        body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:var(--navy);-webkit-font-smoothing:antialiased}
        a{text-decoration:none}
        .olitecHomePage{min-height:100svh;width:100%;background:#fff;overflow-x:hidden}

        .olitecHeader{width:min(1465px,calc(100% - 48px));height:78px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
        .olitecLogo{width:158px;display:block;line-height:0}
        .olitecLogo img{display:block;width:100%;height:auto}
        .olitecNav{display:flex;align-items:center;gap:24px}
        .portalLabel{font-size:10.5px;font-weight:800;color:#16345b;padding-bottom:6px;border-bottom:2px solid #16aa50;line-height:1}
        .homeButton{height:42px;padding:0 19px;border:1px solid #dce5ed;border-radius:999px;background:#fff;color:#10213b;display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;box-shadow:0 5px 16px rgba(17,40,70,.07)}
        .homeIcon{font-size:15px;line-height:1}

        .olitecMain{width:min(1465px,calc(100% - 48px));height:min(540px,calc(100svh - 100px));min-height:455px;margin:0 auto 18px;display:grid;grid-template-columns:minmax(0,2.45fr) minmax(380px,1fr);gap:11px}

        .olitecHero{position:relative;min-width:0;min-height:0;border-radius:18px;overflow:hidden;border:1px solid #e3e9ee;background:#eaf2f4;box-shadow:0 12px 30px rgba(18,42,70,.07)}
        .heroPhoto{position:absolute;inset:0;background-image:url('/olitec-generated-hero.jpg');background-size:100% 100%;background-position:center;background-repeat:no-repeat;transform:none}
        /* The source image is a clean photographic scene. The heading, description and feature icons remain live HTML above it. */
        .heroWash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.92) 0%,rgba(255,255,255,.72) 26%,rgba(255,255,255,.30) 47%,rgba(255,255,255,.05) 66%,rgba(255,255,255,0) 82%);pointer-events:none}
        .heroWash:after{content:"";position:absolute;left:0;bottom:0;width:46%;height:18%;background:linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.30) 50%,rgba(255,255,255,.72) 100%)}
        .heroCopy{position:absolute;z-index:2;left:5.5%;top:0;width:45%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:5% 0 4%}
        .heroEyebrow{font-size:10px;line-height:1.7;letter-spacing:.30em;font-weight:800;color:#637b9b;margin-bottom:17px}
        .heroCopy h1{margin:0;color:#071a3d;font-size:clamp(39px,4vw,61px);line-height:.94;letter-spacing:-.055em;font-weight:900}
        .heroCopy h1 span{color:#075d46}
        .heroCopy p{margin:18px 0 0;color:#4b6382;font-size:15px;line-height:1.42;font-weight:500}
        .heroAccent{display:block;width:29px;height:3px;border-radius:99px;background:#13ae55;margin-top:17px}
        .heroFeatures{display:flex;align-items:flex-start;gap:27px;margin-top:20px}
        .heroFeature{display:flex;align-items:center;gap:7px;color:#496684;font-size:9px;line-height:1.15;font-weight:600;min-width:70px}
        .heroFeatureIcon{width:27px;height:27px;display:grid;place-items:center;color:#0aaa52;flex:0 0 auto}
        .heroFeatureIcon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}

        .olitecServices{min-width:0;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:11px}
        .serviceCard{position:relative;min-width:0;min-height:0;border:1px solid;border-radius:18px;padding:20px 18px 18px;display:flex;flex-direction:column;align-items:flex-start;overflow:hidden;color:var(--navy);transition:transform .18s ease,box-shadow .18s ease}
        .serviceCard:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(15,39,70,.08)}
        .serviceCard.green{background:linear-gradient(145deg,#effaf3 0%,#f7fcf9 100%);border-color:#d9eee1}
        .serviceCard.blue{background:linear-gradient(145deg,#eef5ff 0%,#f7faff 100%);border-color:#dce7f8}
        .serviceCard.orange{background:linear-gradient(145deg,#fff5e9 0%,#fffaf4 100%);border-color:#f1dfca}
        .serviceCard.purple{background:linear-gradient(145deg,#f5efff 0%,#fbf9ff 100%);border-color:#e5dafa}
        .serviceIcon{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;margin-bottom:15px}
        .serviceIcon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .green .serviceIcon{background:#d6f3e0;color:#08a34a}.blue .serviceIcon{background:#dbe9ff;color:#1975e7}.orange .serviceIcon{background:#ffe2c4;color:#ff7d00}.purple .serviceIcon{background:#e8d8ff;color:#7130df}
        .serviceCard strong{display:block;max-width:205px;font-size:20px;line-height:.98;letter-spacing:-.045em;font-weight:900}
        .serviceText{display:block;max-width:205px;margin-top:10px;color:#49627f;font-size:10.5px;line-height:1.4}
        .serviceArrow{position:absolute;right:13px;bottom:13px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.9);font-size:19px;line-height:1}
        .green .serviceArrow{color:#08a34a}.blue .serviceArrow{color:#1975e7}.orange .serviceArrow{color:#ff7d00}.purple .serviceArrow{color:#7130df}

        @media(max-width:1200px){
          .olitecHeader,.olitecMain{width:calc(100% - 36px)}
          .olitecMain{grid-template-columns:minmax(0,2.2fr) minmax(330px,1fr)}
          .heroCopy{left:5%;width:47%}.heroCopy h1{font-size:clamp(36px,4.2vw,54px)}
        }
        @media(max-width:900px){
          .olitecHeader{width:min(720px,calc(100% - 32px));height:60px}
          .olitecMain{width:min(720px,calc(100% - 32px));height:auto;min-height:0;grid-template-columns:1fr;gap:10px}
          .olitecHero{aspect-ratio:1.72/1}
          .heroPhoto{background-position:center;background-size:100% 100%}
          .heroCopy{left:5%;width:48%}.heroCopy h1{font-size:clamp(31px,7vw,48px)}.heroCopy p{font-size:12px}.heroEyebrow{font-size:8px}.heroFeatures{gap:12px}.heroFeature{font-size:8px;min-width:60px}
          .olitecServices{min-height:330px}
        }
        @media(max-width:600px){
          .olitecHeader{width:calc(100% - 24px);height:58px}
          .olitecLogo{width:126px}.olitecNav{gap:9px}.portalLabel{display:none}
          .homeButton{height:34px;padding:0 12px;font-size:10px}
          .olitecMain{width:calc(100% - 24px);gap:8px;margin-bottom:12px}
          .olitecHero{aspect-ratio:1.08/1;border-radius:13px;min-height:390px}
          .heroPhoto{background-position:center;background-size:100% 100%}
          .heroWash{background:linear-gradient(90deg,rgba(255,255,255,.94) 0%,rgba(255,255,255,.72) 48%,rgba(255,255,255,.18) 74%,rgba(255,255,255,0) 100%)}
          .heroWash:after{width:68%;height:18%;background:linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.24) 55%,rgba(255,255,255,.62) 100%)}
          .heroCopy{left:7%;width:62%;height:100%;padding:9% 0 7%;justify-content:flex-start}
          .heroEyebrow{font-size:7px;letter-spacing:.22em;margin-bottom:13px}.heroCopy h1{font-size:32px;line-height:.94}.heroCopy p{font-size:11px;line-height:1.35;margin-top:14px}.desktopBreak{display:none}.heroAccent{margin-top:13px}.heroFeatures{gap:8px;margin-top:16px}.heroFeature{font-size:7px;gap:4px;min-width:54px}.heroFeatureIcon{width:22px;height:22px}.heroFeatureIcon svg{width:21px;height:21px}
          .olitecServices{grid-template-columns:1fr;grid-template-rows:none;gap:8px;min-height:0}
          .serviceCard{height:92px;border-radius:13px;padding:12px 48px 12px 12px;justify-content:center}
          .serviceIcon{width:34px;height:34px;margin-bottom:6px}.serviceIcon svg{width:18px;height:18px}
          .serviceCard strong{font-size:14px;line-height:1.02}.serviceText{font-size:9px;line-height:1.3;margin-top:4px;max-width:245px}
          .serviceArrow{right:12px;top:50%;bottom:auto;transform:translateY(-50%);width:30px;height:30px}
        }
        @media(max-width:380px){.olitecHero{min-height:360px}.heroCopy h1{font-size:29px}.serviceCard{height:86px}.serviceCard strong{font-size:13px}.serviceText{font-size:8.5px}}
      `}</style>
    </div>
  )
}
