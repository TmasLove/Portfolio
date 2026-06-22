// Refresh src/data/steam.json from the public Steam profile XML (no API key needed).
// Optionally enriches with owned games if STEAM_API_KEY is set. Node 18+ (global fetch).
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/steam.json')
const VANITY = 'shlumplord'
const PROFILE_URL = `https://steamcommunity.com/id/${VANITY}/`

function matchCdata(xml, tag) {
  const re = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')
  const m = xml.match(re)
  return m ? m[1].trim() : null
}
function matchPlain(xml, tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i')
  const m = xml.match(re)
  return m ? m[1].trim() : null
}

async function main() {
  const res = await fetch(`${PROFILE_URL}?xml=1`)
  const xml = await res.text()

  const persona = matchCdata(xml, 'steamID') || matchPlain(xml, 'steamID')
  const avatar = matchCdata(xml, 'avatarFull') || matchPlain(xml, 'avatarFull')
  const stateMessage = matchCdata(xml, 'stateMessage') || matchPlain(xml, 'stateMessage')
  const onlineState = matchCdata(xml, 'onlineState') || matchPlain(xml, 'onlineState')
  const memberSince = matchCdata(xml, 'memberSince') || matchPlain(xml, 'memberSince')
  const location = matchCdata(xml, 'location') || matchPlain(xml, 'location')

  const status =
    onlineState === 'online'
      ? 'Online'
      : stateMessage
        ? stateMessage.replace(/<[^>]+>/g, '').trim()
        : 'Offline'

  const data = {
    persona: persona || 'SlumpLord',
    avatar: avatar || '',
    status,
    memberSince: memberSince || '',
    location: location || '',
    profileUrl: PROFILE_URL,
    games: [],
  }

  const key = process.env.STEAM_API_KEY
  if (key) {
    try {
      const vRes = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${VANITY}`
      )
      const vJson = await vRes.json()
      const steamid = vJson?.response?.steamid
      if (steamid) {
        const gRes = await fetch(
          `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamid}&include_appinfo=1&include_played_free_games=1`
        )
        const gJson = await gRes.json()
        const games = gJson?.response?.games || []
        data.games = games
          .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
          .slice(0, 4)
          .map((g) => ({
            name: g.name,
            appid: g.appid,
            playtime: Math.round((g.playtime_forever || 0) / 60),
            img: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_231x87.jpg`,
          }))
      }
    } catch (err) {
      console.warn('Could not fetch owned games:', err.message)
    }
  }

  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n')
  console.log(`Updated ${OUT}`)
  console.log(`  persona: ${data.persona} | status: ${data.status} | games: ${data.games.length}`)
}

main().catch((err) => {
  console.error('fetch-steam failed:', err)
  process.exit(1)
})
