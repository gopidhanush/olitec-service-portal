import Link from 'next/link'

export function PortalHeader() {
  return (
    <header className="customerHeader">
      <Link href="/" className="customerLogo" aria-label="OLITEC home">OLITEC</Link>
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
