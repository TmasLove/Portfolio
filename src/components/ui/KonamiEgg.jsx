import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
]

const EMOJIS = ['🌴', '🚴', '🛹', '🎵', '⚡', '🏝️', '☕']

// Deterministic pseudo-random so we don't need Math.random (kept simple & SSR-safe).
function confetti() {
  return Array.from({ length: 36 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280
    const rand = seed / 233280
    return {
      id: i,
      left: `${(i / 36) * 100}%`,
      delay: rand * 0.6,
      duration: 2.4 + rand * 1.8,
      emoji: EMOJIS[i % EMOJIS.length],
      drift: (rand - 0.5) * 120,
      size: 18 + Math.round(rand * 22),
    }
  })
}

export default function KonamiEgg() {
  const [active, setActive] = useState(false)
  const pieces = confetti()

  useEffect(() => {
    let pos = 0
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      pos = key === SEQUENCE[pos] ? pos + 1 : (key === SEQUENCE[0] ? 1 : 0)
      if (pos === SEQUENCE.length) {
        pos = 0
        setActive(true)
        setTimeout(() => setActive(false), 4500)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
          {pieces.map((p) => (
            <motion.span
              key={p.id}
              className="absolute top-[-10%]"
              style={{ left: p.left, fontSize: p.size }}
              initial={{ y: '-10vh', opacity: 0, rotate: 0 }}
              animate={{ y: '110vh', x: p.drift, opacity: [0, 1, 1, 0.8], rotate: 360 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
            >
              {p.emoji}
            </motion.span>
          ))}
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-night/90 px-6 py-3 text-cream font-display font-black text-lg shadow-2xl ring-1 ring-violet/40"
          >
            <span className="text-violet">↑↑↓↓←→←→ B A</span> — you found it 🚴‍♂️
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
