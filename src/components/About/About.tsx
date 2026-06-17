import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { aboutContent } from '../../data/site'
import './About.css'

const CHAR_MS = 0.030 // 30ms per character

export function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const ruleRef = useRef<HTMLDivElement>(null)

  // Plain paragraph text refs (P0 = greeting, P2 = tech paragraph)
  const p0Ref = useRef<HTMLSpanElement>(null)
  const p2Ref = useRef<HTMLSpanElement>(null)

  // Correction paragraph refs (P1, P3)
  const p1BeforeRef = useRef<HTMLSpanElement>(null)
  const p1StruckTextRef = useRef<HTMLSpanElement>(null)
  const p1StruckLineRef = useRef<HTMLSpanElement>(null)
  const p1ReplRef = useRef<HTMLSpanElement>(null)
  const p3BeforeRef = useRef<HTMLSpanElement>(null)
  const p3StruckTextRef = useRef<HTMLSpanElement>(null)
  const p3StruckLineRef = useRef<HTMLSpanElement>(null)
  const p3ReplRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    const cursor = cursorRef.current
    const label = labelRef.current
    const rule = ruleRef.current
    const p0 = p0Ref.current
    const p2 = p2Ref.current
    const p1Before = p1BeforeRef.current
    const p1StruckText = p1StruckTextRef.current
    const p1StruckLine = p1StruckLineRef.current
    const p1Repl = p1ReplRef.current
    const p3Before = p3BeforeRef.current
    const p3StruckText = p3StruckTextRef.current
    const p3StruckLine = p3StruckLineRef.current
    const p3Repl = p3ReplRef.current

    if (!section || !copy || !cursor || !label || !rule ||
        !p0 || !p2 ||
        !p1Before || !p1StruckText || !p1StruckLine || !p1Repl ||
        !p3Before || !p3StruckText || !p3StruckLine || !p3Repl) return

    const paras = aboutContent.paragraphs
    const p0Text = paras[0].text as string
    const p1Data = paras[1] as { before: string; struck: string; replacement: string }
    const p2Text = paras[2].text as string
    const p3Data = paras[3] as { before: string; struck: string; replacement: string }

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // ── Reduced motion: final state immediately ──
    if (prefersReduced) {
      gsap.set(label, { opacity: 1 })
      gsap.set(cursor, { opacity: 0 })
      p0.textContent = p0Text
      p1Before.textContent = p1Data.before
      p1StruckText.textContent = p1Data.struck
      p1Repl.textContent = p1Data.replacement
      p2.textContent = p2Text
      p3Before.textContent = p3Data.before
      p3StruckText.textContent = p3Data.struck
      p3Repl.textContent = p3Data.replacement
      gsap.set([p1StruckText, p3StruckText], { opacity: 0.4 })
      gsap.set([p1StruckLine, p3StruckLine], { scaleX: 1 })
      gsap.set(rule, { scaleX: 1 })
      return
    }

    // ── Cursor helpers ──
    const setCursorTyping = (typing: boolean) => {
      cursor.classList.toggle('about__cursor--typing', typing)
    }

    const setCursorSize = (isGreeting: boolean) => {
      cursor.classList.toggle('about__cursor--greeting', isGreeting)
    }

    const moveCursor = (targetSpan: HTMLElement) => {
      const copyRect = copy.getBoundingClientRect()

      // Try precise position via Range if span has text
      if (targetSpan.firstChild && targetSpan.firstChild.textContent) {
        const len = targetSpan.firstChild.textContent.length
        if (len > 0) {
          const range = document.createRange()
          range.setStart(targetSpan.firstChild, len)
          range.setEnd(targetSpan.firstChild, len)
          const rects = range.getClientRects()
          if (rects.length > 0) {
            const r = rects[0]
            cursor.style.left = `${r.left - copyRect.left}px`
            cursor.style.top = `${r.top - copyRect.top}px`
            return
          }
        }
      }

      // Fallback: paragraph start position
      const paraEl = targetSpan.closest('.about__paragraph')
      if (paraEl) {
        const pr = paraEl.getBoundingClientRect()
        cursor.style.left = `${pr.left - copyRect.left}px`
        cursor.style.top = `${pr.top - copyRect.top}px`
      }
    }

    // ── Build a typing tween for one text segment ──
    const addTyping = (
      tl: gsap.core.Timeline,
      span: HTMLElement,
      text: string,
      pos: number,
      isGreeting = false
    ): number => {
      const dur = text.length * CHAR_MS
      const proxy = { i: 0 }
      tl.to(proxy, {
        i: text.length,
        duration: dur,
        ease: 'none',
        roundProps: 'i',
        onStart: () => {
          setCursorTyping(true)
          setCursorSize(isGreeting)
        },
        onUpdate: () => {
          span.textContent = text.slice(0, proxy.i)
          moveCursor(span)
        },
        onComplete: () => setCursorTyping(false),
      }, pos)
      return pos + dur
    }

    const ctx = gsap.context(() => {
      // ── Initial states ──
      gsap.set(label, { opacity: 0 })
      gsap.set(cursor, { opacity: 1 })
      gsap.set([p1StruckLine, p3StruckLine], { scaleX: 0 })
      gsap.set(rule, { scaleX: 0 })
      p0.textContent = ''
      p1Before.textContent = ''
      p1StruckText.textContent = ''
      p1Repl.textContent = ''
      p2.textContent = ''
      p3Before.textContent = ''
      p3StruckText.textContent = ''
      p3Repl.textContent = ''

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })

      let t = 0

      // ── Label fade in ──
      tl.to(label, { opacity: 1, duration: 0.4, ease: 'power2.out' }, t)
      // Position cursor at P0 start before typing begins
      tl.call(() => {
        setCursorSize(true)
        moveCursor(p0)
      }, [], t + 0.35)
      t += 0.4

      // ── P1: greeting ──
      t = addTyping(tl, p0, p0Text, t, true)
      t += 0.4 // inter-paragraph pause (cursor blinks)

      // ── P2: correction ──
      tl.call(() => { setCursorSize(false); moveCursor(p1Before) }, [], t - 0.01)
      t = addTyping(tl, p1Before, p1Data.before, t)
      t = addTyping(tl, p1StruckText, p1Data.struck, t)
      t += 0.3 // pause before correction

      // Strikethrough draw
      tl.fromTo(p1StruckLine,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.35, ease: 'power2.inOut' },
        t)
      t += 0.35

      // Drop struck text opacity
      tl.to(p1StruckText,
        { opacity: 0.4, duration: 0.15, ease: 'power2.out' }, t)
      t += 0.15

      // Type replacement
      t = addTyping(tl, p1Repl, p1Data.replacement, t)
      t += 0.4 // inter-paragraph pause

      // ── P3: plain ──
      tl.call(() => moveCursor(p2), [], t - 0.01)
      t = addTyping(tl, p2, p2Text, t)
      t += 0.4 // inter-paragraph pause

      // ── P4: correction ──
      tl.call(() => moveCursor(p3Before), [], t - 0.01)
      t = addTyping(tl, p3Before, p3Data.before, t)
      t = addTyping(tl, p3StruckText, p3Data.struck, t)
      t += 0.3 // pause before correction

      // Strikethrough draw
      tl.fromTo(p3StruckLine,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.35, ease: 'power2.inOut' },
        t)
      t += 0.35

      // Drop struck text opacity
      tl.to(p3StruckText,
        { opacity: 0.4, duration: 0.15, ease: 'power2.out' }, t)
      t += 0.15

      // Type replacement
      t = addTyping(tl, p3Repl, p3Data.replacement, t)

      // ── Ending sequence ──
      t += 0.5 // cursor blinks

      // Cursor fades out
      tl.to(cursor, { opacity: 0, duration: 0.3, ease: 'power2.out' }, t)
      t += 0.3

      // Sage rule draws in
      tl.fromTo(rule,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5, ease: 'power3.out' },
        t)
    }, section)

    return () => ctx.revert()
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
          <span className="about__line" ref={p0Ref} data-about-line />
        </div>

        {/* Paragraph 2: Correction */}
        <div className="about__paragraph about__paragraph--body">
          <span className="about__line" data-about-line>
            <span ref={p1BeforeRef} />
            <span className="about__struck-group">
              <span
                className="about__struck-text"
                ref={p1StruckTextRef}
                data-struck-text
              />
              <span
                className="about__struck-line"
                ref={p1StruckLineRef}
                data-struck-line
                aria-hidden="true"
              />
            </span>
            <span ref={p1ReplRef} />
          </span>
        </div>

        {/* Paragraph 3: Plain */}
        <div className="about__paragraph about__paragraph--body">
          <span className="about__line" ref={p2Ref} data-about-line />
        </div>

        {/* Paragraph 4: Correction */}
        <div className="about__paragraph about__paragraph--body">
          <span className="about__line" data-about-line>
            <span ref={p3BeforeRef} />
            <span className="about__struck-group">
              <span
                className="about__struck-text"
                ref={p3StruckTextRef}
                data-struck-text
              />
              <span
                className="about__struck-line"
                ref={p3StruckLineRef}
                data-struck-line
                aria-hidden="true"
              />
            </span>
            <span ref={p3ReplRef} />
          </span>
        </div>

        {/* Typewriter cursor */}
        <span className="about__cursor" ref={cursorRef} aria-hidden="true">
          |
        </span>

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
