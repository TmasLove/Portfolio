import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../ui/Icon'
import { EASE } from '../../lib/motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { projects } from '../../data/projects'

/*  Sibling work in the same category - keeps a reader moving laterally
    through the portfolio rather than bouncing after one project. Live,
    linkable projects surface first; capped at three so the panel stays a
    project view, not an index. */
function relatedTo(project) {
  const scored = projects.filter(
    (p) => p.key !== project.key && p.category === project.category,
  )
  const rank = (p) => (p.badges?.includes('live') ? 0 : 1) + (p.url ? 0 : 1)
  return scored.sort((a, b) => rank(a) - rank(b)).slice(0, 3)
}

/*  The 3D "open" for a project.

    A shared-element transition: the grid card and this panel share a layoutId,
    so Framer interpolates the real card geometry into the panel rather than
    cross-fading two separate things. The grid behind tilts back on X and
    scales down, which is what sells the depth - the card is not growing, the
    rest of the page is receding.

    Progressive enhancement, deliberately. The cards underneath stay real
    anchors; this only intercepts the click. If JS fails the links still
    navigate, which matters because those hrefs are what a crawler follows.  */
const CTA = `mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5
             text-sm font-bold uppercase tracking-[0.08em] text-night
             transition-colors hover:bg-violet hover:text-white`

export default function ProjectSpotlight({ project, onClose, onOpenProject }) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  // Escape to close, and stop the page behind from scrolling under the panel.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!project) return null
  const external = typeof project.url === 'string' && /^https?:\/\//.test(project.url)
  const desc = t(`data.projects.${project.key}`, project.description)
  const CAT_LABELS = { all: 'All', apps: 'Apps', web: 'Web', ai: 'AI / Agents', tool: 'Tools', archived: 'Archived' }
  const category = t(`filter.${project.category}`, CAT_LABELS[project.category] || project.category)
  const related = relatedTo(project)

  /*  Rendered into <body>.

      PageTransition animates `y` on <main>, which leaves a transform on it -
      and a transformed ancestor becomes the containing block for position:
      fixed, so this panel was centring inside <main> rather than the viewport.
      Portalling past it is the fix; the same trap hit the mobile menu.  */
  return createPortal((
    <div className="fixed inset-0 z-[70] grid place-items-center p-4 sm:p-8" role="dialog" aria-modal="true"
         aria-label={project.title}>
      <motion.div
        className="absolute inset-0 bg-night/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/*  Scale-and-fade rather than a layoutId morph.

           Morphing the card into this panel looked better on paper, but a
           shared layoutId cannot cross the portal: Framer measures the card
           inside a transformed <main> and this panel inside <body>, computes a
           delta between two different coordinate spaces, and freezes - the
           panel sat locked at matrix(0.95,0,0,0.66,0,384) indefinitely.
           Being reliably centred matters more than the morph.  */}
      <motion.article
        initial={{ opacity: 0, scale: reduce ? 1 : 0.94, y: reduce ? 0 : 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: reduce ? 1 : 0.97, y: reduce ? 0 : 8 }}
        transition={{ duration: 0.34, ease: EASE }}
        className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto overscroll-contain
                   rounded-2xl bg-nightsoft text-cream border border-white/12 shadow-2xl"
      >
        <button onClick={onClose} aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full
                     bg-night/70 text-cream/70 backdrop-blur transition-colors hover:text-cream">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        {project.image ? (
          <img src={project.image} alt={project.title}
            className="w-full aspect-[16/9] object-cover border-b border-white/10" />
        ) : (
          <div className="aspect-[16/9] border-b border-white/10 bg-gradient-to-br from-violet/25 via-nightsoft to-cyan/15 grid place-items-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-violet text-white shadow-lg">
              <Icon name={project.icon} className="h-8 w-8" />
            </span>
          </div>
        )}

        <div className="p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet">
            {category} · {project.year}
          </p>
          <h2 className="mt-3 font-display font-black text-3xl sm:text-5xl tracking-tight">{project.title}</h2>
          <p className="mt-5 text-cream/65 leading-relaxed max-w-prose">{desc}</p>

          {project.tech?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.tech.map((tech) => (
                <span key={tech} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-cream/70">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Internal products (Canary, Rehab Pro) deserve a CTA too - they just
              route rather than leaving the site. */}
          {project.url && (
            external ? (
              <a href={project.url} target="_blank"
                 rel={project.nofollow ? 'noopener noreferrer nofollow' : 'noopener noreferrer'}
                 className={CTA}>{t('detail.visitLive', 'Visit live →')}</a>
            ) : (
              <Link to={project.url} className={CTA}>
                {t('common.view', 'View →')}
              </Link>
            )
          )}

          {/*  Lateral links into sibling work. These swap the open project in
               place rather than navigating, so the panel stays put and the
               reader keeps browsing the same category.  */}
          {related.length > 0 && onOpenProject && (
            <div className="mt-10 border-t border-white/10 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cream/40">
                {t('detail.related', 'More in {{category}}', { category })}
              </p>
              <ul className="mt-4 flex flex-col gap-1.5">
                {related.map((r) => (
                  <li key={r.key}>
                    <button
                      onClick={() => onOpenProject(r)}
                      className="group flex w-full items-center gap-3 rounded-lg border border-white/10 bg-night/40 px-3.5 py-3 text-left transition-colors hover:border-white/25 hover:bg-night/70"
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-violet/90 text-white">
                        <Icon name={r.icon || 'layers'} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-sm text-cream group-hover:text-white">
                          {r.title}
                        </span>
                        <span className="block truncate text-xs text-cream/45">
                          {(r.tech || []).slice(0, 3).join(' · ')}
                        </span>
                      </span>
                      <span className="shrink-0 text-cream/30 transition-colors group-hover:text-violet" aria-hidden="true">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.article>
    </div>
  ), document.body)
}
