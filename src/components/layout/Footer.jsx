import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SITE } from '../../data/site'
import Logo from '../ui/Logo'

// Live Miami time — ticks every second, no API needed.
function MiamiClock() {
  const { t } = useTranslation()
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
      <span className="text-cream/30">{t('footer.inMiami', 'in Miami')}</span>
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
  const { t } = useTranslation()
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
  const englishStatus = status === 'offline' ? 'Offline on Discord' : `${status[0].toUpperCase()}${status.slice(1)} on Discord`
  const label = activity
    ? t('footer.discord.playing', `Playing ${activity.name}`, { name: activity.name })
    : t(`footer.discord.${status}`, englishStatus)

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
  const { t } = useTranslation()
  const { track, artist } = SITE.nowSpinning
  return (
    <a href={SITE.socials.appleMusic} target="_blank" rel="noopener"
       className="inline-flex items-center gap-2 text-cream/50 hover:text-cream/80 transition-colors group">
      <span aria-hidden="true" className="inline-block group-hover:animate-spin">♫</span>
      <span>{t('footer.onRepeat', 'On repeat:')} <span className="text-cream/70">{track}</span> — {artist}</span>
    </a>
  )
}

// Rotating cycling-flavored tagline.
function RotatingTagline() {
  const { t } = useTranslation()
  const lines = t('footer.taglines', { returnObjects: true, defaultValue: SITE.taglines })
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
          {lines[i % lines.length]}
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
const NAV = [['/work', 'Work', 'work'], ['/about', 'About', 'about'], ['/tools', 'Tools', 'tools'], ['/contact', 'Contact', 'contact']]

export default function Footer() {
  const { t } = useTranslation()
  return (
    /*  The footer was pure #000 - a value that appears nowhere else in the
        palette, whose darkest brand colour is night (#0E0E10). Every page
        therefore ended on a hard seam where content stopped and a black slab
        began, which reads as a rendering fault rather than a boundary.

        It now descends from just above night to just below it, so on dark
        pages the join is imperceptible and on light pages it arrives as a
        deliberate close. A hairline fading in from both edges marks the
        transition, instead of the colour change having to do that job.

        Layout moves from two crowded columns to three, so the live
        "currently" block - the part with any personality - stops being an
        afterthought wedged beneath the nav.  */
    <footer className="relative text-cream bg-gradient-to-b from-[#141519] via-[#0E0E10] to-[#0A0A0C]">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px
                                  bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40"
           style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(0,224,198,0.07), transparent 70%)' }} />

      <div className="relative mx-auto max-w-content px-6 md:px-10 py-14 md:py-16">
        <div className="grid gap-10 md:gap-8 md:grid-cols-3">

          {/* Brand + nav */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Logo dark size={42} />
              <RotatingTagline />
            </div>
            <nav className="flex flex-wrap gap-x-5 gap-y-2.5 text-xs font-bold uppercase tracking-[0.1em] text-cream/60">
              {NAV.map(([to, label, key]) => (
                <Link key={to} to={to} className="hover:text-cyan transition-colors">{t(`nav.${key}`, label)}</Link>
              ))}
              <Link to="/canary" className="hover:text-cyan transition-colors">Canary</Link>
              <Link to="/rehabpro" className="hover:text-cyan transition-colors">Rehab Pro</Link>
              <a href="/GRVT.html" className="hover:text-cyan transition-colors">GRVT</a>
            </nav>
          </div>

          {/* Live "currently" - its own panel, so it reads as a signal rather
              than three stray links. */}
          <div className="md:px-6 md:border-x md:border-white/[0.07]">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cream/30 mb-3.5">
              {t('footer.currently', 'Currently')}
            </p>
            <div className="flex flex-col gap-2.5 text-xs">
              <DiscordLive />
              <OnRepeat />
              <a href={SITE.socials.discordServer} target="_blank" rel="noopener"
                 className="inline-flex items-center gap-2 text-cream/50 hover:text-cyan transition-colors w-fit">
                <span aria-hidden="true">&#8853;</span>
                <span>{t('footer.joinDiscord', 'Join the Discord')}</span>
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
              {t('footer.available', 'Available for new projects')}
            </span>
            <Link to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/[0.07]
                             px-5 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-cyan
                             hover:bg-cyan hover:text-night transition-colors w-fit">
              {t('common.getInTouch', 'Get in touch →')}
            </Link>
            <div className="flex gap-2">
              {SOCIALS.map(([key, label]) => (
                <a key={key} href={SITE.socials[key]} target="_blank" rel="noopener" aria-label={label}
                   className="w-9 h-9 grid place-items-center rounded-full border border-white/[0.12] text-cream/70
                              hover:border-cyan hover:text-cyan hover:bg-cyan/[0.06] transition-colors">
                  {ICONS[key]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-cream/35">
          <span>&copy; {new Date().getFullYear()} {SITE.name}. {SITE.location}.</span>
          <MiamiClock />
          <a href="/privacy.html" className="hover:text-cream/70 transition-colors">{t('footer.privacy', 'Privacy')}</a>
        </div>
      </div>
    </footer>
  )
}
