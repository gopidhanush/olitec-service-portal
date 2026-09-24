import type { Metadata, Viewport } from 'next'
import './globals.css'
import './admin-polish.css'
import './admin-product-responsive.css'
import './customer-portal.css'
import './supporting-pages.css'
import './reference-page-overrides.css'
import './portal-final-overrides.css'
import './portal-layout-fixes.css'
import './hero-image-fit-fix.css'
import './header-top-fix.css'
import './desktop-hero-text-fix.css'
import './mobile-pages.css'
import './mobile-form-fixes.css'
import './registration-polish.css'
import './registration-layout-final.css'
import './registration-ui-final.css'
import './registration-final-layout.css'
import './registration-review-complete.css'
import './registration-last-cleanup.css'
import './registration-final-clean.css'
import './registration-layout-master.css'
import './customer-final-clean.css'
import './customer-portal-final-fix.css'
import './multi-product-portal.css'
import './global-page-frame.css'
import './final-customer-fixes.css'

export const metadata: Metadata = { title: 'OLITEC — Product Registration', description: 'OLITEC solar inverter product registration and warranty portal' }

// Explicit mobile viewport prevents iOS/Android from rendering the portal at a desktop
// layout scale and then visually zooming/cropping the page.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-frame">
          <div className="site-frame-content">{children}</div>
        </div>
      </body>
    </html>
  )
}
