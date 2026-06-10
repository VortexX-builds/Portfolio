import React from 'react'
import { heroCopy } from '../../data/site'

interface QuoteBridgeProps {
  bridgeRef: React.RefObject<HTMLDivElement | null>
}

export function QuoteBridge({ bridgeRef }: QuoteBridgeProps) {
  // Quote is: "Objects in the vision are closer than they appear."
  // The period should be animated separately at the end.
  const rawQuote = heroCopy.quote
  
  // Extract the trailing period if it exists.
  const hasPeriod = rawQuote.endsWith('.')
  const cleanQuote = hasPeriod ? rawQuote.slice(0, -1) : rawQuote
  const words = cleanQuote.split(' ')

  return (
    <div ref={bridgeRef} className="quote-bridge" aria-hidden="true" style={{ opacity: 0, visibility: 'hidden' }}>
      {/* 
        This acts as a visual overlay wrapper. 
        It's hidden from screen readers because it's a visual transition.
      */}
      <div className="quote-bridge__inner">
        {words.map((word, i) => {
          const isLast = i === words.length - 1;
          return (
            <span 
              key={i} 
              className={`quote-bridge__word ${isLast ? 'quote-bridge__word--last' : ''}`}
            >
              {word}
            </span>
          )
        })}
        {hasPeriod && (
          <span className="quote-bridge__period">.</span>
        )}
      </div>
    </div>
  )
}
