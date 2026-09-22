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
      <main className="min-h-screen bg-white px-5 py-8 text-[#172033]">
        <div className="mx-auto max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <div className="text-3xl font-extrabold tracking-tight">OLITEC</div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Service Admin</span>
          </div>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-2 text-sm font-semibold text-emerald-700">SERVICE PORTAL</div>
              <h1 className="text-2xl font-extrabold">Sign in to manage complaints</h1>
              <p className="mt-2 text-slate-500">Use the Supabase staff account authorised for the OLITEC service desk.</p>
            </div>
            <form onSubmit={login} className="space-y-4">
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400" type="email" placeholder="Staff email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <button disabled={loading} className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
            </form>
          </section>
        </div>
      </main>
    )
  }

  const filtered = filter === 'all' ? complaints : complaints.filter((item) => item.status === filter)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-[#172033] md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold tracking-tight">OLITEC</div>
            <p className="text-sm text-slate-500">Service Complaint Dashboard</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadComplaints} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Refresh</button>
            <button onClick={logout} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Sign out</button>
          </div>
        </header>

        {error && <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-6">
          <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-xs text-slate-500">Total</div><div className="mt-1 text-2xl font-extrabold">{complaints.length}</div></div>
          {statuses.map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-2xl p-4 text-left shadow-sm ${filter === value ? 'bg-orange-500 text-white' : 'bg-white'}`}><div className="text-xs opacity-70">{label}</div><div className="mt-1 text-2xl font-extrabold">{complaints.filter((c) => c.status === value).length}</div></button>)}
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div><h2 className="text-xl font-extrabold">Complaints</h2><p className="text-sm text-slate-500">Select a complaint to update its service status.</p></div>
            <span className="text-sm text-slate-500">{filtered.length} shown</span>
          </div>
          {loading && <div className="p-6 text-slate-500">Loading…</div>}
          {!loading && filtered.length === 0 && <div className="p-8 text-center text-slate-500">No complaints found.</div>}
          {!loading && filtered.length > 0 && <div className="divide-y divide-slate-100">{filtered.map((complaint) => (
            <button key={complaint.complaint_number} onClick={() => setSelected(complaint)} className="grid w-full gap-3 p-5 text-left hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr] md:items-center">
              <div><div className="font-bold">{complaint.complaint_number}</div><div className="text-xs text-slate-500">{new Date(complaint.created_at).toLocaleString()}</div></div>
              <div><div className="text-xs text-slate-400">Serial</div><div className="font-semibold">{complaint.serial_number}</div></div>
              <div><div className="text-xs text-slate-400">Customer</div><div className="font-semibold">{complaint.full_name}</div></div>
              <div><div className="text-xs text-slate-400">Type</div><div className="font-semibold">{complaint.complaint_type}</div></div>
              <div><span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{statusLabel(complaint.status)}</span></div>
            </button>
          ))}</div>}
        </section>

        {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 md:items-center">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4"><div><div className="text-sm font-semibold text-emerald-700">SERVICE COMPLAINT</div><h2 className="text-2xl font-extrabold">{selected.complaint_number}</h2></div><button onClick={() => setSelected(null)} className="rounded-xl border px-3 py-2">Close</button></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[['Customer', selected.full_name], ['Mobile', selected.mobile], ['Registration', selected.registration_number ?? '—'], ['Serial', selected.serial_number], ['Model', selected.model_code ?? '—'], ['Product', selected.product_name ?? '—'], ['Complaint', selected.complaint_type], ['Location', [selected.service_city, selected.service_state].filter(Boolean).join(', ') || '—']].map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 font-semibold">{value}</div></div>)}
            </div>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Problem description</div><div className="mt-1">{selected.problem_description}</div></div>
            <div className="mt-6"><div className="mb-3 font-bold">Update status</div><div className="grid grid-cols-2 gap-2 md:grid-cols-3">{statuses.map(([value, label]) => <button key={value} disabled={loading || selected.status === value} onClick={() => updateStatus(selected.complaint_number, value)} className={`rounded-xl px-3 py-3 text-sm font-semibold ${selected.status === value ? 'bg-orange-500 text-white' : 'border border-slate-200 bg-white hover:bg-slate-50'}`}>{label}</button>)}</div></div>
          </section>
        </div>}
      </div>
    </main>
  )
}
