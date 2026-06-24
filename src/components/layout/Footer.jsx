import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '../../data/site'

// Live Miami time — ticks every second, no API needed.
function MiamiClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date())
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <span aria-hidden="true">🌴</span>
      <span>{time}</span>
      <span className="text-cream/30">in Miami</span>
    </span>
  )
}

const ICONS = {
  linkedin: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
  instagram: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  strava: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>,
  appleMusic: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-5v-6l5 3z"/></svg>,
}
const SOCIALS = [['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['strava', 'Strava'], ['appleMusic', 'Apple Music']]
const NAV = [['/work', 'Work'], ['/about', 'About'], ['/tools', 'Tools'], ['/contact', 'Contact']]

export default function Footer() {
  return (
    <footer className="bg-black text-cream">
      <div className="mx-auto max-w-content px-6 md:px-10 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand + nav */}
          <div className="flex flex-col gap-5">
            <Link to="/" aria-label="Home" className="font-display font-black text-xl tracking-tight">TR</Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.1em] text-cream/70">
              {NAV.map(([to, label]) => (
                <Link key={to} to={to} className="hover:text-cyan transition-colors">{label}</Link>
              ))}
              <a href="/GRVT.html" className="hover:text-cyan transition-colors">GRVT</a>
            </nav>
          </div>

          {/* Contact + socials */}
          <div className="flex flex-col gap-4 md:items-end">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-cream/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
              </span>
              Available for new projects
            </span>
            <Link to="/contact" className="text-sm font-bold uppercase tracking-[0.08em] text-cyan hover:underline">
              Get in touch →
            </Link>
            <div className="flex gap-2">
              {SOCIALS.map(([key, label]) => (
                <a key={key} href={SITE.socials[key]} target="_blank" rel="noopener" aria-label={label}
                   className="w-9 h-9 grid place-items-center rounded-full border border-white/15 hover:border-cyan hover:text-cyan transition-colors">
                  {ICONS[key]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-cream/40">
          <span>© {new Date().getFullYear()} {SITE.name}. {SITE.location}.</span>
          <MiamiClock />
          <a href="/privacy.html" className="hover:text-cream/70 transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
