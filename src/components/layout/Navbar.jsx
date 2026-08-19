import { useState, useEffect, useSyncExternalStore } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { subscribeDarkHero, getDarkHero, getDarkHeroServer } from '../../lib/darkHero'
import Logo, { LogoMark } from '../ui/Logo'

// Tools is deliberately absent: its entries are filtered under Work, and the
// nav has two products to carry now. It stays linked from the footer.
const LINKS = [['/work/', 'Work', 'work'], ['/about/', 'About', 'about'], ['/contact/', 'Contact', 'contact']]

// The two products sit apart from LINKS, each with its own mark. Both are the
// real app icon rather than a drawn glyph: a hand-authored figure for Rehab Pro
// collapsed into an unreadable blob at 18px, and the actual icon is better
// branding anyway - people recognise the thing they are about to download.
const CANARY_ICON = '/canary/canary.png'
const REHAB_ICON  = '/rehabpro/icon.png'

// Routes whose hero is dark from the very top — nav needs light text until scrolled.
// Routes whose hero is dark, so the transparent (unscrolled) bar needs light
// text and the dark-ground logo. Miss one and the nav renders near-invisible -
// dark ink on a dark hero, which is exactly what /canary did until this.
const DARK_ROUTES = ['/contact', '/canary', '/rehabpro']

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
  //
  // The trailing slash matters: GitHub Pages serves these routes at "/canary/",
  // so a direct load or a refresh gives a pathname the bare-string list never
  // matched — the nav went dark-on-dark again the moment you did not arrive by
  // client-side navigation. Normalise before comparing.
  // Some heroes are conditional (the /work corridor plays once per session), so
  // a component can declare one at runtime instead of being listed by route.
  const heroDark = useSyncExternalStore(subscribeDarkHero, getDarkHero, getDarkHeroServer)

  const routeKey = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const onDark = !scrolled && (DARK_ROUTES.includes(routeKey) || heroDark)
  const baseText = onDark ? 'text-cream' : 'text-ink'

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-cream/90 backdrop-blur border-b border-ink/10' : 'bg-transparent'}`}>
        <nav className="mx-auto max-w-content px-6 md:px-10 h-16 flex items-center justify-between">
          <Logo dark={onDark} size={34} />
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
            <NavLink to="/canary/" className={({ isActive }) =>
              `group flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${isActive ? 'text-violet' : `${baseText} hover:text-violet`}`}>
              <img src={CANARY_ICON} alt="" width="18" height="18" className="transition-transform duration-300 group-hover:-translate-y-0.5" />
              Canary
            </NavLink>
            <NavLink to="/rehabpro/" className={({ isActive }) =>
              `group flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${isActive ? 'text-violet' : `${baseText} hover:text-violet`}`}>
              <img src={REHAB_ICON} alt="" width="18" height="18" className="rounded-[4px] transition-transform duration-300 group-hover:-translate-y-0.5" />
              Rehab Pro
            </NavLink>
            <span className={`${baseText} opacity-20`}>|</span>
            <LanguageSwitcher baseText={baseText} />
          </div>
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher baseText={baseText} />
            <button className={`-mr-2 px-2 py-3 text-xs font-bold uppercase tracking-[0.1em] ${baseText}`} onClick={() => setOpen(true)}>{t('nav.menu', 'Menu')}</button>
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
              <LogoMark dark size={32} />
              <button className="text-xs uppercase tracking-[0.1em]" onClick={() => setOpen(false)}>{t('nav.close', 'Close')}</button>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-2 px-8">
              {LINKS.map(([to, label, key], i) => (
                <motion.div key={to} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                  <Link to={to} onClick={() => setOpen(false)} className="font-display font-black text-5xl">{t(`nav.${key}`, label)}</Link>
                </motion.div>
              ))}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * LINKS.length }}>
                <Link to="/canary/" onClick={() => setOpen(false)} className="font-display font-black text-5xl flex items-center gap-3">
                  <img src={CANARY_ICON} alt="" width="46" height="46" />
                  Canary
                </Link>
              </motion.div>
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * (LINKS.length + 1) }}>
                <Link to="/rehabpro/" onClick={() => setOpen(false)} className="font-display font-black text-5xl flex items-center gap-3 whitespace-nowrap">
                  <img src={REHAB_ICON} alt="" width="46" height="46" className="rounded-[10px]" />
                  Rehab Pro
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
