'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

const SUPER_ADMIN_EMAIL = 'admin@gsons.co.in'

type ReportRow = {
  product_id: string
  model_id: string
  model_code: string
  product_name: string
  capacity_kw: number | null
  mrp: number | null
  warranty_months: number
  serial_number: string
  qr_code: string | null
  production_month: string | null
  batch_number: string | null
  created_by: string | null
  created_at: string | null
  downloaded_at: string | null
  download_count: number
  product_status: string | null
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f7f9fb', color: '#172033' },
  shell: { maxWidth: 1800, margin: '0 auto', padding: '28px 34px 60px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 22 },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' },
  button: { border: '1px solid #dfe5ec', borderRadius: 11, padding: '10px 15px', fontWeight: 800, cursor: 'pointer', background: '#fff', color: '#172033' },
  primary: { border: 0, borderRadius: 12, padding: '11px 17px', fontWeight: 800, cursor: 'pointer', background: '#ff7a00', color: '#fff' },
  card: { background: '#fff', border: '1px solid #e4e9ef', borderRadius: 22, padding: 22, boxShadow: '0 10px 35px rgba(23,32,51,.05)' },
  input: { width: '100%', height: 44, padding: '10px 13px', border: '1px solid #dfe3ea', borderRadius: 11, background: '#fff', color: '#172033' },
}

function displayMonth(value: string | null) {
  return value ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'
}

function displayDate(value: string | null) {
  return value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function downloadCsv(rows: ReportRow[]) {
  const header = ['Product', 'Model', 'Capacity (kW)', 'MRP', 'Warranty', 'Serial Number', 'QR URL', 'Production Month', 'Batch Number', 'Created By', 'Created At', 'Downloaded At', 'Download Count', 'Status']
  const lines = rows.map(r => [
    r.product_name,
    r.model_code,
    r.capacity_kw ?? '',
    r.mrp ?? '',
    `${Math.round(r.warranty_months / 12)} years`,
    r.serial_number,
    r.qr_code ?? '',
    displayMonth(r.production_month),
    r.batch_number ?? '',
    r.created_by ?? '',
    displayDate(r.created_at),
    displayDate(r.downloaded_at),
    r.download_count,
    r.product_status ?? '',
  ].map(csvCell).join(','))

  const blob = new Blob([header.map(csvCell).join(',') + '\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `OLITEC-Serial-Generation-Report-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function errorText(error: any) {
  const message = error?.message || 'Something went wrong.'
  if (message.includes('ADMIN_ACCESS_REQUIRED')) return 'Your account does not have Product Admin permission.'
  return message
}

export default function SerialGenerationReportPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<ReportRow[]>([])
  const [search, setSearch] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')

  async function loadReport() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.rpc('admin_get_serial_generation_report')
    if (error) setError(errorText(error))
    else setRows((data || []) as ReportRow[])
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setLoggedIn(true)
        loadReport()
      }
    })
  }, [])

  async function login(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(errorText(error))
      setLoading(false)
      return
    }
    setLoggedIn(true)
    await loadReport()
  }

  async function logout() {
    await supabase.auth.signOut()
    setLoggedIn(false)
    setRows([])
  }

  const models = useMemo(() => Array.from(new Set(rows.map(r => r.model_code))).sort(), [rows])
  const months = useMemo(() => Array.from(new Set(rows.map(r => r.production_month).filter(Boolean) as string[])).sort().reverse(), [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(r => {
      const matchesSearch = !q || [r.product_name, r.model_code, r.serial_number, r.qr_code, r.batch_number, r.created_by].some(v => String(v || '').toLowerCase().includes(q))
      const matchesModel = !modelFilter || r.model_code === modelFilter
      const matchesMonth = !monthFilter || r.production_month === `${monthFilter}-01` || r.production_month === monthFilter
      return matchesSearch && matchesModel && matchesMonth
    })
  }, [rows, search, modelFilter, monthFilter])

  if (!loggedIn) {
    return <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <section style={{ ...styles.card, width: '100%', maxWidth: 560 }}>
        <img src="/olitec-logo.svg" alt="OLITEC" style={{ width: 190, display: 'block', margin: '0 auto 12px' }} />
        <div style={{ textAlign: 'center', color: '#718096' }}>Serial Number Report</div>
        <h1 style={{ textAlign: 'center', marginBottom: 8 }}>Generation Audit Report</h1>
        <p style={{ textAlign: 'center', color: '#718096' }}>Sign in with your Product Administration account to view serial-number generation history.</p>
        <form onSubmit={login}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', margin: '15px 0 7px' }}>Staff email</label>
          <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#475569', margin: '15px 0 7px' }}>Password</label>
          <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: '#fff0f0', color: '#b42318' }}>{error}</div>}
          <button style={{ ...styles.primary, width: '100%', marginTop: 18 }} disabled={loading}>{loading ? 'Signing in…' : 'Sign in →'}</button>
        </form>
        <button style={{ ...styles.button, width: '100%', marginTop: 10 }} onClick={() => { window.location.href = '/admin/products' }}>← Back to Product Administration</button>
      </section>
    </div>
  }

  return <div style={styles.page}>
    <div style={styles.shell}>
      <header style={styles.header}>
        <div>
          <img src="/olitec-logo.svg" alt="OLITEC" style={{ width: 170, display: 'block' }} />
          <div style={{ color: '#718096', fontSize: 14, marginTop: 5 }}>Serial Number Generation Report</div>
        </div>
        <div style={styles.actions}>
          <button style={styles.button} onClick={() => { window.location.href = '/admin/products' }}>← Product Administration</button>
          <button style={styles.button} onClick={loadReport}>↻ Refresh</button>
          <button style={styles.button} onClick={logout}>Sign out</button>
        </div>
      </header>

      {error && <div style={{ padding: 13, borderRadius: 13, background: '#fff0f0', color: '#b42318', border: '1px solid #ffd4d1', marginBottom: 15 }}>{error}</div>}

      <section style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 15, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.12em', fontWeight: 800, color: '#168a45' }}>SERIAL NUMBER AUDIT</div>
            <h1 style={{ margin: '6px 0' }}>Generated Serial Numbers</h1>
            <p style={{ margin: 0, color: '#718096', fontSize: 13 }}>Complete product and generation audit details — product, serial, QR URL, batch, creator and creation time.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <strong>{filtered.length}</strong><span style={{ color: '#718096', fontSize: 13 }}>of {rows.length} serials</span>
            <button style={styles.primary} disabled={!filtered.length} onClick={() => downloadCsv(filtered)}>Export CSV ↓</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginTop: 20 }}>
          <input style={styles.input} placeholder="Search product, model, serial, QR, batch or created by…" value={search} onChange={e => setSearch(e.target.value)} />
          <select style={styles.input} value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
            <option value="">All models</option>
            {models.map(model => <option key={model} value={model}>{model}</option>)}
          </select>
          <select style={styles.input} value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
            <option value="">All production months</option>
            {months.map(month => <option key={month} value={month.slice(0, 7)}>{displayMonth(month)}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto', marginTop: 18 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1500 }}>
            <thead>
              <tr>{['Product', 'Model', 'Capacity', 'MRP', 'Warranty', 'Serial Number', 'QR URL', 'Production Month', 'Batch Number', 'Created By', 'Created At', 'Download', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: 11, borderBottom: '1px solid #e9edf2', color: '#8a94a6', fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(row => <tr key={row.product_id}>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}><strong>{row.product_name}</strong></td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>{row.model_code}</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>{row.capacity_kw ?? '—'} kW</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>₹{Number(row.mrp || 0).toLocaleString('en-IN')}</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>{Math.round(row.warranty_months / 12)} years</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', fontWeight: 800, whiteSpace: 'nowrap' }}>{row.serial_number}</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', maxWidth: 330 }}><span title={row.qr_code || ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#2563eb' }}>{row.qr_code || '—'}</span></td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>{displayMonth(row.production_month)}</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>{row.batch_number || '—'}</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>{row.created_by || '—'}</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>{displayDate(row.created_at)}</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>{row.download_count}×{row.downloaded_at ? ' · Downloaded' : ''}</td>
                <td style={{ padding: 11, borderBottom: '1px solid #eef1f5', whiteSpace: 'nowrap' }}>{row.product_status || '—'}</td>
              </tr>)}
              {!loading && !filtered.length && <tr><td colSpan={13} style={{ padding: 45, textAlign: 'center', color: '#718096' }}>No serial numbers match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
}
