import Section from '../ui/Section'
import Reveal from '../ui/Reveal'
import CountUp from '../ui/CountUp'
import { SITE } from '../../data/site'

export default function Stats() {
  return (
    <Section dark>
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {SITE.stats.map((s, i) => (
          <Reveal
            key={s.label}
            className={`py-6 sm:py-0 sm:px-10 ${
              i > 0 ? 'sm:border-l border-white/10' : ''
            }`}
          >
            <CountUp
              to={s.n}
              suffix={s.suffix}
              className="block font-display font-black text-5xl sm:text-6xl text-cyan"
            />
            <span className="mt-3 block text-cream/50 uppercase text-xs tracking-wide">
              {s.label}
            </span>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
