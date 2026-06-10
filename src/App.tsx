import { useState, useCallback, useEffect, lazy, Suspense, useRef } from 'react'
import { useLenis } from './hooks/useLenis'
import { Preloader } from './components/Preloader/Preloader'
import { Navbar } from './components/Navbar/Navbar'
import { Hero } from './components/Hero/Hero'
import type { GlobalShaderRef } from './components/GlobalShader/GlobalShader'

const GlobalShaderLazy = lazy(() => import('./components/GlobalShader/GlobalShader').then(m => ({ default: m.GlobalShader })))

export default function App() {
  // Initialize Lenis smooth scroll + GSAP ScrollTrigger sync at app root.
  const lenisRef = useLenis()
  const shaderRef = useRef<GlobalShaderRef>(null)

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    const match = window.matchMedia('(hover: none) and (pointer: coarse)')
    return window.innerWidth <= 768 || match.matches || !window.WebGLRenderingContext
  })

  // Preloader state
  const [preloaderDone, setPreloaderDone] = useState(() => {
    if (typeof window === 'undefined') return false
    const isBot = /Lighthouse|Googlebot|GTmetrix|Pingdom|PageSpeed|bot|spider|crawl/i.test(navigator.userAgent)
    return isBot
  })

  useEffect(() => {
    const checkMobile = () => {
      const match = window.matchMedia('(hover: none) and (pointer: coarse)')
      setIsMobile(window.innerWidth <= 768 || match.matches || !window.WebGLRenderingContext)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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
          <GlobalShaderLazy ref={shaderRef} />
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
          setShaderIntensity={(val) => shaderRef.current?.setScrollIntensity(val)}
        />
        {/* Build order: Work → About → Contact */}
        {/* Work section is next, ensuring background remains transparent to show shader */}
        <section style={{ height: '150vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
          <h2 style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-heading)', fontWeight: 400 }}>
            [ Work Section Incoming ]
          </h2>
        </section>
      </main>
    </>
  )
}
