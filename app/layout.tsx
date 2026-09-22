import type { Metadata } from 'next'
import './globals.css'
import './customer-portal.css'

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
