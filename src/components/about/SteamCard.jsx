import steam from '../../data/steam.json'
import Reveal from '../ui/Reveal'

export default function SteamCard() {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-night to-nightsoft text-cream p-5">
        <div className="flex items-start gap-4">
          <img
            src={steam.avatar}
            alt={steam.persona}
            className="w-16 h-16 rounded-lg ring-2 ring-cyan/40 object-cover"
            loading="lazy"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-black text-lg">{steam.persona}</h4>
              {steam.status === 'Online' && (
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" title={steam.status} />
              )}
            </div>
            <p className="text-xs text-cream/50">
              Member since {steam.memberSince.split(', ').pop()} · {steam.location}
            </p>
          </div>
        </div>

        {Array.isArray(steam.games) && steam.games.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {steam.games.slice(0, 4).map((g) => (
              <div key={g.appid ?? g.name} className="flex items-center gap-2 text-xs">
                {g.img && (
                  <img src={g.img} alt={g.name} className="h-8 rounded object-cover" loading="lazy" />
                )}
                <span className="truncate">{g.name}</span>
              </div>
            ))}
          </div>
        )}

        <a
          href={steam.profileUrl}
          target="_blank"
          rel="noopener"
          className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-cyan hover:underline"
        >
          View Steam profile →
        </a>
      </div>
    </Reveal>
  )
}
