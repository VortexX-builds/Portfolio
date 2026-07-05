import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { aboutContent } from '../../data/site'

import './About.css'

export function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  const paras = aboutContent.paragraphs

  useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current

    if (!section || !copy) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReduced) return

    const ctx = gsap.context(() => {
      // Fade in the label
      gsap.fromTo(
        '.about__label',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: copy,
            start: 'top 85%',
            end: 'top 75%',
            scrub: true,
          },
        }
      )

      // Word by word reveal tied to scroll
      gsap.to('.about__word', {
        opacity: 1,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: copy,
          start: 'top 80%',
          end: 'bottom 50%',
          scrub: 1,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" className="about" ref={sectionRef}>
      {/* Section label */}
      <span className="about__label" ref={labelRef} data-about-label>
        ABOUT
      </span>

      <div className="about__copy" ref={copyRef}>

        {paras.map((p, i) => {
          const isGreeting = 'isGreeting' in p && p.isGreeting
          const words = p.text.split(' ')

          return (
            <div
              key={i}
              className={`about__paragraph ${isGreeting ? 'about__paragraph--greeting' : 'about__paragraph--body'}`}
            >
              <span className="about__line">
                {words.map((word, wordIndex) => {
                  const isImportant = word.includes('*')
                  const cleanWord = word.replace(/\*/g, '')

                  return (
                    <span
                      key={wordIndex}
                      className={`about__word ${isImportant ? 'about__word--highlight' : ''}`}
                    >
                      {cleanWord}
                      {wordIndex !== words.length - 1 ? ' ' : ''}
                    </span>
                  )
                })}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
