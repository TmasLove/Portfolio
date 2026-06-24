import { useTranslation } from 'react-i18next'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import Reveal from '../ui/Reveal'

const MILESTONES = [
  {
    id: 'm1',
    tag: 'TerryCo Group',
    title: 'Building Revenue, Forging Partnerships',
    paras: [
      'Today I operate as CTO and Head of LATAM Sales for the TerryCo Group, driving strategic partnerships and market-driven solutions across pharma, beauty, and wellness. Results include a 25% lift in client engagement through targeted outreach and relationship-first selling.',
      'Years in high-end cycling retail — at Mack Cycle & Fitness and City Bikes Miami — sharpened my ability to align solutions to customer goals and build value-driven relationships in premium markets. Every conversation is a deal; every deal is a relationship.',
    ],
  },
  {
    id: 'm2',
    tag: 'Ironhack · MEAN Stack',
    title: '10 Weeks That Changed Everything',
    paras: [
      'I joined the bootcamp at Ironhack — 10 intense weeks of the MEAN stack crammed into my brain. It taught me that the best way to learn is to be thrown in the deep end. Since then, freelance work and personal projects have kept the skills sharp and the curiosity alive.',
      'The result: I bridge product, sales, and technology in ways that most can’t — comfortable in a boardroom pitch and a codebase at the same time.',
    ],
  },
]

export default function Experience() {
  const { t } = useTranslation()
  return (
    <Section dark>
      <Eyebrow dark>{t('experience.eyebrow', 'Experience')}</Eyebrow>
      <div className="mt-4">
        {MILESTONES.map((m) => (
          <Reveal
            key={m.id}
            className="border-t border-white/10 py-10 grid md:grid-cols-[18rem_1fr] gap-6 md:gap-12"
          >
            <span className="text-sm uppercase tracking-[0.18em] text-cyan">{m.tag}</span>
            <div>
              <h3 className="font-display font-black text-3xl sm:text-4xl">{t(`experience.${m.id}Title`, m.title)}</h3>
              <div className="mt-5 space-y-5 text-cream/60 max-w-2xl">
                {m.paras.map((p, i) => (
                  <p key={i}>{t(`experience.${m.id}p${i + 1}`, p)}</p>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
        <Reveal className="border-t border-b border-white/10 py-6 text-cream/70">
          <span className="text-xs uppercase tracking-[0.18em] text-cyan mr-3">{t('experience.rootsLabel', 'Roots')}</span>
          {t('experience.rootsText', 'Cycling retail — Mack Cycle & Fitness · City Bikes Miami')}
        </Reveal>
      </div>
    </Section>
  )
}
