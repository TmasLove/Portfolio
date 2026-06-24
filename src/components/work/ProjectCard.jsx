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
  private: 'border-violet/50 text-violet',
  public: 'border-white/20 text-cream/60',
  live: 'bg-cyan text-night border-cyan',
  archived: 'border-white/15 text-cream/40',
}

const CARD = 'group flex flex-col bg-nightsoft border border-white/10 rounded-lg overflow-hidden h-full text-cream transition-colors hover:border-white/25'
const HOVER = { whileHover: { y: -6 }, transition: { type: 'spring', stiffness: 300, damping: 24 } }

function Badge({ kind }) {
  return (
    <span
      className={`text-[0.6rem] tracking-wide font-bold px-2 py-0.5 rounded-full border uppercase ${
        BADGE_STYLES[kind] || 'border-white/20 text-cream/60'
      }`}
    >
      {kind}
    </span>
  )
}

export default function ProjectCard({ project }) {
  const categoryLabel = CATEGORY_LABELS[project.category] || project.category
  const isArchived = project.image && project.category === 'archived'

  if (isArchived) {
    return (
      <Link to={'/work/' + project.key} className="block h-full">
        <motion.article {...HOVER} className={CARD}>
          <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10">
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 bg-night/85 backdrop-blur-[2px] transition-opacity duration-500 group-hover:opacity-0">
              <span className="text-[0.6rem] tracking-[0.3em] uppercase text-cream/40 mb-2">— Archived —</span>
              <h3 className="font-display font-black text-lg text-cream leading-tight">{project.title}</h3>
              <p className="mt-2 text-xs text-cream/55 max-w-[30ch] leading-snug">{project.description}</p>
            </div>
          </div>

          <div className="p-5 mt-auto flex items-center justify-center text-xs">
            <span className="text-cream/40 font-bold">Old / Archived · {project.year}</span>
          </div>
        </motion.article>
      </Link>
    )
  }

  return (
    <Link to={'/work/' + project.key} className="block h-full">
      <motion.article {...HOVER} className={CARD}>
        {project.image ? (
          <div className="aspect-[16/9] overflow-hidden border-b border-white/10">
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

        <div className="p-5 flex flex-col items-center text-center gap-3 flex-1">
          {!project.image && (
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-md bg-violet text-white">
              <Icon name={project.icon} className="w-5 h-5" />
            </span>
          )}

          {project.badges && project.badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {project.badges.map((b) => (
                <Badge key={b} kind={b} />
              ))}
            </div>
          )}

          <h3 className="font-display font-black text-lg text-cream">{project.title}</h3>
          <p className="text-sm text-cream/60 leading-relaxed line-clamp-3">{project.description}</p>

          {project.tech && project.tech.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="border border-white/15 rounded-full px-2 py-0.5 text-xs text-cream/70"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-white/10 w-full flex items-center justify-center gap-4 text-xs">
            <span className="text-violet font-bold">
              {categoryLabel} · {project.year}
            </span>
            {project.url && (
              <span className="text-cream/70 font-bold group-hover:text-cyan transition-colors">
                Visit →
              </span>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
