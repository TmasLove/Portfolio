import { useTranslation } from 'react-i18next'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import Reveal from '../ui/Reveal'
import { FAQ } from '../../data/faq'

// Answer Engine Optimization block.
//
// Two deliberate choices here:
//   1. <details>/<summary> rather than a JS accordion. The answer text stays in
//      the DOM while collapsed, so crawlers and answer engines can read it, and
//      keyboard/screen-reader behaviour comes free from the platform.
//   2. The JSON-LD is built from the same translated strings that render on the
//      page, so the structured data always matches the visible content.
export default function Faq() {
  const { t } = useTranslation()

  const items = FAQ.map((item) => ({
    id: item.id,
    q: t(`faq.items.${item.id}.q`, item.q),
    a: t(`faq.items.${item.id}.a`, item.a),
  }))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <Section id="faq">
      <Eyebrow>{t('faq.eyebrow', 'Questions')}</Eyebrow>
      <Reveal as="h2" className="font-display font-black text-3xl sm:text-4xl tracking-tight max-w-2xl">
        {t('faq.heading', 'Straight answers to what people ask most.')}
      </Reveal>

      <div className="mt-10 max-w-3xl">
        {items.map((item, i) => (
          <Reveal key={item.id}>
            <details
              className={`group border-t border-ink/10 ${i === items.length - 1 ? 'border-b' : ''}`}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 list-none [&::-webkit-details-marker]:hidden">
                <h3 className="font-display font-black text-lg sm:text-xl tracking-tight transition-colors group-open:text-violet group-hover:text-violet">
                  {item.q}
                </h3>
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/50 transition-all duration-300 group-hover:border-violet group-hover:text-violet group-open:rotate-45 group-open:border-violet group-open:bg-violet group-open:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </summary>
              <p className="pb-6 pr-14 text-ink/70 leading-relaxed">{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Section>
  )
}
