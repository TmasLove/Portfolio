export const EASE = [0.22, 1, 0.36, 1]

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
}

export const stagger = (each = 0.08, delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: each, delayChildren: delay } },
})

export const inView = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-10% 0px' },
}
