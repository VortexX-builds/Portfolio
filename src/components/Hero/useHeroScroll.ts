import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function useHeroScroll(
  heroRef: React.RefObject<HTMLElement | null>,
  ruleRef: React.RefObject<HTMLElement | null>,
  nameRef: React.RefObject<HTMLElement | null>,
  roleRef: React.RefObject<HTMLElement | null>,
  quoteWrapRef: React.RefObject<HTMLElement | null>,
  scrollIndicatorRef: React.RefObject<HTMLElement | null>,
  setScrollIntensity: (val: number) => void,
  isVisible: boolean,
  animationsReady: boolean
) {
  // Store the timeline so we can add tweens to it later
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  // Step 1: Initialize ScrollTrigger and Pin immediately on mount.
  // This prevents the DOM "flash" / black screen caused by the pin-spacer
  // being added *after* the canvas has already rendered.
  useEffect(() => {
    if (!heroRef.current) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      tlRef.current = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=100%', // Pin for 100% of viewport height
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            if (!prefersReduced) setScrollIntensity(self.progress)
          }
        }
      })
    }, heroRef)

    return () => ctx.revert()
  }, [heroRef, setScrollIntensity])

  // Step 2: Add the animation tweens ONLY after the entry animation finishes.
  // This ensures all .to() tweens capture the final fully-visible state (opacity: 1)
  // instead of capturing the starting opacity: 0 from the entry animation.
  useEffect(() => {
    if (!animationsReady || !tlRef.current || !ruleRef.current || !nameRef.current || !roleRef.current || !quoteWrapRef.current || !scrollIndicatorRef.current) return

    const tl = tlRef.current
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Shader canvas fades to 0
    tl.to('.hero__canvas, .hero__bg-static', { opacity: 0, ease: 'none', duration: 1 }, 0)

    // Gold rule retracts right and fades
    tl.to(ruleRef.current, {
      scaleX: 0,
      opacity: 0,
      transformOrigin: 'right center',
      ease: 'power2.in',
      duration: 0.5
    }, 0)

    // Name sinks into the background — scale down, blur, drift down
    tl.to(nameRef.current, {
      scale: prefersReduced ? 1 : 0.85,
      opacity: 0,
      filter: prefersReduced ? 'blur(0px)' : 'blur(12px)',
      y: prefersReduced ? 0 : 30,
      ease: 'power1.in',
      duration: 1
    }, 0)

    // Role fragments stagger-sink
    const roleSpans = roleRef.current?.querySelectorAll('span') ?? []
    tl.to(roleSpans, {
      y: prefersReduced ? 0 : 20,
      opacity: 0,
      filter: prefersReduced ? 'blur(0px)' : 'blur(8px)',
      ease: 'power1.in',
      stagger: 0.05,
      duration: 0.6
    }, 0)

    // Quote words: "Closer Than They Appear" fly-through
    const quoteWords = quoteWrapRef.current?.querySelectorAll('.hero__quote-word') ?? []
    if (quoteWords.length > 0) {
      tl.to(quoteWords, {
        scale: prefersReduced ? 1 : 4.5,
        opacity: 0,
        color: 'var(--color-text-primary)',
        y: prefersReduced ? 0 : -60,
        x: prefersReduced ? 0 : -20,
        ease: 'power2.in',
        stagger: { amount: 0.4, from: 'start' },
        duration: 0.6
      }, 0)
    } else {
      tl.to(quoteWrapRef.current, {
        y: prefersReduced ? 0 : -40,
        opacity: 0,
        ease: 'power2.in',
        duration: 0.6
      }, 0)
    }

    // Scroll indicator fades and drifts down
    tl.to(scrollIndicatorRef.current, {
      y: prefersReduced ? 0 : 20,
      opacity: 0,
      filter: prefersReduced ? 'blur(0px)' : 'blur(4px)',
      ease: 'power1.in',
      duration: 0.6
    }, 0)

  }, [animationsReady, ruleRef, nameRef, roleRef, quoteWrapRef, scrollIndicatorRef])
}
