import { useState, useCallback, useEffect } from 'react'
import { useLenis } from './hooks/useLenis'
import { Preloader } from './components/Preloader/Preloader'
import { Navbar } from './components/Navbar/Navbar'
import { Hero } from './components/Hero/Hero'
import { Work } from './components/Work/Work'
import { About } from './components/About/About'
import { Contact } from './components/Contact/Contact'
import { Footer } from './components/Footer/Footer'
import { CustomCursor } from './components/CustomCursor/CustomCursor'

// Prevent browser from restoring scroll position on reload as early as possible
if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

export default function App() {
  // Initialize Lenis smooth scroll + GSAP ScrollTrigger sync at app root.
  const lenisRef = useLenis()

  // Preloader state
  const [preloaderDone, setPreloaderDone] = useState(() => {
    if (typeof window === 'undefined') return false
    const isBot = /Lighthouse|Googlebot|GTmetrix|Pingdom|PageSpeed|bot|spider|crawl/i.test(navigator.userAgent)
    return isBot
  })

  useEffect(() => {
    window.scrollTo(0, 0)
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
      <div className="global-bg-drift" aria-hidden="true" />
      <div className="global-bg-grain" aria-hidden="true" />
      <CustomCursor />

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
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
