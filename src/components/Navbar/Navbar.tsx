import { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { navLinks, siteIdentity } from '../../data/site'
import { zIndex, duration, ease } from '../../tokens'
import { NameFlip, type NameFlipHandle } from './NameFlip'
import { MobileMenu } from './MobileMenu'
import { scrollToSection } from '../../hooks/useLenis'
import './Navbar.css'

gsap.registerPlugin(ScrollTrigger)

interface NavbarProps {
  /**
   * Set to true by App.tsx once the preloader exit animation fires.
   * The navbar is in the DOM from the start (visibility: hidden) so
   * the entrance animation can reference its real dimensions immediately.
   */
  isVisible: boolean
}

/**
 * Navbar
 * Fixed, full-width navigation bar.
 *
 * States:
 *  - Transparent (idle, on hero)
 *  - Glass (scrolled past hero — backdrop-filter + subtle surface)
 *  - Hidden (scrolling down — translates off-screen)
 *  - Mobile overlay (< 1024px, MENU button open)
 *
 * Animations driven entirely by GSAP. CSS handles only visual states
 * (.navbar--glass class) so the transition is GPU-composited.
 */
export function Navbar({ isVisible }: NavbarProps) {
  const navRef       = useRef<HTMLElement>(null)
  const nameColRef   = useRef<HTMLDivElement>(null)
  const linksRef     = useRef<HTMLAnchorElement[]>([])
  const menuBtnRef   = useRef<HTMLButtonElement>(null)
  const nameFlipRef  = useRef<NameFlipHandle>(null)
  const hasEntered   = useRef(false)

  const [mobileOpen, setMobileOpen] = useState(false)

  // ── Entrance animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible || hasEntered.current) return
    hasEntered.current = true

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      gsap.set(navRef.current, { visibility: 'visible', opacity: 1 })
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // Reveal the element first (was visibility: hidden to prevent FOUC)
      tl.set(navRef.current, { visibility: 'visible' })

      // Navbar slides down from above with a fade
      tl.fromTo(navRef.current,
        { y: -12, opacity: 0 },
        { y: 0, opacity: 1, duration: duration.default, ease: ease.default },
        0
      )

      // Name column enters slightly after the bar itself
      tl.fromTo(nameColRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: duration.default, ease: ease.default },
        0.10
      )

      // Desktop links stagger in
      tl.fromTo(linksRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, stagger: 0.08, duration: duration.default, ease: ease.default },
        0.18
      )

      // Mobile MENU button (hidden on desktop via CSS, harmless to animate)
      if (menuBtnRef.current) {
        tl.fromTo(menuBtnRef.current,
          { opacity: 0, y: -6 },
          { opacity: 1, y: 0, duration: duration.default, ease: ease.default },
          0.18
        )
      }
    }, navRef)

    return () => ctx.revert()
  }, [isVisible])

  // ── Scroll behaviour: glass surface + hide on scroll-down ─────────────────
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    let lastY = 0
    let hidden = false

    // Glass surface trigger: activates when hero section leaves viewport.
    // Hero is expected to be full-viewport height, so start = "bottom top"
    // i.e., when the bottom of #hero crosses the top of the viewport.
    const glassTrigger = ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom top',
      onEnter: () => nav.classList.add('navbar--glass'),
      onLeaveBack: () => nav.classList.remove('navbar--glass'),
    })

    // Velocity-based hide / show on scroll direction
    const velocityTrigger = ScrollTrigger.create({
      start: 'top top',
      end: '99999px top',
      onUpdate: (self) => {
        const currentY = self.scroll()
        const scrolledDown = currentY > lastY

        // Only react after 80px — ignore tiny hero-top jitter
        if (currentY < 80) {
          if (hidden) {
            gsap.to(nav, { y: 0, duration: duration.fast + 0.15, ease: ease.default })
            hidden = false
          }
          lastY = currentY
          return
        }

        if (scrolledDown && !hidden) {
          gsap.to(nav, { y: -80, duration: 0.40, ease: ease.inOut })
          hidden = true
        } else if (!scrolledDown && hidden) {
          gsap.to(nav, { y: 0, duration: 0.50, ease: ease.default })
          hidden = false
        }

        lastY = currentY
      },
    })

    return () => {
      glassTrigger.kill()
      velocityTrigger.kill()
    }
  }, [])

  // ── Keyboard: Escape closes mobile menu ────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const handleMenuClose = useCallback(() => setMobileOpen(false), [])

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    scrollToSection(href)
  }, [])

  return (
    <>
      <header
        ref={navRef}
        className="navbar gsap-hidden"
        style={{ zIndex: zIndex.navbar }}
        role="banner"
        onMouseEnter={() => nameFlipRef.current?.enter()}
        onMouseLeave={() => nameFlipRef.current?.leave()}
      >
        <div className="navbar__inner">

          {/* ── Left: name ────────────────────────────────────────────────── */}
          <div ref={nameColRef} className="navbar__name-col">
            {/* Desktop: full name with 3D flip interaction */}
            <div className="navbar__name-desktop">
              <NameFlip ref={nameFlipRef} />
            </div>

            {/* Mobile: initials only */}
            <a href="#" className="navbar__initials" aria-label={siteIdentity.realName}>
              {siteIdentity.initials}
            </a>
          </div>

          {/* ── Right: desktop links + mobile trigger ─────────────────────── */}
          <div className="navbar__right">
            <nav className="navbar__links" aria-label="Primary navigation">
              {navLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  ref={el => { if (el) linksRef.current[i] = el }}
                  className="navbar__link"
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <button
              ref={menuBtnRef}
              className="navbar__menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay — always in DOM, clip-path controls visibility */}
      <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation">
        <MobileMenu isOpen={mobileOpen} onClose={handleMenuClose} />
      </div>
    </>
  )
}
