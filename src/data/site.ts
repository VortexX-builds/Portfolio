/**
 * Centralized site data.
 * Projects, copy, and structured content live here.
 * Components import from here — no hardcoded content in JSX.
 */

import phaseOneVfxImg from '../assets/works/phase-one-vfx.webp'
import swiftcartDeliveryImg from '../assets/works/swiftcart-delivery.webp'
import novaraHospitalImg from '../assets/works/novara-hospital.webp'
import glaceLevinImg from '../assets/works/glace-levin.webp'
import stoicVfxImg from '../assets/works/stoic-vfx.webp'
import theMonolithGymImg from '../assets/works/the-monolith-gym.webp'
import vibrewCoffeeImg from '../assets/works/vibrew-coffee-shop.webp'

export const siteIdentity = {
  realName: 'Sloak Gohil',
  craftName: 'VortexX',
  /** Abbreviated version used in mobile navbar */
  initials: 'SG',
  role: 'Frontend Developer',
  email: 'turbosites.io@gmail.com',
}

export const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
] as const

export const projects = [
  {
    id: 'phase-one-vfx',
    index: '01',
    title: 'Phase One VFX',
    type: 'VFX Studio | Frontend',
    link: 'https://phaseonevfx.com' as string | null,
    images: [phaseOneVfxImg],
    tags: ['React', 'GSAP', 'Three.js'],
  },
  {
    id: 'swiftcart-delivery',
    index: '02',
    title: 'SwiftCart Delivery',
    type: 'Delivery App | Frontend',
    link: 'https://swiftcart-delivery.vercel.app',
    images: [swiftcartDeliveryImg],
    tags: ['React', 'TypeScript', 'Supabase'],
  },
  {
    id: 'novara-hospital',
    index: '03',
    title: 'Novara Hospital',
    type: 'Healthcare | Frontend',
    link: 'https://novara-two.vercel.app',
    images: [novaraHospitalImg],
    tags: ['React', 'TypeScript', 'GSAP'],
  },
  {
    id: 'glace-levin',
    index: '04',
    title: 'Glacé & Levain',
    type: 'Artisan Bakery | Frontend',
    link: 'https://glace-levin.vercel.app',
    images: [glaceLevinImg],
    tags: ['React', 'TypeScript', 'GSAP'],
  },
  {
    id: 'stoic-vfx',
    index: '05',
    title: 'Stoic VFX',
    type: 'VFX Studio | Frontend',
    link: 'https://stoic-vfx.vercel.app',
    images: [stoicVfxImg],
    tags: ['React', 'GSAP'],
  },
  {
    id: 'the-monolith-gym',
    index: '06',
    title: 'The Monolith Gym',
    type: 'Fitness | Frontend',
    link: 'https://the-monolith.netlify.app',
    images: [theMonolithGymImg],
    tags: ['React', 'TypeScript'],
  },
  {
    id: 'vibrew-coffee',
    index: '07',
    title: 'Vibrew Coffee Shop',
    type: 'F&B | Frontend',
    link: 'https://vibrew-web.vercel.app',
    images: [vibrewCoffeeImg],
    tags: ['React', 'GSAP'],
  },
]

export const aboutContent = {
  paragraphs: [
    {
      type: 'plain' as const,
      text: "I'm Sloak Gohil.",
      isGreeting: true,
    },
    {
      type: 'plain' as const,
      text: "I build websites that are in your brain and turn them into *reality.*",
    },
    {
      type: 'plain' as const,
      text: "React, Three.js, GSAP, TypeScript. The technical side is handled. What actually matters is that every project I touch feels *premium,* *intentional,* and nothing like the generic *slop* flooding the internet.",
    },
    {
      type: 'plain' as const,
      text: "If you can feel the difference, you already know where to find me.",
    },
  ],
} as const

export const heroCopy = {
  roleFragments: ['Frontend Developer.', 'Motion.', 'Interaction.'],
  quote: 'The difference is in the details.',
  scrollLabel: 'scroll',
} as const

export const contactContent = {
  cta: "Let's build something the internet hasn't seen yet.",
  email: 'turbosites.io@gmail.com',
  phone: '+91 6356385989',
  emailLabel: 'EMAIL',
  phoneLabel: 'PHONE',
} as const

export const footerContent = {
  credit: 'Designed & Developed by Sloak Gohil - 2026',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/turbo-sites-68532b402/' },
  ],
  status: '🟢 Available for work',
  localTimeLabel: 'Local Time (IST)',
  backToTop: 'Back to Top',
} as const

export const preloaderSentence = {
  before: 'The web',
  wordA: 'deserves',
  wordB: 'demands',
  after: 'better.',
} as const
