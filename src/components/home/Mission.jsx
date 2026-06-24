import { useTranslation } from 'react-i18next'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import SplitText from '../ui/SplitText'

export default function Mission() {
  const { t, i18n } = useTranslation()
  const lng = (i18n.resolvedLanguage || 'en').split('-')[0]
  return (
    <Section>
      <Eyebrow>{t('mission.eyebrow', 'What I do')}</Eyebrow>
      <h2 key={lng} className="font-display leading-tight text-3xl sm:text-4xl lg:text-5xl max-w-4xl">
        <SplitText text={t('mission.heading', 'I design and build digital products end-to-end — from healthtech platforms to AI agents — obsessed with craft, speed, and motion.')} />
      </h2>
    </Section>
  )
}
