import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { navLinks, siteIdentity } from '../../data/site'
import { duration, ease } from '../../tokens'
import { scrollToSection } from '../../hooks/useLenis'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * MobileMenu
 * Full-screen overlay menu for mobile viewports (< 1024px).
 * Reveals via a radial clip-path expand from the top-right corner.
 * Links use Syne (--font-display) at cinematic scale.
 * Accent color (#C9A84C) applied on link hover.
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const linksRef    = useRef<HTMLAnchorElement[]>([])
  const footerRef   = useRef<HTMLParagraphElement>(null)
  const tlRef       = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isOpen) {
      // Lock body scroll while overlay is open
      document.body.style.overflow = 'hidden'

      if (prefersReduced) {
        gsap.set(overlayRef.current, { clipPath: 'circle(150% at 95% 5%)' })
        gsap.set([...linksRef.current, footerRef.current], { opacity: 1, y: 0 })
        return
      }

      tlRef.current?.kill()
      tlRef.current = gsap.timeline()

      // Reset initial states before animating in
      gsap.set(overlayRef.current, { clipPath: 'circle(0% at 95% 5%)' })
      gsap.set(linksRef.current, { opacity: 0, y: 40 })
      gsap.set(footerRef.current, { opacity: 0 })

      tlRef.current
        // Radial expand from top-right corner
        .to(overlayRef.current, {
          clipPath: 'circle(150% at 95% 5%)',
          duration: duration.default + 0.05, // 0.7s
          ease: ease.enter,
        }, 0)
        // Stagger links in
        .to(linksRef.current, {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: duration.default,
          ease: ease.enter,
        }, 0.15)
        // Fade in footer role line
        .to(footerRef.current, {
          opacity: 1,
          duration: duration.default,
          ease: ease.smooth,
        }, 0.40)

    } else {
      // Unlock body scroll
      document.body.style.overflow = ''

      if (prefersReduced) {
        gsap.set(overlayRef.current, { clipPath: 'circle(0% at 95% 5%)' })
        return
      }

      tlRef.current?.kill()
      tlRef.current = gsap.timeline()

      tlRef.current
        // Links and footer exit first
        .to([...linksRef.current, footerRef.current], {
          opacity: 0,
          y: -20,
          stagger: 0.04,
          duration: 0.3,
          ease: ease.in,
        }, 0)
        // Radial collapse back to origin
        .to(overlayRef.current, {
          clipPath: 'circle(0% at 95% 5%)',
          duration: duration.fast + 0.25, // 0.5s
          ease: ease.enter,
        }, 0.15)
    }

    return () => {
      // Safety: unlock scroll if component unmounts while open
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function handleLinkClick(href: string) {
    onClose()
    // Delay scroll slightly so the close animation doesn't fight the scroll
    setTimeout(() => scrollToSection(href), 350)
  }

  return (
    <div
      ref={overlayRef}
      className="mobile-menu"
      aria-hidden={!isOpen}
      style={{ clipPath: 'circle(0% at 95% 5%)' }}
    >
      {/* Close button — top right */}
      <button
        className="mobile-menu__close"
        onClick={onClose}
        aria-label="Close navigation menu"
        tabIndex={isOpen ? 0 : -1}
      >
        Close
      </button>

      {/* Nav links — large, Syne, centered */}
      <nav className="mobile-menu__links" aria-label="Mobile navigation">
        {navLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            ref={el => { if (el) linksRef.current[i] = el }}
            className="mobile-menu__link"
            onClick={(e) => { e.preventDefault(); handleLinkClick(link.href) }}
            tabIndex={isOpen ? 0 : -1}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Footer: identity line */}
      <p ref={footerRef} className="mobile-menu__footer">
        {siteIdentity.realName} | {siteIdentity.role}
      </p>
    </div>
  )
}
