import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { contactContent } from '../../data/site'
import './Contact.css'

export function Contact() {
  const sectionRef  = useRef<HTMLElement>(null)
  const labelRef    = useRef<HTMLSpanElement>(null)
  const ruleRef     = useRef<HTMLDivElement>(null)
  const ctaRef      = useRef<HTMLHeadingElement>(null)
  const emailRef    = useRef<HTMLAnchorElement>(null)
  const phoneRef    = useRef<HTMLButtonElement>(null)

  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePhoneClick = () => {
    navigator.clipboard.writeText(contactContent.phone).then(() => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      setCopied(true)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500)
    })
  }

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const label   = labelRef.current
    const rule    = ruleRef.current
    const cta     = ctaRef.current
    const email   = emailRef.current
    const phone   = phoneRef.current

    if (!section || !label || !rule || !cta || !email || !phone) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Reduced motion: show everything instantly ──
    if (prefersReduced) {
      gsap.set([label, cta, email, phone], { opacity: 1, y: 0 })
      gsap.set(rule, { scaleX: 1 })
      return
    }

    // ── Set initial hidden states ──
    gsap.set(label,  { opacity: 0 })
    gsap.set(rule,   { scaleX: 0 })
    gsap.set(cta,    { opacity: 0, y: 20 })
    gsap.set(email,  { opacity: 0, y: 15 })
    gsap.set(phone,  { opacity: 0, y: 15 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })

      // t=0.00 — "CONTACT" label fades in (0.4s)
      tl.to(label, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      }, 0)

      // t=0.40 — Sage rule draws in (0.5s)
      tl.to(rule, {
        scaleX: 1,
        duration: 0.5,
        ease: 'power3.out',
      }, 0.4)

      // t=0.90 — CTA fades and drifts up (0.7s)
      tl.to(cta, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, 0.9)

      // t=1.60 — Email fades and drifts up (0.5s)
      tl.to(email, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
      }, 1.6)

      // t=1.75 — Phone fades and drifts up (0.5s)
      tl.to(phone, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
      }, 1.75)
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="contact" className="contact" ref={sectionRef}>
      <div className="contact__column">

        {/* Section label — matches WORKS and ABOUT treatment exactly */}
        <span className="contact__label" ref={labelRef} aria-hidden="true">
          CONTACT
        </span>

        {/* Sage rule — draws in left to right */}
        <div
          className="contact__sage-rule"
          ref={ruleRef}
          aria-hidden="true"
        />

        {/* CTA line — exact copy, do not change */}
        <h2 className="contact__cta" ref={ctaRef}>
          {contactContent.cta}
        </h2>

        {/* Contact details — email and phone */}
        <div className="contact__details" role="list">

          {/* Email — opens mailto on click */}
          <div className="contact__item" role="listitem">
            <span className="contact__item-label">{contactContent.emailLabel}</span>
            {/* TODO: Replace with real email before deployment */}
            <a
              ref={emailRef}
              href={`mailto:${contactContent.email}`}
              className="contact__item-value contact__item-value--link"
              aria-label={`Email: ${contactContent.email}`}
            >
              {contactContent.email}
            </a>
          </div>

          {/* Phone — copies to clipboard, inline confirmation */}
          <div className="contact__item" role="listitem">
            <span className="contact__item-label">{contactContent.phoneLabel}</span>
            {/* TODO: Replace with real phone number before deployment */}
            <button
              ref={phoneRef}
              className="contact__item-value contact__item-value--copy"
              onClick={handlePhoneClick}
              aria-label={copied ? 'Phone number copied to clipboard' : `Copy phone number: ${contactContent.phone}`}
              title={copied ? 'Copied!' : 'Click to copy'}
            >
              {copied ? 'Copied.' : contactContent.phone}
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
