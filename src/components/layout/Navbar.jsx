import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const LINKS = [['/work', 'Work', 'work'], ['/about', 'About', 'about'], ['/tools', 'Tools', 'tools'], ['/contact', 'Contact', 'contact']]

// Canary is a product rather than another section of the portfolio, so it sits
// apart from LINKS with its own mark.
const CANARY_ICON = '/canary/canary.png'

// Routes whose hero is dark from the very top — nav needs light text until scrolled.
const DARK_ROUTES = ['/contact']

export default function Navbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Light text when sitting (unscrolled) over a dark hero; dark text otherwise / once the cream bar appears.
  const onDark = !scrolled && DARK_ROUTES.includes(pathname)
  const baseText = onDark ? 'text-cream' : 'text-ink'

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-cream/90 backdrop-blur border-b border-ink/10' : 'bg-transparent'}`}>
        <nav className="mx-auto max-w-content px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" className={`font-display font-black text-lg tracking-tight ${baseText}`}>TR</Link>
          <div className="hidden md:flex items-center gap-4">
            <ul className="flex items-center gap-1">
              {LINKS.map(([to, label, key]) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) =>
                    `px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${isActive ? 'text-violet' : `${baseText} hover:text-violet`}`}>
                    {t(`nav.${key}`, label)}
                  </NavLink>
                </li>
              ))}
            </ul>
            <span className={`${baseText} opacity-20`}>|</span>
            <NavLink to="/canary" className={({ isActive }) =>
              `group flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${isActive ? 'text-violet' : `${baseText} hover:text-violet`}`}>
              <img src={CANARY_ICON} alt="" width="18" height="18" className="transition-transform duration-300 group-hover:-translate-y-0.5" />
              Canary
            </NavLink>
            <span className={`${baseText} opacity-20`}>|</span>
            <LanguageSwitcher baseText={baseText} />
          </div>
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher baseText={baseText} />
            <button className={`text-xs font-bold uppercase tracking-[0.1em] ${baseText}`} onClick={() => setOpen(true)}>{t('nav.menu', 'Menu')}</button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay — rendered OUTSIDE <header> so the header's backdrop-blur
          (a backdrop-filter, which creates a containing block for position:fixed) can't
          clip this full-screen layer when the page is scrolled. */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] bg-night text-cream flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between items-center px-6 h-16">
              <span className="font-display font-black">TR</span>
              <button className="text-xs uppercase tracking-[0.1em]" onClick={() => setOpen(false)}>{t('nav.close', 'Close')}</button>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-2 px-8">
              {LINKS.map(([to, label, key], i) => (
                <motion.div key={to} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                  <Link to={to} onClick={() => setOpen(false)} className="font-display font-black text-5xl">{t(`nav.${key}`, label)}</Link>
                </motion.div>
              ))}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * LINKS.length }}>
                <Link to="/canary" onClick={() => setOpen(false)} className="font-display font-black text-5xl flex items-center gap-3">
                  <img src={CANARY_ICON} alt="" width="46" height="46" />
                  Canary
                </Link>
              </motion.div>
            </div>
            <div className="px-8 pb-10">
              <LanguageSwitcher baseText="text-cream" className="text-base" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
