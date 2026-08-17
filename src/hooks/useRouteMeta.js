import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { projects } from '../data/projects'

const BASE = 'https://tommyroldan.com'

// Routes we prerender to dist/<route>/index.html. GitHub Pages serves those at
// "/work/" and 301s "/work" → "/work/", so the canonical MUST carry the trailing
// slash — otherwise every page declares a canonical that redirects back to itself.
const PRERENDERED = new Set(['/work', '/about', '/tools', '/contact', '/canary', '/rehabpro'])

const canonicalUrl = (pathname) =>
  BASE + (PRERENDERED.has(pathname) ? `${pathname}/` : pathname)

const DEFAULT_IMAGE = `${BASE}/tr-mark.png`

const META = {
  '/': {
    title: 'Tommy Roldan — Miami Web Developer & Designer',
    desc: 'Miami web developer & designer for hire — React apps, fast websites, e-commerce, and AI agents for startups and small businesses.',
  },
  '/work': {
    title: 'Work — Tommy Roldan',
    desc: 'Selected projects — apps, web platforms, AI agents, and tools, plus archived early work.',
  },
  '/about': {
    title: 'About — Tommy Roldan',
    desc: 'Developer & creative bridging business, sales, and technology. Miami native, cyclist, builder since 2015.',
  },
  '/tools': {
    title: 'Tools — Tommy Roldan',
    desc: 'Practical utilities built to solve real problems — PPT Speech, Strava tools, and more.',
  },
  '/contact': {
    title: 'Hire Tommy Roldan — Web Developer in Miami',
    desc: 'Start a project with Tommy Roldan — Miami web developer & designer. Websites, apps, e-commerce, and AI agents.',
  },
  '/rehabpro': {
    title: 'Rehab Pro — Recovery, built around you',
    desc: 'iPhone app that builds a daily rehab plan around where it hurts, how it hurts today, and the time you have. Syncs with Apple Health to suggest recovery stretches after your workouts.',
    image: `${BASE}/rehabpro/icon.png`,
  },
  '/canary': {
    title: 'Canary - A second opinion for your PC',
    desc: 'Free Windows diagnostic tool that finds failing drives and crash causes your vendor software calls healthy. Reads the SMART counters other tools skip.',
    image: `${BASE}/canary/og.png`,
  },
}

function setMeta(key, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Updates document title / description / canonical / OG+Twitter on route or language change.
export function useRouteMeta() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()
  const lng = i18n.resolvedLanguage
  useEffect(() => {
    let m = META[pathname]
    if (m) {
      m = { title: t(`meta.${pathname}.title`, m.title), image: m.image, desc: t(`meta.${pathname}.desc`, m.desc) }
    } else if (pathname.startsWith('/work/')) {
      const key = pathname.split('/')[2]
      const p = projects.find((x) => x.key === key)
      if (p) m = { title: `${p.title} — Tommy Roldan`, desc: t(`data.projects.${p.key}`, p.description) }
    }
    if (!m) m = { title: t('meta./.title', META['/'].title), desc: t('meta./.desc', META['/'].desc) }

    document.title = m.title
    setMeta('description', m.desc)
    setMeta('og:title', m.title, 'property')
    setMeta('og:description', m.desc, 'property')
    setMeta('og:url', canonicalUrl(pathname), 'property')
    setMeta('og:locale', (lng || 'en') === 'es' ? 'es_ES' : 'en_US', 'property')
    setMeta('twitter:title', m.title)
    setMeta('twitter:description', m.desc)
    const img = m.image || DEFAULT_IMAGE
    setMeta('og:image', img, 'property')
    setMeta('twitter:image', img)
    setMeta('twitter:card', 'summary_large_image')
    setCanonical(canonicalUrl(pathname))
  }, [pathname, lng, t])
}
