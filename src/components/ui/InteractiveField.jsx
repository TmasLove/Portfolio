import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const DEFAULTS = {
  dot: 'rgba(120,130,255,0.8)',   // violet particles
  dotAlt: 'rgba(0,224,198,0.8)',  // cyan particles
  link: '90,100,232',             // inter-particle line (rgb)
  linkAlpha: 0.18,
  cursorLink: '0,224,198',        // cursor thread (rgb)
  cursorAlpha: 0.45,
  radius: 1.0,                    // particle radius multiplier
  density: 15000,                 // lower = more particles
}

// A drifting particle constellation that reacts to the cursor: nearby points link to
// the pointer with cyan threads and gently get pushed away. Pure canvas, no deps.
export default function InteractiveField({ className = '', colors = {} }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const C = { ...DEFAULTS, ...colors }

  useEffect(() => {
    if (reduce) return
    const canvas = ref.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: -9999, y: -9999 }
    let W = 0, H = 0, particles = [], raf

    function build() {
      W = parent.clientWidth
      H = parent.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(24, Math.min(120, Math.floor((W * H) / C.density)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: (Math.random() * 1.6 + 0.6) * C.radius,
        cyan: Math.random() < 0.3,
      }))
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(parent)

    // Listen on window (the form sits above the canvas, so events wouldn't bubble
    // to the parent). Coords are mapped to the canvas; off-canvas moves simply land
    // outside [0,W]×[0,H] and naturally have no effect.
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)

    function tick() {
      ctx.clearRect(0, 0, W, H)
      for (const p of particles) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy
        if (d2 < 130 * 130) {
          const d = Math.sqrt(d2) || 1
          const f = ((130 - d) / 130) * 0.5
          p.vx += (dx / d) * f
          p.vy += (dy / d) * f
        }
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        // keep a baseline drift
        if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.06
        if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.06
        if (p.x < 0) p.x += W
        if (p.x > W) p.x -= W
        if (p.y < 0) p.y += H
        if (p.y > H) p.y -= H

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.cyan ? C.dotAlt : C.dot
        ctx.fill()
      }
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < 110) {
            ctx.strokeStyle = `rgba(${C.link},${(1 - d / 110) * C.linkAlpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        const mdx = a.x - mouse.x, mdy = a.y - mouse.y
        const md = Math.hypot(mdx, mdy)
        if (md < 160) {
          ctx.strokeStyle = `rgba(${C.cursorLink},${(1 - md / 160) * C.cursorAlpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])

  return <canvas ref={ref} className={`pointer-events-none ${className}`} aria-hidden="true" />
}
