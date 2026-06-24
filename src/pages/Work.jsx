import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '../components/ui/Container'
import Eyebrow from '../components/ui/Eyebrow'
import AnimatedBlobs from '../components/ui/AnimatedBlobs'
import InteractiveField from '../components/ui/InteractiveField'
import FilterBar from '../components/work/FilterBar'
import ProjectCard from '../components/work/ProjectCard'
import { projects } from '../data/projects'
import { fadeUp } from '../lib/motion'

export default function Work() {
  const [active, setActive] = useState('all')

  const filtered =
    active === 'all'
      ? projects
      : projects.filter((p) => p.category === active)

  return (
    <section className="relative isolate overflow-hidden bg-cream text-ink min-h-screen">
      {/* Interactive background — aurora wash + cursor-reactive constellation */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <AnimatedBlobs className="absolute inset-0" />
        <InteractiveField className="absolute inset-0" />
        {/* Soft fade so cards near the bottom stay crisp */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream to-transparent" />
      </div>

      <Container className="relative z-10 pt-24 pb-28">
        <Eyebrow>Portfolio</Eyebrow>
        <h1 className="font-display font-black text-5xl sm:text-7xl">Selected work.</h1>
        <p className="mt-6 text-lg text-ink/60 max-w-2xl">
          Apps, web platforms, AI agents, and tools — a decade of building.
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
          <p className="mt-10 text-sm text-ink/50">No projects in this category yet.</p>
        )}
      </Container>
    </section>
  )
}
