/**
 * Centralized site data.
 * Projects, copy, and structured content live here.
 * Components import from here — no hardcoded content in JSX.
 */

export const siteIdentity = {
  realName: 'Sloak Gohil',
  craftName: 'VortexX',
  /** Abbreviated version used in mobile navbar */
  initials: 'SG',
  role: 'Frontend Developer',
  email: '', // to be provided
}

export const navLinks = [
  { label: 'Work',    href: '#work'    },
  { label: 'About',   href: '#about'   },
  { label: 'Contact', href: '#contact' },
] as const

export const projects = [
  {
    id: 'phase-one-vfx',
    index: '01',
    title: 'Phase One VFX',
    description: 'VFX studio site.',
    link: '', // live link to be provided
    image: '', // screenshot to be provided
    tags: ['React', 'GSAP', 'Three.js'],
  },
  {
    id: 'novara-hospital',
    index: '02',
    title: 'Novara Hospital',
    description: 'Hospital and clinic frontend.',
    link: '',
    image: '',
    tags: ['React', 'TypeScript', 'GSAP'],
  },
  {
    id: 'stoic-vfx',
    index: '03',
    title: 'Stoic VFX',
    description: 'VFX studio.',
    link: '',
    image: '',
    tags: ['React', 'GSAP'],
  },
  {
    id: 'the-monolith',
    index: '04',
    title: 'The Monolith',
    description: '',
    link: '',
    image: '',
    tags: [],
  },
  {
    id: 'coffee-shop-one',
    index: '05',
    title: 'Coffee Shop One',
    description: '',
    link: '',
    image: '',
    tags: [],
  },
] as const

/**
 * About copy — exact text, do not alter.
 * Paragraphs are separated arrays for easy rendering.
 */
export const aboutCopy = [
  "I'm Sloak Gohil. I build websites that don't look like websites.",
  "React, Three.js, GSAP, TypeScript — the technical side is handled. What actually matters is that every project I touch feels premium, intentional, and nothing like the generic slop flooding the internet.",
] as const

export const heroCopy = {
  roleFragments: ['Frontend Developer.', 'Motion.', 'Interaction.'],
  quote: 'Objects in the vision are closer than they appear.',
  scrollLabel: 'scroll',
} as const

export const preloaderSentence = {
  before: 'The web',
  wordA:  'deserves',
  wordB:  'demands',
  after:  'better.',
} as const
