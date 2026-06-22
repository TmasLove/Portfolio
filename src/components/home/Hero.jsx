import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import Eyebrow from '../ui/Eyebrow'
import SplitText from '../ui/SplitText'
import BirdsCanvas from './BirdsCanvas'
import { fadeUp, inView, EASE } from '../../lib/motion'
import { SITE } from '../../data/site'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export default function Hero() {
  const reduce = useReducedMotion()
  return (
    <section className="relative min-h-screen flex items-center bg-cream text-ink overflow-hidden">
      {/* Personal bike-ride backdrop */}
      <video
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-45 [filter:grayscale(0.2)_contrast(1.05)]"
        autoPlay={!reduce}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/video/bike-poster.jpg"
        aria-hidden="true"
      >
        <source src="/video/bike.mp4" type="video/mp4" />
      </video>
      {/* Cream wash — headline stays crisp on the left, the ride shows toward the right */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-cream via-cream/75 to-cream/25" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-cream via-transparent to-transparent" />
      <BirdsCanvas className="pointer-events-none absolute inset-0 z-[1] opacity-40" />
      <Container className="relative z-10 py-28">
        <Eyebrow>{SITE.role} · {SITE.location}</Eyebrow>

        <h1 className="font-display font-black tracking-tight leading-[0.95] text-5xl sm:text-7xl lg:text-8xl max-w-5xl">
          <SplitText text="Building products that" />
          <br />
          <motion.span
            className="font-display italic text-violet inline-block"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          >
            move&nbsp;
          </motion.span>
          <SplitText text="the work forward." />
        </h1>

        <motion.p
          className="mt-8 max-w-xl text-base sm:text-lg text-ink/70 leading-relaxed"
          variants={fadeUp}
          {...inView}
        >
          A Miami-based developer and builder shipping apps, web platforms, and AI
          agents — from dental healthtech to autonomous tools.
        </motion.p>

        <motion.div className="mt-10" variants={fadeUp} {...inView}>
          <Link
            to="/work"
            className="inline-flex items-center gap-2 bg-ink text-cream px-7 py-4 rounded-full text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:bg-violet"
          >
            View the work →
          </Link>
        </motion.div>
      </Container>

      <div className="absolute bottom-8 left-0 right-0">
        <Container>
          <div className="flex items-center gap-3 text-ink/40">
            <span className="text-xs uppercase tracking-[0.22em]">Scroll</span>
            <motion.span
              className="block h-px w-12 bg-ink/30 origin-left"
              animate={{ scaleX: [0.3, 1, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </Container>
      </div>
    </section>
  )
}
