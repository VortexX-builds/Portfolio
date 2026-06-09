import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

interface QuoteWordsProps {
  text: string
  className?: string
}

export function QuoteWords({ text, className }: QuoteWordsProps) {
  const words = text.split(' ')

  return (
    <p className={className} aria-label={text}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <Word word={word} />
          {i !== words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </p>
  )
}

function Word({ word }: { word: string }) {
  const elRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const scaleTo = gsap.quickTo(el, 'scale', { duration: 0.35, ease: 'power2.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power2.out' })

    const handleEnter = () => {
      scaleTo(1.07)
      yTo(-2)
    }

    const handleLeave = () => {
      gsap.to(el, {
        scale: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.inOut',
      })
    }

    el.addEventListener('mouseenter', handleEnter)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mouseenter', handleEnter)
      el.removeEventListener('mouseleave', handleLeave)
      gsap.killTweensOf(el)
    }
  }, [])

  return (
    <span ref={elRef} className="hero__quote-word">
      {word}
    </span>
  )
}
