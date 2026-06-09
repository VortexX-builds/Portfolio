import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { preloaderSentence } from '../../data/site'
import { zIndex } from '../../tokens'
import './Preloader.css'

interface PreloaderProps {
  /** Called when the exit animation is complete — removes preloader from tree, fires hero entrance */
  onComplete: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const wordEls = useRef<HTMLSpanElement[]>([])
  const wordARef = useRef<HTMLSpanElement>(null)
  const wordBRef = useRef<HTMLSpanElement>(null)

  // Reset refs on each render to avoid duplicates in StrictMode
  wordEls.current = []

  useEffect(() => {
    // ── Reduced-motion: skip the sequence ────────────────────────────
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      gsap.set('.preloader__stage', { visibility: 'visible', opacity: 1 })
      gsap.set(wordARef.current, { y: '-110%' })
      gsap.set(wordBRef.current, { y: '0%' })

      // Hold for 1s then cut directly to hero
      gsap.delayedCall(1, () => {
        document.body.classList.remove('preloader-active')
        onComplete()
      })
      return
    }

    // Lock native scroll while the preloader plays.
    document.body.classList.add('preloader-active')

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set([rootRef.current, ...wordEls.current, wordARef.current, wordBRef.current], {
            willChange: 'auto',
          })
          document.body.classList.remove('preloader-active')
          onComplete()
        },
      })

      // ── Initial states ─────────────────────────────────────────────────────
      tl.set('.preloader__stage', { visibility: 'visible' })
      tl.set(wordEls.current, { y: '110%' })
      tl.set(wordARef.current, { y: '0%' })
      tl.set(wordBRef.current, { y: '110%' })

      // ── Beat 1: Sentence Entrance ──────────────────────────────────────────
      tl.to(wordEls.current, {
        y: '0%',
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.08,
      }, 0)

      // ── Beat 2: Hold (Implicit dead time ~0.99s to 1.5s) ──────────────────

      // ── Beat 3: Word Flip ──────────────────────────────────────────────────
      tl.to(wordARef.current, {
        y: '-110%',
        duration: 0.4,
        ease: 'power2.in',
      }, 1.5)

      tl.to(wordBRef.current, {
        y: '0%',
        duration: 0.55,
        ease: 'power3.out',
      }, 1.6)

      // ── Beat 4: Hold (Implicit dead time ~2.15s to 2.7s) ──────────────────

      // ── Beat 5: Exit ───────────────────────────────────────────────────────
      tl.to('.preloader__stage', {
        opacity: 0,
        scale: 0.92,
        duration: 0.45,
        ease: 'power2.in',
      }, 2.7)

      tl.to(rootRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
      }, 2.75)

    }, rootRef)

    return () => {
      document.body.classList.remove('preloader-active')
      ctx.revert()
    }
  }, [onComplete])

  return (
    <div
      ref={rootRef}
      className="preloader"
      aria-hidden="true"
      style={{ zIndex: zIndex.preloader }}
    >
      <div className="preloader__stage">
        <p className="preloader__sentence">
          {preloaderSentence.before.split(' ').map((word, i) => (
            <React.Fragment key={`before-${i}`}>
              <span className="preloader__word">
                <span 
                  className="preloader__word-inner"
                  ref={el => { if (el) wordEls.current.push(el) }}
                >
                  {word}
                </span>
              </span>{' '}
            </React.Fragment>
          ))}
          
          <span className="preloader__word">
            <span 
              className="preloader__word-inner preloader__word--flip"
              ref={el => { if (el) wordEls.current.push(el) }}
            >
              <span className="preloader__word-a" ref={wordARef}>
                {preloaderSentence.wordA}
              </span>
              <span className="preloader__word-b" ref={wordBRef}>
                {preloaderSentence.wordB}
              </span>
            </span>
          </span>{' '}

          {preloaderSentence.after.split(' ').map((word, i) => (
            <React.Fragment key={`after-${i}`}>
              <span className="preloader__word">
                <span 
                  className="preloader__word-inner"
                  ref={el => { if (el) wordEls.current.push(el) }}
                >
                  {word}
                </span>
              </span>
              {i < preloaderSentence.after.split(' ').length - 1 ? ' ' : ''}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  )
}
