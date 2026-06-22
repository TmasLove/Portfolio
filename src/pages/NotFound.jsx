import { Link } from 'react-router-dom'
import Section from '../components/ui/Section'
export default function NotFound() {
  return (
    <Section className="pt-24 text-center">
      <h1 className="font-display font-black text-7xl">404</h1>
      <p className="mt-4 text-ink/60">That page wandered off.</p>
      <Link to="/" className="inline-block mt-6 text-violet font-bold uppercase tracking-[0.08em] text-sm">← Back home</Link>
    </Section>
  )
}
