import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const BLOBS = [
  {
    color: 'bg-violet',
    style: { top: '-4rem', left: '-3rem' },
    animate: { x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] },
    duration: 14,
  },
  {
    color: 'bg-cyan',
    style: { bottom: '-5rem', right: '-2rem' },
    animate: { x: [0, -30, 0], y: [0, 35, 0], scale: [1, 1.2, 1] },
    duration: 18,
  },
  {
    color: 'bg-violet',
    style: { top: '30%', right: '20%' },
    animate: { x: [0, 25, 0], y: [0, 25, 0], scale: [1, 0.9, 1] },
    duration: 22,
  },
]

export default function AnimatedBlobs({ className = '' }) {
  const reduced = useReducedMotion()

  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute w-72 h-72 rounded-full blur-3xl opacity-30 ${blob.color}`}
          style={blob.style}
          {...(reduced
            ? {}
            : {
                animate: blob.animate,
                transition: { duration: blob.duration, repeat: Infinity, ease: 'easeInOut' },
              })}
        />
      ))}
    </div>
  )
}
