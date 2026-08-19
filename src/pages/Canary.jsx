import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import BirdsCanvas from '../components/home/BirdsCanvas'
import Reveal from '../components/ui/Reveal'
import { fadeUp, stagger, inView } from '../lib/motion'

/*  Canary — product page.

    Deliberately does not inherit the portfolio's design system. The rest of the
    site is a case-study layout: long measured prose on a dark ground, read by
    someone who already decided to look. This page has to survive a stranger
    who arrived from a search result and will leave in four seconds.

    Three rules drove the rebuild:

    1. Show the thing before explaining it. The screenshot now sits directly
       under the hero. Previously a reader met ~700 words before seeing what
       they were downloading.
    2. Alternate light and dark. Nine dark sections in a row read as one
       undifferentiated wall and hid every boundary between ideas; contrast is
       what makes a page feel navigable rather than long.
    3. Cut prose to the load-bearing sentence. Nearly everything here was true
       and worth saying - and unread, which makes it worth nothing. The detail
       lives in the app and the report, where someone has already opted in.  */

const DOWNLOAD = 'https://drive.google.com/file/d/1cwvx38tHZI7k8lu-QlPx2Kx4oteWXbuz/view?usp=sharing'
const DISCORD  = 'https://discord.com/users/346119932511125515'

const INK   = '#0E1116'   // near-black ground
const PAPER = '#F4F2ED'   // warm off-white, the contrast break
const GOLD  = '#F2C230'

// Six checks, stated as outcomes. The old page described mechanisms.
const CHECKS = [
  { t: 'Failing drives',
    d: 'Reads the counters inside the drive itself — not the pass/fail badge a vendor tool shows you.' },
  { t: 'Silent crashes',
    d: 'Finds the freezes Windows records but never puts in Event Viewer. Most tools never look here.' },
  { t: 'Why it boots slowly',
    d: 'Every startup program, in plain words, with what actually happens if you turn it off.' },
  { t: 'Signs of compromise',
    d: 'The specific ways malware stays on a PC: hijacked sign-ins, disabled antivirus, hidden tasks.' },
  { t: 'Your attack surface',
    d: 'What an attacker on your network could reach — exposed Remote Desktop, SMBv1, open ports.' },
  { t: 'Files quietly in the cloud',
    d: 'Whether your Desktop and Documents actually live on this PC, or in OneDrive without you asking.' },
]

// Canary for Mac. Deliberately NOT a translation of the Windows list: the
// interesting data is somewhere else entirely. Apple silicon hides SMART behind
// its own storage fabric, so "read the drive's own counters" — the Windows
// headline — is not available and pretending otherwise would be the exact
// dishonesty this tool exists to avoid. What macOS does keep is a detailed
// record of its own failures that nothing in the interface ever shows you.
const MAC_CHECKS = [
  { t: 'Why is this running?',
    d: 'Forty-one processes called “Google Chrome” is normal. Whether all forty-one are the same signed binary is the check that actually matters.' },
  { t: 'The diary macOS keeps',
    d: 'Every crash, hang and failed shutdown is written to disk and shown to nobody. Canary reads it and names the function that failed.' },
  { t: 'What starts by itself',
    d: 'Launch agents and daemons — the only durable way for software to keep coming back after you close it.' },
  { t: 'Why memory feels tight',
    d: 'macOS reports memory it has already compressed or moved to disk as “free”, so the number looks best exactly when the machine is working hardest.' },
  { t: 'Why the fans are up',
    d: 'Sustained load against your actual core count, and whether macOS ever had to slow the machine down to cool it.' },
  { t: 'Who signed it',
    d: 'Publisher and Apple notarisation, reported separately. Unsigned reads as “unverified”, never as “malicious”.' },
]

// Everything that differs between the two products. Kept as data rather than
// scattered through the JSX so it is obvious at a glance what a platform
// actually claims — and so a claim cannot be true on one tab and stale on the
// other.
const PLATFORMS = {
  windows: {
    label: 'Windows',
    headline: ['Your PC is fine.', 'Are you sure?'],
    sub: 'Free Windows diagnostics that reads what your hardware actually reports — and tells you plainly what it means.',
    meta: '150\u00a0KB · Windows 10/11 · nothing installed',
    checks: null,     // filled below
    shipping: true,
  },
  mac: {
    label: 'macOS',
    headline: ['Your Mac keeps notes.', 'It never shows you.'],
    sub: 'Every crash, hang and stalled shutdown is written to disk and surfaced nowhere. macOS gives you one word about your SSD: Verified.',
    meta: 'Apple silicon · macOS 14+ · reads only, changes nothing',
    checks: null,
    shipping: false,  // no build to download yet, so no download button
  },
}

PLATFORMS.windows.checks = CHECKS
PLATFORMS.mac.checks = MAC_CHECKS

const WONT = [
  { t: 'Clean your registry',
    d: 'Unused keys cost nothing. Deleting a live one breaks something weeks later.' },
  { t: '“Free up” your RAM',
    d: 'Windows caches on purpose. Emptying it makes the next few minutes slower.' },
  { t: 'Disable services in bulk',
    d: 'The ones that matter break in ways you will never trace back.' },
  { t: 'Promise “30% faster”',
    d: 'A number with no method behind it is marketing. Be sceptical of any tool that shows one.' },
]

/* One tool glanced and stopped. The other kept counting. */
function Count({ to, suffix = '', duration = 1100, delay = 0 }) {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, margin: '-70px' })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!seen) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(to); return }
    let raf
    const start = performance.now() + delay
    const tick = (now) => {
      const p = Math.min(Math.max(now - start, 0) / duration, 1)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to, duration, delay])
  return <span ref={ref} className="tabular-nums">{n}{suffix}</span>
}

function Download({ big = false, light = false }) {
  return (
    <a href={DOWNLOAD} target="_blank" rel="noopener noreferrer"
       className={`inline-flex items-center gap-2.5 rounded-full font-bold uppercase
                   tracking-[0.08em] transition-transform hover:scale-[1.03] active:scale-100
                   ${big ? 'text-base px-10 py-5' : 'text-sm px-8 py-4'}
                   ${light ? 'bg-[#0E1116] text-[#F4F2ED]' : 'bg-[#F2C230] text-[#0E1116]'}`}>
      Download free
      <span aria-hidden className="text-[1.1em] leading-none">↓</span>
    </a>
  )
}

/// The platform switch.
///
/// Two products that answer the same question on machines which record
/// completely different things. A toggle rather than two pages: the argument —
/// read what the machine actually reports, say plainly when you could not — is
/// identical, and splitting it across two URLs would halve the case and double
/// the maintenance.
/// What stands in for the download button on a platform that has no build yet.
///
/// A CTA that goes nowhere costs more trust than a missing one, and offering a
/// Windows .exe under a macOS tab would be worse than either.
function TestCTA({ big = false }) {
  return (
    <a href={DISCORD} target="_blank" rel="noopener noreferrer"
       className={`inline-flex items-center gap-2.5 rounded-full border border-white/15
                   bg-white/[0.05] font-semibold text-[#F4F2ED]/85 hover:bg-white/[0.09]
                   transition ${big ? 'px-7 py-4 text-base' : 'px-5 py-3 text-sm'}`}>
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GOLD }} />
      In development — ask to test it
    </a>
  )
}

function PlatformSwitch({ value, onChange }) {
  return (
    <div role="tablist" aria-label="Platform"
         className="inline-flex items-center gap-1 p-1 rounded-full
                    border border-white/12 bg-white/[0.04] backdrop-blur">
      {Object.entries(PLATFORMS).map(([key, p]) => {
        const on = key === value
        return (
          <button key={key} role="tab" aria-selected={on} onClick={() => onChange(key)}
                  className={`relative px-4 sm:px-5 py-1.5 rounded-full text-sm font-semibold
                              transition-colors duration-200
                              ${on ? 'text-[#0E1116]' : 'text-[#F4F2ED]/55 hover:text-[#F4F2ED]/85'}`}>
            {on && (
              <motion.span layoutId="platform-pill" className="absolute inset-0 rounded-full"
                           style={{ background: GOLD }}
                           transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <span className="relative z-10">{p.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function Canary() {
  // Windows first: it is the product that actually ships, and defaulting to the
  // one a visitor can download respects why most of them arrived.
  const [platform, setPlatform] = useState('windows')
  const P = PLATFORMS[platform]

  return (
    <div style={{ background: INK }}>

      {/* ============ HERO ============ */}
      <div className="relative isolate" style={{ background: INK }}>
        <BirdsCanvas color={0xF2C230}
                     className="pointer-events-none absolute inset-0 z-0 opacity-[0.22]" />
        <div className="pointer-events-none absolute inset-0 z-0"
             style={{ background: `linear-gradient(to bottom, transparent 40%, ${INK} 100%)` }} />

        <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10 pt-20 pb-14 md:pt-28 md:pb-20">
          <Reveal>
            <div className="flex items-center gap-4 sm:gap-6">
              <img src="/canary/canary.png" alt="" width={110} height={110}
                   className="w-14 h-14 sm:w-20 sm:h-20 lg:w-[104px] lg:h-[104px] shrink-0
                              drop-shadow-[0_0_44px_rgba(242,194,48,0.3)]" />
              <h1 className="font-display font-black text-[#F4F2ED] tracking-tight leading-[0.82]
                             text-[3.4rem] sm:text-7xl lg:text-[7.5rem]">
                Canary
              </h1>
            </div>

            <div className="mt-8">
              <PlatformSwitch value={platform} onChange={setPlatform} />
            </div>

            <motion.p key={platform + '-h'}
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
               className="mt-7 sm:mt-8 font-display font-bold text-[#F4F2ED]
                          text-[1.75rem] sm:text-4xl lg:text-[3.1rem] leading-[1.1] max-w-[19ch]">
              {P.headline[0]}<br />
              <span style={{ color: GOLD }}>{P.headline[1]}</span>
            </motion.p>

            <motion.p key={platform + '-s'}
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               transition={{ duration: 0.3, delay: 0.05 }}
               className="mt-6 text-lg sm:text-xl text-[#F4F2ED]/60 max-w-xl leading-relaxed">
              {P.sub}
            </motion.p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              {P.shipping ? <Download /> : <TestCTA />}
              <span className="text-xs uppercase tracking-[0.14em] text-[#F4F2ED]/40">
                {P.meta}
              </span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ============ THE PRODUCT, IMMEDIATELY ============
          Before any argument. A stranger should see what they are downloading
          within one scroll, not after seven hundred words of preamble. */}
      <section className="relative z-10" style={{ background: INK }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 pb-16 md:pb-24">
          <Reveal>
            <figure>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40
                              shadow-[0_40px_100px_-24px_rgba(0,0,0,0.9)]">
                <img src="/canary/app-screenshot.png"
                     alt="The Canary app after a scan: a red bird, and findings showing an unexpected shutdown and an SSD that has used 23% of its spare blocks at 0% wear."
                     width={1240} height={820} loading="lazy"
                     className="w-full h-auto block" />
              </div>
              <figcaption className="mt-4 text-sm text-[#F4F2ED]/40 max-w-2xl leading-relaxed">
                A real scan on a real machine. Only the computer name is edited out.
                One window — no account, no subscription, nothing left running when you close it.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* The proof is a Samsung SMART readout. Apple silicon hides the SSD's
          counters behind its own storage fabric, so this evidence simply does
          not exist on Mac — showing it under the macOS tab would be claiming a
          capability the product does not have, which is the one thing this
          page cannot afford to do. */}
      {P.shipping && (
      <>
      {/* ============ THE PROOF — light, and almost wordless ============
          The contrast break. This is the single most persuasive thing on the
          page, so it gets the loudest treatment and the fewest words. */}
      <section style={{ background: PAPER, color: INK }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <Reveal>
            <p className="text-[0.68rem] uppercase tracking-[0.2em] opacity-45">Why it exists</p>
            <h2 className="mt-5 font-display font-black text-[2.1rem] sm:text-5xl lg:text-6xl
                           leading-[1.02] max-w-[20ch]">
              Samsung’s own tool called this drive
              <span className="text-emerald-600"> Good</span>.
            </h2>
          </Reveal>

          <motion.div className="mt-14 grid sm:grid-cols-2 gap-x-14 gap-y-12 max-w-4xl"
                      variants={stagger(0.12, 0.1)} {...inView}>
            <motion.div variants={fadeUp}>
              <p className="font-display font-black text-6xl sm:text-8xl leading-none text-red-600">
                <Count to={252} />
              </p>
              <p className="mt-3 text-lg font-bold">unrecoverable read errors</p>
              <p className="mt-1.5 opacity-60 leading-relaxed">
                Data the drive could no longer hand back. Not slow — gone.
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <p className="font-display font-black text-6xl sm:text-8xl leading-none text-red-600">
                <Count to={23} suffix="%" delay={340} />
              </p>
              <p className="mt-3 text-lg font-bold">of its spare blocks used up</p>
              <p className="mt-1.5 opacity-60 leading-relaxed">
                At zero percent wear. The drive wasn’t worn out. It was breaking.
              </p>
            </motion.div>
          </motion.div>

          <Reveal>
            <p className="mt-14 text-xl sm:text-2xl font-semibold max-w-2xl leading-snug">
              Vendor tools report a pass/fail flag. Canary reads the counters
              underneath it — and tells you what they mean.
            </p>
          </Reveal>
        </div>
      </section>

      </>
      )}

      {/* ============ WHAT IT CHECKS — scannable, six tiles ============ */}
      <section style={{ background: INK }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <Reveal>
            <h2 className="font-display font-black text-[#F4F2ED]
                           text-[2.1rem] sm:text-5xl leading-[1.02] max-w-[16ch]">
              What it looks at.
            </h2>
          </Reveal>
          <motion.div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-px
                                 bg-white/10 border border-white/10 rounded-xl overflow-hidden"
                      variants={stagger(0.06, 0.08)} {...inView}>
            {P.checks.map((c) => (
              <motion.div key={c.t} variants={fadeUp} className="p-7" style={{ background: INK }}>
                <h3 className="font-display font-bold text-lg text-[#F4F2ED]">{c.t}</h3>
                <p className="mt-2.5 text-[0.95rem] text-[#F4F2ED]/55 leading-relaxed">{c.d}</p>
              </motion.div>
            ))}
          </motion.div>

          <Reveal>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              {P.shipping ? <Download /> : <TestCTA />}
              <span className="text-sm text-[#F4F2ED]/40">
                Scanning changes nothing. Nothing is applied unless you tick it and confirm.
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ WHAT IT WON'T DO — light again ============
          The trust argument, and the one thing no competitor will print. */}
      <section style={{ background: PAPER, color: INK }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <Reveal>
            <h2 className="font-display font-black text-[2.1rem] sm:text-5xl lg:text-6xl
                           leading-[1.02] max-w-[18ch]">
              Four things it refuses to do.
            </h2>
            <p className="mt-5 text-lg opacity-60 max-w-2xl leading-relaxed">
              Every one of these is standard in paid “PC optimizers”. All four are
              placebo at best.
            </p>
          </Reveal>
          <motion.div className="mt-12 grid sm:grid-cols-2 gap-x-12 gap-y-9 max-w-4xl"
                      variants={stagger(0.08, 0.1)} {...inView}>
            {WONT.map((w) => (
              <motion.div key={w.t} variants={fadeUp} className="border-t-2 border-[#0E1116]/15 pt-5">
                <h3 className="font-display font-bold text-lg line-through decoration-red-500/70 decoration-2">
                  {w.t}
                </h3>
                <p className="mt-2 opacity-65 leading-relaxed">{w.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ============ COMPROMISE ============ */}
      <section style={{ background: INK }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <Reveal>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#F4F2ED]/35">
                If you think you’ve been hacked
              </p>
              <h2 className="mt-5 font-display font-black text-[#F4F2ED]
                             text-[2.1rem] sm:text-5xl leading-[1.02]">
                Before you wipe the whole machine.
              </h2>
              <p className="mt-6 text-lg text-[#F4F2ED]/60 leading-relaxed">
                Reinstalling Windows costs you a day. Not reinstalling, when
                something really is on there, costs more. Canary looks for the
                specific ways malware stays on a PC — so the decision is based
                on something.
              </p>
            </Reveal>

            <Reveal>
              <div className="rounded-xl border border-red-400/25 bg-red-500/[0.06] p-6 sm:p-7">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-red-400 mb-3">
                  And the honest limit
                </p>
                <p className="text-[#F4F2ED]/80 leading-relaxed">
                  It can raise suspicion. It <strong className="text-[#F4F2ED]">cannot</strong> prove
                  a PC is clean — anything running at kernel level hides from it.
                </p>
                <p className="mt-4 text-[#F4F2ED]/80 leading-relaxed">
                  So findings mean something. An absence of findings does not.
                  If you have real reason to think you were hacked, reinstall —
                  and this scan should not talk you out of it.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ CLOSE ============ */}
      <section className="relative isolate overflow-hidden" style={{ background: INK }}>
        <div className="absolute inset-0 z-0 opacity-[0.14] pointer-events-none"
             style={{ background: `radial-gradient(circle at 50% 120%, ${GOLD}, transparent 62%)` }} />
        <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10 py-24 md:py-32 text-center">
          <Reveal>
            <img src="/canary/canary.png" alt="" width={96} height={96}
                 className="mx-auto w-16 h-16 sm:w-24 sm:h-24 drop-shadow-[0_0_50px_rgba(242,194,48,0.35)]" />
            <h2 className="mt-8 font-display font-black text-[#F4F2ED]
                           text-[2.3rem] sm:text-6xl leading-[1.0] max-w-[16ch] mx-auto">
              Find out what your PC isn’t telling you.
            </h2>
            <p className="mt-6 text-lg text-[#F4F2ED]/55 max-w-xl mx-auto leading-relaxed">
              Takes about a minute. Nothing is installed, and nothing keeps
              running afterwards.
            </p>
            <div className="mt-10 flex flex-col items-center gap-5">
              {P.shipping ? <Download big /> : <TestCTA big />}
              <p className="text-xs uppercase tracking-[0.14em] text-[#F4F2ED]/35">
                Free · no account · alpha
              </p>
            </div>
            <p className="mt-12 text-sm text-[#F4F2ED]/40">
              Found a bug, or something it got wrong?{' '}
              <a href={DISCORD} target="_blank" rel="noopener noreferrer"
                 className="underline underline-offset-4 hover:text-[#F2C230] transition-colors">
                Tell me on Discord
              </a>
              {' '}— especially if it warned about something you know is fine.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
