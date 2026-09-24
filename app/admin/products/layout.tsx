import AdminAccessGuard from '@/components/AdminAccessGuard'

export default function ProductAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAccessGuard module="product">{children}</AdminAccessGuard>
}
