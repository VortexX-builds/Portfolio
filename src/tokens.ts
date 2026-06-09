/**
 * Design Tokens — Single source of truth for the entire site.
 * Every color, easing, duration, and scale lives here.
 * No magic numbers in components. Import from here.
 */

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
  bg: '#010606',
  textPrimary: '#DAF1DE',
  textMuted: '#8AAFA7',
  accent: '#34D399',

  // Derived / utility — not standalone palette entries
  surface: '#0D2B2C',      // slightly lifted surface for panels
  border: '#163830',       // subtle borders
  overlayDark: 'rgba(5, 31, 32, 0.88)',
} as const

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontFamily = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  clash: "'Clash Display', system-ui, sans-serif",
} as const

/**
 * Type scale — uses clamp() for fluid sizing.
 * Never use fixed px for display text.
 */
export const fontSize = {
  hero:    'clamp(3.5rem, 9vw, 9rem)',   // Giant identity statement
  display: 'clamp(2.5rem, 6vw, 6rem)',   // Section headings
  heading: 'clamp(1.75rem, 3vw, 3rem)',  // Sub-headings
  title:   'clamp(1.25rem, 2vw, 1.75rem)',
  body:    '1rem',
  small:   '0.875rem',
  label:   '0.75rem',
} as const

export const fontWeight = {
  regular: '400',
  medium:  '500',
  semibold: '600',
  bold:    '700',
  black:   '900',
} as const

export const letterSpacing = {
  tight:   '-0.03em',
  normal:  '0em',
  wide:    '0.05em',
  widest:  '0.15em',
} as const

export const lineHeight = {
  tight:   '1.1',   // For display/hero text
  snug:    '1.3',
  normal:  '1.6',   // Body text
  loose:   '1.8',
} as const

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  xs:   '0.5rem',    //  8px
  sm:   '1rem',      // 16px
  md:   '1.5rem',    // 24px
  lg:   '2.5rem',    // 40px
  xl:   '4rem',      // 64px
  '2xl':'6rem',      // 96px
  '3xl':'10rem',     // 160px
  section: 'clamp(5rem, 12vh, 10rem)',
} as const

// ─── Animation ────────────────────────────────────────────────────────────────

/**
 * GSAP easing standards.
 * "power2.out" for entrances (fast in, decelerate).
 * "power3.inOut" for reveals — heavier feel.
 * "expo.out" reserved for dramatic single-shot moments (preloader cut).
 * Never use "elastic" or "bounce" — they break the tone.
 */
export const ease = {
  default:   'power2.out',
  in:        'power2.in',
  inOut:     'power3.inOut',
  smooth:    'power1.inOut',
  dramatic:  'expo.out',
  enter:     'power3.out',  // Standard ScrollTrigger entrance
} as const

/**
 * Duration standards in seconds.
 * "fast" for UI state (hover, toggle).
 * "default" for most ScrollTrigger animations.
 * "slow" for cinematic reveals.
 * "preloader" for the opening sequence.
 */
export const duration = {
  fast:      0.25,
  default:   0.65,
  medium:    0.9,
  slow:      1.4,
  preloader: 1.8,
} as const

/**
 * Standard ScrollTrigger scrub value.
 * 1 = direct 1:1 scroll mapping.
 * 1.5 = slight lag for weighted feel.
 */
export const scrub = {
  direct:    1,
  weighted:  1.5,
} as const

// ─── Z-index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base:      0,
  content:   10,
  overlay:   20,
  navbar:    100,
  preloader: 200,
} as const

// ─── Breakpoints (match Tailwind v4 defaults) ─────────────────────────────────

export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
} as const
