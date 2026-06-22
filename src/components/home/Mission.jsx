import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import SplitText from '../ui/SplitText'

export default function Mission() {
  return (
    <Section>
      <Eyebrow>What I do</Eyebrow>
      <h2 className="font-display leading-tight text-3xl sm:text-4xl lg:text-5xl max-w-4xl">
        <SplitText text="I design and build digital products end-to-end — from healthtech platforms to AI agents — obsessed with craft, speed, and motion." />
      </h2>
    </Section>
  )
}
