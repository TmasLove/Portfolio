import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from '../ui/Icon'
import { EASE } from '../../lib/motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

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

export default function ProjectSpotlight({ project, onClose }) {
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
  const category = t(`filter.${project.category}`, project.category)

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
              <a href={project.url} target="_blank" rel="noopener noreferrer"
                 className={CTA}>{t('detail.visitLive', 'Visit live →')}</a>
            ) : (
              <Link to={project.url} className={CTA}>
                {t('common.view', 'View →')}
              </Link>
            )
          )}
        </div>
      </motion.article>
    </div>
  ), document.body)
}
