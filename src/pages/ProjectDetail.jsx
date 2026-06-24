import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Section from '../components/ui/Section'
import Reveal from '../components/ui/Reveal'
import { projects } from '../data/projects'

const CATEGORY_LABELS = {
  all: 'All',
  apps: 'Apps',
  web: 'Web',
  ai: 'AI / Agents',
  tool: 'Tools',
  archived: 'Old / Archived',
}

const BADGE_STYLES = {
  private: 'border-violet/40 text-violet',
  public: 'border-ink/20 text-ink/60',
  live: 'bg-cyan text-night border-cyan',
  archived: 'border-ink/15 text-ink/40',
}

export default function ProjectDetail() {
  const { t } = useTranslation()
  const { key } = useParams()
  const project = projects.find((p) => p.key === key)

  if (!project) {
    return (
      <Section className="pt-24">
        <h1 className="font-display font-black text-4xl sm:text-6xl">{t('detail.notFound', 'Not found.')}</h1>
        <p className="mt-6 text-lg text-ink/60">
          {t('detail.notFoundBody', "We couldn't find that project.")}
        </p>
        <Link
          to="/work"
          className="inline-block mt-6 text-sm font-bold text-violet hover:underline"
        >
          {t('detail.allWork', '← All work')}
        </Link>
      </Section>
    )
  }

  const categoryLabel = t(`filter.${project.category}`, CATEGORY_LABELS[project.category] || project.category)

  return (
    <Section className="pt-24">
      <Link
        to="/work"
        className="inline-block text-sm font-bold text-violet hover:underline"
      >
        {t('detail.allWork', '← All work')}
      </Link>

      <Reveal className="mt-8">
        {project.badges && project.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {project.badges.map((b) => (
              <span
                key={b}
                className={`text-[0.6rem] tracking-wide font-bold px-2 py-0.5 rounded-full border uppercase ${
                  BADGE_STYLES[b] || 'border-ink/20 text-ink/60'
                }`}
              >
                {t(`badges.${b}`, b)}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-display font-black text-5xl sm:text-7xl">{project.title}</h1>

        <p className="mt-4 text-violet font-bold text-sm">
          {categoryLabel} · {project.year}
        </p>

        <p className="mt-6 text-lg text-ink/70 max-w-2xl leading-relaxed">
          {t(`data.projects.${project.key}`, project.description)}
        </p>

        {project.tech && project.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-6">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="border border-ink/15 rounded-full px-2 py-0.5 text-xs text-ink/70"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.url && (
          <div className="mt-8">
            <a
              href={project.url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 bg-violet text-white px-7 py-4 rounded-full text-sm font-bold uppercase tracking-[0.08em]"
            >
              {t('detail.visitLive', 'Visit live →')}
            </a>
          </div>
        )}
      </Reveal>

      {project.image && (
        <Reveal className="mt-12">
          <img
            src={project.image}
            alt={project.title}
            className="w-full rounded-lg border border-ink/10"
          />
        </Reveal>
      )}
    </Section>
  )
}
