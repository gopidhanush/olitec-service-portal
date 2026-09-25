import Link from 'next/link'
import AdminAccessGuard from '@/components/AdminAccessGuard'

const navStyle = { border: '1px solid #dfe5ec', borderRadius: 11, padding: '10px 15px', fontWeight: 800, background: '#fff', color: '#172033', textDecoration: 'none', display: 'inline-block' as const }
const activeStyle = { ...navStyle, border: 0, background: '#172033', color: '#fff' }

export default function ProductAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAccessGuard module="product">
    <div style={{ minHeight: '100vh' }}>
      <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '14px 28px', background: '#fff', borderBottom: '1px solid #e7ebef', position: 'sticky', top: 0, zIndex: 30 }}>
        <Link href="/admin/products" style={navStyle}>Product Master</Link>
        <Link href="/admin/products#serials" style={navStyle}>Serial Number Generator</Link>
        <Link href="/admin/products/registrations" style={activeStyle}>Product Registration History</Link>
      </nav>
      {children}
    </div>
  </AdminAccessGuard>
}
