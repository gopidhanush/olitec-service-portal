import AdminAccessGuard from '@/components/AdminAccessGuard'

export default function ProductAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAccessGuard module="product">
    <div style={{minHeight:'100vh'}}>
      <nav style={{display:'flex',gap:10,flexWrap:'wrap',padding:'14px 28px',background:'#fff',borderBottom:'1px solid #e7ebef',position:'sticky',top:0,zIndex:30}}>
        <button onClick={()=>{window.location.href='/admin/products'}} style={{border:'1px solid #dfe5ec',borderRadius:11,padding:'10px 15px',fontWeight:800,cursor:'pointer',background:'#fff',color:'#172033'}}>Product Master</button>
        <button onClick={()=>{window.location.href='/admin/products#serials'}} style={{border:'1px solid #dfe5ec',borderRadius:11,padding:'10px 15px',fontWeight:800,cursor:'pointer',background:'#fff',color:'#172033'}}>Serial Number Generator</button>
        <button onClick={()=>{window.location.href='/admin/products/registrations'}} style={{border:0,borderRadius:11,padding:'10px 15px',fontWeight:800,cursor:'pointer',background:'#172033',color:'#fff'}}>Product Registration History</button>
      </nav>
      {children}
    </div>
  </AdminAccessGuard>
}
