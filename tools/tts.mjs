// Generate narration clips with Azure Speech (MAI voice).
// Usage: node tools/tts.mjs tools/narration.json public/audio
// narration.json: [{ "id": "cat-tension", "text": "...", "rate": "-5%" }, ...]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { loadEnv } from './env.mjs'

const env = loadEnv()
const KEY = env.AZURE_MAI_VOICE_KEY
const VOICE = env.AZURE_MAI_VOICE_NAME || 'en-US-Harper:MAI-Voice-2'
// The custom-domain endpoint in .env returns 404 for TTS; the regional endpoint works.
const URL = 'https://westus2.tts.speech.microsoft.com/cognitiveservices/v1'

const [,, listPath = 'tools/narration.json', outDir = 'public/audio'] = process.argv
const items = JSON.parse(readFileSync(listPath, 'utf8'))
mkdirSync(outDir, { recursive: true })

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
let chars = 0, made = 0, skipped = 0
for (const it of items) {
  const file = join(outDir, `${it.id}.mp3`)
  if (existsSync(file) && !process.env.FORCE) { skipped++; continue }
  const rate = it.rate ?? '-4%'
  const ssml = `<speak version='1.0' xml:lang='en-US' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts'><voice name='${VOICE}'><prosody rate='${rate}'>${esc(it.text)}</prosody></voice></speak>`
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      'User-Agent': 'carrier-deck-sim',
    },
    body: ssml,
  })
  if (!res.ok) { console.error(`FAIL ${it.id}: ${res.status} ${await res.text()}`); continue }
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(file, buf)
  chars += it.text.length; made++
  console.log(`ok ${it.id} (${buf.length} bytes)`)
}
console.log(`done: ${made} generated, ${skipped} skipped, ${chars} chars synthesized`)
