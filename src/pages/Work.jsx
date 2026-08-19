import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Section from '../components/ui/Section'
import Eyebrow from '../components/ui/Eyebrow'
import FilterBar from '../components/work/FilterBar'
import ProjectCard from '../components/work/ProjectCard'
import ProjectSpotlight from '../components/work/ProjectSpotlight'
import WorkIntroTunnel from '../components/work/WorkIntroTunnel'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { projects } from '../data/projects'
import { fadeUp } from '../lib/motion'

export default function Work() {
  const { t } = useTranslation()
  const [active, setActive] = useState('all')
  const [open, setOpen] = useState(null)      // the project being spotlit
  const reduce = useReducedMotion()
  const gridRef = useRef(null)
  const skipIntro = () => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  /*  The corridor plays once per browsing session.
      Decided in a lazy initialiser rather than an effect so the very first
      client render already knows - the app mounts with createRoot, not
      hydrateRoot, so there is no prerender mismatch to worry about, and
      deciding later would flash the grid before the intro appeared.
      Wrapped in try/catch because sessionStorage throws outright in Safari
      private mode rather than returning null.  */
  const [showIntro] = useState(() => {
    try {
      if (sessionStorage.getItem('workIntroSeen')) return false
      sessionStorage.setItem('workIntroSeen', '1')
      return true
    } catch { return true }
  })

  const filtered =
    active === 'all'
      ? projects
      : projects.filter((p) => p.category === active)

  return (
    <>
      {/*  The corridor plays first, then hands off to the page itself. It is
           strictly an intro: every project below exists in the DOM whether or
           not this renders, so nothing here is load-bearing for SEO or for a
           reader who skips it.  */}
      {showIntro && <WorkIntroTunnel onSkip={skipIntro} />}

    <div ref={gridRef}>
    <Section className="pt-24">
      <Eyebrow>{t('work.eyebrow', 'Portfolio')}</Eyebrow>
      <h1 className="font-display font-black text-5xl sm:text-7xl">{t('work.heading', 'Selected work.')}</h1>
      <p className="mt-6 text-lg text-ink/60 max-w-2xl">
        {t('work.subtitle', 'Apps, web platforms, AI agents, and tools — a decade of building.')}
      </p>

      <div className="mt-10">
        <FilterBar active={active} onChange={setActive} />
      </div>

      {/* The grid recedes rather than the card growing - tilting the plane back
          is what reads as depth. Perspective lives on the wrapper so every card
          shares one vanishing point. */}
      <div style={{ perspective: 1400 }} className="mt-10">
        <motion.div
          animate={reduce ? undefined : {
            rotateX: open ? 8 : 0,
            scale: open ? 0.94 : 1,
            filter: open ? 'brightness(0.55)' : 'brightness(1)',
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: '50% 0%' }}
        >
      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div
              layout
              key={p.key}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              <ProjectCard project={p} onOpen={() => setOpen(p)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
        </motion.div>
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-sm text-ink/50">{t('work.empty', 'No projects in this category yet.')}</p>
      )}

      <AnimatePresence>
        {open && <ProjectSpotlight key={open.key} project={open} onClose={() => setOpen(null)} onOpenProject={setOpen} />}
      </AnimatePresence>
    </Section>
    </div>
    </>
  )
}
