# Frontend Design — Premium UI Rules

> This is not a reference document. This is a ruleset. Consult it before building any component.

---

## The Benchmark

The about copy is the tone benchmark for everything visual:
> "I build websites that don't look like websites."

If a component looks like something you'd find on a generic portfolio template, rebuild it.

---

## Color Usage

| Token | Hex | When to use |
|---|---|---|
| `--color-bg` | `#010606` | Page background only |
| `--color-text-primary` | `#DAF1DE` | All headings, names, key labels |
| `--color-text-muted` | `#8AAFA7` | Body text, secondary labels, captions |
| `--color-accent` | `#34D399` | Maximum 3-4 moments across the entire site |
| `--color-surface` | `#0D2B2C` | Slightly elevated panels or cards |
| `--color-border` | `#163830` | Dividers, subtle rules |

**Accent rules (non-negotiable):**
- Never use `#34D399` as a background fill
- Never use it on more than one element per visible viewport
- Approved uses: a single underline, a punctuation mark, a hover state indicator, a counter label
- It should feel like a signature, not a theme color

**Never use:**
- `#000000` (pure black)
- `#ffffff` (pure white)
- Any color not in the token list above without a documented reason

---

## Typography

**Font:** Inter — loaded from Google Fonts, weights 400/500/600/700/900

**Scale (use CSS custom properties, not arbitrary values):**
- `--text-hero`: Hero name / identity — clamp(3.5rem, 9vw, 9rem)
- `--text-display`: Section titles — clamp(2.5rem, 6vw, 6rem)
- `--text-heading`: Component headings
- `--text-title`: Card/project titles
- `--text-body`: All body text
- `--text-small`, `--text-label`: Captions, metadata

**Letter spacing:**
- Display and hero text: `-0.03em` (tight, confident)
- Uppercase labels: `0.15em` (wide for small caps only)
- Body: `0em` (no tracking)

**Line height:**
- Hero/display: `1.1` (tight)
- Body: `1.6`
- Never exceed `1.8`

**What "cinematic" means for type:**
- Big where it needs to be. Quiet everywhere else.
- One dominant typographic element per section.
- Support text is muted and small — it does not compete.
- No decorative or serif fonts unless they are chosen for a specific editorial moment.

---

## Spacing

- Use `--space-section` (`clamp(5rem, 12vh, 10rem)`) for vertical section padding
- Use `.container` class for horizontal page gutters
- Do not hardcode pixel values for layout-critical spacing
- Whitespace is intentional — do not compress it to "fit more"

---

## What "Premium" Means in Practice

1. **Generous whitespace.** Breathing room is a design choice, not wasted space.
2. **Strong vertical rhythm.** Sections feel like chapters — distinct, intentional.
3. **One visual statement per section.** Not multiple competing elements.
4. **Restraint.** Less decoration. More craft.
5. **Every element earns its place.** If you can remove it without losing meaning, remove it.
6. **Hover states are deliberate.** A hover effect should reveal intent — not just add motion.
7. **No gradients that look like CSS gradients.** If it's used, it must feel like a material.

---

## Anti-patterns (Never Ship These)

- Skill bar graphs or percentage rings
- Timeline resumes / career history
- Floating emoji or decorative icons as visual noise
- "Passionate", "creative", "solutions-oriented", or any buzzword copy
- Grid layouts for the Work section
- Centered hero text with a floating tagline on top of a stock image
- Card-based layouts with shadows and borders on every element
- Neon glow effects (unless deeply intentional and earned)
