
interface WorkPaginationProps {
  total: number
  activeIndex: number
  isTransitioning: boolean
  onJump: (index: number) => void
}

/**
 * Phase 3: Pagination redesigned to dots-only.
 * Side arrows are rendered directly in Work.tsx as .work__arrow elements,
 * flanking the carousel for maximum visual impact.
 * Dots remain as a rhythm/position indicator below the card.
 */
export function WorkPagination({
  total,
  activeIndex,
  isTransitioning,
  onJump,
}: WorkPaginationProps) {
  return (
    <div className="work__pagination" aria-label="Project position">
      <div className="work__pagination-dots" role="tablist" aria-label="Projects">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Project ${i + 1}`}
            className={`work__pagination-dot${i === activeIndex ? ' work__pagination-dot--active' : ''}`}
            onClick={() => onJump(i)}
            disabled={isTransitioning}
          >
            <span className="work__pagination-dot-inner" />
          </button>
        ))}
      </div>
    </div>
  )
}
