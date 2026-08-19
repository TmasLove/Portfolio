import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { SITE } from '../../data/site'

const META = {
  Apps: {
    desc: 'iOS & Android apps with React Native & Expo.',
    icon: 'smartphone',
    tags: ['React Native', 'Expo', 'iOS', 'Android'],
    href: '/work/',
  },
  Web: {
    desc: 'Fast websites, e-commerce & Shopify for small businesses.',
    icon: 'globe',
    tags: ['React', 'Shopify', 'E-commerce', 'SEO'],
    href: '/work/',
  },
  'AI Agents': {
    desc: 'Custom AI agents & workflow automation.',
    icon: 'bot',
    tags: ['AI Agents', 'Automation', 'LLMs'],
    href: '/work/',
  },
  Tools: {
    desc: 'Practical web tools that solve real problems.',
    icon: 'wrench',
    tags: ['Utilities', 'Web Speech', 'APIs'],
    href: '/tools/',
  },
}

const spring = { type: 'spring', stiffness: 300, damping: 28 }

function CapabilityRow({ name, index, isLast }) {
  const { t } = useTranslation()
  const meta = META[name] || { desc: '', icon: 'layers', tags: [], href: '/work/' }
  const displayName = t(`capabilities.names.${name}`, name)
  const desc = t(`capabilities.desc.${name}`, meta.desc)
  const rowRef = useRef(null)

  // Cursor-following spotlight — set CSS vars directly for perf (no re-render).
  const handleMove = (e) => {
    const el = rowRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <Reveal>
      <Link
        to={meta.href}
        ref={rowRef}
        onMouseMove={handleMove}
        aria-label={`${displayName} — ${desc}`}
        className={`group relative block overflow-hidden border-t border-ink/10 ${
          isLast ? 'border-b' : ''
        }`}
      >
        {/* Cursor spotlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(90,100,232,0.10), transparent 70%)',
          }}
        />

        {/* Ghost watermark icon */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/[0.04] transition-all duration-500 group-hover:text-violet/10 group-hover:scale-110"
        >
          <Icon name={meta.icon} className="w-24 h-24 sm:w-28 sm:h-28" />
        </span>

        <motion.div
          whileHover={{ x: 8 }}
          transition={spring}
          className="relative flex items-center justify-between gap-6 py-7 pl-1 pr-3 sm:pr-4"
        >
          <div className="min-w-0">
            <div className="flex items-baseline gap-4 sm:gap-5">
              <span className="font-display font-black text-sm text-ink/30 transition-colors duration-300 group-hover:text-violet tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="relative font-display font-black text-3xl sm:text-4xl tracking-tight transition-colors duration-300 group-hover:text-violet">
                {displayName}
                <span className="absolute left-0 -bottom-1 h-0.5 bg-violet w-0 transition-all duration-500 group-hover:w-full" />
              </span>
            </div>

            {/* Tags — revealed on hover */}
            <div className="mt-0 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:mt-3 group-hover:max-h-12 group-hover:opacity-100">
              <div className="flex flex-wrap gap-1.5 pl-9 sm:pl-10">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-violet/30 bg-violet/5 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-violet"
                  >
                    {t(`capabilities.tags.${tag}`, tag)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Descriptor + arrow */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <span className="text-ink/50 text-right max-w-xs transition-colors duration-300 group-hover:text-ink/70">
              {desc}
            </span>
            <span className="grid place-items-center w-9 h-9 rounded-full border border-ink/15 text-ink/40 transition-all duration-300 group-hover:border-violet group-hover:bg-violet group-hover:text-white group-hover:-rotate-45">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </motion.div>
      </Link>
    </Reveal>
  )
}

export default function Capabilities() {
  const { t } = useTranslation()
  const items = SITE.capabilities
  return (
    <Section>
      <Eyebrow>{t('capabilities.eyebrow', 'Services')}</Eyebrow>
      <Reveal as="h2" className="font-display font-black text-3xl sm:text-4xl tracking-tight max-w-2xl">
        {t('capabilities.heading', 'Web, apps & AI — built for startups and small businesses.')}
      </Reveal>
      <div className="mt-10">
        {items.map((cap, i) => (
          <CapabilityRow key={cap} name={cap} index={i} isLast={i === items.length - 1} />
        ))}
      </div>
    </Section>
  )
}
