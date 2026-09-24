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
  assigned_engineer_name: string | null
  assigned_engineer_mobile: string | null
  action_taken: string | null
  assigned_at: string | null
  closed_at: string | null
}

function statusLabel(status: string) { return statuses.find(([value]) => value === status)?.[1] ?? status }
function statusClass(status: string) { return `statusPill status-${status.replace(/_/g, '-')}` }
function friendlyError(error: any) {
  const message = error?.message || ''
  const map: Record<string, string> = {
    ENGINEER_DETAILS_REQUIRED: 'Enter the assigned engineer name and contact number before assigning the complaint.',
    ACTION_TAKEN_REQUIRED: 'Enter the action taken before closing the complaint.',
    CLOSED_COMPLAINT_CANNOT_BE_REOPENED: 'A closed complaint cannot be reopened.',
  }
  const key = Object.keys(map).find(item => message.includes(item))
  return key ? map[key] : (message || 'Something went wrong.')
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
  const [engineerName, setEngineerName] = useState('')
  const [engineerMobile, setEngineerMobile] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [editMode, setEditMode] = useState<'assigned' | 'closed' | null>(null)

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
    if (error) setError(friendlyError(error))
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

  function openComplaint(complaint: Complaint) {
    setSelected(complaint)
    setEngineerName(complaint.assigned_engineer_name || '')
    setEngineerMobile(complaint.assigned_engineer_mobile || '')
    setActionTaken(complaint.action_taken || '')
    setEditMode(null)
    setError('')
    setMessage('')
  }

  async function updateStatus(status: string) {
    if (!selected) return
    setLoading(true)
    setError('')
    setMessage('')
    const { error } = await supabase.rpc('update_service_complaint_status', {
      p_complaint_number: selected.complaint_number,
      p_status: status,
      p_engineer_name: engineerName.trim() || null,
      p_engineer_mobile: engineerMobile.trim() || null,
      p_action_taken: actionTaken.trim() || null,
    })
    if (error) {
      setError(friendlyError(error))
    } else {
      setMessage(`Complaint ${selected.complaint_number} updated to ${statusLabel(status)}.`)
      await loadComplaints()
      setSelected(current => current ? {
        ...current,
        status,
        assigned_engineer_name: engineerName.trim() || current.assigned_engineer_name,
        assigned_engineer_mobile: engineerMobile.trim() || current.assigned_engineer_mobile,
        action_taken: actionTaken.trim() || current.action_taken,
      } : current)
      setEditMode(null)
    }
    setLoading(false)
  }

  if (!loggedIn) {
    return (
      <div className="adminPage adminLoginPage">
        <div className="adminLoginWrap">
          <header className="adminBrandRow">
            <div><img src="/olitec-logo.svg" alt="OLITEC" style={{ width: 180, height: 'auto', display: 'block' }} /><div className="adminSubtitle">Service Portal</div></div>
            <span className="adminTopBadge">Service Admin</span>
          </header>
          <section className="adminLoginCard">
            <div className="adminEyebrow">SERVICE PORTAL</div>
            <h1>Sign in to manage complaints</h1>
            <p>Use the authorised OLITEC service desk account.</p>
            <form onSubmit={login} className="adminForm">
              <label>Staff email</label>
              <input type="email" placeholder="service@olitec.in" value={email} onChange={e => setEmail(e.target.value)} required />
              <label>Password</label>
              <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
              {error && <div className="adminError">{error}</div>}
              <button disabled={loading} className="adminPrimaryButton">{loading ? 'Signing in…' : 'Sign in to dashboard →'}</button>
            </form>
            <button className="adminSecondaryButton" style={{ width: '100%', marginTop: 10 }} onClick={() => { window.location.href = '/admin' }}>← Back to Admin Home</button>
          </section>
          <div className="adminFooter">OLITEC · Service Management</div>
        </div>
      </div>
    )
  }

  const filtered = filter === 'all' ? complaints : complaints.filter(item => item.status === filter)

  return (
    <div className="adminPage">
      <div className="adminShell">
        <header className="adminHeader">
          <div>
            <img src="/olitec-logo.svg" alt="OLITEC" style={{ width: 170, height: 'auto', display: 'block' }} />
            <div className="adminSubtitle">Service Complaint Dashboard</div>
          </div>
          <div className="adminHeaderActions">
            <button onClick={() => { window.location.href = '/admin' }} className="adminSecondaryButton">← Admin Home</button>
            <button onClick={loadComplaints} className="adminSecondaryButton">↻ Refresh</button>
            <button onClick={logout} className="adminDarkButton">Sign out</button>
          </div>
        </header>

        {error && <div className="adminAlert error">{error}</div>}
        {message && <div className="adminAlert success">✓ {message}</div>}

        <section className="adminStats">
          <button className={`adminStat ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}><span>Total Complaints</span><strong>{complaints.length}</strong></button>
          {statuses.map(([value, label]) => <button key={value} className={`adminStat ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}><span>{label}</span><strong>{complaints.filter(c => c.status === value).length}</strong></button>)}
        </section>

        <section className="adminPanel">
          <div className="adminPanelHead"><div><h2>Service Complaints</h2><p>Select a complaint to view the customer details, engineer assignment and closure information.</p></div><span className="adminCount">{filtered.length} shown</span></div>
          <div className="adminTableHead"><span>Complaint</span><span>Customer</span><span>Product / Engineer</span><span>Issue / Visit</span><span>Status</span></div>
          {loading && <div className="adminEmpty">Loading complaints…</div>}
          {!loading && filtered.length === 0 && <div className="adminEmpty"><div className="emptyIcon">✓</div><strong>No complaints found</strong><p>There are no complaints in this status.</p></div>}
          {!loading && filtered.length > 0 && <div>{filtered.map(complaint => (
            <button key={complaint.complaint_number} onClick={() => openComplaint(complaint)} className="adminComplaintRow">
              <div><strong>{complaint.complaint_number}</strong><small>{new Date(complaint.created_at).toLocaleString('en-IN')}</small></div>
              <div><strong>{complaint.full_name}</strong><small>{complaint.mobile}</small></div>
              <div><strong>{complaint.model_code || '—'}</strong><small>{complaint.serial_number}</small>{complaint.assigned_engineer_name && <small style={{ color: '#167c42' }}>Engineer: {complaint.assigned_engineer_name}</small>}</div>
              <div><strong>{complaint.complaint_type}</strong><small>{complaint.preferred_visit_date ? `Visit: ${new Date(complaint.preferred_visit_date + 'T00:00:00').toLocaleDateString('en-IN')}` : 'Visit date not set'}</small><small>{complaint.preferred_contact_time || ''}</small></div>
              <div><span className={statusClass(complaint.status)}>{statusLabel(complaint.status)}</span></div>
            </button>
          ))}</div>}
        </section>

        {selected && <div className="adminOverlay" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <section className="adminDrawer">
            <div className="drawerHead"><div><div className="adminEyebrow">SERVICE COMPLAINT</div><h2>{selected.complaint_number}</h2></div><button onClick={() => setSelected(null)} className="drawerClose">×</button></div>
            <div className="drawerStatus"><span>Current status</span><b className={statusClass(selected.status)}>{statusLabel(selected.status)}</b></div>
            <div className="detailGrid">
              {[['Customer', selected.full_name], ['Mobile', selected.mobile], ['Registration', selected.registration_number ?? '—'], ['Serial number', selected.serial_number], ['Model', selected.model_code ?? '—'], ['Product', selected.product_name ?? '—'], ['Complaint type', selected.complaint_type], ['Location', [selected.service_city, selected.service_state].filter(Boolean).join(', ') || '—']].map(([label, value]) => <div className="detailItem" key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </div>
            <div className="detailBlock"><span>Problem description</span><p>{selected.problem_description}</p></div>
            <div className="detailBlock"><span>Customer preferred technician visit</span><p>{selected.preferred_visit_date || 'Not specified'} · {selected.preferred_contact_time || 'Any time'}</p></div>
            <div className="detailBlock"><span>Assigned engineer</span><p>{selected.assigned_engineer_name ? `${selected.assigned_engineer_name} · ${selected.assigned_engineer_mobile || 'No contact'}` : 'Not assigned yet'}</p></div>
            {selected.action_taken && <div className="detailBlock"><span>Action taken</span><p>{selected.action_taken}</p></div>}

            {editMode === 'assigned' && <div className="adminEditBox">
              <h3>Assign engineer</h3><p>Enter the engineer who will handle this complaint. The customer's technician visit date/time is already recorded above.</p>
              <label>Engineer name</label><input value={engineerName} onChange={e => setEngineerName(e.target.value)} placeholder="Engineer name" />
              <label>Engineer contact</label><input value={engineerMobile} onChange={e => setEngineerMobile(e.target.value)} placeholder="Mobile number" inputMode="tel" />
              <button className="adminPrimaryButton" disabled={loading} onClick={() => updateStatus('assigned')}>{loading ? 'Saving…' : 'Save Assignment →'}</button>
            </div>}

            {editMode === 'closed' && <div className="adminEditBox">
              <h3>Close complaint</h3><p>Enter the final action taken. This is required before the complaint can be closed and the inverter can become available for a new service complaint.</p>
              <label>Action Taken</label><textarea value={actionTaken} onChange={e => setActionTaken(e.target.value)} placeholder="Describe the service action, repair/replacement and final resolution…" rows={5} />
              <button className="adminPrimaryButton" disabled={loading} onClick={() => updateStatus('closed')}>{loading ? 'Closing…' : 'Submit & Close Complaint →'}</button>
            </div>}

            <div className="statusSection"><h3>Service workflow</h3><div className="statusGrid">{statuses.map(([value, label]) => {
              const needsAssignment = value === 'assigned'
              const needsClosure = value === 'closed'
              const isClosed = selected.status === 'closed'
              return <button key={value} disabled={loading || (isClosed && value !== 'closed')} onClick={() => needsAssignment ? setEditMode('assigned') : needsClosure ? setEditMode('closed') : updateStatus(value)} className={`statusAction ${selected.status === value ? 'selected' : ''}`}>{selected.status === value ? '✓ ' : ''}{label}{needsAssignment && selected.status !== 'assigned' ? ' · Enter engineer' : ''}{needsClosure && selected.status !== 'closed' ? ' · Enter action' : ''}</button>
            })}</div></div>
          </section>
        </div>}
      </div>
    </div>
  )
}
