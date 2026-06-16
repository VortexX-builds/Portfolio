import { useEffect, useRef, useState, useCallback, createRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../../data/site'
import { WorkCard } from './WorkCard'
import { WorkPagination } from './WorkPagination'
import { useWorkTransition } from './useWorkTransition'
import './Work.css'

const TOTAL = projects.length

// SVG chevron arrows
function ChevronLeft() {
  return (
    <svg viewBox="0 0 28 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polyline points="20,6 6,28 20,50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg viewBox="0 0 28 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polyline points="8,6 22,28 8,50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Work() {
  const sectionRef = useRef<HTMLElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const prevArrowRef = useRef<HTMLButtonElement>(null)
  const nextArrowRef = useRef<HTMLButtonElement>(null)
  const bgTextRef = useRef<HTMLDivElement>(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  // Use a ref — NOT state — so the guard flip never triggers a re-render
  // that would cause ctx.revert() to kill the in-progress entry timeline.
  const hasEnteredRef = useRef(false)

  // One stable ref per project card — never recreated
  const cardRefs = useRef(
    Array.from({ length: TOTAL }, () => createRef<HTMLDivElement>())
  )

  // Track project change for info cascade
  const infoAnimPending = useRef(false)

  const handleProjectChange = useCallback((_nextIndex: number) => {
    infoAnimPending.current = true
  }, [])

  const { snapAllToPosition, goNext, goPrev, goTo } = useWorkTransition({
    cardRefs: cardRefs.current,
    activeIndex,
    setActiveIndex,
    setIsTransitioning,
    onProjectChange: handleProjectChange,
  })

  // Set cards to their PRE-entry-animation state on mount.
  // Cards start hidden/off-position so the ScrollTrigger animation is
  // the sole authority on when they appear — no double-pop flash.
  useEffect(() => {
    const activeCard  = cardRefs.current[0]?.current
    const rightCard   = cardRefs.current[1]?.current
    const leftCard    = cardRefs.current[TOTAL - 1]?.current

    // Snap all cards to their resting transforms first (positions, rotations)
    snapAllToPosition(0)

    // Now override to the START state the entry animation expects:
    // active card: visible, but slightly enlarged and blurred (camera focus effect)
    if (activeCard) gsap.set(activeCard, { opacity: 0, y: 0, scale: 1.06 })
    // ghost cards: invisible, at their resting positions
    if (leftCard)   gsap.set(leftCard,   { opacity: 0, x: '-70vw' })
    if (rightCard)  gsap.set(rightCard,  { opacity: 0, x: '70vw'  })
    // hidden cards are already opacity:0 from snapAllToPosition
  }, [snapAllToPosition])

  // ─── Background title cross-fade on project change ────────────────────────
  const isMounted = useRef(false)
  useEffect(() => {
    // Skip the very first render — no fade needed on mount
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    const el = bgTextRef.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    gsap.timeline()
      .to(el, { opacity: 0, duration: 0.15, ease: 'power2.in' })
      .to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' })
  }, [activeIndex])

  // ─── Phase 1: Cinematic scroll-entry animation ────────────────────────────
  // Empty deps: this effect runs ONCE. The hasEnteredRef guard prevents double-fire
  // without causing a re-render that would ctx.revert() and kill the timeline.
  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 95%',
        once: true,
        onEnter: () => {
          if (hasEnteredRef.current) return
          hasEnteredRef.current = true

          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          const tl = gsap.timeline()

          if (!prefersReduced) {
            // Beat 1: Header fades in from top
            tl.fromTo('.work__header',
              { opacity: 0, y: -20 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
              0.15
            )

            // Beat 2: Active card sharpens into focus
            const activeCard = cardRefs.current[0]?.current
            if (activeCard) {
              tl.to(activeCard, {
                opacity: 1,
                scale: 1,
                duration: 0.85,
                ease: 'power2.out',
              }, 0)
            }

            // Beat 3: Ghost cards fade in at their positions
            const leftCard = cardRefs.current[TOTAL - 1]?.current
            const rightCard = cardRefs.current[1]?.current
            if (leftCard) {
              tl.to(leftCard, { opacity: 0.30, duration: 0.55, ease: 'power2.out' }, 0.15)
            }
            if (rightCard) {
              tl.to(rightCard, { opacity: 0.30, duration: 0.55, ease: 'power2.out' }, 0.20)
            }

            // Beat 4: Card info cascade (within the overlay) - staggered per element
            tl.fromTo('.work__card-index',
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
              0.9
            )
            tl.fromTo('.work__card-title',
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
              0.96
            )
            tl.fromTo('.work__card-type',
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
              1.02
            )
            tl.fromTo('.work__card-footer',
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
              1.08
            )

            // Beat 5: Pagination dots & arrows fade in
            tl.fromTo('.work__pagination',
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
              1.0
            )
            tl.fromTo([prevArrowRef.current, nextArrowRef.current],
              { opacity: 0, x: (i: number) => i === 0 ? -20 : 20 },
              { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 },
              0.85
            )

            // Beat 6: Ambient orbs fade in last
            tl.fromTo('.work__ambient-orb',
              { opacity: 0 },
              { opacity: 1, duration: 1.2, ease: 'power2.out', stagger: 0.2 },
              0.7
            )

          } else {
            // Reduced motion: simple fade for everything
            const activeCard = cardRefs.current[0]?.current
            const leftCard = cardRefs.current[TOTAL - 1]?.current
            const rightCard = cardRefs.current[1]?.current
            if (activeCard) tl.to(activeCard, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
            if (leftCard) tl.to(leftCard, { opacity: 0.30, duration: 0.5, ease: 'power2.out' }, 0.1)
            if (rightCard) tl.to(rightCard, { opacity: 0.30, duration: 0.5, ease: 'power2.out' }, 0.1)
            tl.to('.work__header', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
            tl.to('.work__pagination', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1)
            tl.to([prevArrowRef.current, nextArrowRef.current], { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1)
          }
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Phase 4: Active card mouse-tracking tilt ─────────────────────────────
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const handleMouseMove = (e: MouseEvent) => {
      const activeCard = cardRefs.current[activeIndex]?.current
      if (!activeCard || isTransitioning) return

      const rect = activeCard.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)

      // Max ±4° tilt
      const rotateY = dx * 4
      const rotateX = -dy * 3

      gsap.to(activeCard, {
        rotateX,
        rotateY,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    const handleMouseLeave = () => {
      const activeCard = cardRefs.current[activeIndex]?.current
      if (!activeCard) return
      gsap.to(activeCard, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduced) {
      carousel.addEventListener('mousemove', handleMouseMove)
      carousel.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      carousel.removeEventListener('mousemove', handleMouseMove)
      carousel.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [activeIndex, isTransitioning])

  // ─── Phase 4: Magnetic arrow effect ──────────────────────────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const arrows = [prevArrowRef.current, nextArrowRef.current]

    const makeHandler = (arrow: HTMLButtonElement, isLeft: boolean) => {
      return (e: MouseEvent) => {
        const rect = arrow.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = (e.clientX - cx) / 60
        const dy = (e.clientY - cy) / 60
        const maxDrift = 10
        gsap.to(arrow.querySelector('svg'), {
          x: Math.max(-maxDrift, Math.min(maxDrift, dx * maxDrift)) * (isLeft ? -1 : 1),
          y: Math.max(-maxDrift, Math.min(maxDrift, dy * maxDrift)),
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }
    }
    const makeEnter = () => {
      return () => {
        // Opacity is 1 by default now, so no need to transition opacity on hover.
      }
    }
    const makeLeave = (arrow: HTMLButtonElement) => {
      return () => {
        gsap.to(arrow.querySelector('svg'), {
          x: 0, y: 0,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
    }
    const makeClick = (arrow: HTMLButtonElement) => {
      return () => {
        gsap.timeline()
          .to(arrow, { scale: 0.88, duration: 0.1, ease: 'power2.in' })
          .to(arrow, { scale: 1, duration: 0.25, ease: 'power3.out' })
      }
    }

    const cleanups: (() => void)[] = []
    arrows.forEach((arrow, i) => {
      if (!arrow) return
      const isLeft = i === 0
      const move = makeHandler(arrow, isLeft)
      const enter = makeEnter()
      const leave = makeLeave(arrow)
      const click = makeClick(arrow)
      arrow.addEventListener('mouseenter', enter)
      arrow.addEventListener('mousemove', move)
      arrow.addEventListener('mouseleave', leave)
      arrow.addEventListener('click', click)
      cleanups.push(() => {
        arrow.removeEventListener('mouseenter', enter)
        arrow.removeEventListener('mousemove', move)
        arrow.removeEventListener('mouseleave', leave)
        arrow.removeEventListener('click', click)
      })
    })

    return () => cleanups.forEach(fn => fn())
  }, [])

  // ─── Phase 6: Touch swipe support ────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX
      const dy = e.changedTouches[0].clientY - touchStartY
      // Only trigger if horizontal swipe dominates
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) goNext()
        else goPrev()
      }
    }

    section.addEventListener('touchstart', handleTouchStart, { passive: true })
    section.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      section.removeEventListener('touchstart', handleTouchStart)
      section.removeEventListener('touchend', handleTouchEnd)
    }
  }, [goNext, goPrev])

  // ─── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3
      if (!inView) return

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goPrev()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  // Ghost card click handler
  const handleGhostClick = useCallback((index: number) => {
    if (!isTransitioning) goTo(index)
  }, [isTransitioning, goTo])

  return (
    <section ref={sectionRef} className="work" id="work" aria-label="Selected Work">

      {/* Phase 5: Ambient orbs — CSS animated, nearly invisible depth */}
      <div className="work__ambient-orb work__ambient-orb--1" aria-hidden="true" />
      <div className="work__ambient-orb work__ambient-orb--2" aria-hidden="true" />
      <div className="work__ambient-orb work__ambient-orb--3" aria-hidden="true" />

      {/* Section header */}
      <header className="work__header" aria-hidden="true">
        <span className="work__label">Work</span>
        <span className="work__counter" aria-live="polite" aria-atomic="true">
          <span className="work__counter-current">
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          {' / '}
          {String(TOTAL).padStart(2, '0')}
        </span>
      </header>

      {/* Massive Background Typography */}
      <div ref={bgTextRef} className="work__bg-text" aria-hidden="true">
        {projects[activeIndex].title}
      </div>

      {/* Carousel wrapper — arrows sit inside this for vertical centering */}
      <div className="work__carousel-wrapper">

        {/* Phase 3: Left arrow — infinite prev */}
        <button
          ref={prevArrowRef}
          className="work__arrow work__arrow--prev"
          onClick={goPrev}
          disabled={isTransitioning}
          aria-label="Previous project"
        >
          <ChevronLeft />
        </button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="work__carousel"
          role="region"
          aria-label="Project carousel"
          aria-roledescription="carousel"
        >
          {projects.map((project, i) => {
            const diff = ((i - activeIndex) % TOTAL + TOTAL) % TOTAL
            const isActive = diff === 0
            const isGhost = diff === 1 || diff === TOTAL - 1
            const role = isActive ? 'active' : 'ghost'

            return (
              <WorkCard
                key={project.id}
                project={project}
                role={role}
                cardRef={cardRefs.current[i]}
                isActive={isActive}
                onClick={isGhost ? () => handleGhostClick(i) : undefined}
              />
            )
          })}
        </div>

        {/* Phase 3: Right arrow — infinite next */}
        <button
          ref={nextArrowRef}
          className="work__arrow work__arrow--next"
          onClick={goNext}
          disabled={isTransitioning}
          aria-label="Next project"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Pagination dots only — arrows moved to carousel sides */}
      <WorkPagination
        total={TOTAL}
        activeIndex={activeIndex}
        isTransitioning={isTransitioning}
        onJump={goTo}
      />
    </section>
  )
}
