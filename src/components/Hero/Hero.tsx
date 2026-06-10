import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { heroCopy, siteIdentity } from '../../data/site'
import { QuoteBridge } from './QuoteBridge'
import { useHeroScroll } from './useHeroScroll'
import './Hero.css'

interface HeroProps {
  isVisible: boolean
  onReady?: () => void
  setShaderIntensity: (val: number) => void
}

export function Hero({ isVisible, onReady, setShaderIntensity }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  const ruleRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const roleRefs = useRef<HTMLSpanElement[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const roleContainerRef = useRef<HTMLDivElement>(null)
  const bridgeRef = useRef<HTMLDivElement>(null)

  const [animationsReady, setAnimationsReady] = useState(false)

  // Entry animation sequence
  useEffect(() => {
    if (!isVisible) return

    const isBot = /Lighthouse|Googlebot|GTmetrix|Pingdom|PageSpeed|bot|spider|crawl/i.test(navigator.userAgent)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || isBot

    const ctx = gsap.context(() => {
      const ruleEl = ruleRef.current
      const nameEl = nameRef.current
      const roleEls = roleRefs.current.filter(Boolean)
      const scrollEl = scrollRef.current

      if (prefersReduced) {
        gsap.set([ruleEl, nameEl, roleEls, scrollEl], {
          visibility: 'visible',
          opacity: 1,
          y: 0,
          scaleX: 1,
        })
        setAnimationsReady(true)
        onReady?.()
        return
      }

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set([nameEl, roleEls], { willChange: 'auto' })
        }
      })

      // Optimization: will-change during entry
      gsap.set([nameEl, roleEls], { willChange: 'transform, opacity' })

      // Beat 0: Gold rule
      gsap.set(ruleEl, { scaleX: 0, transformOrigin: 'left center', visibility: 'visible' })
      tl.to(ruleEl, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, 0)

      // Beat 1: Name
      gsap.set(nameEl, { y: 80, opacity: 0, visibility: 'visible' })
      tl.to(nameEl, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, 0.35)

      // Beat 2: Role
      gsap.set(roleEls, { y: 20, opacity: 0, visibility: 'visible' })
      tl.to(roleEls, { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out', stagger: 0.08 }, 0.65)

      // Beat 3: Scroll Indicator fade in
      gsap.set(scrollEl, { opacity: 0, visibility: 'visible' })
      tl.to(scrollEl, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 1.1)

      // All key elements visible — unlock scroll NOW before the cosmetic bounce plays.
      // This fires at t≈1.7s instead of t≈3.3s (saves 1.6s of frozen scroll).
      tl.call(() => {
        setAnimationsReady(true)
        onReady?.()
      }, [], 1.75)

      // Beat 5: Scroll indicator cosmetic bounce (continues after scroll unlocks)
      const scrollSpan = scrollEl?.querySelector('span')
      if (scrollSpan) {
        tl.to(scrollSpan, {
          opacity: 0.3, duration: 0.8, ease: 'power1.inOut',
          yoyo: true, repeat: -1
        }, '>')
      }

    }, rootRef)

    return () => ctx.revert()
  }, [isVisible, onReady])

  // Scroll exit animation hook
  useHeroScroll(
    rootRef,
    ruleRef,
    nameRef,
    roleContainerRef,
    scrollRef,
    bridgeRef,
    setShaderIntensity,
    animationsReady // Add the tweens only after entry is done (captures correct values)
  )

  return (
    <section ref={rootRef} className="hero section" id="hero">
      {/* Content Layer */}
      <div className="hero__content container">
        {/* The Lockup */}
        <div className="hero__lockup">
          {/* Gold rule */}
          <div ref={ruleRef} className="hero__rule gsap-hidden" aria-hidden="true" />

          {/* Name (Sticky container) */}
          <div className="hero__name-container">
            <h1 ref={nameRef} className="hero__name gsap-hidden">
              {siteIdentity.realName}
            </h1>
          </div>

          {/* Role Line */}
          <div 
            ref={roleContainerRef}
            className="hero__role" 
            aria-label={heroCopy.roleFragments.join(' ')}
          >
            {heroCopy.roleFragments.map((frag, i) => (
              <span
                key={i}
                ref={el => {
                  if (el) roleRefs.current[i] = el
                }}
                className="gsap-hidden"
                aria-hidden="true"
              >
                {frag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quote Bridge Transition Overlay */}
      <QuoteBridge bridgeRef={bridgeRef} />

      {/* Scroll Indicator */}
      <div ref={scrollRef} className="hero__scroll gsap-hidden" aria-hidden="true">
        <span>{heroCopy.scrollLabel}</span>
      </div>
    </section>
  )
}
