'use client'

export type ProductAdminTab = 'products' | 'serials' | 'registrations' | 'serial-report'

const tabs = [
  { key: 'products' as const, label: 'Product Master', href: '/admin/products' },
  { key: 'serials' as const, label: 'Serial Number Generator', href: '/admin/products#serials' },
  { key: 'registrations' as const, label: 'Product Registration History', href: '/admin/products/registrations' },
  { key: 'serial-report' as const, label: 'Serial Number Report', href: '/admin/products/serial-report' },
]

export default function ProductAdminNav({ active }: { active: ProductAdminTab }) {
  return (
    <nav style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }} aria-label="Product administration">
      {tabs.map(tab => (
        <button
          key={tab.key}
          type="button"
          style={tab.key === active
            ? { border: 0, borderRadius: 12, padding: '11px 18px', fontWeight: 800, cursor: 'pointer', background: '#172033', color: '#fff' }
            : { border: '1px solid #dfe5ec', borderRadius: 12, padding: '11px 18px', fontWeight: 800, cursor: 'pointer', background: '#fff', color: '#172033' }}
          onClick={() => { window.location.href = tab.href }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
