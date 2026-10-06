import { encode } from 'fast-png'
import { regions, encodePixels, type Model } from './skin-maker.ts'

export const STORE_PAGE_SIZE = 24
export const STORE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
export type StoreSkin = {
  id: string
  name: string
  model: Model
  created: number
  preview: string
}

// A small full-body portrait uses the same UV regions as the real skin.
// Cards do not allocate a WebGL context for every item in the catalogue.
export function skinPortrait(pixels: Uint8Array, model: Model): string {
  const portrait = new Uint8Array(32 * 36 * 4)
  const positions = {
    head: [12, 2],
    body: [12, 10],
    rightArm: [model === 'slim' ? 9 : 8, 10],
    leftArm: [20, 10],
    rightLeg: [12, 22],
    leftLeg: [16, 22],
  }
  for (const layer of ['base', 'outer']) {
    for (const region of regions(model).filter(
      (r) => r.layer === layer && r.face === 'front',
    )) {
      const [dx, dy] = positions[region.part]
      for (let y = 0; y < region.h; y++) {
        for (let x = 0; x < region.w; x++) {
          const source = ((region.y + y) * 64 + region.x + x) * 4
          if (pixels[source + 3] === 255) {
            portrait.set(
              pixels.subarray(source, source + 4),
              ((dy + y) * 32 + dx + x) * 4,
            )
          }
        }
      }
    }
  }
  return encodePixels(
    encode({ width: 32, height: 36, channels: 4, depth: 8, data: portrait }),
  )
}
