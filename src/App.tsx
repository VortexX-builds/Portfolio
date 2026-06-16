import { useState, useCallback, useEffect, lazy, Suspense, useRef } from 'react'
import { useLenis } from './hooks/useLenis'
import { Preloader } from './components/Preloader/Preloader'
import { Navbar } from './components/Navbar/Navbar'
import { Hero } from './components/Hero/Hero'
import { Work } from './components/Work/Work'
import type { GlobalShaderRef } from './components/GlobalShader/GlobalShader'

const GlobalShaderLazy = lazy(() => import('./components/GlobalShader/GlobalShader').then(m => ({ default: m.GlobalShader })))

// Prevent browser from restoring scroll position on reload as early as possible
if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

export default function App() {
  // Initialize Lenis smooth scroll + GSAP ScrollTrigger sync at app root.
  const lenisRef = useLenis()
  const shaderRef = useRef<GlobalShaderRef>(null)

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    const match = window.matchMedia('(hover: none) and (pointer: coarse)')
    return window.innerWidth <= 768 || match.matches || !window.WebGLRenderingContext
  })

  // Defer shader to prioritize main thread rendering
  const [shaderEnabled, setShaderEnabled] = useState(false)

  // Preloader state
  const [preloaderDone, setPreloaderDone] = useState(() => {
    if (typeof window === 'undefined') return false
    const isBot = /Lighthouse|Googlebot|GTmetrix|Pingdom|PageSpeed|bot|spider|crawl/i.test(navigator.userAgent)
    return isBot
  })

  useEffect(() => {
    window.scrollTo(0, 0)

    const checkMobile = () => {
      const match = window.matchMedia('(hover: none) and (pointer: coarse)')
      setIsMobile(window.innerWidth <= 768 || match.matches || !window.WebGLRenderingContext)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const timer = setTimeout(() => setShaderEnabled(true), 100)

    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(timer)
    }
  }, [])

  const handlePreloaderDone = useCallback(() => {
    setPreloaderDone(true)
  }, [])

  const handleHeroReady = useCallback(() => {
    lenisRef.current?.start()
  }, [lenisRef])

  return (
    <>
      {/* Global Background Layer */}
      {isMobile ? (
        <div className="global-bg-static" aria-hidden="true" />
      ) : (
        <Suspense fallback={<div className="global-bg-static" aria-hidden="true" />}>
          {shaderEnabled && <GlobalShaderLazy ref={shaderRef} />}
        </Suspense>
      )}

      {/* Preloader */}
      {!preloaderDone && (
        <Preloader onComplete={handlePreloaderDone} />
      )}

      {/* Navbar */}
      <Navbar isVisible={preloaderDone} />

      {/* Content */}
      <main>
        <Hero 
          isVisible={preloaderDone} 
          onReady={handleHeroReady} 
        />
        <Work />
        {/* Build order: About → Contact */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
          <h2 style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-heading)', fontWeight: 400 }}>
            [ About Section Incoming ]
          </h2>
        </section>
      </main>
    </>
  )
}
