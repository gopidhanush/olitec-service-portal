'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'

type QRScannerProps = {
  onScan?: (value: string) => void
  onClose?: () => void
}

function normalizeScanValue(value: string) {
  const raw = value.trim()
  if (!/^https?:\/\//i.test(raw)) return raw
  try {
    const url = new URL(raw)
    const parts = url.pathname.split('/').filter(Boolean)
    const registerIndex = parts.findIndex(part => part.toLowerCase() === 'register')
    if (registerIndex >= 0 && parts[registerIndex + 1]) return decodeURIComponent(parts[registerIndex + 1])
    const serial = url.searchParams.get('serial') || url.searchParams.get('identifier') || url.searchParams.get('qr')
    return serial?.trim() || raw
  } catch {
    return raw
  }
}

type NativeBarcodeDetector = {
  detect: (source: HTMLVideoElement | HTMLCanvasElement) => Promise<Array<{ rawValue?: string }>>
}

type NativeBarcodeDetectorConstructor = new (options?: { formats?: string[] }) => NativeBarcodeDetector

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const onScanRef = useRef(onScan)
  const onCloseRef = useRef(onClose)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(true)

  useEffect(() => { onScanRef.current = onScan }, [onScan])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    let mounted = true
    let handled = false

    const stopEverything = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      controlsRef.current?.stop()
      controlsRef.current = null
      streamRef.current?.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    const finish = (raw: string) => {
      if (!mounted || handled) return
      const identifier = normalizeScanValue(raw)
      if (!identifier) return
      handled = true
      stopEverything()
      onScanRef.current?.(identifier)
    }

    async function startNativeDetector() {
      const Detector = (window as unknown as { BarcodeDetector?: NativeBarcodeDetectorConstructor }).BarcodeDetector
      if (!Detector || !navigator.mediaDevices?.getUserMedia || !videoRef.current) return false

      try {
        const detector = new Detector({ formats: ['qr_code'] })
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (!mounted || !videoRef.current) { stream.getTracks().forEach(track => track.stop()); return true }
        streamRef.current = stream
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.muted = true
        await videoRef.current.play()
        setStarting(false)

        const canvas = document.createElement('canvas')
        canvasRef.current = canvas
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) throw new Error('Canvas unavailable')

        const scan = async () => {
          if (!mounted || handled || !videoRef.current) return
          const video = videoRef.current
          if (video.readyState >= 2 && video.videoWidth > 0) {
            const width = Math.min(video.videoWidth, 960)
            const height = Math.round(width * video.videoHeight / video.videoWidth)
            canvas.width = width
            canvas.height = height
            context.drawImage(video, 0, 0, width, height)
            try {
              const results = await detector.detect(canvas)
              const value = results.find(item => item.rawValue?.trim())?.rawValue
              if (value) { finish(value); return }
            } catch {
              // Continue scanning; some browsers intermittently reject a frame.
            }
          }
          rafRef.current = requestAnimationFrame(() => { void scan() })
        }
        rafRef.current = requestAnimationFrame(() => { void scan() })
        return true
      } catch (nativeError) {
        console.debug('Native QR detector unavailable; using ZXing fallback.', nativeError)
        streamRef.current?.getTracks().forEach(track => track.stop())
        streamRef.current = null
        return false
      }
    }

    async function startZXing() {
      try {
        if (!videoRef.current) return
        const reader = new BrowserQRCodeReader()
        // ZXing's default retry interval is intentionally conservative. A QR-only
        // scanner can safely retry much faster for a customer-facing registration flow.
        const fastReader = reader as unknown as { timeBetweenDecodingAttempts?: number; timeBetweenDecodingSuccess?: number }
        fastReader.timeBetweenDecodingAttempts = 50
        fastReader.timeBetweenDecodingSuccess = 50

        const controls = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
          videoRef.current,
          (result) => { if (result) finish(result.getText()) },
        )
        controlsRef.current = controls
        if (mounted) setStarting(false)
      } catch (e) {
        console.error(e)
        if (mounted) { setStarting(false); setError('Camera could not be opened. Please allow camera access and try again.') }
      }
    }

    void startNativeDetector().then(nativeStarted => { if (!nativeStarted && mounted) void startZXing() })

    return () => {
      mounted = false
      stopEverything()
    }
  }, [])

  return (
    <div className="scanCard">
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#111', aspectRatio: '4/3' }}>
        <video ref={videoRef} muted playsInline autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: '18%', border: '2px solid #fff', borderRadius: 18, boxShadow: '0 0 0 999px #0005', pointerEvents: 'none' }} />
      </div>
      {starting && <p className="scanHint">Starting camera…</p>}
      {error && <p style={{ color: '#c43b2f', fontSize: 12, textAlign: 'center' }}>{error}</p>}
      <p className="scanHint">Place the OLITEC QR code inside the frame.</p>
      <button className="scanSecondary" type="button" onClick={() => { controlsRef.current?.stop(); streamRef.current?.getTracks().forEach(track => track.stop()); onCloseRef.current?.() }}>Cancel</button>
    </div>
  )
}
