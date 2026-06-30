import { footerContent } from '../../data/site'
import './Footer.css'

/**
 * Footer — pinned to the very bottom of the document.
 * No animation. Simply present.
 * A thin horizontal rule in #4A7C6F at 15% opacity sits above it.
 */
export function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        <span className="site-footer__credit">{footerContent.credit}</span>
      </div>
    </footer>
  )
}
