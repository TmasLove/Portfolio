import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { SITE } from '../../data/site'

const PROJECT_TYPES = ['Website', 'Web app', 'E-commerce / Shopify', 'AI agent / automation', 'Something else']
const BUDGETS = ['Not sure yet', '< $1k', '$1k – $5k', '$5k – $15k', '$15k+']

const field =
  'w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-cream placeholder-cream/40 focus:border-cyan focus:outline-none transition-colors'

export default function ContactForm() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', company: '', projectType: '', budget: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${SITE.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Name: form.name,
          Email: form.email,
          Company: form.company || '—',
          'Project type': form.projectType || '—',
          Budget: form.budget || '—',
          Message: form.message,
          _subject: `Portfolio inquiry — ${form.name || 'new lead'}`,
          _template: 'table',
          _captcha: 'false',
        }),
      })
      const data = await res.json().catch(() => ({}))
      setStatus(data.success === 'true' || data.success === true || res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-cyan/30 bg-cyan/5 p-8 text-center"
      >
        <p className="font-display font-black text-2xl text-cream">{t('form.successTitle', 'Message sent — thank you!')}</p>
        <p className="mt-2 text-sm text-cream/60">{t('form.successBody', "I'll get back to you soon. Talk shortly. 🚀")}</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
      <input className={field} type="text" placeholder={t('form.name', 'Your name *')} value={form.name} onChange={set('name')} required />
      <input className={field} type="email" placeholder={t('form.email', 'Your email *')} value={form.email} onChange={set('email')} required />
      <input className={field} type="text" placeholder={t('form.company', 'Company (optional)')} value={form.company} onChange={set('company')} />
      <select className={`${field} ${form.projectType ? '' : 'text-cream/40'}`} value={form.projectType} onChange={set('projectType')}>
        <option value="" className="text-night">{t('form.projectTypePlaceholder', 'Project type…')}</option>
        {PROJECT_TYPES.map((opt) => <option key={opt} value={opt} className="text-night">{t(`form.projectTypes.${opt}`, opt)}</option>)}
      </select>
      <select className={`${field} sm:col-span-2 ${form.budget ? '' : 'text-cream/40'}`} value={form.budget} onChange={set('budget')}>
        <option value="" className="text-night">{t('form.budgetPlaceholder', 'Budget (optional)…')}</option>
        {BUDGETS.map((b) => <option key={b} value={b} className="text-night">{t(`form.budgets.${b}`, b)}</option>)}
      </select>
      <textarea
        className={`${field} sm:col-span-2 resize-none`}
        placeholder={t('form.message', 'Tell me about your project *')}
        rows={5}
        value={form.message}
        onChange={set('message')}
        required
      />
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <motion.button
          type="submit"
          disabled={status === 'sending'}
          whileHover={{ scale: status === 'sending' ? 1 : 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-violet text-white px-7 py-3 rounded-full text-sm font-bold uppercase tracking-[0.08em] disabled:opacity-60"
        >
          {status === 'sending' ? t('form.sending', 'Sending…') : t('form.send', 'Send message →')}
        </motion.button>
        {status === 'error' && (
          <p className="text-xs text-red-400">
            {t('form.errorText', 'Something went wrong.')}{' '}
            <a href={`mailto:${SITE.email}`} className="underline hover:text-cyan">{t('form.emailDirectly', 'Email me directly')}</a>.
          </p>
        )}
      </div>
    </form>
  )
}
