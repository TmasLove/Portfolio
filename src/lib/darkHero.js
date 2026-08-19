/*  Runtime signal: "a dark hero is on screen right now".

    Deliberately module state rather than an attribute on <html>. The first
    version set data-dark-hero on the document, which the prerenderer then
    captured into dist/work/index.html - so every visitor received
    <html data-dark-hero="true"> whether or not the corridor was playing, and
    the navbar rendered cream-on-cream on the cream page. Module state starts
    false on every page load, so nothing can leak into the static build.  */
let darkHero = false
const listeners = new Set()

export const setDarkHero = (v) => {
  if (darkHero === v) return
  darkHero = v
  listeners.forEach((fn) => fn())
}
export const subscribeDarkHero = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const getDarkHero = () => darkHero
export const getDarkHeroServer = () => false
