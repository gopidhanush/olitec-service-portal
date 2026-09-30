'use client'

import { useEffect } from 'react'
import AdminAccessGuard from '@/components/AdminAccessGuard'

function ProductAdminRefreshCleanup() {
  useEffect(() => {
    const removeRefreshControls = () => {
      document.querySelectorAll('button').forEach(button => {
        const text = (button.textContent || '').trim()
        if (/refresh/i.test(text)) {
          const parent = button.parentElement
          button.remove()
          if (parent instanceof HTMLElement && parent.style.display === 'grid') {
            const count = parent.children.length
            if (count === 4) {
              parent.style.gridTemplateColumns = 'minmax(260px,2fr) minmax(160px,1fr) minmax(180px,1fr) auto'
            }
          }
        }
      })
    }

    removeRefreshControls()
    const observer = new MutationObserver(removeRefreshControls)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}

export default function ProductAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAccessGuard module="product">
      <div style={{ minHeight: '100vh' }}>
        <ProductAdminRefreshCleanup />
        {children}
      </div>
    </AdminAccessGuard>
  )
}
