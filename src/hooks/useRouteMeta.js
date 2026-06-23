import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { projects } from '../data/projects'

const BASE = 'https://tommyroldan.com'

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

// Updates document title / description / canonical / OG+Twitter on route change.
export function useRouteMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    let m = META[pathname]
    if (!m && pathname.startsWith('/work/')) {
      const key = pathname.split('/')[2]
      const p = projects.find((x) => x.key === key)
      if (p) m = { title: `${p.title} — Tommy Roldan`, desc: p.description }
    }
    if (!m) m = META['/']

    document.title = m.title
    setMeta('description', m.desc)
    setMeta('og:title', m.title, 'property')
    setMeta('og:description', m.desc, 'property')
    setMeta('og:url', BASE + (pathname === '/' ? '/' : pathname), 'property')
    setMeta('twitter:title', m.title)
    setMeta('twitter:description', m.desc)
    setCanonical(BASE + (pathname === '/' ? '/' : pathname))
  }, [pathname])
}
