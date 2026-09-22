'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const statuses = [
  ['received', 'Received'],
  ['assigned', 'Assigned'],
  ['technician_visit', 'Technician Visit'],
  ['under_service', 'Under Service'],
  ['resolved', 'Resolved'],
  ['closed', 'Closed'],
] as const

type Complaint = {
  complaint_number: string
  registration_number: string | null
  serial_number: string
  model_code: string | null
  product_name: string | null
  full_name: string
  mobile: string
  complaint_type: string
  problem_description: string
  status: string
  preferred_visit_date: string | null
  preferred_contact_time: string | null
  service_city: string | null
  service_state: string | null
  created_at: string
}

function statusLabel(status: string) {
  return statuses.find(([value]) => value === status)?.[1] ?? status
}

function statusClass(status: string) {
  return `statusPill status-${status.replace(/_/g, '-')}`
}

export default function ServiceAdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Complaint | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setLoggedIn(true)
        loadComplaints()
      }
    })
  }, [])

  async function loadComplaints() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.rpc('get_service_admin_complaints')
    if (error) setError(error.message)
    else setComplaints((data ?? []) as Complaint[])
    setLoading(false)
  }

  async function login(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setLoggedIn(true)
    await loadComplaints()
  }

  async function logout() {
    await supabase.auth.signOut()
    setLoggedIn(false)
    setComplaints([])
    setSelected(null)
  }

  async function updateStatus(complaintNumber: string, status: string) {
    setLoading(true)
    setError('')
    setMessage('')
    const { error } = await supabase.rpc('update_service_complaint_status', {
      p_complaint_number: complaintNumber,
      p_status: status,
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage(`Complaint ${complaintNumber} updated to ${statusLabel(status)}.`)
      await loadComplaints()
      setSelected((current) => current ? { ...current, status } : current)
    }
    setLoading(false)
  }

  if (!loggedIn) {
    return (
      <div className="adminPage adminLoginPage">
        <div className="adminLoginWrap">
          <header className="adminBrandRow">
            <div><div className="adminLogo">OLITEC</div><div className="adminSubtitle">Service Portal</div></div>
            <span className="adminTopBadge">Service Admin</span>
          </header>
          <section className="adminLoginCard">
            <div className="adminEyebrow">SERVICE PORTAL</div>
            <h1>Sign in to manage complaints</h1>
            <p>Use the authorised OLITEC service desk account.</p>
            <form onSubmit={login} className="adminForm">
              <label>Staff email</label>
              <input type="email" placeholder="service@olitec.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label>Password</label>
              <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {error && <div className="adminError">{error}</div>}
              <button disabled={loading} className="adminPrimaryButton">{loading ? 'Signing in…' : 'Sign in to dashboard →'}</button>
            </form>
          </section>
          <div className="adminFooter">OLITEC · Service Management</div>
        </div>
      </div>
    )
  }

  const filtered = filter === 'all' ? complaints : complaints.filter((item) => item.status === filter)

  return (
    <div className="adminPage">
      <div className="adminShell">
        <header className="adminHeader">
          <div>
            <div className="adminLogo">OLITEC</div>
            <div className="adminSubtitle">Service Complaint Dashboard</div>
          </div>
          <div className="adminHeaderActions">
            <button onClick={loadComplaints} className="adminSecondaryButton">↻ Refresh</button>
            <button onClick={logout} className="adminDarkButton">Sign out</button>
          </div>
        </header>

        {error && <div className="adminAlert error">{error}</div>}
        {message && <div className="adminAlert success">✓ {message}</div>}

        <section className="adminStats">
          <button className={`adminStat ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            <span>Total Complaints</span><strong>{complaints.length}</strong>
          </button>
          {statuses.map(([value, label]) => (
            <button key={value} className={`adminStat ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>
              <span>{label}</span><strong>{complaints.filter((c) => c.status === value).length}</strong>
            </button>
          ))}
        </section>

        <section className="adminPanel">
          <div className="adminPanelHead">
            <div><h2>Service Complaints</h2><p>Select a complaint to view details and update its status.</p></div>
            <span className="adminCount">{filtered.length} shown</span>
          </div>

          <div className="adminTableHead"><span>Complaint</span><span>Customer</span><span>Product</span><span>Issue</span><span>Status</span></div>
          {loading && <div className="adminEmpty">Loading complaints…</div>}
          {!loading && filtered.length === 0 && <div className="adminEmpty"><div className="emptyIcon">✓</div><strong>No complaints found</strong><p>There are no complaints in this status.</p></div>}
          {!loading && filtered.length > 0 && <div>{filtered.map((complaint) => (
            <button key={complaint.complaint_number} onClick={() => setSelected(complaint)} className="adminComplaintRow">
              <div><strong>{complaint.complaint_number}</strong><small>{new Date(complaint.created_at).toLocaleString('en-IN')}</small></div>
              <div><strong>{complaint.full_name}</strong><small>{complaint.mobile}</small></div>
              <div><strong>{complaint.model_code || '—'}</strong><small>{complaint.serial_number}</small></div>
              <div><strong>{complaint.complaint_type}</strong><small>{complaint.service_city || 'Service location not set'}</small></div>
              <div><span className={statusClass(complaint.status)}>{statusLabel(complaint.status)}</span></div>
            </button>
          ))}</div>}
        </section>

        {selected && <div className="adminOverlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null) }}>
          <section className="adminDrawer">
            <div className="drawerHead">
              <div><div className="adminEyebrow">SERVICE COMPLAINT</div><h2>{selected.complaint_number}</h2></div>
              <button onClick={() => setSelected(null)} className="drawerClose">×</button>
            </div>
            <div className="drawerStatus"><span>Current status</span><b className={statusClass(selected.status)}>{statusLabel(selected.status)}</b></div>
            <div className="detailGrid">
              {[['Customer', selected.full_name], ['Mobile', selected.mobile], ['Registration', selected.registration_number ?? '—'], ['Serial number', selected.serial_number], ['Model', selected.model_code ?? '—'], ['Product', selected.product_name ?? '—'], ['Complaint type', selected.complaint_type], ['Location', [selected.service_city, selected.service_state].filter(Boolean).join(', ') || '—']].map(([label, value]) => <div className="detailItem" key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </div>
            <div className="detailBlock"><span>Problem description</span><p>{selected.problem_description}</p></div>
            <div className="detailBlock"><span>Preferred visit</span><p>{selected.preferred_visit_date || 'Not specified'} · {selected.preferred_contact_time || 'Any time'}</p></div>
            <div className="statusSection"><h3>Update service status</h3><div className="statusGrid">{statuses.map(([value, label]) => <button key={value} disabled={loading || selected.status === value} onClick={() => updateStatus(selected.complaint_number, value)} className={`statusAction ${selected.status === value ? 'selected' : ''}`}>{selected.status === value ? '✓ ' : ''}{label}</button>)}</div></div>
          </section>
        </div>}
      </div>
    </div>
  )
}
