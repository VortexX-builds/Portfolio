import { useEffect } from 'react'
import { gsap } from 'gsap'

export function useHeroScroll(
  heroRef: React.RefObject<HTMLElement | null>,
  ruleRef: React.RefObject<HTMLElement | null>,
  nameRef: React.RefObject<HTMLElement | null>,
  roleRef: React.RefObject<HTMLElement | null>,
  scrollIndicatorRef: React.RefObject<HTMLElement | null>,
  bridgeRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const hero = heroRef.current
    const rule = ruleRef.current
    const name = nameRef.current
    const role = roleRef.current
    const scrollIndicator = scrollIndicatorRef.current
    const bridge = bridgeRef.current

    if (!hero || !rule || !name || !role || !scrollIndicator || !bridge) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 768
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: isMobile ? 'bottom top' : '+=180%', // No dead scroll gap
          pin: !isMobile, // Don't pin on mobile to prevent huge pin spacer dead space
          scrub: 1
        }
      })

      // ==========================================
      // PHASE 1: HERO EXIT (Timeline Time: 0 to 1.0)
      // ==========================================
      
      tl.addLabel('heroExit', 0)

      tl.fromTo(rule, {
        scaleX: 1,
        opacity: 1
      }, {
        scaleX: 0,
        opacity: 0,
        transformOrigin: 'right center',
        ease: 'power2.in',
        duration: 0.5,
        immediateRender: false
      }, 'heroExit')

      tl.fromTo(name, {
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        y: 0
      }, {
        scale: prefersReduced ? 1 : 0.85,
        opacity: 0,
        filter: prefersReduced ? 'blur(0px)' : 'blur(12px)',
        y: prefersReduced ? 0 : 30,
        ease: 'power1.in',
        duration: 0.8,
        immediateRender: false
      }, 'heroExit')

      const roleSpans = role.querySelectorAll('span')
      if (roleSpans.length > 0) {
        tl.fromTo(roleSpans, {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)'
        }, {
          y: prefersReduced ? 0 : 20,
          opacity: 0,
          filter: prefersReduced ? 'blur(0px)' : 'blur(8px)',
          ease: 'power1.in',
          stagger: 0.05,
          duration: 0.6,
          immediateRender: false
        }, 'heroExit')
      }

      tl.fromTo(scrollIndicator, {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)'
      }, {
        y: prefersReduced ? 0 : 20,
        opacity: 0,
        filter: prefersReduced ? 'blur(0px)' : 'blur(4px)',
        ease: 'power1.in',
        duration: 0.6,
        immediateRender: false
      }, 'heroExit')

      // ==========================================
      // PHASE 2: QUOTE BRIDGE (Timeline Time: 1.0 to 3.0)
      // ==========================================
      
      const bridgeWords = bridge.querySelectorAll('.quote-bridge__word')
      const bridgePeriod = bridge.querySelector('.quote-bridge__period')
      
      tl.addLabel('quoteStart', 1.0)

      // Make the wrapper visible so the children can be seen when they animate
      tl.set(bridge, { visibility: 'visible', opacity: 1 }, 'quoteStart')

      if (prefersReduced) {
        tl.fromTo(bridge, 
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power2.out' },
          'quoteStart'
        )
        tl.to(bridge, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut'
        }, 2.5)

      } else {
        if (bridgeWords.length > 0) {
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

        if (bridgePeriod) {
          const periodStartTime = 1.0 + (bridgeWords.length * 0.08) + 0.1
          tl.fromTo(bridgePeriod,
            { scale: 0.8, opacity: 0, filter: 'blur(8px)', z: -50 },
            { scale: 1, opacity: 1, filter: 'blur(0px)', z: 0, ease: 'power2.out', duration: 0.4 },
            periodStartTime
          )
        }
        
        tl.to(bridge, {
          opacity: 0,
          filter: 'blur(12px)',
          scale: 1.05,
          duration: 0.6,
          ease: 'power2.inOut'
        }, 2.6)
      }

      tl.to({}, { duration: 0.1 }, 2.7)

    }, hero)

    return () => ctx.revert()
  }, [heroRef, ruleRef, nameRef, roleRef, bridgeRef, scrollIndicatorRef])
}
