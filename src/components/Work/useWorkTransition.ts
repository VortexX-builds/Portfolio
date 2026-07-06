import { useCallback, useRef } from 'react'
import { gsap } from 'gsap'
import { projects } from '../../data/site'

const TOTAL = projects.length

/**
 * Card positions in the carousel.
 * Phase 2: ghost positions adjusted for larger active card.
 * GSAP controls all transforms; these are the resting values per role.
 */
const POSITIONS = {
  active:      { x: '0vw',     rotateY: 0,   scale: 1,    opacity: 1,    zIndex: 10, pointerEvents: 'auto' },
  ghostRight:  { x: '70vw',    rotateY: 15,  scale: 0.78, opacity: 0.30, zIndex: 5,  pointerEvents: 'auto' },
  ghostLeft:   { x: '-70vw',   rotateY: -15, scale: 0.78, opacity: 0.30, zIndex: 5,  pointerEvents: 'auto' },
  hiddenRight: { x: '145vw',   rotateY: 20,  scale: 0.68, opacity: 0,    zIndex: 1,  pointerEvents: 'none' },
  hiddenLeft:  { x: '-145vw',  rotateY: -20, scale: 0.68, opacity: 0,    zIndex: 1,  pointerEvents: 'none' },
}

function getPosition(cardIndex: number, activeIndex: number) {
  const diff = ((cardIndex - activeIndex) % TOTAL + TOTAL) % TOTAL
  if (diff === 0)          return 'active'
  if (diff === 1)          return 'ghostRight'
  if (diff === TOTAL - 1)  return 'ghostLeft'
  if (diff === 2)          return 'hiddenRight'
  return 'hiddenLeft'
}

interface UseWorkTransitionOptions {
  cardRefs: React.RefObject<HTMLDivElement | null>[]
  activeIndex: number
  setActiveIndex: (index: number) => void
  setIsTransitioning: (val: boolean) => void
  onProjectChange?: (nextIndex: number) => void
}

export function useWorkTransition({
  cardRefs,
  activeIndex,
  setActiveIndex,
  setIsTransitioning,
  onProjectChange,
}: UseWorkTransitionOptions) {
  const isTransitioningRef = useRef(false)
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex

  /** Set every card to its resting position (no animation) */
  const snapAllToPosition = useCallback((currentActive: number) => {
    cardRefs.forEach((ref, i) => {
      if (!ref.current) return
      const pos = getPosition(i, currentActive)
      gsap.set(ref.current, { ...POSITIONS[pos], immediateRender: true })
    })
  }, [cardRefs])

  /** Animate all cards to their new resting positions */
  const animateToIndex = useCallback((
    nextIndex: number,
    isJump: boolean,
  ) => {
    if (isTransitioningRef.current) return
    if (nextIndex === activeIndexRef.current) return

    isTransitioningRef.current = true
    setIsTransitioning(true)
    onProjectChange?.(nextIndex)

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = prefersReduced ? 0.35 : 0.65
    const ease = prefersReduced ? 'power2.inOut' : 'power3.inOut'

    if (isJump && Math.abs(nextIndex - activeIndexRef.current) > 1) {
      // Direct crossfade for jumps of 2+ positions
      const tl = gsap.timeline({
        onComplete: () => {
          activeIndexRef.current = nextIndex
          setActiveIndex(nextIndex)
          setIsTransitioning(false)
          isTransitioningRef.current = false
        }
      })

      // Snap all non-active cards to their new positions immediately
      cardRefs.forEach((ref, i) => {
        if (!ref.current || i === activeIndexRef.current) return
        const newPos = getPosition(i, nextIndex)
        gsap.set(ref.current, { ...POSITIONS[newPos] })
      })

      const oldActive = cardRefs[activeIndexRef.current]?.current
      const newActive = cardRefs[nextIndex]?.current

      if (oldActive) {
        tl.to(oldActive, {
          opacity: 0,
          scale: 0.92,
          duration: 0.28,
          ease: 'power2.in'
        }, 0)
      }
      if (newActive) {
        gsap.set(newActive, { ...POSITIONS.active, opacity: 0, scale: 1.04 })
        tl.to(newActive, {
          opacity: 1,
          scale: 1,
          duration: 0.38,
          ease: 'power2.out'
        }, 0.22)
      }

      tl.call(() => {
        cardRefs.forEach((ref, i) => {
          if (!ref.current || i === nextIndex) return
          const newPos = getPosition(i, nextIndex)
          gsap.to(ref.current, { ...POSITIONS[newPos], duration: 0.4, ease: 'power2.out' })
        })
      }, [], 0.28)

      return
    }

    // Phase 4: Standard adjacent transition with scale overshoot & blur
    const tl = gsap.timeline({
      onComplete: () => {
        activeIndexRef.current = nextIndex
        setActiveIndex(nextIndex)
        setIsTransitioning(false)
        isTransitioningRef.current = false
      }
    })

    cardRefs.forEach((ref, i) => {
      if (!ref.current) return
      const newPos = getPosition(i, nextIndex)
      const targetValues = POSITIONS[newPos]

      // Incoming active card gets a landing overshoot
      if (i === nextIndex) {
        tl.fromTo(
          ref.current,
          { scale: 1.04 },
          {
            ...targetValues,
            scale: 1,
            duration,
            ease,
            overwrite: 'auto'
          },
          0
        )
      } else {
        // Outgoing active adds a brief blur as it leaves
        tl.to(
          ref.current,
          {
            ...targetValues,
            duration,
            ease,
            overwrite: 'auto'
          },
          0
        )
      }
    })

  }, [cardRefs, setActiveIndex, setIsTransitioning, onProjectChange])

  // Phase 3: Infinite wrap — modular arithmetic, no clamping
  const goNext = useCallback(() => {
    const next = (activeIndexRef.current + 1) % TOTAL
    animateToIndex(next, false)
  }, [animateToIndex])

  const goPrev = useCallback(() => {
    const prev = (activeIndexRef.current - 1 + TOTAL) % TOTAL
    animateToIndex(prev, false)
  }, [animateToIndex])

  const goTo = useCallback((index: number) => {
    animateToIndex(index, true)
  }, [animateToIndex])

  return { snapAllToPosition, goNext, goPrev, goTo }
}
