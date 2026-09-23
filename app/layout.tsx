import type { Metadata } from 'next'
import './globals.css'
import './customer-portal.css'
// home-redesign.css and mobile-home.css removed: both only targeted `.customerHome`
// and `.portalHomeHero`/`.portalTile` etc. — classes from an earlier version of the
// homepage. The current homepage (app/page.tsx) is self-styled via styled-jsx and
// never renders those classes, so the two files were 100% dead weight.
import './supporting-pages.css'
import './reference-page-overrides.css'
import './portal-final-overrides.css'
import './portal-layout-fixes.css'
import './hero-image-fit-fix.css'
import './header-top-fix.css'
import './desktop-hero-text-fix.css'
import './mobile-pages.css'
import './registration-polish.css'
import './registration-layout-final.css'
import './registration-ui-final.css'
// registration-clean.css removed: it only styled the orphaned /register/success
// page (deleted — superseded by /register/[identifier]/success).
import './registration-final-layout.css'
import './registration-review-complete.css'
import './registration-last-cleanup.css'
import './registration-final-clean.css'
import './registration-layout-master.css'

export const metadata: Metadata = {
  title: 'OLITEC — Product Registration',
  description: 'OLITEC solar inverter product registration and warranty portal',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
