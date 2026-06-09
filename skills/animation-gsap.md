# GSAP Animation — Rules and Standards

> Read this before writing a single `gsap.to()`.

---

## Plugin Registration

ScrollTrigger is registered **once** in `src/hooks/useLenis.ts` at app root.
Do NOT re-register it in components. Import only:

```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
```

---

## Easing Standards

| Constant | GSAP value | Use case |
|---|---|---|
| `ease.default` | `power2.out` | Standard entrance, most animations |
| `ease.enter` | `power3.out` | ScrollTrigger entrances |
| `ease.inOut` | `power3.inOut` | Transitions that need both in and out weight |
| `ease.smooth` | `power1.inOut` | Subtle continuous motion |
| `ease.dramatic` | `expo.out` | Single dramatic cut (preloader only) |

**Never use:** `elastic`, `bounce`, `back` — they break the tone.

---

## Duration Standards (seconds)

| Constant | Value | Use case |
|---|---|---|
| `duration.fast` | 0.25s | Hover states, UI toggles |
| `duration.default` | 0.65s | Most ScrollTrigger animations |
| `duration.medium` | 0.9s | Heavier reveals, image entries |
| `duration.slow` | 1.4s | Cinematic text reveals |
| `duration.preloader` | 1.8s | Preloader sequence |

---

## The "Mass" Principle

Every animation should feel like the element has **weight**.

- Elements don't snap — they decelerate.
- Fast in, slow out (power eases out).
- Images feel heavier than text (use longer durations for images).
- Stagger should be subtle: `0.08s` to `0.15s` — never more.

---

## ScrollTrigger Patterns

### Standard entrance (use this by default)
```ts
gsap.fromTo(el, 
  { y: 40, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 0.65,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
    }
  }
)
```

### Scrub reveal (for parallax / cinematic sections)
```ts
gsap.fromTo(el,
  { y: 80 },
  {
    y: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    }
  }
)
```

### Text character split (for hero)
- Use GSAP's own SplitText utility if available, or manual span wrapping
- Stagger: `0.04s` per character, `0.12s` per word
- Duration per element: `0.8s` with `power3.out`

---

## Cleanup — Non-Negotiable

Every `useEffect` that creates GSAP animations **must** return a cleanup function:

```ts
useEffect(() => {
  const ctx = gsap.context(() => {
    // animations here
  }, containerRef)
  
  return () => ctx.revert()
}, [])
```

Use `gsap.context()` for all component-scoped animations. It handles cleanup automatically.

---

## Performance Checklist

Before shipping any animation:

- [ ] Only animating `transform` and `opacity` (never `width`, `height`, `top`, `left`)
- [ ] `will-change: transform` only on elements that need GPU compositing
- [ ] No animation loop without a `kill()` path on unmount
- [ ] Scroll-driven animations use `scrub` — not `requestAnimationFrame` loops
- [ ] Stagger count is under 20 elements — beyond that, batch or simplify
- [ ] FPS tested on mid-tier hardware (not just your machine)

---

## Reduced Motion

All animations must respect `prefers-reduced-motion`.

```ts
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!prefersReduced) {
  // Full animation
  gsap.fromTo(...)
} else {
  // Instant state — no animation
  gsap.set(el, { opacity: 1, y: 0 })
}
```

Alternatively, use the CSS rule in `index.css` which zeroes all durations for prefers-reduced-motion.

---

## What NOT to Animate

- Do not animate layout properties (`width`, `height`, `padding`, `margin`)
- Do not animate `color` or `background-color` continuously
- Do not use GSAP where CSS transitions are sufficient (e.g. simple hover color changes)
- Do not add GSAP to elements the user cannot see
