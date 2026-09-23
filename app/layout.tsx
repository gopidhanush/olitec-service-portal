import type { Metadata } from 'next'
import './globals.css'
import './customer-portal.css'
import './home-redesign.css'
import './mobile-home.css'
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
