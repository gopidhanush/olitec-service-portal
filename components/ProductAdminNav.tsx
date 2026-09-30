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
    <nav className="productAdminNav" aria-label="Product administration">
      {tabs.map(tab => (
        <button
          key={tab.key}
          type="button"
          className={tab.key === active ? 'productAdminNavTab active' : 'productAdminNavTab'}
          onClick={() => { window.location.href = tab.href }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
