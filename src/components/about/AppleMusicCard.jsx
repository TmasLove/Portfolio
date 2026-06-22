import { SITE } from '../../data/site'

// Apple Music embeddable player (previews for everyone, full playback for subscribers).
const PLAYLIST_EMBED =
  'https://embed.music.apple.com/us/playlist/chill-web/pl.u-06oxxNATom9ePX'

export default function AppleMusicCard() {
  return (
    <div className="w-full">
      <iframe
        title="Apple Music — Chill Web playlist"
        allow="autoplay *; encrypted-media *; clipboard-write"
        frameBorder="0"
        height="450"
        loading="lazy"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        src={PLAYLIST_EMBED}
        className="w-full rounded-xl border border-ink/10 bg-transparent"
      />
      <a
        href={SITE.socials.appleMusic}
        target="_blank"
        rel="noopener"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-[#FA2D48] hover:underline"
      >
        @tmizle on Apple Music →
      </a>
    </div>
  )
}
