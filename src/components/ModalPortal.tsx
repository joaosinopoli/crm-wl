'use client'

import { createPortal } from 'react-dom'
import { useEffect, useSyncExternalStore, type ReactNode } from 'react'

// Fieldwork OS: overlays vivem no body para não herdarem overflow, blur ou stacking contexts de rail/topbar.
export default function ModalPortal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  useEffect(() => {
    if (!mounted) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [mounted])
  return mounted ? createPortal(children, document.body) : null
}
