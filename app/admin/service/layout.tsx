import AdminAccessGuard from '@/components/AdminAccessGuard'

export default function ServiceAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAccessGuard module="service">{children}</AdminAccessGuard>
}
