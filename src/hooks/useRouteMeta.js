import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { projects } from '../data/projects'

const BASE = 'https://tommyroldan.com'

// Routes we prerender to dist/<route>/index.html. GitHub Pages serves those at
// "/work/" and 301s "/work" → "/work/", so the canonical MUST carry the trailing
// slash — otherwise every page declares a canonical that redirects back to itself.
const PRERENDERED = new Set(['/work', '/about', '/tools', '/contact', '/canary', '/rehabpro'])

const canonicalUrl = (routeKey) =>
  BASE + (PRERENDERED.has(routeKey) ? `${routeKey}/` : routeKey)

/*  GitHub Pages serves every prerendered route from a directory, so a direct
    load or a refresh lands on "/rehabpro/" - with the slash - while every key
    in META is written without one. The lookup missed, fell through to the
    home-page defaults, and the moment React mounted it overwrote the correct
    prerendered <title> and og:image with the portfolio's. Every product link
    shared from a real URL carried the wrong title and the wrong preview image.
    Normalise once, then use the normalised key everywhere below.  */
const toRouteKey = (pathname) =>
  pathname === '/' ? '/' : pathname.replace(/\/+$/, '')

const DEFAULT_IMAGE = `${BASE}/tr-mark.png`

const META = {
  '/': {
    title: 'Miami Web Developer & Designer | Tommy Roldan',
    ogTitle: 'I build websites, apps & AI agents for Miami businesses',
    desc: 'Freelance Miami web developer building React websites, Shopify e-commerce, iOS apps, and AI agents for startups and small businesses. Available for hire.',
  },
  '/work': {
    title: 'Web & App Projects in Miami | Tommy Roldan',
    ogTitle: 'A decade of apps, websites, and AI agents',
    desc: 'Portfolio of shipped work — React & Next.js websites, Shopify stores, React Native apps, and AI agents for real businesses across Miami and beyond.',
  },
  '/about': {
    title: 'About Tommy Roldan — Miami Developer Since 2015',
    ogTitle: 'Builder, rider, Miami native',
    desc: 'Miami-based developer and designer building since 2015 — bridging product, sales, and engineering. React, React Native, Shopify, and AI, in English and Spanish.',
  },
  '/tools': {
    title: 'Free Web Tools by Tommy Roldan',
    ogTitle: 'Free browser tools that solve real problems',
    desc: 'Free, no-signup browser utilities — a PowerPoint reader, Strava effort tracker, and more. Built to solve real problems, running entirely in your browser.',
  },
  '/contact': {
    title: 'Hire a Miami Web Developer | Tommy Roldan',
    ogTitle: "Got a project? Let's build it.",
    desc: 'Start a website, app, e-commerce store, or AI agent with a Miami-based developer. Tell me the project and get a straight answer on scope and cost.',
  },
  '/rehabpro': {
    title: 'Rehab Pro — Recovery, built around you',
    ogTitle: 'Rehab Pro — a recovery plan that reads how today feels',
    desc: 'iPhone app that builds a daily rehab plan around where it hurts, how it hurts today, and the time you have. Syncs with Apple Health to suggest recovery stretches after your workouts.',
    image: `${BASE}/rehabpro/icon.png`,
  },
  '/canary': {
    title: 'Canary — Free Windows Diagnostic Tool',
    ogTitle: 'Canary — a second opinion for your PC',
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
    const routeKey = toRouteKey(pathname)
    let m = META[routeKey]
    if (m) {
      m = { title: t(`meta.${routeKey}.title`, m.title), ogTitle: m.ogTitle, image: m.image, desc: t(`meta.${routeKey}.desc`, m.desc) }
    } else if (routeKey.startsWith('/work/')) {
      const key = routeKey.split('/')[2]
      const p = projects.find((x) => x.key === key)
      if (p) m = { title: `${p.title} — Tommy Roldan`, desc: t(`data.projects.${p.key}`, p.description) }
    }
    if (!m) m = { title: t('meta./.title', META['/'].title), desc: t('meta./.desc', META['/'].desc) }

    document.title = m.title
    const ogTitle = m.ogTitle || m.title
    setMeta('description', m.desc)
    setMeta('og:title', ogTitle, 'property')
    setMeta('og:description', m.desc, 'property')
    setMeta('og:url', canonicalUrl(routeKey), 'property')
    setMeta('og:locale', (lng || 'en') === 'es' ? 'es_ES' : 'en_US', 'property')
    setMeta('twitter:title', ogTitle)
    setMeta('twitter:description', m.desc)
    const img = m.image || DEFAULT_IMAGE
    setMeta('og:image', img, 'property')
    setMeta('twitter:image', img)
    setMeta('twitter:card', 'summary_large_image')
    setCanonical(canonicalUrl(routeKey))
  }, [pathname, lng, t])
}
