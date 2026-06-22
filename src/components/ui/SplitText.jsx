import { motion } from 'framer-motion'
import { stagger, inView, EASE } from '../../lib/motion'
const word = { hidden: { y: '110%' }, visible: { y: '0%', transition: { duration: 0.7, ease: EASE } } }
export default function SplitText({ text, className = '' }) {
  return (
    <motion.span className={`inline ${className}`} variants={stagger(0.06)} {...inView} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span className="inline-block" variants={word}>{w}&nbsp;</motion.span>
        </span>
      ))}
    </motion.span>
  )
}
