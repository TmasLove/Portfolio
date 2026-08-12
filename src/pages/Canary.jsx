import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import BirdsCanvas from '../components/home/BirdsCanvas'
import Section from '../components/ui/Section'
import Eyebrow from '../components/ui/Eyebrow'
import Reveal from '../components/ui/Reveal'
import { fadeUp, stagger, inView } from '../lib/motion'

const DOWNLOAD = 'https://drive.google.com/file/d/13jyO3t6n8ksKIRr4b2UshMSnlWlsEJTl/view?usp=drive_link'
const DISCORD = 'https://discord.com/users/346119932511125515'

// The bird's colour is earned by the scan result, never chosen by the user.
const STATES = [
  { img: 'blue', label: 'Not scanned', hex: '#4E9BE8' },
  { img: 'green', label: 'Nothing found', hex: '#3ECF8E' },
  { img: 'yellow', label: 'Worth a look', hex: '#F2C230' },
  { img: 'red', label: 'Needs attention', hex: '#FF5F56' },
]

const FINDINGS = [
  { sev: 'Critical', tone: 'bg-red-500/15 text-red-400',
    title: '252 unrecoverable media errors',
    body: 'Reads the drive could not recover, even with its own error correction.' },
  { sev: 'Warning', tone: 'bg-amber-400/15 text-amber-300',
    title: '7 unexpected shutdowns — none in 20 days',
    body: 'Downgraded because it stopped happening, and it tells you that is why.' },
  { sev: 'Warning', tone: 'bg-amber-400/15 text-amber-300',
    title: 'Drive health could not be verified',
    body: 'Windows refused the query. That is a gap — not a pass.' },
  { sev: 'Warning', tone: 'bg-amber-400/15 text-amber-300',
    title: 'GPU reporting 8 GB of VRAM, not 24 GB',
    body: 'Windows had the card at a third of its actual memory. Flagged, then corrected.' },
  { sev: 'Healthy', tone: 'bg-emerald-400/15 text-emerald-300',
    title: 'Folders stored locally',
    body: 'Nothing silently syncing to OneDrive.' },
]

const SECURITY = [
  { h: 'Persistence',
    p: 'WMI event subscriptions, sign-in hijacks, launch hijacks, injected DLLs and scheduled tasks running hidden or encoded commands.' },
  { h: 'Antivirus posture',
    p: 'Real-time protection and tamper protection switched off, stale definitions, and scan exclusions - a favourite trick is to exclude a folder, then put the payload in it.' },
  { h: 'Network and access',
    p: 'Hosts-file entries blocking security or update domains, an unexpected proxy, Remote Desktop enabled, and remote-access tools like AnyDesk or TeamViewer running.' },
  { h: 'Accounts and logs',
    p: 'Administrator accounts you did not create, recent password changes, Defender detection history, and whether the Security log has been cleared.' },
  { h: 'Network exposure',
    p: 'The same surface an attacker scans first - SMBv1 / EternalBlue, exposed Remote Desktop, open ports, missing account lockout, failed-login spikes - checked from the inside, before anyone tries.' },
]
const WONT = [
  { h: 'Clean your registry',
    p: 'It is an indexed database. Unused keys cost nothing. Microsoft does not endorse cleaners, and deleting a live key breaks things weeks later.' },
  { h: '"Free up" your RAM',
    p: 'Unused RAM is wasted RAM. Windows caches on purpose. Emptying it makes the next few minutes slower, not faster.' },
  { h: 'Disable services in bulk',
    p: 'Most sit idle using no CPU. The ones that matter — Update, Defender, audio — break in ways you will never trace back.' },
  { h: 'Promise "30% faster"',
    p: 'A number with no methodology is marketing. Be sceptical of any figure a tool will not show its working for.' },
]

/* One tool glanced and stopped. The other kept counting — so the numbers climb
   while "Good" just sits there. The whole argument, in motion. */
function Count({ to, suffix = '', duration = 1200, delay = 0 }) {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, margin: '-80px' })
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

function Bird({ colour = 'canary', size = 40, className = '' }) {
  const src = colour === 'canary' ? '/canary/canary.png' : `/canary/bird-${colour}.png`
  return <img src={src} alt="" width={size} height={size} className={className} />
}

export default function Canary() {
  return (
    <>
      {/* ---------- Hero: name, claim, action. Nothing else.
           A flock of the brand-yellow birds drifts behind it - the same boid
           canvas the home page uses, recoloured. Purely ambient: it sits under
           the content, ignores pointer events, and the component already bails
           out entirely under prefers-reduced-motion. ---------- */}
      <div className="relative isolate bg-night text-cream">
        <BirdsCanvas color={0xF2C230}
                     className="pointer-events-none absolute inset-0 z-0 opacity-[0.28]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-night" />
      <Section dark className="pt-24 relative z-10 !bg-transparent" containerClassName="pb-10 md:pb-14">
        <Reveal>
          <Eyebrow dark>Windows diagnostics · free · alpha</Eyebrow>
          <div className="flex items-end gap-4 sm:gap-7">
            <Bird size={110}
                  className="shrink-0 w-[64px] h-[64px] sm:w-[92px] sm:h-[92px] lg:w-[110px] lg:h-[110px] drop-shadow-[0_0_40px_rgba(242,194,48,0.28)]" />
            <h1 className="font-display font-black text-[3.15rem] sm:text-8xl lg:text-9xl leading-[0.82] tracking-tight">
              Canary
            </h1>
          </div>
          <p className="mt-8 text-2xl sm:text-3xl text-cream/75 max-w-2xl leading-[1.25]">
            A second opinion for your PC — for when the tool that came with your
            hardware says everything is fine.
          </p>
          <div className="mt-9 sm:mt-10 flex flex-wrap items-center gap-x-5 gap-y-4">
            <a href={DOWNLOAD} target="_blank" rel="noopener noreferrer"
               className="rounded-full bg-cyan text-night font-bold uppercase tracking-[0.08em] text-sm px-8 py-4 hover:opacity-90 transition-opacity">
              Download free
            </a>
            <span className="text-xs uppercase tracking-[0.14em] text-cream/40">
              135&nbsp;KB · Windows 10/11 · nothing installed
            </span>
          </div>
        </Reveal>
      </Section>
      </div>

      {/* ---------- Why this exists ----------
          Written as a sequence, not a comparison. Two equal columns implied
          both readings were equally valid, when the point is that one of them
          told me nothing. Setup, turn, then the explanation that makes the
          disagreement make sense - and every number glossed in plain words,
          because "spare block pool" means nothing to most readers. */}
      <section className="bg-night text-cream border-y border-white/10">
        <div className="mx-auto w-full max-w-content px-6 md:px-10 py-16 md:py-24">

          {/* Setup */}
          <Reveal>
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-cream/35">
              Why this exists
            </p>
            <h2 className="mt-6 font-display font-black text-3xl sm:text-5xl leading-[1.05] max-w-3xl">
              My SSD&apos;s own manufacturer checked the drive
              <span className="text-cream/40"> and told me it was fine.</span>
            </h2>
            <div className="mt-8 inline-flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <span className="text-[0.62rem] uppercase tracking-[0.16em] text-cream/40">Samsung Magician</span>
              <span className="font-display font-black text-3xl sm:text-4xl text-emerald-400 leading-none">Good</span>
            </div>
          </Reveal>

          {/* Turn */}
          <Reveal>
            <p className="mt-14 text-xl sm:text-2xl font-semibold max-w-2xl leading-snug">
              It was not fine. Here is what that verdict left out.
            </p>
          </Reveal>

          {/* The evidence, each number said twice: once as data, once in English. */}
          <motion.div className="mt-10 grid sm:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl"
                      variants={stagger(0.12, 0.1)} {...inView}>
            <motion.div variants={fadeUp}>
              <p className="font-display font-black text-[3.25rem] sm:text-7xl text-red-400 leading-none">
                <Count to={252} />
              </p>
              <p className="mt-3 font-semibold">unrecoverable read errors</p>
              <p className="mt-1.5 text-cream/55 text-[0.95rem] leading-relaxed">
                Data the drive could no longer hand back — not slow, not corrupted
                in software. Gone.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <p className="font-display font-black text-[3.25rem] sm:text-7xl text-red-400 leading-none">
                <Count to={23} suffix="%" delay={380} />
              </p>
              <p className="mt-3 font-semibold">of its spare blocks already used</p>
              <p className="mt-1.5 text-cream/55 text-[0.95rem] leading-relaxed">
                Every SSD keeps replacement blocks for when parts of it fail. Nearly
                a quarter of mine were already spent.
              </p>
            </motion.div>
          </motion.div>

          <Reveal>
            <p className="mt-10 text-lg sm:text-xl text-cream/75 max-w-2xl leading-relaxed">
              And it had done that at{' '}
              <span className="text-cream font-semibold">zero percent wear</span> — barely
              used. The drive was not worn out. It was breaking.
            </p>
          </Reveal>

          {/* Second opinion. This escalates the setup before the explanation lands:
              it was not one bad tool, it was everything reading the same flag. Kept
              factual about what happened and aimed at the tooling, not the techs. */}
          <Reveal>
            <div className="mt-14 max-w-2xl">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-cream/35 mb-3">
                And it was not just the software
              </p>
              <p className="text-cream/75 leading-relaxed">
                I took the machine into Micro Center. Their techs ran OCCT — hours of
                stress testing across CPU, RAM, GPU and power supply — and it came back
                clean. Same verdict: healthy. Then they offered me an extended warranty
                on my own parts.
              </p>
              <p className="mt-4 text-cream/75 leading-relaxed">
                OCCT is a good tool. It just does not test the drive. It hammers compute
                and power hunting for instability under load; it never asks what the SSD
                has been logging about itself. Clean result, wrong question.
              </p>
              <p className="mt-4 text-cream/75 leading-relaxed">
                I turned the warranty down. Buying coverage on a drive I had already
                watched fail would have turned their miss into a free NVMe at their
                expense. It was the easy move. It was not the honest one.
              </p>
              <p className="mt-4 text-cream/75 leading-relaxed">
                Two opinions, one machine, one verdict — and it was wrong both times.
              </p>
            </div>
          </Reveal>

          {/* The explanation. This is the part that makes the tool make sense. */}
          <Reveal>
            <div className="mt-14 border-l-2 border-cyan pl-6 sm:pl-8 max-w-2xl">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-cyan mb-3">
                So why did it say Good?
              </p>
              <p className="text-cream/75 leading-relaxed">
                Because vendor tools report a pass/fail flag, and nothing had crossed
                its threshold yet. Technically correct. Practically useless — the
                counters underneath had been climbing for weeks, and it never mentioned
                them.
              </p>
              <p className="mt-4 text-cream/75 leading-relaxed">
                Canary reads those counters and tells you what they mean.
                That is the whole idea.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- What it does — narrow column, findings do the talking ---------- */}
      <Section>
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>What it does</Eyebrow>
            <h2 className="font-display font-black text-4xl sm:text-6xl leading-[0.95]">
              Hardware, or software?
            </h2>
            <p className="mt-6 text-lg text-ink/60 leading-relaxed max-w-xl">
              It scans for real faults — failing drives, crash patterns, driver problems —
              and turns Event Viewer codes into plain English. It tunes settings too, but
              that is the smaller half.
            </p>
            <p className="mt-5 text-lg text-ink/60 leading-relaxed max-w-xl">
              It matters because hardware costs money and software does not. A failing
              drive stalling a game load shows up as a graphics driver crash — and people
              buy a new GPU to fix a dying SSD.
            </p>
          </Reveal>
        </div>

        <motion.div className="mt-14 grid sm:grid-cols-2 gap-3" variants={stagger(0.07, 0.1)} {...inView}>
          {FINDINGS.map((f) => (
            <motion.div key={f.title} variants={fadeUp}
              className="rounded-xl border border-ink/10 bg-white/60 px-5 py-4">
              <span className={`inline-block rounded-full px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.09em] ${f.tone}`}>
                {f.sev}
              </span>
              <p className="mt-3 font-semibold text-sm leading-snug">{f.title}</p>
              <p className="mt-1 text-sm text-ink/55 leading-snug">{f.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ---------- Compromise check ----------
          This was only ever mentioned as a disclaimer further down, which gave a
          real capability nothing but negative billing. It gets a section, and the
          honest limit stays attached to it rather than living somewhere else. */}
      <Section dark>
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow dark>If you think you have been hacked</Eyebrow>
            <h2 className="font-display font-black text-4xl sm:text-6xl leading-[0.95]">
              Before you wipe<br />the whole machine.
            </h2>
            <p className="mt-6 text-lg text-cream/65 leading-relaxed max-w-2xl">
              Reinstalling Windows costs you a day and everything not backed up. Not
              reinstalling, when something really is on there, costs more. Canary looks
              for the specific ways malware stays on a PC, so the decision is based on
              something.
            </p>
          </Reveal>
        </div>

        <motion.div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    variants={stagger(0.08, 0.1)} {...inView}>
          {SECURITY.map((s) => (
            <motion.div key={s.h} variants={fadeUp}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-display font-bold text-base">{s.h}</h3>
              <p className="mt-2 text-sm text-cream/55 leading-relaxed">{s.p}</p>
            </motion.div>
          ))}
        </motion.div>

        <Reveal>
          <div className="mt-12 grid lg:grid-cols-2 gap-8 lg:gap-14">
            <div className="border-l-2 border-red-400/70 pl-6">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-red-400 mb-3">
                What it cannot do
              </p>
              <p className="text-cream/75 leading-relaxed">
                It can raise suspicion. It <strong className="text-cream">cannot</strong> tell
                you a PC is clean. Everything it does runs as an ordinary program, and
                anything operating at kernel level hides from all of it.
              </p>
              <p className="mt-4 text-cream/75 leading-relaxed">
                So findings mean something. An absence of findings does not. If you have
                real reason to think you were hacked, reinstall — and this scan should not
                talk you out of it.
              </p>
            </div>
            <div className="border-l-2 border-cyan pl-6">
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-cyan mb-3">
                It also tells you what to do first
              </p>
              <p className="text-cream/75 leading-relaxed">
                Change your passwords <strong className="text-cream">from a different
                device</strong>, email first. Almost everyone gets this wrong — changing
                them on the compromised machine just hands over the new ones.
              </p>
              <p className="mt-4 text-cream/75 leading-relaxed">
                Then two-factor, sign out other sessions, offline scan, back up documents
                only, and reinstall from media made on another PC.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ---------- The bird, at scale. The product's personality. ---------- */}
      <Section dark containerClassName="py-16 md:py-20">
        <div className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-16 items-center">
          <motion.div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:flex sm:gap-7" variants={stagger(0.09, 0.1)} {...inView}>
            {STATES.map((s) => (
              <motion.div key={s.img} variants={fadeUp} className="text-center">
                <img src={`/canary/bird-${s.img}.png`} alt="" width="72" height="72"
                     className="mx-auto block w-12 h-12 sm:w-[72px] sm:h-[72px]" />
                <span className="mt-3 block text-[0.6rem] sm:text-[0.66rem] uppercase tracking-[0.08em]"
                      style={{ color: s.hex }}>
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
          <Reveal>
            <p className="text-xl sm:text-2xl text-cream/70 leading-snug max-w-lg">
              The bird does not change colour because you picked a favourite.
              It changes because it found something.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* ---------- What it won't do ---------- */}
      <Section>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>The part that matters</Eyebrow>
            <h2 className="font-display font-black text-4xl sm:text-7xl leading-[0.92]">
              What it won&apos;t do.
            </h2>
            <p className="mt-6 text-lg text-ink/60 leading-relaxed">
              &ldquo;PC optimizer&rdquo; has a deserved reputation. Here is what is missing
              on purpose — so you can judge any tool that offers it. Including this one.
            </p>
          </Reveal>
        </div>

        <motion.div className="mt-14 grid sm:grid-cols-2 gap-x-10 gap-y-9" variants={stagger(0.08, 0.12)} {...inView}>
          {WONT.map((w) => (
            <motion.div key={w.h} variants={fadeUp} className="border-t border-ink/15 pt-5">
              <h3 className="font-display font-bold text-xl line-through decoration-red-400/70 decoration-2 decoration-from-font">
                {w.h}
              </h3>
              <p className="mt-3 text-[0.94rem] text-ink/60 leading-relaxed">{w.p}</p>
            </motion.div>
          ))}
        </motion.div>

        <Reveal>
          <p className="mt-14 text-xl sm:text-2xl leading-snug max-w-3xl border-l-2 border-violet pl-7">
            Every change says what it does and why, records the old value, and writes an
            undo script. If a change cannot be explained in one sentence, it should not
            ship — and you should not trust a tool that will not explain it.
          </p>
        </Reveal>
      </Section>

      {/* ---------- The ask ---------- */}
      <Section dark>
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-12 lg:gap-20">
          <Reveal>
            <Eyebrow dark>Why you</Eyebrow>
            <h2 className="font-display font-black text-4xl sm:text-6xl leading-[0.92]">
              Tested on<br />exactly one PC.
            </h2>
            <p className="mt-7 text-lg text-cream/60 leading-relaxed">
              Mine. An i9-13900K with an RX 7900 XTX — representative of nothing. Every
              check was written against one machine&apos;s quirks. No idea what it does on
              an NVIDIA card, an AMD CPU, a laptop, or a clean install.
            </p>
            <p className="mt-4 text-lg text-cream/60 leading-relaxed">
              It caught a real failing SSD. It also threw <strong className="text-cream">two
              false alarms</strong> I only spotted because I already knew the answer. That is
              what other machines will shake out.
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
              <h3 className="font-display font-bold text-lg">What helps most</h3>
              <ul className="mt-5 space-y-4 text-sm text-cream/65">
                <li><span className="text-cyan font-bold mr-2">01</span>Tell me if a finding is <strong className="text-cream">wrong</strong>. A warning about something you know is fine is the best bug report there is.</li>
                <li><span className="text-cyan font-bold mr-2">02</span>Tell me if a finding is <strong className="text-cream">confusing</strong>. If you cannot tell what to do, that is my fault.</li>
                <li><span className="text-cyan font-bold mr-2">03</span>Anything that <strong className="text-cream">crashes or looks broken</strong> — especially on a laptop or an NVIDIA card.</li>
              </ul>
              <div className="mt-7 pt-6 border-t border-white/10 flex flex-wrap gap-3">
                <a href={DOWNLOAD} target="_blank" rel="noopener noreferrer"
                   className="rounded-full bg-cream text-night font-bold uppercase tracking-[0.08em] text-xs px-5 py-2.5 hover:bg-cyan transition-colors">
                  Download
                </a>
                <a href={DISCORD} target="_blank" rel="noopener noreferrer"
                   className="rounded-full border border-white/25 font-bold uppercase tracking-[0.08em] text-xs px-5 py-2.5 hover:border-cyan hover:text-cyan transition-colors">
                  Message me on Discord
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ---------- Setup + the honest limit ---------- */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <Reveal>
            <Eyebrow>Sixty seconds</Eyebrow>
            <h2 className="font-display font-black text-4xl sm:text-5xl leading-[0.95]">
              Nothing installed.
            </h2>
            <ol className="mt-7 space-y-4 text-[0.94rem] text-ink/65">
              <li><span className="font-display font-black text-violet mr-2">01</span>Download and unzip. Right-click the ZIP → Properties → <strong>Unblock</strong> first.</li>
              <li><span className="font-display font-black text-violet mr-2">02</span>Double-click <code className="bg-ink/8 px-1.5 py-0.5 rounded text-xs">Run Canary.bat</code>, accept the admin prompt.</li>
              <li><span className="font-display font-black text-violet mr-2">03</span>Hit <strong>Run Scan Only</strong> — the outlined button under Optimize.</li>
              <li><span className="font-display font-black text-violet mr-2">04</span>Read the Health tab. Tell me what looks wrong.</li>
            </ol>
            <p className="mt-7 text-sm text-ink/50 leading-relaxed">
              It is a PowerShell script — nothing added to your system, nothing to
              uninstall. Admin is needed to read drive health.{' '}
              <strong className="text-ink/75">Scanning changes nothing.</strong>
            </p>
          </Reveal>

          <Reveal>
            <Eyebrow>The rule</Eyebrow>
            <h2 className="font-display font-black text-4xl sm:text-5xl leading-[0.95]">
              &ldquo;Could not verify&rdquo;<br />is not &ldquo;passed&rdquo;.
            </h2>
            <p className="mt-7 text-ink/60 leading-relaxed">
              When a check cannot run — Windows refuses the query, the tool lacks
              permission, the data is simply not there — Canary says so and names the gap.
            </p>
            <p className="mt-4 text-ink/60 leading-relaxed">
              It never reports a check it could not complete as one that passed. Confident
              false reassurance is the worst thing a diagnostic tool can do, and it is the
              exact failure that made this necessary.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Bird size={40} className="opacity-90" />
              <span className="text-xs uppercase tracking-[0.14em] text-ink/40 leading-relaxed">
                Every number measured on a real machine.<br />Not estimated.
              </span>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
