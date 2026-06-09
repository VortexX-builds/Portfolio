# Performance — Component Checklist

> Every component must pass this checklist before it ships.

---

## Lighthouse Targets

| Metric | Desktop | Mobile |
|---|---|---|
| Performance | 90+ | 80+ |
| Accessibility | 95+ | 95+ |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| CLS | < 0.05 | < 0.05 |

---

## Images

- [ ] Format: **WebP only**. No JPEG or PNG in production.
- [ ] `loading="lazy"` on all images below the fold
- [ ] `fetchpriority="high"` on hero/LCP images
- [ ] Explicit `width` and `height` attributes on every `<img>` (prevents CLS)
- [ ] `srcset` for responsive image sizing where applicable
- [ ] No unoptimized images over 200KB in production

---

## Animations

- [ ] Only animating `transform` and `opacity`
- [ ] `will-change` applied only to actively animating elements (remove after animation ends)
- [ ] All GSAP contexts killed on component unmount via `ctx.revert()`
- [ ] ScrollTrigger instances killed on unmount
- [ ] `prefers-reduced-motion` handled — animations disabled or instant-set
- [ ] No JavaScript animation on elements not in the viewport

---

## Three.js (if used)

- [ ] One scene maximum across the entire site
- [ ] Renderer disposed on unmount: `renderer.dispose()`
- [ ] Geometry disposed: `geometry.dispose()`
- [ ] Materials disposed: `material.dispose()`
- [ ] Textures disposed: `texture.dispose()`
- [ ] Animation frame cancelled: `cancelAnimationFrame(frameId)`
- [ ] Pixel ratio capped: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- [ ] Polygon count tested — nothing over 50k polys for background scenes
- [ ] Frame rate tested on mid-tier GPU — if it drops below 55fps, the scene is cut

---

## Lenis

- [ ] Initialized once in `App.tsx` via `useLenis()` hook
- [ ] Destroyed in hook cleanup: `lenis.destroy()`
- [ ] Not re-initialized in child components
- [ ] GSAP ticker uses `gsap.ticker.lagSmoothing(0)` (already set in hook)

---

## Fonts

- [ ] Self-hosted or loaded via `<link rel="preload">` in `index.html` if performance-critical
- [ ] `font-display: swap` set
- [ ] Only Inter weights 400, 500, 700, 900 loaded — no others

---

## Bundle

- [ ] React, GSAP, and Three.js in separate manual chunks (configured in `vite.config.ts`)
- [ ] No barrel imports that pull in entire libraries for a single utility
- [ ] Route-based code splitting if the site grows beyond single-page

---

## Core Web Vitals

| Signal | What causes it | Prevention |
|---|---|---|
| CLS | Images without dimensions, late-loaded fonts | Explicit width/height, font preload |
| LCP | Unoptimized hero image, render-blocking resources | WebP + preload, hero above fold |
| FID/INP | Heavy JS on main thread, animation jank | Offload to compositor via transform/opacity |
| TTFB | Server response time | Vercel edge — handled |

---

## Mobile

- [ ] All touch interactions work correctly
- [ ] No horizontal overflow on any screen width
- [ ] Tap targets minimum 44x44px
- [ ] No hover-only interactions (always have a touch equivalent)
- [ ] Tested at 375px, 768px, 1024px, 1280px, 1440px viewports
