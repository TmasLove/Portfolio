import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
export default function CountUp({ to, suffix = '', duration = 1200, className = '' }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!visible) return
    if (reduce) { setN(to); return }
    let raf, start
    const tick = (t) => {
      start ??= t
      const p = Math.min((t - start) / duration, 1)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, to, duration, reduce])
  return <span ref={ref} className={className}>{n}{suffix}</span>
}
