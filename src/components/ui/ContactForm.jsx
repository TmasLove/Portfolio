import { useState } from 'react'
import { motion } from 'framer-motion'
import { SITE } from '../../data/site'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio inquiry from ${name || 'someone'}`)
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ''}`)
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`
    setSent(true)
  }

  const inputClass =
    'w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-cream placeholder-cream/40 focus:border-cyan focus:outline-none transition-colors'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className={inputClass}
      />
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={inputClass}
      />
      <textarea
        placeholder="Your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={6}
        className={`${inputClass} resize-none`}
      />
      <motion.button
        type="submit"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-violet text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-[0.08em] w-full sm:w-auto"
      >
        Send message →
      </motion.button>
      {sent && (
        <p className="text-xs text-cyan">Opening your mail app…</p>
      )}
    </form>
  )
}
