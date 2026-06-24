import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import InteractiveField from '../ui/InteractiveField'
import { useReducedMotion } from '../../hooks/useReducedMotion'

// Color blobs spread across the viewport (not just one corner) so the cream bg reads tinted.
const BLOBS = [
  { c: 'bg-violet', o: 'opacity-40', s: { top: '-8rem', left: '-6rem' },   a: { x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }, d: 16 },
  { c: 'bg-cyan',   o: 'opacity-30', s: { top: '-4rem', right: '-6rem' },  a: { x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.2, 1] },  d: 19 },
  { c: 'bg-violet', o: 'opacity-25', s: { top: '40%', left: '34%' },       a: { x: [0, 40, 0], y: [0, 30, 0], scale: [1, 0.9, 1] },   d: 23 },
  { c: 'bg-cyan',   o: 'opacity-30', s: { bottom: '-6rem', left: '-4rem' },a: { x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] },  d: 21 },
  { c: 'bg-violet', o: 'opacity-30', s: { bottom: '-8rem', right: '8%' },  a: { x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.18, 1] }, d: 17 },
]

export default function WorkBackground() {
  const wrapRef = useRef(null)
  const reduced = useReducedMotion()

  // Cursor spotlight — driven by a window listener (layer is pointer-events-none).
  // The sticky layer is pinned to the viewport top-left, so clientX/Y map directly.
  useEffect(() => {
    const onMove = (e) => {
      const el = wrapRef.current
      if (!el) return
      el.style.setProperty('--mx', `${e.clientX}px`)
      el.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {/* Sticky → stays viewport-sized & pinned while the page scrolls (dense particles) */}
      <div ref={wrapRef} className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Drifting color blobs */}
        {BLOBS.map((b, i) => (
          <motion.div
            key={i}
            className={`absolute w-[26rem] h-[26rem] rounded-full blur-3xl ${b.c} ${b.o}`}
            style={b.s}
            {...(reduced ? {} : { animate: b.a, transition: { duration: b.d, repeat: Infinity, ease: 'easeInOut' } })}
          />
        ))}

        {/* Cursor spotlight */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(380px circle at var(--mx, 50%) var(--my, 30%), rgba(90,100,232,0.18), transparent 70%)',
          }}
        />

        {/* Cursor-reactive constellation — tuned dark-on-light so it shows on cream */}
        <InteractiveField
          className="absolute inset-0"
          colors={{
            dot: 'rgba(90,100,232,0.6)',
            dotAlt: 'rgba(0,180,165,0.65)',
            link: '90,100,232',
            linkAlpha: 0.3,
            cursorLink: '90,100,232',
            cursorAlpha: 0.55,
            radius: 1.3,
            density: 11000,
          }}
        />
      </div>
    </div>
  )
}
