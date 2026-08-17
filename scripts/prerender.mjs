// Post-build prerender: render each main route to static HTML in dist/ so crawlers
// (and AI assistants that don't run JS) get full page content + correct per-route <head>.
// Real visitors still boot the SPA on top. Runs at deploy time only.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const PORT = 4178
const ROUTES = ['/', '/work', '/about', '/tools', '/contact', '/canary', '/rehabpro']

const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.mp4': 'video/mp4', '.txt': 'text/plain',
  '.xml': 'application/xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
}

// Static server for dist with SPA fallback (so client routes resolve to index.html).
const server = createServer(async (req, res) => {
  const indexHtml = () => readFile(join(DIST, 'index.html'))
  try {
    const p = decodeURIComponent(req.url.split('?')[0])
    let file = join(DIST, p)
    if (p.endsWith('/')) file = join(file, 'index.html')
    if (!extname(file)) { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(await indexHtml()) }
    const data = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    try { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(await indexHtml()) }
    catch { res.writeHead(404); res.end('not found') }
  }
})

await new Promise((r) => server.listen(PORT, r))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-data-dir=/tmp/tr-prerender-profile'],
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

for (const route of ROUTES) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  try {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle2', timeout: 30000 })
  } catch {
    // external embeds (Apple Music / Strava / Lanyard) may keep the network busy — proceed anyway
  }
  // Scroll through to trigger whileInView reveals so static content is fully populated.
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0
      const step = () => {
        window.scrollTo(0, y)
        y += 600
        if (y < document.body.scrollHeight) setTimeout(step, 70)
        else { window.scrollTo(0, 0); setTimeout(res, 250) }
      }
      step()
    })
  })
  await sleep(400)

  const html = await page.content()
  const outDir = route === '/' ? DIST : join(DIST, route)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  const kb = Math.round(html.length / 1024)
  console.log(`prerendered ${route.padEnd(9)} → ${route === '/' ? 'index.html' : route.slice(1) + '/index.html'} (${kb} KB)`)
  await page.close()
}

await browser.close()
server.close()
console.log('Prerender complete.')
