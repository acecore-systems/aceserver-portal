// Explicit opt-in: three real, billable model requests; no deployment or user data.
import { mkdtemp, writeFile, rm, mkdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { getPlatformProxy } from 'wrangler'
import { encode } from 'fast-png'
import {
  MODEL,
  PARTS,
  LAYERS,
  FACES,
  regions,
  applyDesign,
  encodePixels,
} from '../src/lib/skin-maker.ts'
import { modelInput, parseCompletion } from '../functions/api/skin-maker.ts'
import { readSkinPng } from '../src/lib/skin-png.ts'

if (!process.argv.includes('--live'))
  throw new Error('Use --live to authorize three billable synthetic tests.')
const account = process.env.CLOUDFLARE_ACCOUNT_ID
if (!account)
  throw new Error(
    'CLOUDFLARE_ACCOUNT_ID is required; Wrangler handles authentication.',
  )
const dir = await mkdtemp(path.join(tmpdir(), 'skin-probe-'))
const out =
  process.env.SKIN_PROBE_OUTPUT || path.join(tmpdir(), 'skin-maker-evidence')
await mkdir(out, { recursive: true })
await writeFile(
  path.join(dir, 'wrangler.json'),
  JSON.stringify({
    name: 'skin-maker-probe',
    account_id: account,
    compatibility_date: '2026-09-06',
    ai: { binding: 'AI', remote: true },
  }),
)
const proxy = await getPlatformProxy({
  configPath: path.join(dir, 'wrangler.json'),
  persist: false,
  envFiles: [],
  remoteBindings: true,
})
let failed = false
try {
  const reference = new Uint8Array(64 * 64 * 4)
  const rectangle = (x, y, w, h, color) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++)
        reference.set(color, (yy * 64 + xx) * 4)
  }
  rectangle(0, 0, 64, 64, [245, 239, 220, 255])
  rectangle(22, 4, 20, 20, [85, 40, 22, 255])
  rectangle(25, 10, 14, 14, [237, 178, 133, 255])
  rectangle(25, 13, 3, 3, [20, 140, 220, 255])
  rectangle(36, 13, 3, 3, [20, 140, 220, 255])
  rectangle(18, 25, 28, 22, [15, 120, 128, 255])
  rectangle(27, 25, 9, 7, [246, 180, 20, 255])
  rectangle(22, 47, 9, 14, [40, 45, 65, 255])
  rectangle(33, 47, 9, 14, [40, 45, 65, 255])
  await writeFile(
    path.join(out, 'reference-input.png'),
    encode({ width: 64, height: 64, data: reference, channels: 4, depth: 8 }),
  )
  const base = {
    mode: 'create',
    model: 'classic',
    token: 'synthetic',
    consent: true,
    parts: [...PARTS],
    layers: [...LAYERS],
    faces: [...FACES],
  }
  let current
  let currentModel = 'classic'
  if (process.env.SKIN_PROBE_SOURCE) {
    currentModel = process.env.SKIN_PROBE_SOURCE_MODEL || 'slim'
    current = readSkinPng(
      new Uint8Array(await readFile(process.env.SKIN_PROBE_SOURCE)),
      currentModel,
    )
  }
  for (const [name, input] of [
    [
      'text',
      {
        ...base,
        prompt:
          '栗色の短髪、青い目、深緑の探検家ジャケット、金色のスカーフ、紺のズボン、茶色のブーツ。背中に革の小さなリュック。袖口と襟にも立体レイヤーを使う。',
      },
    ],
    [
      'reference',
      {
        ...base,
        model: 'slim',
        prompt:
          'このオリジナル人物をスキンに。髪色、青い目、青緑の服、金色の襟、紺のズボンを忠実に保ち、側面と背面も自然に仕上げて。',
        reference: { width: 64, height: 64, pixels: encodePixels(reference) },
      },
    ],
    [
      'edit',
      {
        ...base,
        mode: 'edit',
        parts: ['head'],
        layers: ['base'],
        faces: ['front'],
        prompt:
          '両目の青い部分だけを緑色に変更。目の形や髪、肌、服は変えない。',
      },
    ],
  ]) {
    if (process.argv.includes('--edit-only') && name !== 'edit') continue
    if (name === 'reference' && process.argv.includes('--text-edit-only'))
      continue
    if (name === 'edit' && !current) {
      failed = true
      console.log(JSON.stringify({ name, skipped: 'text generation invalid' }))
      continue
    }
    if (name === 'edit') {
      input.current = encodePixels(current)
      input.model = currentModel
    }
    const start = Date.now()
    let timer
    try {
      const payload = modelInput(input, name === 'edit' ? current : undefined)
      // AbortSignal cannot cross getPlatformProxy's serialization boundary.
      // A probe timeout ends the run; the production handler uses a native signal.
      const raw = await Promise.race([
        proxy.env.AI.run(MODEL, payload),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('probe_timeout')), 250_000)
        }),
      ])
      console.log(
        JSON.stringify({
          name,
          received: true,
          ms: Date.now() - start,
          usage: raw.usage,
        }),
      )
      await writeFile(
        path.join(out, name + '-completion.json'),
        JSON.stringify(raw, null, 2),
      )
      const design = parseCompletion(raw)
      await writeFile(
        path.join(out, name + '.json'),
        JSON.stringify(design, null, 2),
      )
      const result = applyDesign(
        design,
        input,
        name === 'edit' ? current : undefined,
      )
      if (name === 'edit') {
        const face = regions(input.model).find(
          (r) => r.part === 'head' && r.layer === 'base' && r.face === 'front',
        )
        const eyes = new Set()
        for (let y = 0; y < face.h; y++)
          for (let x = 0; x < face.w; x++) {
            const i = ((face.y + y) * 64 + face.x + x) * 4
            if (
              current[i] < 100 &&
              current[i + 2] > 100 &&
              current[i + 2] > current[i + 1] * 1.2
            )
              eyes.add(i)
          }
        if (eyes.size < 2)
          throw new Error('synthetic_source_missing_two_blue_eyes')
        for (let i = 0; i < current.length; i += 4) {
          if (eyes.has(i)) {
            if (!(
              result.pixels[i + 1] > result.pixels[i] &&
              result.pixels[i + 1] > result.pixels[i + 2]
            ))
              throw new Error('requested_eye_not_green')
          } else if (
            current
              .subarray(i, i + 4)
              .some((v, j) => result.pixels[i + j] !== v)
          )
            throw new Error('unrelated_pixel_changed')
        }
        console.log(
          JSON.stringify({
            name,
            semantic: true,
            eyes: eyes.size,
            unrelatedPixelsPreserved: true,
          }),
        )
      }
      await writeFile(
        path.join(out, name + '.png'),
        encode({
          width: 64,
          height: 64,
          data: result.pixels,
          channels: 4,
          depth: 8,
        }),
      )
      if (name === 'text') {
        current = result.pixels
        currentModel = input.model
      }
      console.log(
        JSON.stringify({
          name,
          valid: true,
          ms: Date.now() - start,
          changed: result.changed,
          usage: raw.usage,
        }),
      )
    } catch (e) {
      failed = true
      console.log(
        JSON.stringify({
          name,
          valid: false,
          ms: Date.now() - start,
          error: String(e).slice(0, 600),
        }),
      )
      if (String(e).includes('probe_timeout')) break
    } finally {
      clearTimeout(timer)
    }
  }
  console.log('Synthetic artifacts: ' + out)
  if (failed) process.exitCode = 1
} finally {
  await proxy.dispose()
  await rm(dir, { recursive: true, force: true })
}
