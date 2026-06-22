import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import Reveal from '../ui/Reveal'

export default function Story() {
  return (
    <Section>
      <Eyebrow>Origin story</Eyebrow>
      <Reveal as="h2" className="font-display font-black text-4xl">
        From Medellín to Key Biscayne
      </Reveal>
      <div className="mt-8 space-y-6 text-ink/70 max-w-2xl">
        <Reveal as="p">
          Born in Medellín, Colombia and raised on Key Biscayne — a small, private island just off
          the coast of Miami. Growing up with entrepreneurial parents, the hustle was in the blood
          from day one. Business Management felt like a natural fit, and it was.
        </Reveal>
        <Reveal as="p">
          But early on, a fascination with technology started pulling equally hard. From CyberSec
          curiosity to a full dive into web development, I found a way to bring both worlds together —
          business grit backed by real technical ability.
        </Reveal>
      </div>
    </Section>
  )
}
