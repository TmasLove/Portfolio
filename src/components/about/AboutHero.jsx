import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import SplitText from '../ui/SplitText'
import Reveal from '../ui/Reveal'
import { EASE } from '../../lib/motion'

const FACTS = [
  { key: 'Based in', label: 'Based in', value: 'Miami, FL' },
  { key: 'Born in', label: 'Born in', value: 'Medellín, Colombia' },
  { key: 'Position', label: 'Position', value: 'CTO · Head of LATAM Sales · TerryCo Group', tkey: 'position' },
  { key: 'Passion', label: 'Passion', value: 'Fast cars, fixed bikes, sharp design, clean code & the close', tkey: 'passion' },
]

export default function AboutHero() {
  const { t, i18n } = useTranslation()
  const lng = (i18n.resolvedLanguage || 'en').split('-')[0]
  return (
    <Section className="pt-24">
      <Eyebrow>{t('aboutHero.eyebrow', 'About')}</Eyebrow>
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        <div>
          <h1 key={lng} className="font-display font-black text-5xl sm:text-7xl leading-[0.95]">
            <SplitText text={t('aboutHero.line1', 'Builder, rider,')} />
            <span className="block italic text-violet">{t('aboutHero.line2', 'Miami native.')}</span>
          </h1>
          <Reveal className="mt-6 text-lg text-ink/70 max-w-md">
            {t('aboutHero.blurb', 'Developer & creative bridging business, sales, and technology — building since 2015.')}
          </Reveal>
          <Reveal as="dl" className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6">
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt className="text-xs uppercase tracking-[0.18em] text-ink/40">{t(`aboutHero.facts.labels.${f.key}`, f.label)}</dt>
                <dd className="mt-1 font-bold">{f.tkey ? t(`aboutHero.facts.${f.tkey}`, f.value) : f.value}</dd>
              </div>
            ))}
          </Reveal>
        </div>
        <div className="overflow-hidden rounded-sm">
          <motion.img
            src="/images/tomcat.jpeg"
            alt="Tommy Roldan"
            className="w-full aspect-[4/5] object-cover rounded-sm"
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </div>
      </div>
    </Section>
  )
}
