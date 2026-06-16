import React from 'react'
import { projects } from '../../data/site'

type Project = typeof projects[number]

interface WorkCardProps {
  project: Project
  role: 'active' | 'ghost'
  cardRef: React.RefObject<HTMLDivElement | null>
  isActive: boolean
  onClick?: () => void
}

/** Distinct placeholder gradient per project index */
const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  '01': 'linear-gradient(145deg, #0D2B2C 0%, #163830 50%, #0a1e1f 100%)',
  '02': 'linear-gradient(145deg, #080e0e 0%, #0D2B2C 60%, #071515 100%)',
  '03': 'linear-gradient(145deg, #0f2020 0%, #1a3535 50%, #0D2B2C 100%)',
  '04': 'linear-gradient(145deg, #050a0a 0%, #0D2B2C 55%, #080d0d 100%)',
  '05': 'linear-gradient(145deg, #0D2B2C 0%, #0a1a1a 60%, #040808 100%)',
}

export const WorkCard = React.memo(function WorkCard({
  project,
  role,
  cardRef,
  isActive,
  onClick,
}: WorkCardProps) {
  const hasImage = project.images.length > 0
  const gradient = PLACEHOLDER_GRADIENTS[project.index] ?? PLACEHOLDER_GRADIENTS['01']

  return (
    <div
      ref={cardRef}
      className={`work__card${role === 'ghost' ? ' work__card--ghost' : ''}`}
      onClick={role === 'ghost' ? onClick : undefined}
      aria-hidden={!isActive}
    >
      <div className="work__card-inner">
        {/* Image or placeholder */}
        {hasImage ? (
          <img
            src={project.images[0]}
            alt={project.title}
            className="work__card-image"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div
            className="work__card-placeholder"
            style={{ background: gradient }}
          >
            <span
              className="work__card-placeholder-number"
              aria-hidden="true"
            >
              {project.index}
            </span>
          </div>
        )}

        {/* Glassmorphic floating panel overlay */}
        <div className="work__card-overlay" aria-hidden={!isActive}>
          <div className="work__card-index">{project.index}</div>

          <h2 className="work__card-title">{project.title}</h2>

          <p className="work__card-type">{project.type}</p>

          <div className="work__card-footer">
            <div className="work__card-tags" aria-label="Technologies">
              {project.tags.map((tag) => (
                <span key={tag} className="work__card-tag">
                  {tag}
                </span>
              ))}
            </div>

            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="work__card-link"
                tabIndex={isActive ? 0 : -1}
              >
                {new URL(project.link).hostname.replace('www.', '')}
                <span className="work__card-link-arrow" aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="work__card-link work__card-link--inactive" aria-hidden="true">
                Coming soon
              </span>
            )}
          </div>
        </div>

        {/* Phase 4: Active card shimmer border */}
        {isActive && (
          <div className="work__card-shimmer" aria-hidden="true" />
        )}
      </div>
    </div>
  )
})
