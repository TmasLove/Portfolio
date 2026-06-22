import { motion } from 'framer-motion'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import Reveal from '../ui/Reveal'
import { SITE } from '../../data/site'

const DESCRIPTORS = {
  Apps: 'Cross-platform apps with React Native & Expo.',
  Web: 'Fast, modern marketing sites & web platforms.',
  'AI Agents': 'Autonomous agents & AI-powered tools.',
  Tools: 'Useful utilities that solve real problems.',
}

const spring = { type: 'spring', stiffness: 300, damping: 28 }

export default function Capabilities() {
  const items = SITE.capabilities
  return (
    <Section>
      <Eyebrow>Capabilities</Eyebrow>
      <div className="mt-8">
        {items.map((cap, i) => (
          <Reveal key={cap}>
            <motion.div
              whileHover={{ x: 6 }}
              transition={spring}
              className={`group border-t border-ink/10 ${
                i === items.length - 1 ? 'border-b' : ''
              } py-6 flex items-baseline justify-between gap-6`}
            >
              <div className="flex items-baseline gap-5">
                <span className="font-display font-black text-base text-ink/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="relative font-display font-black text-3xl sm:text-4xl tracking-tight">
                  {cap}
                  <span className="absolute left-0 -bottom-1 h-0.5 bg-violet w-0 transition-all duration-500 group-hover:w-full" />
                </span>
              </div>
              <span className="text-ink/50 hidden sm:block text-right max-w-xs">
                {DESCRIPTORS[cap]}
              </span>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
