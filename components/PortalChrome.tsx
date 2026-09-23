import Link from 'next/link'

export type PortalIconType = 'scan' | 'shield' | 'wrench' | 'document'

export function PortalIcon({ type }: { type: PortalIconType }) {
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

export function PortalHeader() {
  return (
    <header className="customerHeader">
      <Link href="/" className="customerLogo" aria-label="OLITEC home">
        <img className="olitecOfficialLogo" src="/olitec-logo.svg" alt="OLITEC — Powering a Better Tomorrow" />
      </Link>
    </header>
  )
}

export function PortalSupport() {
  return (
    <section className="portalSupport" aria-label="OLITEC support">
      <div>
        <strong>Need help?</strong>
        <span>Our service team is here to help.</span>
      </div>
      <span className="portalSupportLink">View Support Details&nbsp; →</span>
    </section>
  )
}

export function PortalFooter() {
  return (
    <>
      <PortalSupport />
      <footer className="customerFooter">OLITEC · Clean Energy · Reliable Performance · Smarter Tomorrow</footer>
    </>
  )
}
