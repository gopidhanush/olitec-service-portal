'use client'

import Link from 'next/link'

const services = [
  { tone: 'green', title: 'Product Registration', text: 'Scan QR code or enter your serial number.', href: '/register', icon: 'scan' },
  { tone: 'blue', title: 'Warranty Status', text: 'Check your product warranty details.', href: '/warranty', icon: 'shield' },
  { tone: 'orange', title: 'Register Complaint', text: 'Report a problem with your registered product.', href: '/service/complaint/start', icon: 'wrench' },
  { tone: 'purple', title: 'Complaint Status', text: 'Track the latest status of your service complaint.', href: '/service/track', icon: 'file' },
]

function ServiceIcon({ type }: { type: string }) {
  if (type === 'scan') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M3 17v2a2 2 0 0 0 2 2h2"/><circle cx="12" cy="12" r="3"/><path d="M8 12h1M15 12h1M12 8v1M12 15v1"/></svg>
  if (type === 'shield') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.3 8.6-8 10-4.7-1.4-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>
  if (type === 'wrench') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.1a5 5 0 0 0-6.2 6.2L3.8 17a2.1 2.1 0 1 0 3 3l4.7-4.7a5 5 0 0 0 6.2-6.2l-3.2 3.2-2.9-.9-.9-2.9 3.2-3.2Z"/></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M10 12h5M10 16h5"/></svg>
}

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
          <img src="/olitec-generated-hero.jpg" alt="OLITEC inverter support" />
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

        /* Desktop baseline is intentionally sized to reproduce the visual scale that previously required 110% browser zoom. */
        .olitecHeader{width:min(1465px,calc(100% - 48px));height:78px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
        .olitecLogo{width:158px;display:block;line-height:0}
        .olitecLogo img{display:block;width:100%;height:auto}
        .olitecNav{display:flex;align-items:center;gap:24px}
        .portalLabel{font-size:10.5px;font-weight:800;color:#16345b;padding-bottom:6px;border-bottom:2px solid #16aa50;line-height:1}
        .homeButton{height:42px;padding:0 19px;border:1px solid #dce5ed;border-radius:999px;background:#fff;color:#10213b;display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;box-shadow:0 5px 16px rgba(17,40,70,.07)}
        .homeIcon{font-size:15px;line-height:1}

        .olitecMain{width:min(1465px,calc(100% - 48px));height:min(540px,calc(100svh - 100px));min-height:455px;margin:0 auto 18px;display:grid;grid-template-columns:minmax(0,2.45fr) minmax(380px,1fr);gap:11px}
        .olitecHero{position:relative;min-width:0;min-height:0;border-radius:18px;overflow:hidden;border:1px solid #e3e9ee;background:#edf4f6;box-shadow:0 12px 30px rgba(18,42,70,.07)}
        /* The supplied raster contains a grey strip at its bottom. Scale from the top so that strip stays outside the visible hero. */
        .olitecHero img{position:absolute;left:50%;top:0;width:108%;height:auto;min-height:108%;display:block;max-width:none;object-fit:cover;object-position:center top;transform:translateX(-50%);transform-origin:center top}

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
        }
        @media(max-width:900px){
          .olitecHeader{width:min(720px,calc(100% - 32px));height:60px}
          .olitecMain{width:min(720px,calc(100% - 32px));height:auto;min-height:0;grid-template-columns:1fr;gap:10px}
          .olitecHero{aspect-ratio:2/1}
          .olitecHero img{width:108%;min-height:108%;height:auto}
          .olitecServices{min-height:330px}
        }
        @media(max-width:600px){
          .olitecHeader{width:calc(100% - 24px);height:58px}
          .olitecLogo{width:126px}
          .olitecNav{gap:9px}.portalLabel{display:none}
          .homeButton{height:34px;padding:0 12px;font-size:10px}
          .olitecMain{width:calc(100% - 24px);gap:8px;margin-bottom:12px}
          .olitecHero{aspect-ratio:2/1;border-radius:13px}
          .olitecHero img{width:108%;min-height:108%;object-fit:cover;object-position:center top}
          .olitecServices{grid-template-columns:1fr;grid-template-rows:none;gap:8px;min-height:0}
          .serviceCard{height:92px;border-radius:13px;padding:12px 48px 12px 12px;justify-content:center}
          .serviceIcon{width:34px;height:34px;margin-bottom:6px}.serviceIcon svg{width:18px;height:18px}
          .serviceCard strong{font-size:14px;line-height:1.02}.serviceText{font-size:9px;line-height:1.3;margin-top:4px;max-width:245px}
          .serviceArrow{right:12px;top:50%;bottom:auto;transform:translateY(-50%);width:30px;height:30px}
        }
        @media(max-width:380px){.serviceCard{height:86px}.serviceCard strong{font-size:13px}.serviceText{font-size:8.5px}}
      `}</style>
    </div>
  )
}
