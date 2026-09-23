'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PurchaseRegistrationRedirect(){
  const router = useRouter()

  useEffect(() => {
    const identifier = new URLSearchParams(window.location.search).get('identifier')?.trim()
    router.replace(identifier ? `/register/${encodeURIComponent(identifier)}/purchase` : '/register')
  }, [router])

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'Arial, sans-serif',
        color: '#08234d',
      }}
    >
      Preparing your registration…
    </div>
  )
}
