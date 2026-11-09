// Generate an image with the Azure OpenAI deployment (gpt-image-2.5-flare).
// Usage: node tools/image.mjs "<prompt>" out.png [size] [quality] [background]
// background (optional): transparent | opaque | auto; left out of the request when not given.
import { writeFileSync } from 'node:fs'
import { loadEnv } from './env.mjs'

const env = loadEnv()
const [,, prompt, out = 'tools/out/image.png', size = '1024x1024', quality = 'medium', background = ''] = process.argv
if (!prompt) { console.error('prompt required'); process.exit(1) }
const url = `${env.AZURE_AI_OPENAI_ENDPOINT.replace(/\/$/, '')}/images/generations`
const res = await fetch(url, {
  method: 'POST',
  headers: { 'api-key': env.AZURE_AI_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'gpt-image-2.5-flare', prompt, size, quality, n: 1, output_format: 'png', ...(background ? { background } : {}) }),
})
if (!res.ok) { console.error(`FAIL ${res.status}: ${await res.text()}`); process.exit(1) }
const j = await res.json()
const b64 = j.data?.[0]?.b64_json
if (!b64) { console.error('no image in response', JSON.stringify(j).slice(0, 500)); process.exit(1) }
writeFileSync(out, Buffer.from(b64, 'base64'))
console.log(`ok ${out} usage=${JSON.stringify(j.usage ?? {})}`)
