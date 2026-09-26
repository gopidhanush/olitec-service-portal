import type { Metadata, Viewport } from 'next'
import './styles/base/globals.css'
import './styles/admin/base.css'
import './styles/admin/product.css'
import './styles/customer/portal.css'
import './styles/pages/supporting.css'
import './styles/base/reference.css'
import './styles/layout/overrides.css'
import './styles/layout/portal.css'
import './styles/layout/hero.css'
import './styles/layout/header.css'
import './styles/layout/desktop.css'
import './styles/mobile/pages.css'
import './styles/mobile/forms.css'
import './styles/registration/polish.css'
import './styles/registration/layout.css'
import './styles/registration/ui.css'
import './styles/registration/final-layout.css'
import './styles/registration/review.css'
import './styles/registration/cleanup.css'
import './styles/registration/clean.css'
import './styles/registration/master-layout.css'
import './styles/customer/clean.css'
import './styles/customer/portal-fix.css'
import './styles/customer/multi-product.css'
import './styles/base/page-frame.css'
import './styles/customer/fixes.css'
import './styles/admin/warranty.css'
import './styles/mobile/navigation.css'
import './styles/admin/mobile-layout.css'
import './styles/admin/home.css'
import './styles/admin/service.css'
import MobileNavigationController from '@/components/MobileNavigationController'

export const metadata: Metadata = {
  title: 'OLITEC — Product Registration',
  description: 'OLITEC solar inverter product registration and warranty portal',
  icons: { icon: '/olitec-favicon.svg', shortcut: '/olitec-favicon.svg', apple: '/olitec-favicon.svg' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, viewportFit: 'cover' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><MobileNavigationController/><div className="site-frame"><div className="site-frame-content">{children}</div></div></body></html>
}
