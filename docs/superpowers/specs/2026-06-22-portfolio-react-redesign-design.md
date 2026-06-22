# Portfolio React Redesign — Design Spec

**Date:** 2026-06-22
**Repo:** TmasLove/Portfolio (served at tommyroldan.com via GitHub Pages, `gh-pages` branch)
**Status:** Approved in brainstorming; pending spec review → implementation plan

## Goal
Rebuild the static multi-page portfolio as a modern **React** app with an
**L'Oréal-group-inspired** editorial design and current-generation **Framer Motion**
animation. Framing: a **personal developer portfolio with L'Oréal polish (hybrid)** —
personal name/role intro, but projects presented as a curated "venture/brand portfolio"
with editorial sections and a stats block.

## Tech & Architecture
- **Stack:** React 18, Vite, Tailwind CSS, Framer Motion, React Router.
- **Hosting:** GitHub Pages on the `gh-pages` branch. Vite builds to `dist/`; deploy via the
  `gh-pages` npm package (`npm run deploy`). Keep `CNAME` (tommyroldan.com).
- **Routing:** clean URLs (`/`, `/work`, `/about`, `/tools`, `/contact`) using the standard
  `404.html` SPA-redirect fallback for GitHub Pages. Respect `prefers-reduced-motion` globally.
- **Repo layout:** React source in `src/`; static apps/assets preserved under `public/`.
- **Preserved as-is** (copied to `public/`, linked from the new site, not rewritten):
  PPT Speech app (`ppt-speech/`), `GRVT.html` (legacy brand page), `privacy.html`,
  and `images/`, `video/`, `js/` assets.

## Visual System
- **Palette:** warm white `#FAF9F6`, charcoal `#161616`, violet `#7B2FFF` (accent),
  cyan `#00E0C6` (secondary), dark bands `#0E0E10`. Light editorial default, dark dramatic
  bands for featured work / stats / CTA (P1 + P2 blend).
- **Type:** Archivo (display headings) + Space Grotesk (body) + an italic display accent for
  emphasis words. (Swappable to Satoshi/General Sans later if desired.)
- **Layout language:** generous whitespace, hairline rules, eyebrow labels, big headlines,
  full-bleed imagery, alternating light/dark bands.

## Pages

### Home (flagship long-scroll)
1. **Hero** — full-viewport; name/role/tagline with masked staggered text reveal; parallax backdrop **reusing the existing Three.js birds** (ported into a React component), lightly restyled to the new palette.
2. **Intro / Mission** — one bold statement; word-by-word `whileInView` reveal.
3. **Featured Work** (dark band) — 3–4 marquee projects, full-bleed imagery, sticky/pinned scroll sequence, image parallax, spring hover.
4. **Stats strip** (dark band) — e.g. 13+ projects · 6 live · since 2015; count-up on enter.
5. **About teaser** — bio + portrait + link to About; clip-path image reveal.
6. **Capabilities** — Apps · Web · AI Agents · Tools as editorial list rows; underline-draw + stagger.
7. **Contact CTA** (dark band) — "let's build" + email + socials; magnetic button, marquee footer.

### Work
- Editorial hero + filterable project grid (Apps / Web / AI / Tools / **Old·Archived**).
- Rich project cards; clicking opens a detail view via shared-element transition, or the live link where applicable.
- Project data sourced from current `work.html` (current projects, the two tools, and the 9 archived 2015 projects with their images).

### About
- **Intro / bio** — Miami, developer & creative.
- **Story** — path into building/dev.
- **Experience** — roots at Miami's top bike shops: **Mack Cycle** and **City Bikes** (details TBD — placeholder).
- **Hobbies** (two pillars):
  - **Gaming** — blurb + **Steam** (`https://steamcommunity.com/id/shlumplord/`) + **Discord** (link TBD — placeholder).
  - **Cycling** — joy of riding, shop background, **Strava** (`strava.com/athletes/14197229`), and the story of **launching GRVT** (links to the GRVT brand page). Candidate for a scroll-driven story sequence + GRVT logo reveal.
    - **Strava clubs** (link both; URLs TBD — placeholder):
      - **Fixed Latinos** — represents a movement (also one of the archived 2015 projects).
      - **GRVT** — the cycling brand Tomas tried to build ~a decade ago (ties to the GRVT page).
- **Skills / capabilities** and a dark CTA band → Contact.

### Tools
- Tools hub as cards linking to live apps (PPT Speech, Local Legend Predictor, KOM Memorial, etc.).

### Contact
- Big CTA, email, social links, dark band.

## Animation Language (Framer Motion, current-gen)
- Page transitions via `AnimatePresence`.
- Hero text mask/stagger reveals.
- Scroll-linked parallax (`useScroll` / `useTransform`) on imagery.
- `whileInView` section reveals (fade/rise, word/line splits).
- Sticky pinned featured-work scroll sequence.
- Count-up stat numbers.
- Magnetic, spring-physics buttons; subtle hover scale on cards.
- Shared-element transition: Work grid card → detail view.
- Tasteful and fast; full `prefers-reduced-motion` fallback (animations reduced to simple fades/none).

## Content / Data
- `projects` data module (from current `work.html`): title, category, badges (Private/Public/Live/Archived), description, tech tags, year, image/icon, live URL.
- Stats figures, capabilities list, About copy, social/contact links.
- Known links: Steam (above), Strava athlete (above). Placeholders: Discord, Strava clubs, Mack Cycle / City Bikes role details.

## Out of Scope (this phase)
- Rewriting the PPT Speech app or GRVT page (kept as static).
- DNS changes (staying on GitHub Pages).
- A CMS/blog.

## Open Items (placeholders, fillable without blocking build)
- Discord link · Strava club URLs (clubs = Fixed Latinos, GRVT) · Mack Cycle / City Bikes roles & years · final stat numbers.
