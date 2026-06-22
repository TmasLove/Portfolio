import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../ui/Icon'

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

function Badge({ kind }) {
  return (
    <span
      className={`text-[0.6rem] tracking-wide font-bold px-2 py-0.5 rounded-full border uppercase ${
        BADGE_STYLES[kind] || 'border-ink/20 text-ink/60'
      }`}
    >
      {kind}
    </span>
  )
}

export default function ProjectCard({ project }) {
  const categoryLabel = CATEGORY_LABELS[project.category] || project.category

  return (
    <Link to={'/work/' + project.key} className="block h-full">
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="group block bg-white border border-ink/10 rounded-lg overflow-hidden h-full"
      >
        {project.image ? (
          <div className="aspect-[16/9] overflow-hidden border-b border-ink/10">
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="h-1.5 bg-gradient-to-r from-violet to-cyan" />
        )}

        <div className="p-5 flex flex-col gap-3">
          {!project.image && (
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-md bg-violet text-white">
              <Icon name={project.icon} className="w-5 h-5" />
            </span>
          )}

          {project.badges && project.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.badges.map((b) => (
                <Badge key={b} kind={b} />
              ))}
            </div>
          )}

          <h3 className="font-display font-black text-lg">{project.title}</h3>
          <p className="text-sm text-ink/60 leading-relaxed">{project.description}</p>

          {project.tech && project.tech.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="border border-ink/15 rounded-full px-2 py-0.5 text-xs text-ink/70"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-ink/10 flex items-center justify-between text-xs">
            <span className="text-violet font-bold">
              {categoryLabel} · {project.year}
            </span>
            {project.url && (
              <span className="text-ink/70 font-bold group-hover:text-violet transition-colors">
                Visit →
              </span>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
