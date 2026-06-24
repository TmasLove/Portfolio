import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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

const DISCORD_STATUS = {
  online: 'bg-green-400',
  idle: 'bg-yellow-400',
  dnd: 'bg-red-400',
  offline: 'bg-gray-500',
}

// Live Discord presence via Lanyard — shows current activity or status.
function DiscordLive() {
  const [data, setData] = useState(null)
  useEffect(() => {
    let cancelled = false
    fetch(`https://api.lanyard.rest/v1/users/${SITE.discordId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => { if (!cancelled && j && j.success) setData(j.data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const status = data?.discord_status || 'offline'
  const activity = (data?.activities || []).find((a) => a.type !== 4)
  const label = activity ? `Playing ${activity.name}` : status === 'offline' ? 'Offline on Discord' : `${status[0].toUpperCase()}${status.slice(1)} on Discord`

  return (
    <a href={SITE.socials.discord} target="_blank" rel="noopener"
       className="inline-flex items-center gap-2 text-cream/50 hover:text-cream/80 transition-colors">
      <span className={`inline-block w-2 h-2 rounded-full ${DISCORD_STATUS[status]} ${status !== 'offline' ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </a>
  )
}

// Curated "on repeat" — links to Apple Music profile.
function OnRepeat() {
  const { track, artist } = SITE.nowSpinning
  return (
    <a href={SITE.socials.appleMusic} target="_blank" rel="noopener"
       className="inline-flex items-center gap-2 text-cream/50 hover:text-cream/80 transition-colors group">
      <span aria-hidden="true" className="inline-block group-hover:animate-spin">♫</span>
      <span>On repeat: <span className="text-cream/70">{track}</span> — {artist}</span>
    </a>
  )
}

// Rotating cycling-flavored tagline.
function RotatingTagline() {
  const lines = SITE.taglines
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % lines.length), 3200)
    return () => clearInterval(id)
  }, [lines.length])
  return (
    <span className="relative block h-4 overflow-hidden text-xs text-cream/40">
      <AnimatePresence mode="wait">
        <motion.span key={i} className="block"
          initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.4 }}>
          {lines[i]}
        </motion.span>
      </AnimatePresence>
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
            <div className="flex flex-col gap-1">
              <Link to="/" aria-label="Home" className="font-display font-black text-xl tracking-tight">TR</Link>
              <RotatingTagline />
            </div>
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.1em] text-cream/70">
              {NAV.map(([to, label]) => (
                <Link key={to} to={to} className="hover:text-cyan transition-colors">{label}</Link>
              ))}
              <a href="/GRVT.html" className="hover:text-cyan transition-colors">GRVT</a>
            </nav>

            {/* Live "currently" status */}
            <div className="flex flex-col gap-1.5 text-xs">
              <DiscordLive />
              <OnRepeat />
              <a href={SITE.socials.discordServer} target="_blank" rel="noopener"
                 className="inline-flex items-center gap-2 text-cream/50 hover:text-cyan transition-colors">
                <span aria-hidden="true">⊕</span>
                <span>Join the Discord</span>
              </a>
            </div>
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
