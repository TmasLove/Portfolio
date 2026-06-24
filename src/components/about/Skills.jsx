import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import Reveal from '../ui/Reveal'
import { stagger, fadeUp, inView } from '../../lib/motion'

const SKILLS = [
  'Strategic Sales',
  'Business Development',
  'Pharma & Wellness',
  'Partnership Building',
  'HTML / CSS',
  'JavaScript',
  'Node.js',
  'Express',
  'MongoDB',
  'React',
  'Git / GitHub',
  'Shopify',
  'Always Learning',
]

export default function Skills() {
  const { t } = useTranslation()
  return (
    <Section>
      <Eyebrow>{t('skills.eyebrow', 'Toolkit')}</Eyebrow>
      <Reveal as="h2" className="font-display font-black text-4xl">
        {t('skills.heading', 'What I work with')}
      </Reveal>
      <motion.ul
        className="mt-8 flex flex-wrap gap-3"
        variants={stagger(0.05)}
        {...inView}
      >
        {SKILLS.map((s, i) => (
          <motion.li
            key={s}
            variants={fadeUp}
            className="border border-ink/15 rounded-full px-3 py-1 text-sm"
          >
            {t(`skills.items.${i}`, s)}
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  )
}
