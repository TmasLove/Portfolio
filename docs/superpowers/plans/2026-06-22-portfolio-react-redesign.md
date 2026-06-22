# Portfolio React Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild tommyroldan.com as a modern React (Vite) app with an L'Oréal-inspired editorial design and Framer Motion animation, deployed to GitHub Pages.

**Architecture:** Vite + React 18 + React Router (clean URLs via a `404.html` SPA fallback) + Tailwind CSS (design tokens) + Framer Motion. Source in `src/`; the current static apps (PPT Speech, GRVT, privacy) and media are preserved verbatim under `public/`. Build output (`dist/`) is published to the `gh-pages` branch with the existing `CNAME`.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, Framer Motion 11, react-router-dom 6, gh-pages (deploy), vitest + @testing-library/react (smoke tests), ESLint.

**Verification model:** This is a visual frontend. Each task is verified by (a) `npm run build` succeeding, (b) ESLint clean, and where applicable (c) a `preview_screenshot` confirming the rendered result. A few pure-logic units (data module, motion helpers) get vitest tests. Respect `prefers-reduced-motion` throughout.

**Spec:** `docs/superpowers/specs/2026-06-22-portfolio-react-redesign-design.md`

---

## IMPORTANT — working safely alongside the live site

The live site currently lives on the `gh-pages` branch root. **Do all React development on a `redesign` branch**, and do NOT deploy until Phase 9. The `gh-pages` deploy in Phase 9 publishes built output to `gh-pages` and will replace the live site — only run it once the build is approved.

---

## Phase 0 — Scaffold & deployable skeleton

### Task 0.1: Create the `redesign` working branch

**Files:** none (git)

- [ ] **Step 1: Branch off current gh-pages**

```bash
cd "/Users/tommyroldan/Desktop/Claude Workspace/GitHub/Portfolio"
git checkout gh-pages && git pull --ff-only origin gh-pages
git checkout -b redesign
```

- [ ] **Step 2: Confirm branch**

Run: `git branch --show-current`
Expected: `redesign`

### Task 0.2: Move legacy static files into `public/` (preserve live apps)

The Vite app will own the repo root. Existing static apps/media must survive as static assets so `/ppt-speech`, `/GRVT.html`, `/privacy.html`, images, and video keep working.

**Files:**
- Create dir: `public/`
- Move: `ppt-speech/`, `GRVT.html`, `GravityCycles.html`, `privacy.html`, `images/`, `video/`, `js/`, `css/`, `CNAME` → `public/`

- [ ] **Step 1: Create public/ and move assets**

```bash
mkdir -p public
git mv ppt-speech public/ppt-speech
git mv GRVT.html public/GRVT.html
git mv GravityCycles.html public/GravityCycles.html
git mv privacy.html public/privacy.html
git mv images public/images
git mv video public/video
git mv js public/js
git mv css public/css
git mv CNAME public/CNAME
```

- [ ] **Step 2: Remove the old top-level HTML pages being replaced by React**

(They are superseded by React routes. `work.html`/`about.html`/`contact.html`/`tools.html`/`index.html` are replaced.)

```bash
git rm index.html about.html contact.html tools.html work.html
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: move legacy static apps/media into public/ for Vite"
```

### Task 0.3: Initialize Vite React app at repo root

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `.gitignore` (update), `.nvmrc`

- [ ] **Step 1: Scaffold without clobbering existing files**

```bash
npm create vite@latest . -- --template react
# If prompted about non-empty dir, choose "Ignore files and continue".
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install -D tailwindcss postcss autoprefixer eslint gh-pages vitest @testing-library/react @testing-library/jest-dom jsdom
npm install framer-motion react-router-dom
npx tailwindcss init -p
```

- [ ] **Step 3: Ensure `dist/` and `node_modules/` are gitignored**

Append to `.gitignore`:

```
node_modules
dist
.DS_Store
.superpowers/
```

- [ ] **Step 4: Set `vite.config.js`** (base `/` for custom domain, add vitest)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.js' },
})
```

- [ ] **Step 5: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add scripts to `package.json`** (merge into existing "scripts")

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "lint": "eslint .",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist -b gh-pages -t true"
}
```

(`-t true` ensures dotfiles like `CNAME` in `dist/` are published.)

- [ ] **Step 7: Verify dev/build run**

Run: `npm run build`
Expected: build succeeds, `dist/` created.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold Vite + React app at repo root"
```

### Task 0.4: Wire Tailwind + base styles

**Files:**
- Modify: `tailwind.config.js`
- Create: `src/index.css` (replace default), update `src/main.jsx` import

- [ ] **Step 1: `tailwind.config.js`** with design tokens

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F6',
        ink: '#161616',
        violet: '#7B2FFF',
        cyan: '#00E0C6',
        night: '#0E0E10',
        nightsoft: '#1E1F26',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      maxWidth: { content: '1200px' },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
html { scroll-behavior: smooth; }
body { @apply bg-cream text-ink font-body antialiased; }
::selection { background: #7B2FFF; color: #fff; }

/* Fonts (match existing site) */
@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Space+Grotesk:wght@300;400;500;700&display=swap');

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

- [ ] **Step 3: Ensure `src/main.jsx` imports `./index.css`** and remove default `App.css`/demo markup.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: success, Tailwind classes available.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: tailwind design tokens + base styles"
```

### Task 0.5: Router + GitHub Pages SPA fallback + CNAME

**Files:**
- Modify: `src/App.jsx`, `src/main.jsx`
- Create: `public/404.html`
- Confirm: `public/CNAME` present (from Task 0.2)

- [ ] **Step 1: `src/main.jsx`** wrap with BrowserRouter

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 2: `src/App.jsx`** placeholder routes (filled in later phases)

```jsx
import { Routes, Route } from 'react-router-dom'

function Stub({ name }) { return <main className="p-20 font-display text-4xl">{name}</main> }

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Stub name="Home" />} />
      <Route path="/work" element={<Stub name="Work" />} />
      <Route path="/about" element={<Stub name="About" />} />
      <Route path="/tools" element={<Stub name="Tools" />} />
      <Route path="/contact" element={<Stub name="Contact" />} />
      <Route path="*" element={<Stub name="404" />} />
    </Routes>
  )
}
```

- [ ] **Step 3: `public/404.html`** SPA redirect (spa-github-pages technique)

```html
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redirecting…</title>
<script>
  // Single-page-apps for GitHub Pages — redirect deep links to index with path in query.
  var l = window.location;
  var path = l.pathname.slice(1).split('/').map(decodeURIComponent).join('/');
  l.replace(l.origin + '/?/' + path + (l.search ? '&' + l.search.slice(1) : '') + l.hash);
</script></head><body></body></html>
```

- [ ] **Step 4: Add the decode snippet to `index.html`** (in `<head>`, before the module script) so `/?/work` becomes `/work`

```html
<script>
  (function(){
    var q = window.location.search;
    if (q && q[1] === '/') {
      var decoded = q.slice(1).split('&').map(function(s){return s.replace(/~and~/g,'&')}).join('?');
      window.history.replaceState(null, null, window.location.pathname.slice(0,-1) + decoded + window.location.hash);
    }
  })();
</script>
```

- [ ] **Step 5: Verify routing in dev**

Run: `npm run dev`, use `preview_start` on the dev server, navigate to `/work`, reload — confirm it resolves to the Work stub (not a 404). Build also succeeds: `npm run build`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: react-router + gh-pages SPA fallback + CNAME"
```

---

## Phase 1 — Design system & motion primitives

### Task 1.1: Layout primitives

**Files:**
- Create: `src/components/ui/Section.jsx`, `src/components/ui/Container.jsx`, `src/components/ui/Eyebrow.jsx`

- [ ] **Step 1: `Container.jsx`** — centered max-width wrapper

```jsx
export default function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-content px-6 md:px-10 ${className}`}>{children}</div>
}
```

- [ ] **Step 2: `Section.jsx`** — full-width band, light or dark

```jsx
import Container from './Container'
export default function Section({ dark = false, className = '', containerClassName = '', children, id }) {
  return (
    <section id={id} className={`${dark ? 'bg-night text-cream' : 'bg-cream text-ink'} ${className}`}>
      <Container className={`py-20 md:py-28 ${containerClassName}`}>{children}</Container>
    </section>
  )
}
```

- [ ] **Step 3: `Eyebrow.jsx`** — small uppercase label

```jsx
export default function Eyebrow({ children, dark = false }) {
  return <span className={`block text-xs tracking-[0.22em] uppercase mb-4 ${dark ? 'text-cyan' : 'text-violet'}`}>{children}</span>
}
```

- [ ] **Step 4: Verify build + commit**

```bash
npm run build && git add -A && git commit -m "feat: layout primitives (Section/Container/Eyebrow)"
```

### Task 1.2: Motion primitives + reduced-motion hook

**Files:**
- Create: `src/lib/motion.js`, `src/hooks/useReducedMotion.js`
- Test: `src/lib/motion.test.js`

- [ ] **Step 1: Write failing test for variants**

```js
import { describe, it, expect } from 'vitest'
import { fadeUp, stagger } from './motion'

describe('motion variants', () => {
  it('fadeUp hides then shows with y offset', () => {
    expect(fadeUp.hidden.opacity).toBe(0)
    expect(fadeUp.visible.opacity).toBe(1)
    expect(fadeUp.hidden.y).toBeGreaterThan(0)
  })
  it('stagger sets container staggerChildren', () => {
    expect(stagger().visible.transition.staggerChildren).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test, expect FAIL**

Run: `npm test -- motion`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/motion.js`**

```js
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

// Shared whileInView props for sections
export const inView = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-10% 0px' },
}
```

- [ ] **Step 4: `src/hooks/useReducedMotion.js`** (re-export framer's, plus SSR-safe default)

```js
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'
export function useReducedMotion() { return useFramerReducedMotion() ?? false }
```

- [ ] **Step 5: Run test, expect PASS**

Run: `npm test -- motion`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: motion variants + reduced-motion hook (tested)"
```

### Task 1.3: Reveal + reusable animated components

**Files:**
- Create: `src/components/ui/Reveal.jsx`, `src/components/ui/SplitText.jsx`, `src/components/ui/MagneticButton.jsx`, `src/components/ui/CountUp.jsx`

- [ ] **Step 1: `Reveal.jsx`** — wraps children, fades/rises in on view

```jsx
import { motion } from 'framer-motion'
import { fadeUp, inView } from '../../lib/motion'
export default function Reveal({ as = 'div', className = '', children, variants = fadeUp }) {
  const M = motion[as] || motion.div
  return <M className={className} variants={variants} {...inView}>{children}</M>
}
```

- [ ] **Step 2: `SplitText.jsx`** — splits a string into word spans for staggered mask reveal

```jsx
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
```

- [ ] **Step 3: `MagneticButton.jsx`** — spring-follows cursor, link or button

```jsx
import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
export default function MagneticButton({ as = 'a', className = '', children, ...props }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const M = motion[as] || motion.a
  function onMove(e) {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  function reset() { x.set(0); y.set(0) }
  return (
    <M ref={ref} style={{ x, y }} onMouseMove={onMove} onMouseLeave={reset}
       className={`inline-flex items-center gap-2 ${className}`} {...props}>
      {children}
    </M>
  )
}
```

- [ ] **Step 4: `CountUp.jsx`** — animates a number when in view

```jsx
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
export default function CountUp({ to, suffix = '', duration = 1200, className = '' }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!visible) return
    if (reduce) { setN(to); return }
    let raf, start
    const tick = (t) => { start ??= t; const p = Math.min((t - start) / duration, 1)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [visible, to, duration, reduce])
  return <span ref={ref} className={className}>{n}{suffix}</span>
}
```

- [ ] **Step 5: Verify build + commit**

```bash
npm run build && git add -A && git commit -m "feat: Reveal/SplitText/MagneticButton/CountUp components"
```

---

## Phase 2 — Shell: Nav, Footer, page transitions

### Task 2.1: Navigation bar

**Files:**
- Create: `src/components/layout/Navbar.jsx`

Behavior: fixed/sticky top; "TR" brand → `/`; links Work/About/Tools/Contact using `NavLink` (active state); transparent over hero, gains cream background on scroll; mobile hamburger that opens a full-screen overlay menu with staggered link reveal. Uses `framer-motion` for the overlay.

- [ ] **Step 1: Implement `Navbar.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const LINKS = [['/work', 'Work'], ['/about', 'About'], ['/tools', 'Tools'], ['/contact', 'Contact']]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll(); window.addEventListener('scroll', onScroll); return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-cream/90 backdrop-blur border-b border-ink/10' : 'bg-transparent'}`}>
      <nav className="mx-auto max-w-content px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-black text-lg tracking-tight">TR</Link>
        <ul className="hidden md:flex items-center gap-1">
          {LINKS.map(([to, label]) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) =>
                `px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${isActive ? 'text-violet' : 'hover:text-violet'}`}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button className="md:hidden text-xs font-bold uppercase tracking-[0.1em]" onClick={() => setOpen(true)}>Menu</button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-night text-cream flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between items-center px-6 h-16">
              <span className="font-display font-black">TR</span>
              <button className="text-xs uppercase tracking-[0.1em]" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-2 px-8">
              {LINKS.map(([to, label], i) => (
                <motion.div key={to} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                  <Link to={to} onClick={() => setOpen(false)} className="font-display font-black text-5xl">{label}</Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
```

- [ ] **Step 2: Verify build + commit**

```bash
npm run build && git add -A && git commit -m "feat: responsive navbar with overlay menu"
```

### Task 2.2: Footer

**Files:** Create `src/components/layout/Footer.jsx`

Dark band: big "Let's build" line, email (`mailto:troldan@terryco.com`), socials (LinkedIn, Instagram `@tomcat.png`, Strava, Apple Music — reuse SVGs from old `index.html`), a marquee of capabilities, copyright. Use `MagneticButton` for the email CTA.

- [ ] **Step 1: Implement `Footer.jsx`** (dark `Section`, social SVGs copied from old `public/`-less markup; inline the SVG paths used previously). Marquee = a CSS keyframe `animate-[marquee_20s_linear_infinite]` defined in `index.css` (`@keyframes marquee {from{transform:translateX(0)}to{transform:translateX(-50%)}}`).
- [ ] **Step 2: Add `@keyframes marquee` to `src/index.css`.**
- [ ] **Step 3: Verify build + commit**

```bash
npm run build && git add -A && git commit -m "feat: footer with CTA + marquee + socials"
```

### Task 2.3: App layout + page transitions

**Files:** Modify `src/App.jsx`; Create `src/components/layout/PageTransition.jsx`

- [ ] **Step 1: `PageTransition.jsx`**

```jsx
import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'
export default function PageTransition({ children }) {
  return (
    <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="pt-16">
      {children}
    </motion.main>
  )
}
```

- [ ] **Step 2: `App.jsx`** — Navbar + AnimatePresence routes (keyed by location) + Footer + ScrollToTop on route change

```jsx
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageTransition from './components/layout/PageTransition'
import Home from './pages/Home'
import Work from './pages/Work'
import About from './pages/About'
import Tools from './pages/Tools'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const location = useLocation()
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/work" element={<PageTransition><Work /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/tools" element={<PageTransition><Tools /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Create stub page files** `src/pages/{Home,Work,About,Tools,Contact,NotFound}.jsx` each exporting a minimal component (filled in later phases) so the build compiles.
- [ ] **Step 4: Verify build + commit**

```bash
npm run build && git add -A && git commit -m "feat: app shell with page transitions + stub pages"
```

---

## Phase 3 — Content & data

### Task 3.1: Projects data module

**Files:** Create `src/data/projects.js`; Test `src/data/projects.test.js`

Port every project from the current `work.html` (13 current incl. the 2 tools, + 9 archived). Each: `{ key, title, category ('apps'|'web'|'ai'|'tool'|'archived'), badges (['private'|'public'|'live'|'archived']), description, tech (string[]), year, image (path under /images or null), icon (key for line-icon, or null), url (string|null) }`.

- [ ] **Step 1: Write failing test**

```js
import { describe, it, expect } from 'vitest'
import { projects, CATEGORIES } from './projects'
describe('projects data', () => {
  it('has all projects with required fields', () => {
    expect(projects.length).toBeGreaterThanOrEqual(22)
    for (const p of projects) {
      expect(p.key && p.title && p.category && p.description).toBeTruthy()
      expect(Array.isArray(p.badges)).toBe(true)
    }
  })
  it('archived projects carry the archived badge + image', () => {
    const arch = projects.filter(p => p.category === 'archived')
    expect(arch.length).toBe(9)
    arch.forEach(p => { expect(p.badges).toContain('archived'); expect(p.image).toMatch(/^\/images\//) })
  })
  it('exposes filter categories', () => {
    expect(CATEGORIES).toEqual(['all','apps','web','ai','tool','archived'])
  })
})
```

- [ ] **Step 2: Run, expect FAIL.** `npm test -- projects`
- [ ] **Step 3: Implement `src/data/projects.js`** — copy content verbatim from current `work.html` cards (titles, descriptions, tech tags, badges, urls, years; archived image paths like `/images/gravity-cycles.png`, `/images/gfx/tropical-sun.png`). Export `projects` array and `export const CATEGORIES = ['all','apps','web','ai','tool','archived']`. (Use the exact copy already written in `public/...`? No — pull text from git history of `work.html`: `git show gh-pages:work.html`.)
- [ ] **Step 4: Run, expect PASS.** `npm test -- projects`
- [ ] **Step 5: Commit** `git add -A && git commit -m "feat: projects data module (tested)"`

### Task 3.2: Site content + links module

**Files:** Create `src/data/site.js`

```js
export const SITE = {
  name: 'Tommy Roldan',
  role: 'Web Developer & Creative',
  location: 'Miami, FL',
  email: 'troldan@terryco.com',
  socials: {
    linkedin: 'https://www.linkedin.com/in/tommy-roldan/',
    instagram: 'https://instagram.com/tomcat.png',
    strava: 'https://www.strava.com/athletes/14197229',
    appleMusic: 'https://itunes.apple.com/profile/tmizle',
    steam: 'https://steamcommunity.com/id/shlumplord/',
    discord: '', // TODO: fill in Discord invite/tag
  },
  stravaClubs: [
    { name: 'Fixed Latinos', note: 'represents a movement', url: '' }, // TODO url
    { name: 'GRVT', note: 'the cycling brand I built ~a decade ago', url: '' }, // TODO url
  ],
  stats: [
    { n: 13, suffix: '+', label: 'Projects shipped' },
    { n: 6, suffix: '', label: 'Live products' },
    { n: 2015, suffix: '', label: 'Building since' },
  ],
  capabilities: ['Apps', 'Web', 'AI Agents', 'Tools'],
}
```

- [ ] **Step 1: Create file as above.**
- [ ] **Step 2: Commit** `git add -A && git commit -m "feat: site content + links module"`

### Task 3.3: Line-icon set

**Files:** Create `src/components/ui/Icon.jsx`

Port the inline SVG line icons used in `work.html` (smartphone, building, megaphone, bot, mic, activity, pill, wrench, globe, layers, home, bike, presentation) into a single `<Icon name="..." />` component mapping name→paths. Verify build. Commit `feat: line-icon component`.

---

## Phase 4 — Home page

### Task 4.1: Three.js birds hero backdrop (ported)

**Files:** Create `src/components/home/BirdsCanvas.jsx`

Port `public/js/bird.js` + `canvas.js` behavior into a React component that mounts the canvas in a `useEffect`, scoped to the hero, `position:absolute inset-0 -z-10 opacity-30`, cleaned up on unmount. Load the legacy scripts dynamically OR re-implement minimally. Keep `pointer-events:none`. Respect reduced motion (skip animation loop). Verify build + screenshot. Commit.

### Task 4.2: Hero section

**Files:** Create `src/components/home/Hero.jsx`

Full-viewport; `Eyebrow` (role · location), big display headline using `SplitText` with an italic accent word, lead paragraph, primary `MagneticButton` → `/work`, birds backdrop, scroll cue. Verify with `preview_screenshot`. Commit.

### Task 4.3: Intro/mission + Capabilities + About-teaser + Stats + Featured Work + Contact CTA

**Files:** Create `src/components/home/{Mission,Capabilities,AboutTeaser,Stats,FeaturedWork,ContactCTA}.jsx`; assemble in `src/pages/Home.jsx`

- **Mission** (light): big statement, `SplitText`/`Reveal`.
- **FeaturedWork** (dark `Section`): 3–4 marquee projects (filter `projects` for chosen keys e.g. clear-care-dental, nst-redesign, geo, cuatro-group), full-bleed imagery where available, scroll parallax via `useScroll`/`useTransform`, spring hover.
- **Stats** (dark): `CountUp` for each `SITE.stats`.
- **AboutTeaser** (light): portrait (`/images/...`) with clip-path reveal + bio snippet + link to `/about`.
- **Capabilities** (light): editorial list rows, underline-draw on hover/in-view.
- **ContactCTA** (dark): handled by shared `Footer`, or a dedicated pre-footer CTA band.

Assemble `Home.jsx` in section order from the spec. Verify each with screenshots at desktop + mobile widths. Commit after each component.

---

## Phase 5 — Work page

### Task 5.1: Project card + grid + filters

**Files:** Create `src/components/work/ProjectCard.jsx`, `src/components/work/FilterBar.jsx`; build `src/pages/Work.jsx`

- `ProjectCard`: image (archived) or icon-chip header (current), badges, title, description, tech tags, footer (category · year) + Visit link when `url`. Spring hover lift.
- `FilterBar`: buttons from `CATEGORIES` (label "Old / Archived" for `archived`); active state; animates grid with `layout` + `AnimatePresence`.
- `Work.jsx`: editorial hero + `FilterBar` + responsive grid; filter state via `useState`.

Verify: screenshot All view + Archived view. Commit.

### Task 5.2: Project detail view (shared-element)

**Files:** Create `src/pages/ProjectDetail.jsx`; add route `/work/:key`; add `layoutId` to card + detail

Detail page: large hero (title, meta, image), description, tech, live link. Use Framer `layoutId={p.key}` on the card image/title and the detail hero for a shared-element transition. Back link to `/work`. Add `<Route path="/work/:key" .../>`. For projects with only an external `url` and no detail content, the card can link out instead — keep detail for the richer ones; others open `url`. Verify + commit.

---

## Phase 6 — About page

### Task 6.1: About core (intro, story, experience)

**Files:** Build `src/pages/About.jsx` + `src/components/about/{Intro,Story,Experience}.jsx`

- Intro: portrait + bio (pull copy from old `about.html` via `git show gh-pages:about.html`).
- Story: editorial narrative, `Reveal`/`SplitText`.
- Experience: timeline/list incl. **Mack Cycle** and **City Bikes** (placeholder roles/years from `SITE` or inline TODO comments).

Verify + commit.

### Task 6.2: Hobbies section (gaming + cycling)

**Files:** Create `src/components/about/Hobbies.jsx`

- **Gaming** card: blurb + Steam link (`SITE.socials.steam`) + Discord (`SITE.socials.discord`, render only if set).
- **Cycling** block: joy-of-riding copy; shop background tie-in; Strava athlete link; **Strava clubs** list (`SITE.stravaClubs` — Fixed Latinos, GRVT) rendering name + note (+ link when set); the **GRVT launch story** as a scroll-driven sequence (`useScroll` pinned) with a GRVT logo reveal (`/images/gfx/gvrt-logo.png`) linking to `/GRVT.html`.

Verify (screenshot) + commit.

---

## Phase 7 — Tools page

### Task 7.1: Tools hub

**Files:** Build `src/pages/Tools.jsx` + reuse `ProjectCard` or a `ToolCard`

Cards for live tools (PPT Speech → `/ppt-speech/`, Local Legend Predictor → its URL, KOM Memorial → its URL, Domain Hub if applicable). Pull tool list/text from `git show gh-pages:tools.html`. Editorial hero + grid. Verify + commit.

---

## Phase 8 — Contact page

### Task 8.1: Contact

**Files:** Build `src/pages/Contact.jsx`

Big CTA headline (`SplitText`), `mailto:` button (`MagneticButton`), social links from `SITE.socials`, dark band aesthetic. (Form optional/omitted — YAGNI; mailto is enough.) Build `NotFound.jsx` (simple, link home). Verify + commit.

---

## Phase 9 — Polish, verify, deploy

### Task 9.1: Cross-page polish pass

- [ ] Verify reduced-motion: with `preview_resize` colorScheme/devtools emulate reduced motion (or temporarily set the hook), confirm animations degrade to fades/none and all content is visible.
- [ ] Responsive pass: screenshot Home/Work/About/Tools/Contact at mobile (375) and desktop (1280); fix layout issues.
- [ ] Check all internal links/routes and external links resolve; confirm `/ppt-speech/`, `/GRVT.html`, `/privacy.html` still load from `public/`.
- [ ] `npm run lint` clean; `npm run build` clean; `npm test` green.
- [ ] Commit fixes.

### Task 9.2: Deploy to GitHub Pages

- [ ] **Step 1: Confirm `public/CNAME` contains `tommyroldan.com`** (so it lands in `dist/`).
- [ ] **Step 2: Merge `redesign` → `master`** (source of truth for the app) and push.

```bash
git checkout master && git merge --no-ff redesign -m "feat: React portfolio redesign" && git push origin master
```

- [ ] **Step 3: Deploy build to gh-pages**

```bash
npm run deploy
```

Expected: `gh-pages` branch updated with `dist/` contents (incl. `CNAME`, `404.html`, `public/` assets).

- [ ] **Step 4: Verify live** — load https://tommyroldan.com, click through routes, hard-reload a deep link (e.g. /work) to confirm the 404 fallback works, confirm `/ppt-speech/` and `/GRVT.html` load.
- [ ] **Step 5: Update memory** — note the repo is now a Vite React app deployed via `npm run deploy`, source on `master`, build on `gh-pages`.

---

## Notes for the executor
- Pull legacy copy/content from git rather than guessing: `git show gh-pages:work.html`, `git show gh-pages:about.html`, `git show gh-pages:tools.html`, `git show gh-pages:contact.html`.
- Keep commits frequent (one per task/step group).
- Do NOT run `npm run deploy` before Phase 9 — it overwrites the live site.
- Fonts, palette, and icons must match the tokens in `tailwind.config.js` and the spec.
- Placeholders that are allowed to remain as TODO comments (won't block build): Discord link, Strava club URLs, Mack Cycle / City Bikes roles & years. Flag them in the final summary.
