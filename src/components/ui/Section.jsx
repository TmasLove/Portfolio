import Container from './Container'
export default function Section({ dark = false, className = '', containerClassName = '', children, id }) {
  return (
    <section id={id} className={`${dark ? 'bg-night text-cream' : 'bg-cream text-ink'} ${className}`}>
      <Container className={`py-20 md:py-28 ${containerClassName}`}>{children}</Container>
    </section>
  )
}
