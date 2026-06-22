import { useEffect, useState } from 'react'
import { SITE } from '../../data/site'

const STATUS = {
  online: { color: 'bg-green-400', label: 'Online' },
  idle: { color: 'bg-yellow-400', label: 'Idle' },
  dnd: { color: 'bg-red-400', label: 'Do Not Disturb' },
  offline: { color: 'bg-gray-500', label: 'Offline' },
}

const DiscordGlyph = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.2.36-.43.85-.593 1.23a18.27 18.27 0 0 0-3.93 0A12.6 12.6 0 0 0 11.44 3a19.7 19.7 0 0 0-3.76 1.37C3.94 8.06 3.13 11.65 3.43 15.19a19.9 19.9 0 0 0 6.07 3.08c.49-.67.93-1.39 1.31-2.13-.72-.27-1.4-.6-2.05-.99.17-.13.34-.26.5-.4 3.95 1.85 8.23 1.85 12.13 0 .17.14.33.27.5.4-.65.39-1.34.72-2.06.99.38.74.82 1.46 1.31 2.13a19.9 19.9 0 0 0 6.07-3.08c.36-4.1-.92-7.66-3.86-10.82ZM9.68 13.5c-.95 0-1.73-.87-1.73-1.95s.76-1.95 1.73-1.95c.97 0 1.75.88 1.73 1.95 0 1.08-.77 1.95-1.73 1.95Zm4.64 0c-.95 0-1.73-.87-1.73-1.95s.76-1.95 1.73-1.95c.97 0 1.75.88 1.73 1.95 0 1.08-.76 1.95-1.73 1.95Z" />
  </svg>
)

const CARD = 'relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#5865F2] to-night text-cream p-5'

export default function DiscordCard() {
  const id = SITE.discordId
  const profileUrl = SITE.socials.discord
  const [data, setData] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`https://api.lanyard.rest/v1/users/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        if (j && j.success) setData(j.data)
        else setFailed(true)
      })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [id])

  // Fallback (not yet monitored by Lanyard, or fetch failed)
  if (failed || !data) {
    return (
      <div className={CARD}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-white/15 grid place-items-center text-white">
            <DiscordGlyph />
          </div>
          <div>
            <h4 className="font-display font-black text-lg">Discord</h4>
            <p className="text-xs text-cream/70">{failed ? 'Say hi — open to a chat' : 'Loading…'}</p>
          </div>
        </div>
        <a href={profileUrl} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-white hover:underline">
          Add on Discord →
        </a>
      </div>
    )
  }

  const user = data.discord_user || {}
  const status = STATUS[data.discord_status] || STATUS.offline
  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : 'https://cdn.discordapp.com/embed/avatars/0.png'
  const name = user.global_name || user.username || 'Discord'
  const activity = (data.activities || []).find((a) => a.type !== 4) // skip custom status

  return (
    <div className={CARD}>
      <div className="flex items-center gap-4">
        <img src={avatar} alt={name} className="w-16 h-16 rounded-lg ring-2 ring-white/30 object-cover" loading="lazy" />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display font-black text-lg">{name}</h4>
            <span className={`inline-block w-2 h-2 rounded-full ${status.color}`} title={status.label} />
          </div>
          <p className="text-xs text-cream/70">{user.username ? `@${user.username}` : ''} · {status.label}</p>
          {activity && <p className="mt-0.5 text-xs text-cream/60">Playing {activity.name}</p>}
        </div>
      </div>
      <a href={profileUrl} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-white hover:underline">
        Add on Discord →
      </a>
    </div>
  )
}
