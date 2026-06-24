import { useTranslation } from 'react-i18next'
import { CATEGORIES } from '../../data/projects'

const CATEGORY_LABELS = {
  all: 'All',
  apps: 'Apps',
  web: 'Web',
  ai: 'AI / Agents',
  tool: 'Tools',
  archived: 'Old / Archived',
}

export default function FilterBar({ active, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = cat === active
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors ${
              isActive
                ? 'bg-ink text-cream'
                : 'border border-ink/15 text-ink/70 hover:border-violet hover:text-violet'
            }`}
          >
            {t(`filter.${cat}`, CATEGORY_LABELS[cat] || cat)}
          </button>
        )
      })}
    </div>
  )
}
