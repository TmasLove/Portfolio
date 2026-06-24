import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Section from '../components/ui/Section'
import Container from '../components/ui/Container'
import Eyebrow from '../components/ui/Eyebrow'
import Reveal from '../components/ui/Reveal'
import Icon from '../components/ui/Icon'
import { fadeUp, stagger, inView } from '../lib/motion'

const TOOLS = [
  {
    key: 'ppt-speech',
    name: 'PowerPoint Speech Tool',
    icon: 'presentation',
    badge: 'New',
    url: '/ppt-speech/',
    external: false,
    cta: 'Launch tool',
    desc: "Upload any .pptx and have it read aloud slide-by-slide using your browser's built-in voices. Choose language, speed, navigate freely — zero server, zero upload.",
    tech: ['Client-side', 'TTS', 'Multi-voice', 'Keyboard nav'],
  },
  {
    key: 'effort-tracker',
    name: 'Personal Effort Tracker',
    icon: 'bike',
    badge: 'Hosted',
    url: 'https://local-legend-predictor.onrender.com',
    external: true,
    cta: 'Launch tool',
    desc: 'Connect your Strava and visualise your own segment efforts over the last 90 days. Compare your pace to the same period last year, set personal goals per segment, track progress, and download a shareable PNG card — all using your data only.',
    tech: ['Strava API', 'OAuth', 'Node.js', 'Personal goals', 'Share card'],
  },
  {
    key: 'kom-memorial',
    name: 'KOM Memorial',
    icon: 'activity',
    badge: 'Open Source',
    url: 'https://kom-memorial.vercel.app',
    external: true,
    cta: 'Launch KOM Memorial',
    desc: 'Log every King of the Mountain segment you hold. When someone steals your crown, give it the send-off it deserves — auto-generated funny obituary, days-held counter, and a shareable 1080×1080 PNG memorial card ready for Instagram. No Strava API needed.',
    tech: ['Node.js', 'Express', 'Vercel', 'No API', 'PNG Export'],
  },
  {
    key: 'domain-hub',
    name: 'Domain Hub',
    icon: 'globe',
    badge: 'In Progress',
    wip: true,
    url: 'https://domain-hub-khaki.vercel.app',
    external: true,
    cta: 'Preview Domain Hub',
    desc: "Find, evaluate, and manage domain names for flipping. Auto-generate TLD combinations and score each domain's resale potential with a valuation engine, bulk-register via a simulated Namecheap checkout, and track your portfolio in one dashboard.",
    tech: ['React', 'Vite', 'Node.js', 'Namecheap API', 'WHOIS', 'Vercel'],
  },
]

function BadgePill({ badge }) {
  const { t } = useTranslation()
  const base = 'rounded-full px-2 py-0.5 text-[0.6rem] uppercase tracking-wide font-bold border'
  let style = 'border-white/20 text-cream/60'
  if (badge === 'New') style = 'border-cyan bg-cyan text-night'
  else if (badge === 'In Progress') style = 'border-amber-400 bg-amber-400 text-night'
  return <span className={`${base} ${style}`}>{t(`toolsPage.badge.${badge}`, badge)}</span>
}

function ToolCard({ tool }) {
  const { t } = useTranslation()
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group bg-nightsoft text-cream border border-white/10 rounded-lg overflow-hidden flex flex-col transition-colors hover:border-white/25"
    >
      {/* Accent bar — caution stripes for work-in-progress, gradient otherwise */}
      <div
        className={
          tool.wip
            ? 'h-1.5 bg-[repeating-linear-gradient(45deg,#f59e0b_0,#f59e0b_10px,#1E1F26_10px,#1E1F26_20px)]'
            : 'h-1.5 bg-gradient-to-r from-violet to-cyan'
        }
      />

      {/* Body */}
      <div className="p-6 flex flex-col items-center text-center gap-3 flex-1">
        {/* Icon + badge row */}
        <div className="flex items-center justify-center gap-3">
          <span className="inline-flex w-10 h-10 items-center justify-center rounded-md bg-violet text-white">
            <Icon name={tool.icon} className="w-5 h-5" />
          </span>
          <BadgePill badge={tool.badge} />
        </div>

        <h3 className="font-display font-black text-xl">{t(`data.tools.${tool.key}.name`, tool.name)}</h3>

        <p className="text-sm text-cream/60 leading-relaxed line-clamp-3">{t(`data.tools.${tool.key}.desc`, tool.desc)}</p>

        {tool.wip && (
          <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-500">
            {t('toolsPage.wip', '🚧 Work in progress — still building, expect rough edges.')}
          </p>
        )}

        {/* Tech pills */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {tool.tech.map((tech) => (
            <span
              key={tech}
              className="border border-white/15 rounded-full px-2 py-0.5 text-xs text-cream/70"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-3">
          {tool.external ? (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-cream text-night group-hover:bg-violet group-hover:text-white transition-colors px-5 py-3 rounded-full text-xs font-bold uppercase tracking-[0.08em]"
            >
              ↗ {t(`toolsPage.cta.${tool.cta}`, tool.cta)}
            </a>
          ) : (
            <a
              href={tool.url}
              className="inline-flex items-center gap-2 bg-cream text-night group-hover:bg-violet group-hover:text-white transition-colors px-5 py-3 rounded-full text-xs font-bold uppercase tracking-[0.08em]"
            >
              ↗ {t(`toolsPage.cta.${tool.cta}`, tool.cta)}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default function Tools() {
  const { t } = useTranslation()
  return (
    <Section className="pt-24">
      <Container>
        {/* Hero */}
        <Reveal>
          <Eyebrow>{t('toolsPage.eyebrow', 'Utilities')}</Eyebrow>
          <h1 className="font-display font-black text-5xl sm:text-7xl mt-4">{t('toolsPage.heading', 'Tools.')}</h1>
          <p className="mt-4 text-lg text-ink/60 max-w-xl">
            {t('toolsPage.subtitle', 'Practical utilities — built to solve real problems.')}
          </p>
        </Reveal>

        {/* Cards grid */}
        <motion.div
          className="mt-16 grid sm:grid-cols-2 gap-6"
          variants={stagger(0.1, 0.2)}
          {...inView}
        >
          {TOOLS.map((tool) => (
            <ToolCard key={tool.key} tool={tool} />
          ))}
        </motion.div>
      </Container>
    </Section>
  )
}
