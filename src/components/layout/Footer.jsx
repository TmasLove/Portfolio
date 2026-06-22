import { Link } from 'react-router-dom'
import { SITE } from '../../data/site'
import AnimatedBlobs from '../ui/AnimatedBlobs'

const ICONS = {
  linkedin: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  strava: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>,
  appleMusic: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-5v-6l5 3z"/></svg>,
}
const SOCIALS = [['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['strava', 'Strava'], ['appleMusic', 'Apple Music']]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night text-cream">
      <AnimatedBlobs className="absolute inset-0 -z-0 opacity-50" />
      <div className="relative z-10 mx-auto max-w-content px-6 md:px-10 py-20 md:py-28">
        <p className="text-xs tracking-[0.22em] uppercase text-cyan mb-6">Get in touch</p>
        <h2 className="font-display font-black text-5xl md:text-7xl leading-[0.95] tracking-tight">
          Let's build something.
        </h2>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 mt-8 bg-violet text-white px-7 py-4 rounded-full text-sm font-bold uppercase tracking-[0.08em] hover:bg-cyan hover:text-night transition-colors"
        >
          Contact me →
        </Link>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          {SOCIALS.map(([key, label]) => (
            <a key={key} href={SITE.socials[key]} target="_blank" rel="noopener" aria-label={label}
               className="w-11 h-11 grid place-items-center rounded-full border border-white/15 hover:border-cyan hover:text-cyan transition-colors">
              {ICONS[key]}
            </a>
          ))}
        </div>

        <div className="mt-16 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-cream/50">
          <span>© {new Date().getFullYear()} {SITE.name}. {SITE.location}.</span>
          <a href="/privacy.html" className="hover:text-cream">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
