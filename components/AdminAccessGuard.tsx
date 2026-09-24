'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Permission = { active: boolean; product_admin: boolean; service_admin: boolean; super_admin: boolean }

export default function AdminAccessGuard({ module, children }: { module: 'product' | 'service'; children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let mounted = true
    async function check() {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        if (mounted) { setHasSession(false); setAllowed(false); setChecking(false) }
        return
      }
      const { data } = await supabase.rpc('get_admin_permissions')
      const p = (data?.[0] || null) as Permission | null
      const canAccess = Boolean(p?.active && (p.super_admin || (module === 'product' ? p.product_admin : p.service_admin)))
      if (mounted) { setHasSession(true); setAllowed(canAccess); setChecking(false) }
    }
    check()
    const { data: listener } = supabase.auth.onAuthStateChange(() => { check() })
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [module])

  if (checking) return <main className="adminPage adminLoading"><div className="adminLoadingMark"><img src="/olitec-logo.svg" alt="OLITEC" /></div></main>
  if (!hasSession) return <>{children}</>
  if (!allowed) return <main className="adminPage adminLoginPage"><section className="adminLoginCard adminHomeLoginCard"><img src="/olitec-logo.svg" alt="OLITEC" className="adminHomeLogo" /><div className="adminSubtitle adminHomeSubtitle">Administration</div><div className="adminEyebrow adminHomeEyebrow">ACCESS RESTRICTED</div><h1>Permission required</h1><p>Your account does not have access to this administration module. Ask the Super Admin to assign the required permission.</p><button className="adminPrimaryButton" onClick={() => { window.location.href = '/admin' }}>← Return to Admin Home</button></section></main>
  return <>{children}</>
}
