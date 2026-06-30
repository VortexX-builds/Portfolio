import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './CustomCursor.css'

export function CustomCursor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGSVGElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  const [isHovered, setIsHovered] = useState(false)
  const [hoverText, setHoverText] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current

    if (!container || !dot || !ring || !label) return

    // Quick setters/tos for high-performance lag-free updates
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' })
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' })

    const setRingX = gsap.quickTo(ring, 'x', { duration: 0.24, ease: 'power2.out' })
    const setRingY = gsap.quickTo(ring, 'y', { duration: 0.24, ease: 'power2.out' })

    const setLabelX = gsap.quickTo(label, 'x', { duration: 0.16, ease: 'power2.out' })
    const setLabelY = gsap.quickTo(label, 'y', { duration: 0.16, ease: 'power2.out' })

    // Position label offset (slightly to the bottom-right of the pointer)
    const labelOffsetX = 36
    const labelOffsetY = 24

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e

      // Show cursor on first mouse movement inside window
      if (!isVisible) {
        setIsVisible(true)
        gsap.to([dot, ring], { opacity: 1, duration: 0.2 })
      }

      setDotX(x)
      setDotY(y)

      setRingX(x)
      setRingY(y)

      setLabelX(x + labelOffsetX)
      setLabelY(y + labelOffsetY)
    }

    // Hide custom cursor when mouse leaves document window boundaries
    const handleMouseLeave = () => {
      setIsVisible(false)
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 })
    }

    // Show custom cursor when mouse re-enters window
    const handleMouseEnter = () => {
      setIsVisible(true)
      gsap.to([dot, ring], { opacity: 1, duration: 0.2 })
    }

    // Set up global event listeners for mouse position
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    // Initially hide cursor until mouse is detected inside window
    gsap.set([dot, ring, label], { xPercent: -50, yPercent: -50 })
    gsap.set([dot, ring], { opacity: 0 })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isVisible])

  // Setup Event Delegation for Hover States on Interactive Elements
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactiveEl = target.closest('a, button, [role="button"], .project-card, .navbar__link, .mobile-menu__btn')

      if (interactiveEl) {
        setIsHovered(true)

        // Show "VIEW" text on projects or links pointing to externals
        const isProject = interactiveEl.closest('#work') || 
                          interactiveEl.classList.contains('work-card') || 
                          interactiveEl.classList.contains('work__image-container')
        
        if (isProject) {
          setHoverText('VIEW')
        } else {
          setHoverText('')
        }
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactiveEl = target.closest('a, button, [role="button"], .project-card, .navbar__link, .mobile-menu__btn')

      if (interactiveEl) {
        setIsHovered(false)
        setHoverText('')
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  // Animate cursor states using GSAP
  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current

    if (!dot || !ring) return

    if (isHovered) {
      // Expand and rotate brackets, scale inner dot
      gsap.to(ring, {
        scale: 1.5,
        rotate: 45,
        duration: 0.35,
        ease: 'power2.out',
      })
      gsap.to(dot, {
        scale: 1.8,
        backgroundColor: '#FF6B6B', // Contrasting vibrant coral color
        duration: 0.25,
      })
    } else {
      // Revert back to original state
      gsap.to(ring, {
        scale: 1.0,
        rotate: 0,
        duration: 0.35,
        ease: 'power2.out',
      })
      gsap.to(dot, {
        scale: 1.0,
        backgroundColor: '#34D399', // Return to standard CSS accent color
        duration: 0.25,
      })
    }
  }, [isHovered])

  useEffect(() => {
    const label = labelRef.current
    if (!label) return

    if (hoverText) {
      gsap.to(label, {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      })
    } else {
      gsap.to(label, {
        opacity: 0,
        scale: 0.6,
        duration: 0.2,
        ease: 'power2.in',
      })
    }
  }, [hoverText])

  return (
    <div ref={containerRef} className="custom-cursor" aria-hidden="true">
      {/* Dynamic Outer Corner Brackets Frame */}
      <svg 
        ref={ringRef} 
        className="custom-cursor__ring" 
        viewBox="0 0 32 32"
      >
        {/* Top-Left Bracket */}
        <path className="custom-cursor__bracket" d="M 8 2 L 2 2 L 2 8" />
        {/* Top-Right Bracket */}
        <path className="custom-cursor__bracket" d="M 24 2 L 30 2 L 30 8" />
        {/* Bottom-Left Bracket */}
        <path className="custom-cursor__bracket" d="M 8 30 L 2 30 L 2 24" />
        {/* Bottom-Right Bracket */}
        <path className="custom-cursor__bracket" d="M 24 30 L 30 30 L 30 24" />
      </svg>

      {/* Inner Dot */}
      <div ref={dotRef} className="custom-cursor__dot" />

      {/* Tooltip Label */}
      <div ref={labelRef} className="custom-cursor__label">
        {hoverText}
      </div>
    </div>
  )
}
