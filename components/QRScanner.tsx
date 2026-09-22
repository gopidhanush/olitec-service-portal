'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { useRouter } from 'next/navigation'

export default function QRScanner({ onClose }: { onClose?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const reader = new BrowserQRCodeReader()

    async function start() {
      try {
        if (!videoRef.current) return
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (result) => {
            if (!mounted || !result) return
            let identifier = result.getText()
            try {
              const url = new URL(identifier)
              const parts = url.pathname.split('/').filter(Boolean)
              const i = parts.indexOf('register')
              identifier = i >= 0 && parts[i + 1]
                ? parts[i + 1]
                : url.searchParams.get('qr') || url.searchParams.get('serial') || identifier
            } catch {}
            controlsRef.current?.stop()
            router.push(`/register/${encodeURIComponent(identifier)}`)
          }
        )
        controlsRef.current = controls
        if (mounted) setStarting(false)
      } catch (e) {
        console.error(e)
        if (mounted) {
          setStarting(false)
          setError('Camera could not be opened. Please allow camera access and try again.')
        }
      }
    }

    start()
    return () => {
      mounted = false
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [router])

  return (
    <div className="scanCard">
      <div style={{position:'relative',borderRadius:16,overflow:'hidden',background:'#111',aspectRatio:'4/3'}}>
        <video ref={videoRef} muted playsInline style={{width:'100%',height:'100%',objectFit:'cover'}} />
        <div style={{position:'absolute',inset:'18%',border:'2px solid #fff',borderRadius:18,boxShadow:'0 0 0 999px #0005'}} />
      </div>
      {starting && <p className="scanHint">Starting camera…</p>}
      {error && <p style={{color:'#c43b2f',fontSize:12,textAlign:'center'}}>{error}</p>}
      <p className="scanHint">Place the OLITEC QR code inside the frame.</p>
      <button className="scanSecondary" onClick={() => { controlsRef.current?.stop(); onClose?.() }}>Cancel</button>
    </div>
  )
}
