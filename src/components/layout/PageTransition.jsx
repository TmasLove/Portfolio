import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'
export default function PageTransition({ children }) {
  return (
    <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }}>
      {children}
    </motion.main>
  )
}
