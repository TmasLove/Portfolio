import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Section from '../components/ui/Section'
import Container from '../components/ui/Container'
import Eyebrow from '../components/ui/Eyebrow'
import Reveal from '../components/ui/Reveal'
import { fadeUp, stagger, inView } from '../lib/motion'

const DOWNLOAD = 'https://drive.google.com/file/d/13jyO3t6n8ksKIRr4b2UshMSnlWlsEJTl/view?usp=drive_link'
const DISCORD  = 'https://discord.com/users/346119932511125515'

// The bird colour is earned by the scan result, never chosen by the user.
const STATES = [
  { c: '#4E9BE8', label: 'Not scanned' },
  { c: '#3ECF8E', label: 'Nothing found' },
  { c: '#F2C230', label: 'Worth a look' },
  { c: '#FF5F56', label: 'Needs attention' },
]

const FINDINGS = [
  { sev: 'Critical', tone: 'bg-red-500/15 text-red-400 border-red-500/30',
    title: '252 unrecoverable media errors',
    body: "Reads the drive couldn't recover, even with its own error correction." },
  { sev: 'Warning', tone: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    title: '7 unexpected shutdowns — none in 20 days',
    body: 'Downgraded because it stopped happening, and it tells you that’s why.' },
  { sev: 'Warning', tone: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    title: "Drive health couldn't be verified",
    body: 'Windows refused the query. That’s a gap — not a pass.' },
  { sev: 'Healthy', tone: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    title: 'Folders stored locally',
    body: 'Nothing silently syncing to OneDrive.' },
]

const WONT = [
  { h: 'Clean your registry',
    p: "It's an indexed database. Unused keys cost nothing. Microsoft doesn't endorse cleaners, and deleting a live key breaks things weeks later." },
  { h: '"Free up" your RAM',
    p: 'Unused RAM is wasted RAM. Windows caches on purpose. Emptying it makes the next few minutes slower, not faster.' },
  { h: 'Disable services in bulk',
    p: "Most sit idle using no CPU. The ones that matter — Update, Defender, audio — break in ways you'll never trace back." },
  { h: 'Promise "30% faster"',
    p: "A number with no methodology is marketing. Be sceptical of any figure a tool won't show its working for." },
]

function Bird({ size = 40, className = '' }) {
  return <img src="/canary/canary.png" alt="" width={size} height={size} className={className} />
}

export default function Canary() {
  const { t } = useTranslation()

  return (
    <>
      {/* ---------- Hero: the contradiction, before any pitch ---------- */}
      <Section dark className="pt-24">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
          <Reveal>
            <Eyebrow dark>{t('canary.eyebrow', 'Windows diagnostics')}</Eyebrow>
            <div className="flex items-center gap-5">
              <Bird size={92} className="shrink-0 drop-shadow-[0_0_28px_rgba(242,194,48,0.25)]" />
              <h1 className="font-display font-black text-6xl sm:text-8xl leading-[0.9]">Canary</h1>
            </div>
            <p className="mt-6 text-xl sm:text-2xl text-cream/70 max-w-xl leading-snug">
              A second opinion for your PC. It reads the counters vendors skip — and when
              it can&apos;t check something, it says so instead of calling it healthy.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href={DOWNLOAD} target="_blank" rel="noopener noreferrer"
                 className="rounded-full bg-cyan text-night font-bold uppercase tracking-[0.08em] text-sm px-7 py-3.5 hover:opacity-90 transition-opacity">
                Download free
              </a>
              <span className="text-xs uppercase tracking-[0.14em] text-cream/40">
                135&nbsp;KB · Windows 10/11 · nothing installed
              </span>
            </div>
          </Reveal>

          {/* Same drive, same afternoon, two verdicts. */}
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 backdrop-blur">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-cream/40 mb-5">
                Same drive · same afternoon
              </p>
              <div className="grid grid-cols-2 gap-5">
                <div className="border-r border-white/10 pr-5">
                  <p className="text-[0.6rem] uppercase tracking-[0.14em] text-cream/35 mb-2">Samsung Magician</p>
                  <p className="font-display font-black text-3xl text-emerald-400">Good</p>
                  <p className="text-xs text-cream/40 mt-1">Drive Health</p>
                </div>
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.14em] text-cream/35 mb-2">Canary</p>
                  <p className="text-sm tabular-nums leading-relaxed">
                    <span className="font-bold text-red-400">252</span> unrecoverable errors<br />
                    <span className="font-bold text-red-400">23%</span> spare blocks gone<br />
                    <span className="text-cream/40">…at 0% wear</span>
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bird states */}
        <motion.div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3" variants={stagger(0.07, 0.1)} {...inView}>
          {STATES.map((s) => (
            <motion.div key={s.label} variants={fadeUp}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center">
              <span className="mx-auto block h-8 w-8 rounded-full" style={{ background: s.c }} />
              <span className="mt-3 block text-[0.68rem] uppercase tracking-[0.1em] text-cream/50">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
        <p className="mt-4 text-sm text-cream/45 max-w-lg">
          The bird doesn&apos;t change colour because you picked a favourite. It changes because it found something.
        </p>
      </Section>

      {/* ---------- What it does ---------- */}
      <Section>
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16">
          <Reveal>
            <Eyebrow>What it does</Eyebrow>
            <h2 className="font-display font-black text-4xl sm:text-5xl leading-[0.95]">
              Hardware,<br />or software?
            </h2>
            <p className="mt-5 text-ink/60 leading-relaxed">
              It scans for real faults — failing drives, crash patterns, driver problems — and
              turns Event Viewer codes into plain English. It tunes settings too. That&apos;s the
              smaller half.
            </p>
            <p className="mt-3 text-ink/60 leading-relaxed">
              The answer decides whether you spend money.
            </p>
          </Reveal>

          <motion.div className="grid gap-3" variants={stagger(0.08, 0.1)} {...inView}>
            {FINDINGS.map((f) => (
              <motion.div key={f.title} variants={fadeUp}
                className="rounded-xl border border-ink/10 bg-white/60 px-5 py-4 flex gap-4 items-start">
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.09em] ${f.tone}`}>
                  {f.sev}
                </span>
                <span>
                  <span className="block font-semibold text-sm">{f.title}</span>
                  <span className="block text-sm text-ink/55 mt-0.5">{f.body}</span>
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ---------- What it won't do ---------- */}
      <Section dark>
        <Reveal>
          <Eyebrow dark>The part that matters</Eyebrow>
          <h2 className="font-display font-black text-4xl sm:text-6xl">What it won&apos;t do.</h2>
          <p className="mt-5 text-cream/60 max-w-2xl">
            &ldquo;PC optimizer&rdquo; has a deserved reputation. Here&apos;s what&apos;s missing on
            purpose — so you can judge any tool that offers it. Including this one.
          </p>
        </Reveal>

        <motion.div className="mt-12 grid sm:grid-cols-2 gap-4" variants={stagger(0.08, 0.15)} {...inView}>
          {WONT.map((w) => (
            <motion.div key={w.h} variants={fadeUp}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-cyan/40 transition-colors">
              <h3 className="font-display font-bold text-lg line-through decoration-red-400/70 decoration-2">{w.h}</h3>
              <p className="mt-2.5 text-sm text-cream/55 leading-relaxed">{w.p}</p>
            </motion.div>
          ))}
        </motion.div>

        <Reveal>
          <div className="mt-8 rounded-2xl border-l-2 border-cyan bg-white/[0.04] p-6">
            <p className="text-cream/70 leading-relaxed">
              <strong className="text-cream">Instead:</strong> every change says what it does and
              why, records the old value, and writes an undo script. If a change can&apos;t be
              explained in one sentence, it shouldn&apos;t ship — and you shouldn&apos;t trust a
              tool that won&apos;t explain it.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* ---------- Testing ask ---------- */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <Reveal>
            <Eyebrow>Why you</Eyebrow>
            <h2 className="font-display font-black text-4xl sm:text-5xl leading-[0.95]">
              Tested on<br />exactly one PC.
            </h2>
            <p className="mt-5 text-ink/60 leading-relaxed">
              Mine. An i9-13900K with an RX 7900 XTX — representative of nothing. Every check was
              written against one machine&apos;s quirks. No idea what it does on AMD, a laptop, or
              a clean install.
            </p>
            <p className="mt-3 text-ink/60 leading-relaxed">
              It caught a real failing SSD — and threw <strong>two false alarms</strong> I only
              spotted because I knew the answer. That&apos;s what other machines will shake out.
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-2xl border border-ink/10 bg-white/60 p-7">
              <h3 className="font-display font-bold text-lg">What helps most</h3>
              <ul className="mt-4 space-y-3 text-sm text-ink/65">
                <li className="flex gap-3"><span className="text-violet font-bold">1</span>
                  <span>Tell me if a finding is <strong>wrong</strong> — a warning about something you know is fine is the best bug report there is.</span></li>
                <li className="flex gap-3"><span className="text-violet font-bold">2</span>
                  <span>Tell me if a finding is <strong>confusing</strong>. If you can&apos;t tell what to do, that&apos;s my fault.</span></li>
                <li className="flex gap-3"><span className="text-violet font-bold">3</span>
                  <span>Anything that <strong>crashes or looks broken</strong> — especially on a laptop or AMD.</span></li>
              </ul>
              <div className="mt-6 pt-5 border-t border-ink/10 flex flex-wrap gap-3">
                <a href={DOWNLOAD} target="_blank" rel="noopener noreferrer"
                   className="rounded-full bg-ink text-cream font-bold uppercase tracking-[0.08em] text-xs px-5 py-2.5 hover:bg-violet transition-colors">
                  Download
                </a>
                <a href={DISCORD} target="_blank" rel="noopener noreferrer"
                   className="rounded-full border border-ink/20 font-bold uppercase tracking-[0.08em] text-xs px-5 py-2.5 hover:border-violet hover:text-violet transition-colors">
                  Message me on Discord
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ---------- Setup + honest limits ---------- */}
      <Section dark>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <Reveal>
            <Eyebrow dark>Setup</Eyebrow>
            <h2 className="font-display font-black text-3xl sm:text-4xl">Sixty seconds. Nothing installed.</h2>
            <ol className="mt-6 space-y-3 text-sm text-cream/65">
              <li><span className="text-cyan font-bold mr-2">01</span>Download and unzip. Right-click the ZIP → Properties → <strong>Unblock</strong> first.</li>
              <li><span className="text-cyan font-bold mr-2">02</span>Double-click <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">Run Canary.bat</code>, accept the admin prompt.</li>
              <li><span className="text-cyan font-bold mr-2">03</span>Hit <strong>Run Scan Only</strong> — the outlined button under Optimize.</li>
              <li><span className="text-cyan font-bold mr-2">04</span>Read the Health tab. Tell me what looks wrong.</li>
            </ol>
            <p className="mt-6 text-sm text-cream/45">
              It&apos;s a PowerShell script — nothing added to your system, nothing to uninstall.
              Admin is needed to read drive health. <strong className="text-cream/70">Scanning changes nothing.</strong>
            </p>
          </Reveal>

          <Reveal>
            <Eyebrow dark>Fair warning</Eyebrow>
            <h2 className="font-display font-black text-3xl sm:text-4xl">What it can&apos;t tell you.</h2>
            <p className="mt-6 text-cream/60 leading-relaxed">
              There&apos;s a check for signs of a compromised PC. It can raise suspicion. It{' '}
              <strong className="text-cream">cannot</strong> tell you a machine is clean — everything
              it does runs as an ordinary program, and anything at kernel level hides from all of it.
            </p>
            <p className="mt-3 text-cream/60 leading-relaxed">
              Same rule throughout: a check that couldn&apos;t run says &ldquo;couldn&apos;t
              verify&rdquo;, never &ldquo;passed&rdquo;.
            </p>
            <div className="mt-8 flex items-center gap-4 text-xs uppercase tracking-[0.14em] text-cream/35">
              <Bird size={30} />
              <span>Every number measured on a real machine. Not estimated.</span>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
