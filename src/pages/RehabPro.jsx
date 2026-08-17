import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import Reveal from '../components/ui/Reveal'
import { fadeUp, stagger, inView, EASE } from '../lib/motion'

/*  Rehab Pro — product page for the iOS app.

    Like Canary, this sits outside the portfolio's case-study layout: the reader
    is a stranger evaluating an app, not someone reading about my work. Palette
    comes from the app icon (teal → blue) so page and product read as one thing.

    The load-bearing section is the origin story, not the feature list. Every
    rehab app claims to personalise a plan; almost none can say why they know
    the generic sheet fails. That is the only thing here a competitor cannot
    copy, so it sits second — directly after the hero, before any feature.

    Motion is scroll-driven rather than decorative: the hero resolves on mount
    so the page is never blank, the timeline draws itself as you read it, and
    everything collapses to static under prefers-reduced-motion.

    Every product claim comes from the App Store listing. There is no App Store
    link while the listing is unpublished — a dead download button on a launch
    page costs more trust than the button gains.  */

const TEAL  = '#17A899'
const BLUE  = '#1E7FB8'
const INK   = '#0F1B20'
const PAPER = '#F4F2ED'

const INPUTS = [
  { k: 'Where',    t: 'Where it hurts',     d: 'Pick the region. You get exercises for that, and nothing else.' },
  { k: 'How bad',  t: 'How it hurts today', d: 'Pain and mobility move daily. The plan reads today, not the day you signed up.' },
  { k: 'How long', t: 'The time you have',  d: 'A plan you finish beats a better plan you skip.' },
]

const STEPS = [
  { n: '01', t: 'Answer a few questions', d: 'Pain level, mobility, and what you are working toward.' },
  { n: '02', t: 'Get a filtered list',    d: 'Exercises for your region — nothing too advanced for where you are today.' },
  { n: '03', t: 'Follow the cues',        d: 'Step-by-step instructions, dosage in sets, reps and holds, and the safety notes that matter.' },
  { n: '04', t: 'Watch it done',          d: 'A demonstration video for anything you are unsure about.' },
]

const LIMITS = [
  { t: 'Diagnose you',
    d: 'It does not know what is wrong with you. It works from what you tell it about pain and mobility.' },
  { t: 'Replace your physio',
    d: 'It is what you open between appointments — so recovery does not stop when the visit ends.' },
  { t: 'Push you through pain',
    d: 'If the screening finds symptoms that need a doctor, the plan holds to the gentlest options and says so.' },
]

/* Thin scroll indicator. Cheap, and it makes a long page feel navigable. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  return (
    <motion.div aria-hidden
      className="fixed top-0 left-0 right-0 z-[45] h-[3px] origin-left"
      style={{ scaleX: x, background: `linear-gradient(90deg, ${TEAL}, ${BLUE})` }} />
  )
}

export default function RehabPro() {
  const reduce = useReducedMotion()

  // The timeline rule draws itself down the steps as they scroll past.
  const stepsRef = useRef(null)
  const { scrollYProgress: stepsProgress } = useScroll({
    target: stepsRef,
    offset: ['start 75%', 'end 60%'],
  })
  const ruleScale = useSpring(stepsProgress, { stiffness: 90, damping: 26, restDelta: 0.001 })

  return (
    <div style={{ background: INK }}>
      <ScrollProgress />

      {/* ============ HERO ============
          Animates on mount, not on scroll — the top of a page must never
          depend on an intersection observer to become visible. */}
      <div className="relative isolate overflow-hidden"
           style={{ background: `linear-gradient(145deg, ${TEAL} 0%, ${BLUE} 62%, ${INK} 100%)` }}>

        {/* Two slow, offset glows. The hero breathes instead of sitting still. */}
        {!reduce && (
          <>
            <motion.div aria-hidden className="pointer-events-none absolute -top-1/3 -left-1/4 w-[70vw] h-[70vw] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 62%)' }}
              animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div aria-hidden className="pointer-events-none absolute -bottom-1/3 right-0 w-[55vw] h-[55vw] rounded-full"
              style={{ background: `radial-gradient(circle, rgba(23,168,153,0.30), transparent 65%)` }}
              animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.18, 1] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} />
          </>
        )}
        {reduce && (
          <div aria-hidden className="pointer-events-none absolute inset-0"
               style={{ background: 'radial-gradient(80% 55% at 15% 0%, rgba(255,255,255,0.20), transparent 70%)' }} />
        )}

        <motion.div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10 pt-24 pb-16 md:pt-32 md:pb-24"
                    variants={stagger(0.11, 0.05)} initial="hidden" animate="visible">
          <div className="flex items-center gap-4 sm:gap-6">
            <motion.img src="/rehabpro/icon.png" alt="" width={104} height={104}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-[104px] lg:h-[104px] shrink-0 rounded-[22%]
                         shadow-[0_18px_50px_-10px_rgba(0,0,0,0.55)]"
              variants={{ hidden: { opacity: 0, scale: 0.82, rotate: -6 },
                          visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.75, ease: EASE } } }} />
            <motion.h1 variants={fadeUp}
              className="font-display font-black text-white tracking-tight leading-[0.85]
                         text-[3rem] sm:text-6xl lg:text-8xl">
              Rehab&nbsp;Pro
            </motion.h1>
          </div>

          <motion.p variants={fadeUp}
            className="mt-8 sm:mt-10 font-display font-bold text-white
                       text-[1.7rem] sm:text-4xl lg:text-[3rem] leading-[1.08] max-w-[17ch]">
            Recovery,<br />built around you.
          </motion.p>

          <motion.p variants={fadeUp}
            className="mt-6 text-lg sm:text-xl text-white/75 max-w-xl leading-relaxed">
            A daily plan built from three things: where it hurts, how it hurts
            right now, and how much time you actually have.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10
                             px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
              {!reduce && (
                <motion.span aria-hidden className="w-1.5 h-1.5 rounded-full bg-white"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
              )}
              Coming to the App Store
            </span>
            <span className="text-xs uppercase tracking-[0.14em] text-white/55">
              iPhone · Health &amp; Fitness · $0.99
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ============ THE STORY ============
          The whole argument for this app in one section. It goes before the
          features because it is the reason to believe them. */}
      <section style={{ background: PAPER }}>
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-20 md:py-32">
          <Reveal>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em]" style={{ color: BLUE }}>
              Why this exists
            </p>
          </Reveal>

          <Reveal>
            <h2 className="mt-6 font-display font-black text-[2.1rem] sm:text-5xl lg:text-6xl leading-[1.03]"
                style={{ color: INK }}>
              Three herniated discs,
              <span style={{ color: BLUE }}> and a sheet of exercises</span> that
              assumed every day felt the same.
            </h2>
          </Reveal>

          <motion.div className="mt-10 space-y-6 text-lg sm:text-xl leading-relaxed max-w-2xl"
                      variants={stagger(0.1, 0.05)} {...inView}>
            <motion.p variants={fadeUp} style={{ color: `${INK}B3` }}>
              I have ridden for over a decade — fixed gear through Miami traffic
              first, then road, then years working the floor at Mack Cycle and
              City Bikes. Then three herniated discs took me off the bike
              completely.
            </motion.p>
            <motion.p variants={fadeUp} style={{ color: `${INK}B3` }}>
              What you get after an appointment is a printout. It is good advice,
              written once, for the version of you sitting in that room. Some
              mornings I could do the whole set. Most I could not — and nothing
              on that page told me which of those was fine and which was a reason
              to stop.
            </motion.p>
            <motion.p variants={fadeUp} className="font-semibold" style={{ color: INK }}>
              So I built the thing I wanted at 6am on a bad morning: something
              that asks how today actually is before it decides what you should do.
            </motion.p>
          </motion.div>

          {/* The signature line, set apart. */}
          <Reveal>
            <div className="mt-12 flex items-center gap-4 border-t pt-8"
                 style={{ borderColor: `${INK}1A` }}>
              <span className="h-9 w-1 rounded-full"
                    style={{ background: `linear-gradient(${TEAL}, ${BLUE})` }} />
              <p className="text-[0.95rem] leading-snug" style={{ color: `${INK}8C` }}>
                Built by an athlete in recovery, not a wellness brand.<br />
                <span style={{ color: `${INK}66` }}>Tommy Roldan · Miami, FL</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ THE THREE INPUTS ============ */}
      <section style={{ background: INK }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <Reveal>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em]" style={{ color: TEAL }}>
              What it plans around
            </p>
            <h2 className="mt-5 font-display font-black text-3xl sm:text-5xl leading-[1.05] text-white max-w-[20ch]">
              Most plans are written once and never look up.
            </h2>
          </Reveal>

          <motion.div className="mt-14 grid sm:grid-cols-3 gap-4" variants={stagger(0.1, 0.1)} {...inView}>
            {INPUTS.map((i) => (
              <motion.div key={i.t} variants={fadeUp}
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/25">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em]" style={{ color: TEAL }}>{i.k}</p>
                <p className="mt-3 font-display font-black text-xl text-white">{i.t}</p>
                <p className="mt-2 text-[0.95rem] text-white/55 leading-relaxed">{i.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ HOW IT WORKS — self-drawing timeline ============ */}
      <section style={{ background: PAPER }}>
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-20 md:py-28">
          <Reveal>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em]" style={{ color: BLUE }}>
              How it works
            </p>
            <h2 className="mt-5 font-display font-black text-3xl sm:text-5xl leading-[1.05]" style={{ color: INK }}>
              Four steps, then you are moving.
            </h2>
          </Reveal>

          <div ref={stepsRef} className="relative mt-14 pl-12 sm:pl-16">
            {/* Track + the rule that fills as you scroll */}
            <div aria-hidden className="absolute left-[13px] sm:left-[17px] top-2 bottom-2 w-[2px] rounded-full"
                 style={{ background: `${INK}14` }} />
            <motion.div aria-hidden
              className="absolute left-[13px] sm:left-[17px] top-2 bottom-2 w-[2px] rounded-full origin-top"
              style={{ scaleY: reduce ? 1 : ruleScale, background: `linear-gradient(${TEAL}, ${BLUE})` }} />

            <motion.div className="space-y-10 sm:space-y-12" variants={stagger(0.12, 0.05)} {...inView}>
              {STEPS.map((s) => (
                <motion.div key={s.n} variants={fadeUp} className="relative">
                  <span aria-hidden
                        className="absolute -left-12 sm:-left-16 top-0.5 grid place-items-center
                                   w-7 h-7 sm:w-9 sm:h-9 rounded-full text-[0.62rem] sm:text-xs font-bold tabular-nums text-white"
                        style={{ background: `linear-gradient(135deg, ${TEAL}, ${BLUE})` }}>
                    {s.n}
                  </span>
                  <p className="font-display font-bold text-xl sm:text-2xl" style={{ color: INK }}>{s.t}</p>
                  <p className="mt-2 leading-relaxed max-w-xl" style={{ color: `${INK}A6` }}>{s.d}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ APPLE HEALTH + SAFETY ============ */}
      <section style={{ background: INK }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em]" style={{ color: TEAL }}>
                Recovery, automatically
              </p>
              <h2 className="mt-5 font-display font-black text-3xl sm:text-5xl leading-[1.05] text-white">
                It already knows<br />you rode today.
              </h2>
              <p className="mt-6 text-lg text-white/60 leading-relaxed">
                Connect Apple Health and Rehab Pro notices when you finish a workout —
                a ride, a run, a lift — and suggests recovery stretches for the muscles
                you just used.
              </p>
              <p className="mt-4 text-lg text-white/60 leading-relaxed">
                It reads whatever writes to Health, so Strava, Garmin and the rest
                arrive on their own. Nothing to log twice.
              </p>
            </Reveal>

            <Reveal>
              <motion.div whileHover={reduce ? undefined : { y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 sm:p-10">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em]" style={{ color: TEAL }}>
                  Built for safety
                </p>
                <p className="mt-4 text-lg text-white/70 leading-relaxed">
                  A short screening at setup checks for symptoms that need a doctor,
                  not an app. If any come up, Rehab Pro holds your plan to the gentlest
                  options and tells you to get it looked at.
                </p>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ WHAT IT WON'T DO ============ */}
      <section style={{ background: PAPER }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <Reveal>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em]" style={{ color: BLUE }}>
              What it will not do
            </p>
            <h2 className="mt-5 font-display font-black text-3xl sm:text-5xl leading-[1.05] max-w-[20ch]"
                style={{ color: INK }}>
              It is not a doctor, and does not pretend to be.
            </h2>
          </Reveal>

          <motion.div className="mt-14 grid sm:grid-cols-3 gap-4" variants={stagger(0.1, 0.1)} {...inView}>
            {LIMITS.map((l) => (
              <motion.div key={l.t} variants={fadeUp}
                className="rounded-2xl border p-6"
                style={{ borderColor: `${INK}1A`, background: '#FFFFFF80' }}>
                {/* The rule strikes through as the card arrives. */}
                <span className="relative inline-block font-display font-bold text-lg" style={{ color: INK }}>
                  {l.t}
                  <motion.span aria-hidden
                    className="absolute left-0 top-1/2 h-[2px] w-full origin-left rounded-full"
                    style={{ background: BLUE }}
                    initial={{ scaleX: reduce ? 1 : 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.25 }} />
                </span>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed" style={{ color: `${INK}99` }}>{l.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ PRIVACY + CLOSE ============ */}
      <section style={{ background: INK }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <Reveal>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em]" style={{ color: TEAL }}>
                Your data
              </p>
              <h2 className="mt-5 font-display font-black text-3xl sm:text-4xl leading-[1.05] text-white">
                Stays on your phone.
              </h2>
              <p className="mt-6 text-lg text-white/60 leading-relaxed">
                Health and fitness data is stored on your device and used to run the
                app. No analytics, no advertising, no account to create, and nothing
                collected for tracking.
              </p>
            </Reveal>

            <Reveal>
              <div className="lg:pt-14">
                <p className="font-display font-black text-2xl sm:text-3xl leading-[1.15] text-white">
                  Recovery does not stop when the visit ends.
                </p>
                <p className="mt-5 text-lg text-white/60 leading-relaxed">
                  Rehab Pro is built in Miami by Tommy Roldan. It is launching on the
                  App Store shortly.
                </p>
                <motion.a href="/contact"
                  whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm
                             font-bold uppercase tracking-[0.08em] text-white"
                  style={{ background: `linear-gradient(120deg, ${TEAL}, ${BLUE})` }}>
                  Get in touch
                  <span aria-hidden className="text-[1.1em] leading-none">→</span>
                </motion.a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
