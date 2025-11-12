// app/fb-pixel-listener.tsx
'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global { interface Window { fbq?: (...args: any[]) => void } }

export default function FbPixelListener() {
  const pathname = usePathname()
  const search = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  }, [pathname, search])

  return null
}
