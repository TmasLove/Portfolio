import { useId } from 'react'

// The "TR — products that move" mark (speed lines · gradient R · chevron).
// Rendered inline so the Archivo webfont (already loaded by the site) draws the
// letterforms crisply. `onDark` flips the T fill for dark backgrounds.
export default function TrMark({ onDark = false, className = '', title = 'Tommy Roldan' }) {
  const gid = useId()
  const tFill = onDark ? '#F5F5F4' : '#23262D'
  return (
    <svg viewBox="0 0 540 260" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6D28D9" />
          <stop offset="1" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
      <g fill="#2DD4BF">
        <rect x="28" y="72" width="40" height="14" rx="7" opacity="0.30" />
        <rect x="28" y="119" width="66" height="14" rx="7" opacity="0.55" />
        <rect x="28" y="166" width="40" height="14" rx="7" opacity="0.30" />
      </g>
      <text x="112" y="198" fontSize="212" letterSpacing="-32" fontFamily="Archivo, system-ui, sans-serif" fontWeight="900">
        <tspan fill={tFill}>T</tspan>
        <tspan fill={`url(#${gid})`}>R</tspan>
      </text>
      <polyline
        points="404,86 456,131 404,176"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
