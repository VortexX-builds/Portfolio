import { useState, useCallback } from 'react'
import { useLenis } from './hooks/useLenis'
import { Preloader } from './components/Preloader/Preloader'
import { Navbar } from './components/Navbar/Navbar'
import { Hero } from './components/Hero/Hero'

export default function App() {
  // Initialize Lenis smooth scroll + GSAP ScrollTrigger sync at app root.
  // lenisRef gives us the live instance for pause/resume during the preloader.
  const lenisRef = useLenis()

  // Preloader is in the tree from the very first paint.
  // Once its exit animation completes, this flips to true and removes it.
  const [preloaderDone, setPreloaderDone] = useState(false)

  const handlePreloaderDone = useCallback(() => {
    // Preloader is done — remove it from the tree.
    // Scroll stays locked here; Hero will call onHeroReady once its
    // entry animation completes, at which point the ScrollTrigger pin
    // is registered and Lenis can safely start.
    setPreloaderDone(true)
  }, [])

  const handleHeroReady = useCallback(() => {
    // Entry animation is finished, ScrollTrigger pin is registered — unlock scroll.
    lenisRef.current?.start()
  }, [lenisRef])

  return (
    <>
      {/* Preloader is rendered above everything, removed once its exit fires */}
      {!preloaderDone && (
        <Preloader onComplete={handlePreloaderDone} />
      )}

      {/*
        Navbar is always in the DOM so GSAP can read its real dimensions
        on entrance. It starts visibility: hidden (via .gsap-hidden) and
        reveals itself once isVisible flips to true (preloader done).
      */}
      <Navbar isVisible={preloaderDone} />

      {/*
        Hero and all other sections go here.
        They render in the background while the preloader plays — no asset delay.
        Each section defers its own entrance animations until it enters the
        viewport via ScrollTrigger, which means they are naturally "waiting"
        when the preloader exits.
      */}
      <main>
        <Hero isVisible={preloaderDone} onReady={handleHeroReady} />
        {/* Build order: Work → About → Contact */}
        <section style={{ height: '150vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
          <h2 style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-heading)', fontWeight: 400 }}>
            [ Work Section Incoming ]
          </h2>
        </section>
      </main>
    </>
  )
}
