import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins globally — done once here, available everywhere
gsap.registerPlugin(ScrollTrigger)

/** Module-level singleton — accessible without prop-drilling */
let _lenis: Lenis | null = null

export function getLenis() {
  return _lenis
}

export function stopScroll() {
  _lenis?.stop()
}

export function startScroll() {
  _lenis?.start()
}

let _maxScrollLimit: number | null = null

export function restrictScrollDown(limit: number) {
  _maxScrollLimit = limit
}

export function releaseScrollDown() {
  _maxScrollLimit = null
}

/**
 * Smoothly scroll to a CSS selector or element using the active Lenis instance.
 * Falls back to native scrollIntoView if Lenis hasn't been initialised yet.
 */
export function scrollToSection(target: string | HTMLElement, offset = 0) {
  if (_lenis) {
    _lenis.scrollTo(target, { offset, duration: 1.4 })
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: 'smooth' })
  }
}

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    })

    lenisRef.current = lenis
    _lenis = lenis

    // Start scroll locked — the preloader will call lenis.start() on its
    // onComplete callback. If there is no preloader (reduced motion), App.tsx
    // removes the Preloader node immediately and calls start() synchronously.
    lenis.stop()

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', (e: any) => {
      if (_maxScrollLimit !== null && e.scroll > _maxScrollLimit) {
        lenis.scrollTo(_maxScrollLimit, { immediate: true })
      }
      ScrollTrigger.update()
    })

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      lenisRef.current = null
      _lenis = null
    }
  }, [])

  return lenisRef
}
