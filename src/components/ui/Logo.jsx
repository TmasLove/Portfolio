import { Link } from 'react-router-dom'

/*  The TR/ identity.

    Three pieces from the same system, so the header, the footer and a favicon
    never drift apart:

      mark      the boxed TR/  - square, works at favicon size
      lockup    mark + name    - the default for a site header
      wordmark  TOMMY ROLDAN/  - where a box would be noise

    Two grounds, because the navbar is transparent over a dark hero and becomes
    a cream bar once scrolled. The slash changes hue between them on purpose:
    the brand cyan is bright enough to sit on near-black, and too light to hold
    contrast on cream, so light grounds get a darkened teal instead. That is a
    legibility decision, not a second brand colour.  */

const SLASH_DARK  = 'text-cyan'            // #00E0C6 on near-black
const SLASH_LIGHT = 'text-[#0A8578]'       // darkened, for cream/white grounds

export function LogoMark({ dark = true, size = 36, className = '' }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`inline-grid place-items-center shrink-0 border transition-colors
                  ${dark ? 'bg-[#1A1A1C] border-white/[0.14]' : 'bg-cream border-ink/15'}
                  ${className}`}
    >
      <span
        style={{ fontSize: size * 0.39 }}
        className={`font-display font-black leading-none tracking-[-0.02em]
                    ${dark ? 'text-cream' : 'text-ink'}`}
      >
        TR<span className={dark ? SLASH_DARK : SLASH_LIGHT}>/</span>
      </span>
    </span>
  )
}

export function Wordmark({ dark = true, className = '' }) {
  return (
    <span className={`font-display font-black tracking-[0.06em] leading-none
                      ${dark ? 'text-cream' : 'text-ink'} ${className}`}>
      TOMMY ROLDAN<span className={dark ? SLASH_DARK : SLASH_LIGHT}>/</span>
    </span>
  )
}

/*  The header/footer lockup. `to` makes it a link; omit it for static use.
    The name hides below `sm` so the mark alone carries small screens - the
    full lockup at phone width crowds the nav toggle. */
export default function Logo({
  dark = true, to = '/', size = 36, showName = true, tagline = false, className = '',
}) {
  const inner = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark dark={dark} size={size} />
      {showName && (
        <span className="hidden sm:flex flex-col gap-1">
          <span className={`font-display font-black leading-none tracking-[0.06em]
                            ${dark ? 'text-cream' : 'text-ink'}`}
                style={{ fontSize: size * 0.42 }}>
            TOMMY ROLDAN
          </span>
          {tagline && (
            <span className={`text-[0.6rem] font-bold uppercase tracking-[0.22em] leading-none
                              ${dark ? 'text-cream/45' : 'text-ink/45'}`}>
              Web Developer &amp; Designer
            </span>
          )}
        </span>
      )}
    </span>
  )

  if (!to) return inner
  return (
    <Link to={to} aria-label="Tommy Roldan — home"
          className="inline-flex items-center group hover:opacity-85 transition-opacity">
      {inner}
    </Link>
  )
}
