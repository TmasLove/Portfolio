import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Section from '../ui/Section'
import Eyebrow from '../ui/Eyebrow'
import Reveal from '../ui/Reveal'
import { EASE } from '../../lib/motion'

export default function AboutTeaser() {
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          className="overflow-hidden rounded-sm"
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <img
            src="/images/tomcat.jpeg"
            alt="Tommy Roldan"
            className="aspect-[4/5] object-cover w-full rounded-sm"
          />
        </motion.div>

        <Reveal>
          <Eyebrow>About</Eyebrow>
          <h2 className="font-display font-black text-4xl tracking-tight">
            Builder, rider, Miami native.
          </h2>
          <p className="mt-6 text-ink/70 leading-relaxed">
            I'm Tommy — a developer and creative who's been shipping since 2015. I
            build apps, web platforms, and AI agents end-to-end, sweating the
            details on craft, speed, and motion.
          </p>
          <p className="mt-4 text-ink/70 leading-relaxed">
            Off the keyboard, you'll find me on a bike. Cycling shaped how I work:
            steady output, sharp lines, and a love for the long ride.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-block text-violet font-bold uppercase text-sm tracking-[0.08em]"
          >
            More about me →
          </Link>
        </Reveal>
      </div>
    </Section>
  )
}
