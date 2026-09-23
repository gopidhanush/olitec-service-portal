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
        <Link href="/" className="olitecBrand" aria-label="OLITEC home"><img src="/olitec-logo.svg" alt="OLITEC" /></Link>
        <div className="olitecHeaderRight">
          <span className="olitecPortalLabel">Support Portal</span>
          <Link href="/" className="olitecHomeButton"><span aria-hidden="true">⌂</span> Home</Link>
        </div>
      </header>

      <main className="olitecHomeMain">
        <div className="olitecHomeLayout">
          <section className="olitecHero" aria-labelledby="hero-title">
            <div className="olitecScene" aria-hidden="true">
              <div className="olitecSky" />
              <div className="olitecCloud cloudOne" />
              <div className="olitecCloud cloudTwo" />
              <div className="olitecHouse">
                <div className="olitecRoof" />
                <div className="olitecSolar"><i /><i /><i /><i /><i /><i /></div>
                <div className="olitecHouseWall"><span /><span /><span /></div>
              </div>
              <div className="olitecLeaf leafOne" /><div className="olitecLeaf leafTwo" /><div className="olitecLeaf leafThree" />
              <div className="olitecPlant"><i /><i /><i /><i /><b /></div>
              <img className="olitecHeroInverter" src="/olitec-inverter-hero.svg" alt="" />
              <div className="olitecSceneCaption">Powering<br /><em>Sustainable</em><br />Living</div>
            </div>
            <div className="olitecHeroContent">
              <span className="olitecEyebrow">CLEAN ENERGY<br />FOR A BRIGHTER TOMORROW</span>
              <h1 id="hero-title">Your OLITEC<br />Inverter Support</h1>
              <p>Register, check warranty and get service support — all in one place.</p>
              <span className="olitecAccent" aria-hidden="true" />
              <div className="olitecFeatures">
                <Feature type="shield">Genuine Support</Feature>
                <Feature type="wrench">Quick Service</Feature>
                <Feature type="headset">Reliable Assistance</Feature>
              </div>
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
        html,body{margin:0;padding:0;background:#fff}*,*::before,*::after{box-sizing:border-box}a{-webkit-tap-highlight-color:transparent}
        .olitecHome{min-height:100svh;width:100%;overflow-x:hidden;background:#fff;color:#071a3d;font-family:Arial,Helvetica,sans-serif}
        .olitecHomeHeader,.olitecHomeMain{width:min(1240px,calc(100% - 32px));margin:0 auto}
        .olitecHomeHeader{height:62px;display:flex;align-items:center;justify-content:space-between}
        .olitecBrand{display:block;width:145px;line-height:0}.olitecBrand img{display:block;width:100%;height:auto}
        .olitecHeaderRight{display:flex;align-items:center;gap:18px}.olitecPortalLabel{font-size:8px;font-weight:800;color:#264567;padding-bottom:4px;border-bottom:2px solid #29ae58}
        .olitecHomeButton{height:36px;padding:0 14px;display:inline-flex;align-items:center;gap:7px;border:1px solid #dce5ed;border-radius:999px;background:#fff;color:#10213b;text-decoration:none;font-size:11px;font-weight:800;box-shadow:0 5px 15px rgba(18,42,70,.06)}.olitecHomeButton span{font-size:15px;line-height:1}
        .olitecHomeMain{padding-bottom:16px}.olitecHomeLayout{display:grid;grid-template-columns:minmax(0,1.62fr) minmax(320px,1fr);gap:10px;min-height:calc(100svh - 78px);max-height:760px}
        .olitecHero{position:relative;min-width:0;min-height:0;overflow:hidden;border:1px solid #e5ebee;border-radius:18px;background:#edf4f3;box-shadow:0 12px 32px rgba(19,40,66,.06)}
        .olitecScene{position:absolute;inset:0;overflow:hidden;background:linear-gradient(180deg,#b9ddf7 0%,#dceef9 43%,#dfe8df 67%,#eef1ed 100%)}
        .olitecSky{position:absolute;inset:0;background:linear-gradient(100deg,rgba(255,255,255,.82) 0%,rgba(255,255,255,.24) 50%,transparent 72%)}
        .olitecCloud{position:absolute;border-radius:999px;background:rgba(255,255,255,.66);filter:blur(2px)}.cloudOne{width:180px;height:42px;top:22px;right:22%;}.cloudTwo{width:120px;height:32px;top:58px;right:6%}
        .olitecHouse{position:absolute;right:-5%;top:25%;width:57%;height:57%;background:linear-gradient(135deg,#f8f8f5,#d9dedb);clip-path:polygon(16% 0,100% 0,100% 100%,0 100%,0 20%);box-shadow:-12px 20px 40px rgba(25,48,62,.15)}
        .olitecRoof{position:absolute;left:-5%;top:8%;width:72%;height:38%;background:linear-gradient(155deg,#52616d,#1f303d);transform:skewY(-11deg);clip-path:polygon(0 35%,100% 0,100% 100%,0 100%)}
        .olitecSolar{position:absolute;left:10%;top:11%;width:56%;height:25%;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:2px;transform:skewY(-11deg);background:#203a4c;padding:3px}.olitecSolar i{background:linear-gradient(135deg,#527e9e,#183b55);border:1px solid rgba(180,220,242,.28)}
        .olitecHouseWall{position:absolute;right:13%;bottom:12%;width:46%;height:49%;display:flex;gap:6px}.olitecHouseWall span{flex:1;background:linear-gradient(135deg,#7da1b4,#203d4e);border:4px solid #f0f2ee;box-shadow:inset 0 0 20px rgba(255,255,255,.22)}
        .olitecLeaf{position:absolute;background:linear-gradient(145deg,#7fcf78,#2c7745);border-radius:100% 0 100% 0;filter:blur(.2px);opacity:.9}.leafOne{right:2%;bottom:13%;width:22%;height:30%;transform:rotate(-28deg)}.leafTwo{right:8%;bottom:3%;width:17%;height:27%;transform:rotate(23deg)}.leafThree{right:22%;bottom:1%;width:12%;height:21%;transform:rotate(-12deg)}
        .olitecPlant{position:absolute;right:1%;bottom:-1%;width:20%;height:30%;z-index:2}.olitecPlant b{position:absolute;bottom:0;left:26%;width:48%;height:28%;background:#d8d2c5;border-radius:8px 8px 16px 16px}.olitecPlant i{position:absolute;bottom:18%;left:42%;width:20%;height:70%;background:#2d8a4e;border-radius:100% 0 100% 0;transform-origin:bottom}.olitecPlant i:nth-child(1){transform:rotate(-38deg)}.olitecPlant i:nth-child(2){transform:rotate(-14deg)}.olitecPlant i:nth-child(3){transform:rotate(18deg)}.olitecPlant i:nth-child(4){transform:rotate(43deg)}
        .olitecHeroInverter{position:absolute;z-index:3;right:9%;bottom:-2%;width:42%;height:70%;object-fit:contain;filter:drop-shadow(12px 15px 14px rgba(25,45,54,.24))}
        .olitecSceneCaption{position:absolute;z-index:4;right:4%;top:36%;font-family:Georgia,serif;font-size:13px;line-height:.9;color:#304c4d;transform:rotate(-10deg);text-align:center}.olitecSceneCaption em{color:#248b54;font-size:15px}
        .olitecHeroContent{position:absolute;z-index:5;left:0;top:0;bottom:0;width:56%;display:flex;flex-direction:column;justify-content:center;padding:28px 28px;background:linear-gradient(90deg,rgba(255,255,255,.97) 0%,rgba(255,255,255,.91) 70%,rgba(255,255,255,0) 100%)}
        .olitecEyebrow{margin:0 0 12px;color:#607797;font-size:8px;line-height:1.45;letter-spacing:.29em;font-weight:800}.olitecHero h1{margin:0;color:#071a3d;font-size:clamp(36px,4vw,57px);line-height:.93;letter-spacing:-.055em;font-weight:850}.olitecHeroContent>p{max-width:310px;margin:12px 0 0;color:#536b89;font-size:12px;line-height:1.4}.olitecAccent{display:block;width:30px;height:3px;margin-top:14px;border-radius:999px;background:#22ad58}
        .olitecFeatures{display:flex;gap:18px;margin-top:15px}.olitecFeature{display:flex;align-items:center;gap:5px;color:#5b708c;font-size:8px;line-height:1.12}.olitecFeatureIcon{width:23px;height:23px;flex:0 0 auto;color:#159d4b}.olitecFeatureIcon svg{width:100%;height:100%;display:block}
        .olitecServices{min-width:0;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:10px}.olitecServiceCard{position:relative;min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;align-items:flex-start;padding:18px 15px;border:1px solid;text-decoration:none;color:#081b3d;border-radius:18px}.olitecServiceCard.green{background:linear-gradient(145deg,#eefaf2,#f8fcf9);border-color:#dcefe3}.olitecServiceCard.blue{background:linear-gradient(145deg,#eef5ff,#f7faff);border-color:#dfe8f7}.olitecServiceCard.orange{background:linear-gradient(145deg,#fff5ea,#fffbf6);border-color:#f4e7da}.olitecServiceCard.purple{background:linear-gradient(145deg,#f5efff,#fbf9ff);border-color:#e9e1f7}.olitecServiceIcon{display:grid;place-items:center;width:34px;height:34px;border-radius:50%}.olitecServiceIcon svg{width:55%;height:55%}.green .olitecServiceIcon{background:#d3f3df;color:#12a64b}.blue .olitecServiceIcon{background:#d8e8ff;color:#1469d8}.orange .olitecServiceIcon{background:#ffe2c1;color:#e96900}.purple .olitecServiceIcon{background:#e8d5ff;color:#7130d0}.olitecServiceBody{display:flex;flex-direction:column;min-width:0;margin-top:10px;padding-right:18px}.olitecServiceBody strong{color:#081b3d;font-size:clamp(14px,1.45vw,19px);line-height:1.02;letter-spacing:-.035em;font-weight:850}.olitecServiceBody>span{margin-top:5px;color:#5b708e;font-size:9px;line-height:1.28}.olitecArrow{position:absolute;right:9px;bottom:9px;width:29px;height:29px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.8);font-size:18px}.green .olitecArrow{color:#159f48}.blue .olitecArrow{color:#1769d7}.orange .olitecArrow{color:#e96b00}.purple .olitecArrow{color:#7130cf}
        @media(max-width:900px) and (min-width:701px){.olitecHomeHeader,.olitecHomeMain{width:calc(100% - 24px)}.olitecHomeLayout{grid-template-columns:1.55fr 1fr;gap:8px;min-height:560px}.olitecHeroContent{width:62%;padding:22px}.olitecHero h1{font-size:42px}.olitecHeroInverter{right:2%;width:47%;height:68%}.olitecFeatures{gap:10px}.olitecFeature{font-size:7px}}
        @media(max-width:700px){.olitecHomeHeader,.olitecHomeMain{width:calc(100% - 20px)}.olitecHomeHeader{height:58px}.olitecBrand{width:128px}.olitecHeaderRight{gap:8px}.olitecPortalLabel{display:none}.olitecHomeButton{height:32px;padding:0 11px;font-size:10px}.olitecHomeMain{padding-bottom:14px}.olitecHomeLayout{display:flex;flex-direction:column;gap:9px;min-height:0;max-height:none}.olitecHero{height:330px;min-height:330px;border-radius:17px}.olitecHeroContent{width:66%;padding:22px 17px;background:linear-gradient(90deg,rgba(255,255,255,.98) 0%,rgba(255,255,255,.88) 72%,transparent 100%);justify-content:flex-start;padding-top:25px}.olitecEyebrow{font-size:6.5px;letter-spacing:.23em;margin-bottom:8px}.olitecHero h1{font-size:30px;line-height:.96}.olitecHeroContent>p{font-size:9.5px;line-height:1.35;margin-top:9px;max-width:195px}.olitecAccent{width:27px;height:3px;margin-top:11px}.olitecFeatures{gap:7px;margin-top:12px}.olitecFeature{font-size:6.8px;gap:3px}.olitecFeatureIcon{width:18px;height:18px}.olitecScene{background:linear-gradient(180deg,#b9ddf7 0%,#dceef9 42%,#e1e8df 70%,#eef1ed 100%)}.olitecHeroInverter{right:-2%;bottom:0;width:48%;height:55%}.olitecHouse{right:-18%;top:30%;width:65%;height:48%}.olitecPlant{right:-3%;bottom:-2%;width:24%;height:27%}.olitecSceneCaption{display:none}.olitecSolar{top:10%;left:8%}.olitecServices{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,128px);gap:8px}.olitecServiceCard{padding:13px 11px;border-radius:15px}.olitecServiceIcon{width:30px;height:30px}.olitecServiceBody{margin-top:7px;padding-right:12px}.olitecServiceBody strong{font-size:14px}.olitecServiceBody>span{font-size:8px;margin-top:4px}.olitecArrow{width:25px;height:25px;right:7px;bottom:7px;font-size:16px}}
        @media(max-width:370px){.olitecHero{height:305px;min-height:305px}.olitecHero h1{font-size:27px}.olitecHeroContent>p{font-size:9px}.olitecHeroInverter{width:50%;height:52%}.olitecServices{grid-template-rows:118px 118px}.olitecServiceBody strong{font-size:13px}}
      `}</style>
    </div>
  )
}
