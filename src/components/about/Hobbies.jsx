import { motion } from 'framer-motion'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import Reveal from '../ui/Reveal'
import Icon from '../ui/Icon'
import { fade } from '../../lib/motion'
import { SITE } from '../../data/site'
import SteamCard from './SteamCard'
import DiscordCard from './DiscordCard'
import AppleMusicCard from './AppleMusicCard'

const pill =
  'inline-flex items-center rounded-full border border-violet/30 text-violet px-4 py-1.5 text-sm font-medium hover:bg-violet hover:text-cream transition-colors'

// Strava club "latest rides" embeds. Each src is a per-club token from
// Strava → club page → ⋯ → "Embed on your website". Add Fixed Latinos once you grab it.
const STRAVA_CLUBS = [
  {
    name: 'GRVT',
    src: 'https://www.strava.com/clubs/558892/latest-rides/c36ad841324e45dd580b1fe925f8d2b30351b763?show_rides=true',
  },
  {
    name: 'Fixed Latinos',
    src: 'https://www.strava.com/clubs/206322/latest-rides/86bb2fd6cb688a02d8925fd0b5c16234584ff381?show_rides=true',
  },
]

export default function Hobbies() {
  return (
    <Section>
      <Eyebrow>Off the keyboard</Eyebrow>
      <Reveal as="h2" className="font-display font-black text-4xl">
        Hobbies
      </Reveal>

      <div className="mt-12 grid md:grid-cols-2 gap-10">
        {/* Gaming */}
        <Reveal className="border border-ink/10 rounded-sm p-8">
          <div className="flex items-center gap-3">
            <Icon name="bot" className="w-6 h-6 text-violet" />
            <h3 className="font-display font-black text-2xl">Gaming</h3>
          </div>
          <p className="mt-4 text-ink/70">
            When I’m not building, I’m gaming — co-op nights, competitive ladders, and the occasional
            deep-dive RPG.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={SITE.socials.steam} target="_blank" rel="noopener" className={pill}>
              Steam →
            </a>
            {SITE.socials.discordServer && (
              <a href={SITE.socials.discordServer} target="_blank" rel="noopener" className={pill}>
                Discord →
              </a>
            )}
          </div>
          <div className="mt-6 space-y-4">
            <SteamCard />
            <DiscordCard />
          </div>
        </Reveal>

        {/* Cycling */}
        <Reveal className="border border-ink/10 rounded-sm p-8">
          <div className="flex items-center gap-3">
            <Icon name="bike" className="w-6 h-6 text-violet" />
            <h3 className="font-display font-black text-2xl">Cycling</h3>
          </div>
          <p className="mt-4 text-ink/70">
            Cycling is the constant — from years in Miami’s best shops (Mack Cycle, City Bikes) to the
            pure joy of the ride.
          </p>
          <div className="mt-6">
            <a href={SITE.socials.strava} target="_blank" rel="noopener" className={pill}>
              Strava →
            </a>
          </div>

          <div className="mt-8">
            <h4 className="text-xs uppercase tracking-[0.18em] text-ink/40">Strava clubs</h4>
            <ul className="mt-3 space-y-2">
              {SITE.stravaClubs.map((c) => (
                <li key={c.name} className="flex flex-wrap items-baseline gap-x-2">
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener"
                      className="font-bold hover:text-violet transition-colors"
                    >
                      {c.name}
                    </a>
                  ) : (
                    <span className="font-bold">{c.name}</span>
                  )}
                  <span className="text-ink/50">— {c.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h4 className="text-xs uppercase tracking-[0.18em] text-ink/40">Latest club rides</h4>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {STRAVA_CLUBS.map((club) => (
                <div key={club.name}>
                  <p className="mb-2 text-sm font-bold">{club.name}</p>
                  <div className="overflow-hidden rounded-sm border border-ink/10">
                    <iframe
                      height="454"
                      width="100%"
                      frameBorder="0"
                      allowTransparency="true"
                      scrolling="no"
                      loading="lazy"
                      title={`${club.name} Strava Club — Latest Rides`}
                      src={club.src}
                    ></iframe>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Music strip */}
      <Reveal className="mt-12 border-t border-ink/10 pt-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <Eyebrow>On repeat</Eyebrow>
          <h3 className="font-display font-black text-3xl sm:text-4xl">Always something playing</h3>
          <p className="mt-5 text-ink/70 max-w-2xl">
            Coding, riding, driving — there’s a soundtrack to all of it. Catch what I’m into on Apple Music.
          </p>
        </div>
        <AppleMusicCard />
      </Reveal>

      {/* GRVT story */}
      <Reveal className="mt-12 border-t border-ink/10 pt-12 grid md:grid-cols-[1fr_auto] gap-10 items-center">
        <div>
          <Eyebrow>A brand I built</Eyebrow>
          <h3 className="font-display font-black text-3xl sm:text-4xl">GRVT — a beautiful failure</h3>
          <p className="mt-5 text-ink/70 max-w-2xl">
            GRVT was a failed attempt — it started a few years too early, before enough people were
            into cycling, and it never made money. But I learned a ton, made some cool designs I
            still wear, and it was a blast. A reminder that not every build is about ROI.
          </p>
        </div>
        <motion.a
          href="/GRVT.html"
          className="block shrink-0"
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <img
            src="/images/gfx/gvrt-logo.png"
            alt="GRVT"
            className="w-40 md:w-56 object-contain"
          />
        </motion.a>
      </Reveal>
    </Section>
  )
}
