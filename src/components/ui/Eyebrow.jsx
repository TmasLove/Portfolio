export default function Eyebrow({ children, dark = false }) {
  return <span className={`block text-xs tracking-[0.22em] uppercase mb-4 ${dark ? 'text-cyan' : 'text-violet'}`}>{children}</span>
}
