'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Permissions = { email: string; display_name: string; active: boolean; product_admin: boolean; service_admin: boolean; super_admin: boolean; approved_at: string | null }
type AdminUser = Permissions & { created_at: string }

const SUPER_ADMIN_EMAIL = 'admin@gsons.co.in'

function friendlyError(error: any) {
  const message = error?.message || 'Something went wrong.'
  const map: Record<string, string> = {
    SUPER_ADMIN_REQUIRED: 'Only the Super Admin can change staff permissions.',
    SUPER_ADMIN_LOCKED: 'The Super Admin account is protected and cannot be modified here.',
    ADMIN_USER_NOT_FOUND: 'Staff account not found.',
  }
  const key = Object.keys(map).find(k => message.includes(k))
  return key ? map[key] : message
}

export default function AdminHomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [signupMode, setSignupMode] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [permissions, setPermissions] = useState<Permissions | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return }
      await loadPermissions()
      setLoading(false)
    })
  }, [])

  async function loadPermissions() {
    const { data, error } = await supabase.rpc('get_admin_permissions')
    if (error) { setError(friendlyError(error)); return null }
    const value = (data?.[0] || null) as Permissions | null
    setPermissions(value)
    setLoggedIn(Boolean(value?.active))
    if (value?.super_admin) await loadUsers()
    return value
  }

  async function loadUsers() {
    const { data, error } = await supabase.rpc('admin_list_users')
    if (error) { setError(friendlyError(error)); return }
    setUsers((data || []) as AdminUser[])
  }

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) { setError(error.message); setBusy(false); return }
    const value = await loadPermissions()
    if (!value?.active) {
      await supabase.auth.signOut()
      setLoggedIn(false)
      setMessage('Your account is registered but is waiting for Super Admin approval and module access.')
    }
    setBusy(false)
  }

  async function signup(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); setBusy(false); return }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { display_name: displayName.trim() } },
    })
    if (error) { setError(error.message); setBusy(false); return }
    if (data.session) await supabase.auth.signOut()
    setEmail(''); setPassword(''); setDisplayName(''); setSignupMode(false)
    setMessage(data.session
      ? 'Account created. Your request is now pending Super Admin approval.'
      : 'Account created. Check the email address for verification, then wait for Super Admin approval.')
    setBusy(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setLoggedIn(false); setPermissions(null); setUsers([]); setError(''); setMessage('')
  }

  async function saveUser(user: AdminUser) {
    setBusy(true); setError(''); setMessage('')
    const { error } = await supabase.rpc('admin_set_user_permissions', {
      p_email: user.email,
      p_active: user.active,
      p_product_admin: user.product_admin,
      p_service_admin: user.service_admin,
    })
    if (error) setError(friendlyError(error))
    else { setMessage(`Permissions updated for ${user.email}.`); await loadUsers() }
    setBusy(false)
  }

  if (loading) return <main className="adminPage adminLoading"><div className="adminLoadingMark"><img src="/olitec-logo.svg" alt="OLITEC" /></div></main>

  if (!loggedIn) {
    return (
      <main className="adminPage adminLoginPage">
        <section className="adminLoginCard adminHomeLoginCard">
          <img src="/olitec-logo.svg" alt="OLITEC" className="adminHomeLogo" />
          <div className="adminSubtitle adminHomeSubtitle">Administration</div>
          <div className="adminEyebrow adminHomeEyebrow">OLITEC ADMINISTRATION</div>
          <h1>{signupMode ? 'Create staff account' : 'Service & Product Management'}</h1>
          <p>{signupMode ? 'Create your OLITEC administration account. Access will remain locked until the Super Admin assigns permissions.' : 'Sign in with your authorised staff account or create a new account.'}</p>
          <form onSubmit={signupMode ? signup : login} className="adminForm">
            {signupMode && <><label>Staff name</label><input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Enter staff name" required /></>}
            <label>Staff email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@gsons.co.in" required />
            <label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={signupMode ? 'Minimum 8 characters' : 'Enter password'} required minLength={signupMode ? 8 : undefined} />
            {error && <div className="adminError">{error}</div>}
            {message && <div className="adminAlert success" style={{ marginTop: 12 }}>{message}</div>}
            <button disabled={busy} className="adminPrimaryButton">{busy ? (signupMode ? 'Creating account…' : 'Signing in…') : (signupMode ? 'Create Account →' : 'Sign in →')}</button>
          </form>
          <button className="adminSecondaryButton" style={{ width: '100%', marginTop: 10 }} onClick={() => { setSignupMode(v => !v); setError(''); setMessage('') }}>{signupMode ? '← Back to Sign in' : 'Create new staff account'}</button>
          <button className="adminSecondaryButton" style={{ width: '100%', marginTop: 10 }} onClick={() => { window.location.href = '/' }}>← Back to Portal</button>
        </section>
      </main>
    )
  }

  const canProduct = permissions?.super_admin || permissions?.product_admin
  const canService = permissions?.super_admin || permissions?.service_admin

  return (
    <main className="adminPage adminHomePage">
      <div className="adminShell adminHomeShell">
        <header className="adminHeader adminHomeHeader">
          <div className="adminBrandBlock"><img src="/olitec-logo.svg" alt="OLITEC" className="adminHomeLogo" /><div className="adminSubtitle">Administration</div></div>
          <div className="adminHeaderActions"><span className="adminTopBadge">{permissions?.display_name || permissions?.email}</span><button className="adminDarkButton" onClick={logout}>Sign out</button></div>
        </header>

        {error && <div className="adminAlert error">{error}</div>}
        {message && <div className="adminAlert success">✓ {message}</div>}

        <section className="adminHomeHero"><div><div className="adminEyebrow">OLITEC ADMINISTRATION</div><h1>Service &amp; Product Management</h1><p>Choose an administration area assigned to your account.</p></div><div className="adminHomeHeroMark">OLITEC</div></section>

        <section className="adminHomeModules" aria-label="Administration modules">
          {canService && <button className="adminHomeModule service" onClick={() => { window.location.href = '/admin/service' }}><div className="adminModuleTop"><span className="adminModuleIcon">✓</span><span className="adminModuleLabel">SERVICE</span></div><h2>Service Complaints</h2><p>Receive, assign, track and close customer complaints from one service dashboard.</p><span className="adminModuleAction">Open Service Admin <b>→</b></span></button>}
          {canProduct && <button className="adminHomeModule product" onClick={() => { window.location.href = '/admin/products' }}><div className="adminModuleTop"><span className="adminModuleIcon">▣</span><span className="adminModuleLabel">PRODUCT</span></div><h2>Product Master</h2><p>Manage product models, MRP and warranty details, then generate controlled production serial batches.</p><span className="adminModuleAction">Open Product Admin <b>→</b></span></button>}
        </section>

        {!canProduct && !canService && <section className="adminPanel"><div className="adminEmpty"><strong>No module access has been assigned yet.</strong><p>Ask the Super Admin to approve your account and assign Service Admin or Product Admin access.</p></div></section>}

        {permissions?.super_admin && <section className="adminPanel adminStaffPanel">
          <div className="adminPanelHead"><div><div className="adminEyebrow">SUPER ADMIN</div><h2>Staff Access</h2><p>Approve staff accounts and assign Service Admin or Product Admin permissions.</p></div><span className="adminCount">{users.length} account{users.length === 1 ? '' : 's'}</span></div>
          <div className="adminStaffList">
            {users.map(user => <div key={user.email} className="adminStaffRow">
              <div className="adminStaffIdentity"><strong>{user.display_name || user.email}</strong><small>{user.email}{user.super_admin ? ' · Super Admin' : ''}</small></div>
              <div className="adminStaffControls">
                {user.super_admin ? <span className="adminRolePill">Protected Super Admin</span> : <>
                  <label className="adminCheck"><input type="checkbox" checked={user.active} onChange={e => setUsers(current => current.map(x => x.email === user.email ? { ...x, active: e.target.checked } : x))} /> Active</label>
                  <label className="adminCheck"><input type="checkbox" checked={user.product_admin} onChange={e => setUsers(current => current.map(x => x.email === user.email ? { ...x, product_admin: e.target.checked } : x))} /> Product Admin</label>
                  <label className="adminCheck"><input type="checkbox" checked={user.service_admin} onChange={e => setUsers(current => current.map(x => x.email === user.email ? { ...x, service_admin: e.target.checked } : x))} /> Service Admin</label>
                  <button className="adminSecondaryButton" disabled={busy} onClick={() => saveUser(user)}>Save</button>
                </>}
              </div>
            </div>)}
          </div>
          <div className="adminStaffNote">Super Admin: <strong>{SUPER_ADMIN_EMAIL}</strong>. Serial-number reprints are protected by this account's password.</div>
        </section>}

        <div className="adminHomeFooterRow"><span>OLITEC Administration</span><span>{permissions?.email}</span></div>
      </div>
    </main>
  )
}
