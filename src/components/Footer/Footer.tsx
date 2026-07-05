import { useState, useEffect } from 'react'
import { footerContent } from '../../data/site'
import './Footer.css'

export function Footer() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const date = new Date()
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
      const istDate = new Date(utc + (3600000 * 5.5))
      
      const hours = istDate.getHours()
      const minutes = istDate.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const formattedHours = hours % 12 || 12
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
      
      setTime(`${formattedHours}:${formattedMinutes} ${ampm} IST`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleBackToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__column">
            <span className="site-footer__label">Connect</span>
            <ul className="site-footer__list">
              {footerContent.socials.map((social) => (
                <li key={social.label}>
                  <a href={social.href} className="site-footer__link" target="_blank" rel="noopener noreferrer">
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="site-footer__column">
            <span className="site-footer__label">Legal</span>
            <ul className="site-footer__list">
              {footerContent.legalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="site-footer__link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__column site-footer__column--desktop-only">
            <span className="site-footer__label">Status</span>
            <span className="site-footer__text site-footer__text--status">{footerContent.status}</span>
            <span className="site-footer__text">{time}</span>
          </div>

          <div className="site-footer__column site-footer__column--right">
            <button className="site-footer__back-to-top" onClick={handleBackToTop}>
              <span className="site-footer__back-to-top-text">{footerContent.backToTop}</span>
              <div className="site-footer__back-to-top-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span className="site-footer__credit">&copy; {footerContent.credit}</span>
        </div>
      </div>
    </footer>
  )
}
