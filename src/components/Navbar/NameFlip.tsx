import { useRef, forwardRef, useImperativeHandle } from 'react'
import { gsap } from 'gsap'
import { siteIdentity } from '../../data/site'
import { duration, ease } from '../../tokens'

/**
 * NameFlipHandle — exposed to parent via useImperativeHandle.
 * The flip is triggered by the parent (Navbar) so the interaction zone
 * can be the entire navbar bar, not just the name text itself.
 */
export interface NameFlipHandle {
  enter: () => void
  leave: () => void
}

/**
 * NameFlip
 * Renders "Sloak Gohil" (front) and "VortexX" (back) as two absolutely-stacked
 * spans inside a perspective container.
 *
 * Font decision: Cinzel (serif) for "Sloak Gohil", Syne (geometric sans) for
 * "VortexX". The serif-to-sans contrast IS the storytelling — it makes the flip
 * feel like an identity transformation, not just a text change.
 *
 * Animation is controlled entirely by the parent via the ref handle.
 * No hover listeners here.
 */
export const NameFlip = forwardRef<NameFlipHandle>(function NameFlip(_, ref) {
  const frontRef = useRef<HTMLSpanElement>(null)
  const backRef  = useRef<HTMLSpanElement>(null)
  const tlRef    = useRef<gsap.core.Timeline | null>(null)

  useImperativeHandle(ref, () => ({
    enter() {
      // Kill any in-progress tween to prevent jitter on fast mouse moves
      tlRef.current?.kill()
      tlRef.current = gsap.timeline()
      tlRef.current
        .to(frontRef.current, {
          rotateY: -90,
          duration: duration.default * 0.62, // 0.4s
          ease: ease.inOut,
        }, 0)
        .to(backRef.current, {
          rotateY: 0,
          duration: duration.default * 0.62,
          ease: ease.inOut,
        }, 0.05) // Enters right behind the exiting front
    },

    leave() {
      tlRef.current?.kill()
      tlRef.current = gsap.timeline()
      tlRef.current
        .to(backRef.current, {
          rotateY: 90,
          duration: duration.default * 0.62,
          ease: ease.inOut,
        }, 0)
        .to(frontRef.current, {
          rotateY: 0,
          duration: duration.default * 0.62,
          ease: ease.inOut,
        }, 0.05)
    },
  }))

  return (
    <a
      href="#"
      className="navbar__name"
      aria-label={`${siteIdentity.realName} — also known as ${siteIdentity.craftName}`}
    >
      <span
        ref={frontRef}
        className="navbar__name-front"
        aria-hidden="true"
      >
        {siteIdentity.realName}
      </span>
      <span
        ref={backRef}
        className="navbar__name-back"
        aria-hidden="true"
      >
        {siteIdentity.craftName}
      </span>
    </a>
  )
})
