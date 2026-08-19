import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { projects } from '../../data/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { setDarkHero } from '../../lib/darkHero'

/*  Scroll-driven corridor of real project screenshots — CSS 3D, no Three.js.

    The Framer component that inspired this ships Three.js + GSAP: roughly
    180KB gzipped against a whole-site bundle of ~158KB. A corridor is just
    panels at different depths and a camera that moves along Z, which the
    compositor already does for free via perspective + translateZ. So this is
    the same idea for no new dependency.

    Degradation is deliberate, per the mileage-bar lesson: if JS never runs the
    panels are still in the DOM as a plain responsive grid with real links, and
    under prefers-reduced-motion that grid is what renders.  */

const SHOTS = projects
  .filter((p) => p.image && p.category !== 'archived')
  .slice(0, 12)

const SPACING = 900          // px between panels along Z
const DEPTH = SHOTS.length * SPACING

/*  Deterministic scatter so panels do not stack in a single line.
    Narrow viewports get a much tighter spread and a camera pulled further
    back: perspective magnifies whatever is closest, and at 375px the near
    panel was being thrown clean off the right edge.  */
const place = (i, narrow) => {
  const a = i * 2.399963                                  // golden angle
  const sx = narrow ? 5 : 13
  const sy = narrow ? 6 : 11
  return { x: Math.cos(a) * sx, y: Math.sin(a * 1.7) * sy }
}

function useNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const on = (e) => setNarrow(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow
}

function Panel({ p, i, camZ, narrow }) {
  const z = -i * SPACING
  const { x, y } = place(i, narrow)

  // Distance from the camera as the scene slides past.
  const dist = useTransform(camZ, (c) => c + z)
  const opacity = useTransform(dist, [-SPACING * 1.2, -SPACING * 0.55, 0, 420], [0, 1, 1, 0])
  const blur = useTransform(dist, [-SPACING * 1.2, -SPACING * 0.6], [6, 0])
  const filter = useTransform(blur, (b) => `blur(${b}px)`)

  return (
    <motion.a
      href={p.url || `/work/${p.key}`}
      target={p.url?.startsWith('http') ? '_blank' : undefined}
      rel={p.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="absolute left-1/2 top-1/2 block w-[min(66vw,620px)] sm:w-[min(78vw,620px)] will-change-transform"
      style={{
        opacity, filter,
        translateX: '-50%', translateY: '-50%',
        x: `${x}vw`, y: `${y}vh`, z,
        transformStyle: 'preserve-3d',
      }}
    >
      <figure className="overflow-hidden rounded-xl border border-white/12 bg-nightsoft
                         shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        <img src={p.image} alt={p.title} loading="lazy"
             className="block w-full aspect-[16/10] object-cover" />
        <figcaption className="flex items-baseline justify-between gap-4 px-4 py-3">
          <span className="font-display font-black text-cream text-sm sm:text-base">{p.title}</span>
          <span className="text-[0.65rem] uppercase tracking-[0.16em] text-cream/40">{p.year}</span>
        </figcaption>
      </figure>
    </motion.a>
  )
}

export default function WorkIntroTunnel({ onSkip }) {
  const wrap = useRef(null)
  const reduce = useReducedMotion()
  const narrow = useNarrow()

  /*  Tell the navbar a dark hero is on screen.
      Keying this off the route instead was a bug: /work is dark only while the
      corridor is playing, so on the second visit of a session the nav rendered
      cream-on-cream and vanished. The hero itself is the only thing that knows.  */
  useEffect(() => {
    if (reduce) return
    setDarkHero(true)
    return () => setDarkHero(false)
  }, [reduce])

  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 26, restDelta: 0.001 })
  const camZ = useTransform(smooth, [0, 1], [0, DEPTH])
  // Dissolve the corridor across the final stretch so the grid underneath
  // arrives instead of being cut to.
  const handoff = useTransform(smooth, [0, 0.86, 1], [1, 1, 0])

  // Under reduced motion the intro is pure decoration over content that
  // already exists below, so it is simply not rendered.
  if (reduce) return null

  return (
    <div ref={wrap} style={{ height: `${SHOTS.length * 46}vh` }} className="relative bg-night">
      <motion.div className="sticky top-0 h-screen overflow-hidden"
           style={{ perspective: narrow ? 1800 : 1100, perspectiveOrigin: '50% 50%', opacity: handoff }}>

        {/* depth cues: a vignette and a receding floor grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10"
             style={{ background: 'radial-gradient(70% 60% at 50% 50%, transparent 40%, rgba(14,14,16,0.95) 100%)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-[0.14]"
             style={{
               backgroundImage:
                 'linear-gradient(rgba(0,224,198,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,224,198,0.6) 1px, transparent 1px)',
               backgroundSize: '64px 64px',
               transform: 'rotateX(78deg)', transformOrigin: 'bottom center',
             }} />

        <motion.div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', z: camZ }}>
          {SHOTS.map((p, i) => <Panel key={p.key} p={p} i={i} camZ={camZ} narrow={narrow} />)}
        </motion.div>

        <div className="absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-3">
          <span className="pointer-events-none text-[0.62rem] uppercase tracking-[0.24em] text-cream/35">
            Scroll to fly through
          </span>
          <button onClick={onSkip}
            className="rounded-full border border-white/20 px-4 py-1.5 text-[0.6rem] font-bold
                       uppercase tracking-[0.16em] text-cream/50 transition-colors
                       hover:border-cream/50 hover:text-cream">
            Skip to all work
          </button>
        </div>
      </motion.div>
    </div>
  )
}
