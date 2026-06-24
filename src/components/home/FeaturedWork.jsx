import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { projects } from '../../data/projects'

const FEATURED_KEYS = ['clear-care-dental', 'nst-redesign', 'geo', 'cuatro-group']
const featured = FEATURED_KEYS.map((k) => projects.find((p) => p.key === k)).filter(Boolean)

const spring = { type: 'spring', stiffness: 300, damping: 28 }

export default function FeaturedWork() {
  const { t } = useTranslation()
  return (
    <Section dark>
      <Eyebrow dark>{t('featured.eyebrow', 'Selected work')}</Eyebrow>
      <h2 className="font-display font-black text-4xl sm:text-6xl tracking-tight">
        {t('featured.heading', 'Featured projects')}
      </h2>

      <div className="mt-12">
        {featured.map((p, i) => {
          const external = Boolean(p.url)
          const linkProps = external
            ? { href: p.url, target: '_blank', rel: 'noopener noreferrer' }
            : { to: '/work' }
          const LinkEl = external ? 'a' : Link

          return (
            <Reveal key={p.key}>
              <motion.div
                whileHover={{ x: 6 }}
                transition={spring}
                className={`group border-t border-white/10 ${
                  i === featured.length - 1 ? 'border-b' : ''
                } py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start`}
              >
                <div className="md:col-span-2 flex items-center gap-4">
                  <span className="font-display font-black text-2xl text-cream/40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="grid place-items-center w-10 h-10 rounded-md bg-violet/15 text-violet">
                    <Icon name={p.icon} />
                  </span>
                </div>

                <div className="md:col-span-7">
                  <h3 className="font-display font-black text-3xl sm:text-5xl tracking-tight transition-colors group-hover:text-cyan">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-cream/60 max-w-prose leading-relaxed">
                    {t(`data.projects.${p.key}`, p.description)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="border border-white/15 rounded-full px-2 py-0.5 text-xs text-cream/70"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-3 md:text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-cream/40">
                    {t(`filter.${p.category}`, p.category)} · {p.year}
                  </p>
                  <LinkEl
                    {...linkProps}
                    className="mt-2 inline-block text-sm font-bold text-cream transition-colors group-hover:text-cyan"
                  >
                    {t('common.view', 'View →')}
                  </LinkEl>
                </div>
              </motion.div>
            </Reveal>
          )
        })}
      </div>

      <div className="mt-10">
        <Link to="/work" className="text-cyan text-sm font-bold uppercase tracking-[0.08em]">
          {t('common.seeAllWork', 'See all work →')}
        </Link>
      </div>
    </Section>
  )
}
