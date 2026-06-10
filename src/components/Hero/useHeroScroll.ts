import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function useHeroScroll(
  heroRef: React.RefObject<HTMLElement | null>,
  ruleRef: React.RefObject<HTMLElement | null>,
  nameRef: React.RefObject<HTMLElement | null>,
  roleRef: React.RefObject<HTMLElement | null>,
  scrollIndicatorRef: React.RefObject<HTMLElement | null>,
  bridgeRef: React.RefObject<HTMLElement | null>,
  setScrollIntensity: (val: number) => void,
  animationsReady: boolean
) {
  // Store the timeline so we can add tweens to it later
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  // Step 1: Initialize ScrollTrigger and Pin immediately on mount.
  useEffect(() => {
    if (!heroRef.current) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      tlRef.current = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=250%', // Extended pin: accommodates Hero exit + Quote Bridge
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            // Intensify shader in the first 40% of scroll (hero exit) and hold it
            if (!prefersReduced) {
              setScrollIntensity(Math.min(1, self.progress * 2.5))
            }
          }
        }
      })
    }, heroRef)

    return () => ctx.revert()
  }, [heroRef, setScrollIntensity])

  // Step 2: Add the animation tweens ONLY after the entry animation finishes.
  useEffect(() => {
    if (!animationsReady || !tlRef.current || !ruleRef.current || !nameRef.current || !roleRef.current || !bridgeRef.current || !scrollIndicatorRef.current) return

    const tl = tlRef.current
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ==========================================
    // PHASE 1: HERO EXIT (Timeline Time: 0 to 1.0)
    // ==========================================
    
    tl.addLabel('heroExit', 0)

    tl.to(ruleRef.current, {
      scaleX: 0,
      opacity: 0,
      transformOrigin: 'right center',
      ease: 'power2.in',
      duration: 0.5
    }, 'heroExit')

    tl.to(nameRef.current, {
      scale: prefersReduced ? 1 : 0.85,
      opacity: 0,
      filter: prefersReduced ? 'blur(0px)' : 'blur(12px)',
      y: prefersReduced ? 0 : 30,
      ease: 'power1.in',
      duration: 0.8
    }, 'heroExit')

    const roleSpans = roleRef.current?.querySelectorAll('span') ?? []
    tl.to(roleSpans, {
      y: prefersReduced ? 0 : 20,
      opacity: 0,
      filter: prefersReduced ? 'blur(0px)' : 'blur(8px)',
      ease: 'power1.in',
      stagger: 0.05,
      duration: 0.6
    }, 'heroExit')

    tl.to(scrollIndicatorRef.current, {
      y: prefersReduced ? 0 : 20,
      opacity: 0,
      filter: prefersReduced ? 'blur(0px)' : 'blur(4px)',
      ease: 'power1.in',
      duration: 0.6
    }, 'heroExit')

    // ==========================================
    // PHASE 2: QUOTE BRIDGE (Timeline Time: 1.0 to 3.0)
    // ==========================================
    
    const bridgeWords = bridgeRef.current.querySelectorAll('.quote-bridge__word')
    const bridgePeriod = bridgeRef.current.querySelector('.quote-bridge__period')
    
    tl.addLabel('quoteStart', 1.0)

    // Make the wrapper visible so the children can be seen when they animate
    tl.set(bridgeRef.current, { visibility: 'visible', opacity: 1 }, 'quoteStart')

    if (prefersReduced) {
      // Reduced Motion: Fade in all at once, hold, fade out
      // Note: we just set opacity to 1 above, so we can fromTo to handle it properly
      tl.fromTo(bridgeRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' },
        'quoteStart'
      )
      tl.to(bridgeRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut'
      }, 2.5) // Fades out at the end

    } else {
      // Standard Motion: Staggered assembly
      if (bridgeWords.length > 0) {
        // Words fly in from slightly further away
        tl.fromTo(bridgeWords,
          { scale: 0.8, opacity: 0, filter: 'blur(8px)', z: -50 },
          {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            z: 0,
            ease: 'power2.out',
            stagger: 0.08,
            duration: 0.5
          },
          'quoteStart'
        )
      }

      // Period arrives last with a slight pause
      if (bridgePeriod) {
        const periodStartTime = 1.0 + (bridgeWords.length * 0.08) + 0.1 // slight gap
        tl.fromTo(bridgePeriod,
          { scale: 0.8, opacity: 0, filter: 'blur(8px)', z: -50 },
          { scale: 1, opacity: 1, filter: 'blur(0px)', z: 0, ease: 'power2.out', duration: 0.4 },
          periodStartTime
        )
      }

      // Hold automatically happens because there's a gap before the next tween.
      
      // Dissolve the entire quote wrapper
      tl.to(bridgeRef.current, {
        opacity: 0,
        filter: 'blur(12px)',
        scale: 1.05, // Slight push forward as it dissolves
        duration: 0.6,
        ease: 'power2.inOut'
      }, 2.6) // Starts dissolving near the end
    }

    // Add empty space to ensure total timeline duration reaches around 3.2
    // This gives the dissolve time to fully finish before unpinning.
    tl.to({}, { duration: 0.1 }, 3.2)

  }, [animationsReady, ruleRef, nameRef, roleRef, bridgeRef, scrollIndicatorRef])
}
