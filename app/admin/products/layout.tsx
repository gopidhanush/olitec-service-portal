'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminAccessGuard from '@/components/AdminAccessGuard'

const tabs = [
  { href: '/admin/products', label: 'Product Master & Serial Generator', exact: true },
  { href: '/admin/products/registrations', label: 'Product Registration History' },
  { href: '/admin/products/serial-report', label: 'Serial Number Report' },
]

export default function ProductAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AdminAccessGuard module="product">
      <div style={{ minHeight: '100vh' }}>
        <div style={{ maxWidth: 1800, margin: '0 auto', padding: '16px 34px 0' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #e4e9ef', paddingBottom: 10 }}>
            {tabs.map(tab => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{
                    textDecoration: 'none',
                    border: active ? '0' : '1px solid #dfe5ec',
                    borderRadius: 10,
                    padding: '9px 14px',
                    fontWeight: 800,
                    fontSize: 13,
                    background: active ? '#172033' : '#fff',
                    color: active ? '#fff' : '#172033',
                  }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
        {children}
      </div>
    </AdminAccessGuard>
  )
}
