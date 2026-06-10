# PROJECT_CONTEXT.md

> This file is the single source of truth for this project.
> Read it before touching anything. Update it every time a section ships.

---

## Identity

- **Site owner:** Sloak Gohil (also known as VortexX)
- **Age:** 19, self-taught, building a freelance career
- **Site purpose:** Personal portfolio. The most important sales tool he has.
- **Deployed on:** Vercel
- **Repository:** d:/Freelance/Portfolio
- **GitHub Repository:** https://github.com/VortexX-builds/Portfolio

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 + Vite 8 | Framework + build tool |
| TypeScript (strict) | All source files |
| Tailwind CSS v4 | Utility classes via `@tailwindcss/vite` plugin |
| GSAP + ScrollTrigger | All animations |
| Lenis | Smooth scroll (synced with GSAP) |
| Three.js | Reserved, used sparingly |

---

## Design System

### Colors

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#010606` | Page background |
| `--color-text-primary` | `#DAF1DE` | Headings, key text |
| `--color-text-muted` | `#8AAFA7` | Body, secondary text |
| `--color-accent` | `#34D399` | Signature accent, max 3-4 uses sitewide |
| `--color-surface` | `#0D2B2C` | Elevated panels |
| `--color-border` | `#163830` | Subtle dividers |

**Critical:** Never `#000000` or `#ffffff`. Accent used like a signature, not a theme color.

### Typography

- **Font:** Inter (400, 500, 600, 700, 900)
- **Scale:** Defined as CSS custom properties in `src/index.css`
  - `--text-hero`: clamp(3.5rem, 9vw, 9rem)
  - `--text-display`: clamp(2.5rem, 6vw, 6rem)
  - `--text-heading`: clamp(1.75rem, 3vw, 3rem)
  - `--text-title`: clamp(1.25rem, 2vw, 1.75rem)
- **Letter spacing:** `-0.03em` for display text, `0.15em` for uppercase labels only
- **Line height:** `1.1` for hero/display, `1.6` for body

### Motion Philosophy

- Everything moves like it has mass. Slow, intentional, weighted.
- No cheap micro-animations.
- GSAP handles all animation. Lenis handles scroll.
- `power2.out` / `power3.out` for entrances. `expo.out` for dramatic single moments only.
- No `elastic` or `bounce` easings. Ever.
- `prefers-reduced-motion` must be respected in every animated component.

### Animation Standards

- Standard duration: 0.65s
- Hero/cinematic: 1.4s
- Preloader: 1.8s
- Stagger: 0.08–0.15s (never more)

---

## Non-Negotiable Rules

1. **No em dashes anywhere.** Not in copy, not in comments, not in UI. Zero.
2. **No generic portfolio cliches.** No "passionate", no "creative solutions", no skill bars, no timeline resumes.
3. **No pure black (`#000000`) or pure white (`#ffffff`).** Anywhere.
4. **Accent color** (`#34D399`) used maximum 3-4 times across the entire site.
5. **Three.js** scenes: one max, lightweight, disposed properly, cut if it stutters.
6. **Performance:** 90+ Lighthouse desktop, 80+ mobile. No negotiation.
7. **No magic numbers** in components. Import from `src/tokens.ts` or use CSS custom properties.
8. **No content hardcoded** in JSX. All copy and data from `src/data/site.ts`.

---

## Key Interaction: Name Flip

Wherever "Sloak Gohil" appears (navbar, hero, about), hovering triggers a smooth animated flip/transition to "VortexX" and back.

- **Storytelling intent:** Sloak Gohil = the person. VortexX = the craftsman.
- **Implementation approach:** CSS 3D transform flip on Y-axis using two absolutely-positioned spans. GSAP drives the flip for precise control. Duration: 0.4s, ease: power2.inOut.
- **Feel:** Smooth and deliberate. Not jarring.

---

## Site Structure

| # | Section | Status | Notes |
|---|---|---|---|
| 1 | Preloader | COMPLETE | Cinematic, ~2s, split curtain exit, reduced motion handled |
| 2 | Navbar | COMPLETE | Glass surface post-hero, scroll hide/show, name flip, mobile radial overlay |
| 3 | Hero | COMPLETE | Name + role, subtle background motion, hover interaction |
| 4 | Quote Bridge | COMPLETE | Scroll-scrubbed transition (+250vh pin), word-by-word assembly |
| 5 | Work | PENDING | 5 projects, full-width sequential scroll, no grid |
| 6 | About | PENDING | 3 paragraphs, exact copy, name flip on hover |
| 7 | Contact | PENDING | No form, direct email, confident closing copy |

**Build order is fixed.** Do not start next section until current one is approved.

---

## Projects

Present in this exact order:

| # | Title | Description | Live Link | Screenshot |
|---|---|---|---|---|
| 01 | Phase One VFX | VFX studio site | TBD | TBD |
| 02 | Novara Hospital | Hospital/clinic frontend | TBD | TBD |
| 03 | Stoic VFX | VFX studio | TBD | TBD |
| 04 | The Monolith | TBD | TBD | TBD |
| 05 | Coffee Shop One | TBD | TBD | TBD |

Work section: full-width or near full-width sequential scroll. Project name, brief description, live link. Visual enters with weight on scroll. No card grids.

---

## About Copy (Exact, Do Not Alter)

Paragraph 1:
> I'm Sloak Gohil. I build websites that don't look like websites.

Paragraph 2:
> React, Three.js, GSAP, TypeScript — the technical side is handled. What actually matters is that every project I touch feels premium, intentional, and nothing like the generic slop flooding the internet.

Paragraph 3:
> If you can feel the difference, you already know what I do.

**Note:** The em dash in paragraph 2 is in the original brief. Render it as provided in the data file. The "no em dashes" rule applies to copy we write ourselves.

---

## File Structure

```
Portfolio/
├── index.html                  # Entry HTML, updated with proper meta
├── vite.config.ts              # Vite + React + Tailwind configured
├── tsconfig.json               # Strict TypeScript
├── PROJECT_CONTEXT.md          # This file
├── skills/
│   ├── frontend-design.md      # Premium UI rules
│   ├── animation-gsap.md       # GSAP standards
│   ├── performance.md          # Performance checklist
│   └── copywriting.md          # Copy tone and rules
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # App shell with Lenis initialized
    ├── index.css               # Global CSS, design tokens, reset
    ├── tokens.ts               # TypeScript design token constants
    ├── hooks/
    │   └── useLenis.ts         # Lenis + GSAP ScrollTrigger sync hook
    ├── data/
    │   └── site.ts             # All site content (projects, copy, identity)
    └── components/             # (empty, ready for sections)
```

---

## Dependencies Installed

```json
{
  "gsap": "^3.15.0",
  "@gsap/react": "^2.1.2",
  "lenis": "^1.3.23",
  "three": "^0.184.0",
  "@types/three": "^0.184.1",
  "tailwindcss": "^4.3.0",
  "@tailwindcss/vite": "^4.3.0",
  "react": "^19.x",
  "react-dom": "^19.x",
  "@vitejs/plugin-react": "^x.x.x",
  "@types/react": "^19.x",
  "@types/react-dom": "^19.x"
}
```

---

## Build Status

**Bootstrap:** COMPLETE  
**Preloader:** COMPLETE  
**Navbar:** COMPLETE  
**Hero & Quote Bridge:** COMPLETE  
**Current section in progress:** None  
**Next section to build:** Work (awaiting approval to proceed)

---

## Decisions Log

| Decision | Rationale |
|---|---|
| Tailwind v4 via `@tailwindcss/vite` plugin | No config file needed, CSS-first approach, faster builds |
| Lenis hook at App root | Single initialization, proper cleanup, GSAP sync |
| GSAP ScrollTrigger registered in useLenis.ts | One registration point, eliminates double-register bugs |
| `src/tokens.ts` mirrors CSS custom properties | TypeScript-safe access in JS logic, CSS vars for styling |
| `src/data/site.ts` for all content | Copy never hardcoded in JSX, single place to update |
| Manual chunk splitting (react/gsap/three) | Prevents one large bundle, improves LCP |
| Quote Bridge inside Hero pin | Extends the hero pin by 150vh (`+=250%`) to keep the shader running beneath the quote assembly |
| Global WebGL Shader | Moved shader to fixed global background, relying on Page Visibility API to pause instead of IntersectionObserver |
