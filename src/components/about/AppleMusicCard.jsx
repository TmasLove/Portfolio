import { SITE } from '../../data/site'

const MusicGlyph = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

export default function AppleMusicCard() {
  return (
    <div className="relative w-full md:w-80 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#FA2D48] to-[#FB5C74] text-white p-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-white/15 grid place-items-center text-white">
          <MusicGlyph />
        </div>
        <div>
          <h4 className="font-display font-black text-lg">Apple Music</h4>
          <p className="text-xs text-white/80">@tmizle</p>
        </div>
      </div>
      <a href={SITE.socials.appleMusic} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-white hover:underline">
        Open Apple Music →
      </a>
    </div>
  )
}
