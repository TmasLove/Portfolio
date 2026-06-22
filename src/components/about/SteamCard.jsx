import steam from '../../data/steam.json'
import Reveal from '../ui/Reveal'

const SHORTCUTS = [
  ['Profile', ''],
  ['Games', 'games/?tab=all'],
  ['Screenshots', 'screenshots/'],
  ['Groups', 'groups/'],
]

const hours = (min) => `${(min / 60).toFixed(1)}h`

export default function SteamCard() {
  const online = steam.status === 'Online'
  const memberYear = steam.memberSince.split(', ').pop()
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-night to-nightsoft text-cream p-5">
        {/* Header — clickable to profile */}
        <a href={steam.profileUrl} target="_blank" rel="noopener" className="flex items-center gap-4 group/head">
          <img
            src={steam.avatar}
            alt={steam.persona}
            loading="lazy"
            className="w-16 h-16 rounded-lg ring-2 ring-cyan/40 object-cover transition-transform group-hover/head:scale-105"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-black text-lg group-hover/head:text-cyan transition-colors">{steam.persona}</h4>
              {online && <span className="inline-block w-2 h-2 rounded-full bg-green-400" title="Online" />}
            </div>
            <p className="text-xs text-cream/50">Member since {memberYear} · {steam.location}</p>
          </div>
        </a>

        {/* Quick-link chips into the profile */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {SHORTCUTS.map(([label, path]) => (
            <a
              key={label}
              href={steam.profileUrl + path}
              target="_blank"
              rel="noopener"
              className="rounded-full border border-white/15 px-2.5 py-1 text-[0.6rem] uppercase tracking-wide font-bold text-cream/70 hover:border-cyan hover:text-cyan transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Most-played games — clickable tiles to the store */}
        {Array.isArray(steam.games) && steam.games.length > 0 && (
          <div className="mt-5">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-cream/40 mb-2">Most played</p>
            <div className="grid grid-cols-2 gap-2">
              {steam.games.slice(0, 4).map((g) => (
                <a
                  key={g.appid ?? g.name}
                  href={`https://store.steampowered.com/app/${g.appid}`}
                  target="_blank"
                  rel="noopener"
                  className="group/g block rounded-md overflow-hidden border border-white/10 hover:border-cyan transition-colors"
                >
                  {g.img && (
                    <img src={g.img} alt={g.name} loading="lazy" className="w-full aspect-[231/87] object-cover" />
                  )}
                  <div className="px-2 py-1.5">
                    <p className="text-[0.7rem] font-bold truncate group-hover/g:text-cyan transition-colors">{g.name}</p>
                    <p className="text-[0.6rem] text-cream/50">{hours(g.playtime)} played</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <a
          href={steam.profileUrl}
          target="_blank"
          rel="noopener"
          className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-cyan hover:underline"
        >
          View full profile →
        </a>
      </div>
    </Reveal>
  )
}
