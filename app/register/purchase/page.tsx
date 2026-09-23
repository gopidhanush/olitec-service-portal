'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PurchaseRegistrationRedirect(){
  const router=useRouter(); const params=useSearchParams()
  useEffect(()=>{
    const identifier=params.get('identifier')?.trim()
    if(identifier) router.replace(`/register/${encodeURIComponent(identifier)}/purchase`)
    else router.replace('/register')
  },[params,router])
  return <div style={{minHeight:'60vh',display:'grid',placeItems:'center',fontFamily:'Arial,sans-serif',color:'#08234d'}}>Preparing your registration…</div>
}
