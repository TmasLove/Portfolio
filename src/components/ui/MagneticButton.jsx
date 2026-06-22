import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
export default function MagneticButton({ as = 'a', className = '', children, ...props }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const M = motion[as] || motion.a
  function onMove(e) {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  function reset() { x.set(0); y.set(0) }
  return (
    <M ref={ref} style={{ x, y }} onMouseMove={onMove} onMouseLeave={reset}
       className={`inline-flex items-center gap-2 ${className}`} {...props}>
      {children}
    </M>
  )
}
