# Work Page Project Cards — Design

**Date:** 2026-06-18
**File touched:** `work.html` (single self-contained file)

## Goal
Replace the existing project cards on the Work page with cards representing Tommy's
current projects, styled after the NST `/products` cards but adapted to the portfolio.

## Decisions (from brainstorming)
- **Card style:** Option C "hybrid" — brutalist edges (3px border, hard offset shadow)
  with a gradient icon header and the NST content structure.
- **Palette:** P1 "Violet + Cyan" (`#7B2FFF` violet, `#00E0C6` cyan, charcoal/white neutrals).
  Replaces the old red/yellow ("McDonald's") scheme on this page only.
- **Old projects:** Replaced entirely.
- **Theme toggle:** Dark/Light toggle scoped to the cards section only. Default = Light.
- **Page shell:** Keep existing nav, "MY WORK" header, and filter bar structure.

## Card anatomy
Gradient icon header → badge row (`Private` / `Public` / `Live`) → bold title →
1–2 line summary (reads in both themes) → tech-stack tag chips →
footer with `Category · Year` and a `Visit →` button when a live URL exists.

## Badge / link rules
- Private repo → `Private` badge, no repo link.
- Public repo → `Public` badge.
- Deployed site → `Live` badge + `Visit →` button to the live URL.
- A card can carry any combination (e.g. Private + Live).

## Filters
Replace old Web/Graphic filters with: **All · Apps · Web · AI/Agents**.

## Cards
| Project | Category | Badges | Live URL |
|---|---|---|---|
| Clear Care Dental | Apps | Private | — |
| CleanCare Enterprise | Web | Public · Live | clearcare-enterprise.vercel.app |
| CleanCare Marketing | Web | Private · Live | clearcaredentalgroup.com |
| GEO | AI/Agents | Private | — |
| Voice Agent | AI/Agents | Private | — |
| Bloodwork Pro | Apps | Private | — |
| NST Redesign | Web | Private · Live | nst-redesign.vercel.app |
| Versatile Customs | Web | Private · Live | versatile-customs.vercel.app |
| Cuatro Group | Web | Private · Live | cuatro-group.vercel.app/en |
| Alexandra Rossi Collection | Web | Private | — |
| La Dolce Vita Casa | Web | Private · Live | ladolcevitacasa.com |

Descriptions for GEO/CleanCare/etc. drafted from the GitHub repo blurbs; a handful
(Voice Agent, Bloodwork Pro, Versatile Customs, Cuatro Group, La Dolce Vita Casa)
are best-guess placeholders flagged for the user to refine.

## Implementation
Pure HTML/CSS/JS inside `work.html`. Theme toggle flips a `data-theme` attribute on the
cards-section wrapper; CSS variables drive light vs dark. Respects
`prefers-reduced-motion`. No new dependencies.
