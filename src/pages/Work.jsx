import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Section from '../components/ui/Section'
import Eyebrow from '../components/ui/Eyebrow'
import FilterBar from '../components/work/FilterBar'
import ProjectCard from '../components/work/ProjectCard'
import { projects } from '../data/projects'
import { fadeUp } from '../lib/motion'

export default function Work() {
  const { t } = useTranslation()
  const [active, setActive] = useState('all')

  const filtered =
    active === 'all'
      ? projects
      : projects.filter((p) => p.category === active)

  return (
    <Section className="pt-24">
      <Eyebrow>{t('work.eyebrow', 'Portfolio')}</Eyebrow>
      <h1 className="font-display font-black text-5xl sm:text-7xl">{t('work.heading', 'Selected work.')}</h1>
      <p className="mt-6 text-lg text-ink/60 max-w-2xl">
        {t('work.subtitle', 'Apps, web platforms, AI agents, and tools — a decade of building.')}
      </p>

      <div className="mt-10">
        <FilterBar active={active} onChange={setActive} />
      </div>

      <motion.div layout className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-10 text-sm text-ink/50">{t('work.empty', 'No projects in this category yet.')}</p>
      )}
    </Section>
  )
}
