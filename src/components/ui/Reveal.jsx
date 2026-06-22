import { motion } from 'framer-motion'
import { fadeUp, inView } from '../../lib/motion'
export default function Reveal({ as = 'div', className = '', children, variants = fadeUp }) {
  const M = motion[as] || motion.div
  return <M className={className} variants={variants} {...inView}>{children}</M>
}
