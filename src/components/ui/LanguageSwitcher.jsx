import { useTranslation } from 'react-i18next'

// Compact EN | ES toggle. `dark` flips the base text color for light-on-dark surfaces.
export default function LanguageSwitcher({ className = '', baseText = 'text-ink' }) {
  const { i18n, t } = useTranslation()
  const lng = (i18n.resolvedLanguage || 'en').split('-')[0]

  const set = (l) => () => i18n.changeLanguage(l)
  const item = (l, label) =>
    lng === l
      ? <span className="text-violet">{label}</span>
      : <button type="button" onClick={set(l)} className={`${baseText} hover:text-violet transition-colors`}>{label}</button>

  return (
    <div className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em] ${className}`} aria-label={t('lang.switch', 'Change language')}>
      {item('en', 'EN')}
      <span className="opacity-30">/</span>
      {item('es', 'ES')}
    </div>
  )
}
