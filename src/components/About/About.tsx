import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { aboutContent } from '../../data/site'

import './About.css'

/**
 * About section — Mask-Reveal "Text Curtain" effect.
 *
 * All text is in the DOM at full opacity but hidden behind a CSS gradient mask.
 * As the user scrolls, GSAP drives the mask downward, revealing text line-by-line
 * like a curtain being drawn. A luminous scan-line sits at the reveal edge.
 *
 * Correction paragraphs: struck text is revealed by the mask, then a strikethrough
 * draws across it and it dims, then the replacement text fades in.
 */

export function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const ruleRef = useRef<HTMLDivElement>(null)

  const p1StruckTextRef = useRef<HTMLSpanElement>(null)
  const p1StruckLineRef = useRef<HTMLSpanElement>(null)
  const p1ReplRef = useRef<HTMLSpanElement>(null)
  const p3StruckTextRef = useRef<HTMLSpanElement>(null)
  const p3StruckLineRef = useRef<HTMLSpanElement>(null)
  const p3ReplRef = useRef<HTMLSpanElement>(null)

  /* Extract content from centralized data */
  const paras = aboutContent.paragraphs
  const p0Text = paras[0].text as string
  const p1 = paras[1] as unknown as { before: string; struck: string; replacement: string }
  const p2Text = paras[2].text as string
  const p3 = paras[3] as unknown as { before: string; struck: string; replacement: string }

  useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    const label = labelRef.current
    const rule = ruleRef.current
    const p1StruckText = p1StruckTextRef.current
    const p1StruckLine = p1StruckLineRef.current
    const p1Repl = p1ReplRef.current
    const p3StruckText = p3StruckTextRef.current
    const p3StruckLine = p3StruckLineRef.current
    const p3Repl = p3ReplRef.current

    if (!section || !copy || !label || !rule ||
        !p1StruckText || !p1StruckLine || !p1Repl ||
        !p3StruckText || !p3StruckLine || !p3Repl) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    /* ── Reduced motion: show final state immediately ──────────────── */
    if (prefersReduced) {
      gsap.set(label, { opacity: 1 })
      copy.style.maskImage = 'none'
      copy.style.webkitMaskImage = 'none'
      gsap.set([p1StruckText, p3StruckText], { opacity: 0.35 })
      gsap.set([p1StruckLine, p3StruckLine], { scaleX: 1 })
      gsap.set([p1Repl, p3Repl], { opacity: 1 })
      gsap.set(rule, { scaleX: 1 })
      return
    }

    /* ── Measurements ──────────────────────────────────────────────── */
    const copyHeight = copy.offsetHeight
    const EDGE = 55 // px — soft mask edge width (fog effect)

    // Where each correction paragraph sits (as 0–1 fraction of copy height)
    const p1Para = p1StruckText.closest('.about__paragraph') as HTMLElement | null
    const p3Para = p3StruckText.closest('.about__paragraph') as HTMLElement | null
    const p1Frac = p1Para ? (p1Para.offsetTop + p1Para.offsetHeight) / copyHeight : 0.35
    const p3Frac = p3Para ? (p3Para.offsetTop + p3Para.offsetHeight) / copyHeight : 0.85

    /* ── Mask helper ───────────────────────────────────────────────── */
    const applyMask = (pos: number) => {
      const v = `linear-gradient(to bottom, black 0px, black ${pos}px, transparent ${pos + EDGE}px)`
      copy.style.maskImage = v
      copy.style.webkitMaskImage = v
    }

    /* ── Initial states ────────────────────────────────────────────── */
    gsap.set(label, { opacity: 0, y: 12 })
    gsap.set([p1StruckLine, p3StruckLine], { scaleX: 0 })
    gsap.set([p1Repl, p3Repl], { opacity: 0 })
    gsap.set(rule, { scaleX: 0 })
    applyMask(0)

    const ctx = gsap.context(() => {
      const proxy = { pos: 0 }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: copy,
          start: 'top 95%',
          end: 'bottom 45%',
          scrub: 1.5,
        },
      })

      /* 0.00–0.05  Label fade in */
      tl.to(label, { opacity: 1, y: 0, duration: 0.05, ease: 'power2.out' }, 0)

      /* 0.04–0.88  Main curtain reveal — mask sweeps top→bottom */
      tl.to(proxy, {
        pos: copyHeight + EDGE + 20,
        duration: 0.84,
        ease: 'none',
        onUpdate: () => {
          applyMask(proxy.pos)
        },
      }, 0.04)

      /* Correction beat 1 — fires after mask passes P1 */
      const p1Beat = 0.04 + p1Frac * 0.84 + 0.03
      tl.fromTo(p1StruckLine,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.04, ease: 'power2.inOut' },
        p1Beat
      )
      tl.to(p1StruckText,
        { opacity: 0.35, duration: 0.03, ease: 'power2.out' },
        p1Beat + 0.02
      )
      tl.to(p1Repl,
        { opacity: 1, duration: 0.04, ease: 'power2.out' },
        p1Beat + 0.04
      )

      /* Correction beat 2 — fires after mask passes P3 */
      const p3Beat = Math.min(0.04 + p3Frac * 0.84 + 0.03, 0.90)
      tl.fromTo(p3StruckLine,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.04, ease: 'power2.inOut' },
        p3Beat
      )
      tl.to(p3StruckText,
        { opacity: 0.35, duration: 0.03, ease: 'power2.out' },
        p3Beat + 0.02
      )
      tl.to(p3Repl,
        { opacity: 1, duration: 0.04, ease: 'power2.out' },
        Math.min(p3Beat + 0.04, 0.96)
      )

      /* 0.92–1.00  Sage rule draws in */
      tl.fromTo(rule,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.08, ease: 'power3.out' },
        0.92
      )
    }, section)

    return () => {
      ctx.revert()
      copy.style.maskImage = ''
      copy.style.webkitMaskImage = ''
    }
  }, [])

  return (
    <section id="about" className="about" ref={sectionRef}>
      <div className="about__copy" ref={copyRef}>
        {/* Section label */}
        <span className="about__label" ref={labelRef} data-about-label>
          ABOUT
        </span>

        {/* Paragraph 1: Greeting */}
        <div className="about__paragraph about__paragraph--greeting">
          <span className="about__line">{p0Text}</span>
        </div>

        {/* Paragraph 2: Correction */}
        <div className="about__paragraph about__paragraph--body">
          <span className="about__line">
            {p1.before}
            <span className="about__struck-group">
              <span className="about__struck-text" ref={p1StruckTextRef}>
                {p1.struck}
              </span>
              <span
                className="about__struck-line"
                ref={p1StruckLineRef}
                aria-hidden="true"
              />
            </span>
            <span className="about__repl" ref={p1ReplRef}>
              {p1.replacement}
            </span>
          </span>
        </div>

        {/* Paragraph 3: Plain */}
        <div className="about__paragraph about__paragraph--body">
          <span className="about__line">{p2Text}</span>
        </div>

        {/* Paragraph 4: Correction */}
        <div className="about__paragraph about__paragraph--body">
          <span className="about__line">
            {p3.before}
            <span className="about__struck-group">
              <span className="about__struck-text" ref={p3StruckTextRef}>
                {p3.struck}
              </span>
              <span
                className="about__struck-line"
                ref={p3StruckLineRef}
                aria-hidden="true"
              />
            </span>
            <span className="about__repl" ref={p3ReplRef}>
              {p3.replacement}
            </span>
          </span>
        </div>

        {/* Sage rule */}
        <div
          className="about__sage-rule"
          ref={ruleRef}
          aria-hidden="true"
        />
      </div>
    </section>
  )
}
