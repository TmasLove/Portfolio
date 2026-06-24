import Section from '../components/ui/Section'
import Eyebrow from '../components/ui/Eyebrow'
import SplitText from '../components/ui/SplitText'
import Reveal from '../components/ui/Reveal'
import ContactForm from '../components/ui/ContactForm'
import AnimatedBlobs from '../components/ui/AnimatedBlobs'
import InteractiveField from '../components/ui/InteractiveField'
import { SITE } from '../data/site'

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const StravaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
  </svg>
)

const AppleMusicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-5v-6l5 3z"/>
  </svg>
)

const socials = [
  { key: 'linkedin', label: 'LinkedIn', href: SITE.socials.linkedin, Icon: LinkedInIcon },
  { key: 'instagram', label: 'Instagram', href: SITE.socials.instagram, Icon: InstagramIcon },
  { key: 'strava', label: 'Strava', href: SITE.socials.strava, Icon: StravaIcon },
  { key: 'appleMusic', label: 'Apple Music', href: SITE.socials.appleMusic, Icon: AppleMusicIcon },
]

export default function Contact() {
  return (
    <Section dark className="pt-24 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-0">
        <AnimatedBlobs className="absolute inset-0 opacity-70" />
        <InteractiveField className="absolute inset-0" />
      </div>
      <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20">

        {/* Left column: hero + CTA + socials */}
        <div>
          <Reveal>
            <Eyebrow dark>Contact</Eyebrow>
            <h1 className="font-display font-black text-6xl sm:text-8xl leading-none">
              <SplitText text="Let's talk." />
            </h1>
            <p className="mt-6 text-lg text-cream/60 max-w-xl">
              I love meeting new people. Got a project, a beer, or an idea? Hit me up.
            </p>
          </Reveal>

          <Reveal className="mt-16">
            <Eyebrow dark>Follow along</Eyebrow>
            <div className="flex gap-3 mt-4">
              {socials.map(({ key, label, href, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-12 h-12 grid place-items-center rounded-full border border-white/15 hover:border-cyan text-cream hover:text-cyan transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right column: send a note form */}
        <div>
          <Reveal>
            <Eyebrow dark>Send a note</Eyebrow>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Reveal>
        </div>

      </div>
    </Section>
  )
}
