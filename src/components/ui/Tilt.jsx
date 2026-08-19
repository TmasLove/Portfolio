import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/*  Pointer-reactive 3D tilt.

    Progressive enhancement only: children render identically with no pointer,
    no JS-driven layout, and under prefers-reduced-motion. Nothing here is
    load-bearing for content - the lesson from the mileage bars is that motion
    must never be the thing that makes content appear.

    Rotation is driven by motion values rather than React state, so moving the
    pointer never triggers a re-render.  */
export default function Tilt({
  children, max = 9, scale = 1.02, glare = true, className = '', style,
}) {
  const reduce = useReducedMotion()
  const ref = useRef(null)

  const px = useMotionValue(0.5)   // 0..1 across the element
  const py = useMotionValue(0.5)
  const soft = { stiffness: 220, damping: 22, mass: 0.6 }
  const rotX = useSpring(useTransform(py, [0, 1], [max, -max]), soft)
  const rotY = useSpring(useTransform(px, [0, 1], [-max, max]), soft)
  const sc = useSpring(1, soft)

  const gx = useTransform(px, (v) => `${v * 100}%`)
  const gy = useTransform(py, (v) => `${v * 100}%`)

  if (reduce) return <div className={className} style={style}>{children}</div>

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const onEnter = () => sc.set(scale)
  const onLeave = () => { sc.set(1); px.set(0.5); py.set(0.5) }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{ perspective: 900, ...style }}
      className={className}
    >
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY, scale: sc, transformStyle: 'preserve-3d' }}
        className="relative will-change-transform"
      >
        {children}
        {glare && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0
                       transition-opacity duration-300 [.group:hover_&]:opacity-100"
            style={{
              background: useTransform([gx, gy], ([x, y]) =>
                `radial-gradient(420px circle at ${x} ${y}, rgba(255,255,255,0.14), transparent 60%)`),
            }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}
