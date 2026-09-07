import { decode, encode } from 'fast-png'
import { encodePixels, validateSkin, type Model } from './skin-maker.ts'

export function skinPngUrl(pixels: Uint8Array): string {
  return (
    'data:image/png;base64,' +
    encodePixels(
      encode({ width: 64, height: 64, channels: 4, depth: 8, data: pixels }),
    )
  )
}
export function readSkinPng(bytes: Uint8Array, model: Model): Uint8Array {
  if (
    bytes.length < 33 ||
    bytes.length > 1_000_000 ||
    ![137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
  )
    throw new Error('png')
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (view.getUint32(16) !== 64 || view.getUint32(20) !== 64)
    throw new Error('dimensions')
  const image = decode(bytes, { checkCrc: true })
  if (image.depth !== 8 && !image.palette) throw new Error('depth')
  if (image.depth < 8 && bytes[28] !== 0) throw new Error('interlaced_palette')
  const pixels = new Uint8Array(16384)
  for (let i = 0; i < 4096; i++) {
    if (image.palette) {
      const bits = image.depth
      const index =
        bits === 8
          ? image.data[i]
          : (image.data[Math.floor((i * bits) / 8)] >>>
              (8 - bits - (i % (8 / bits)) * bits)) &
            ((1 << bits) - 1)
      const color = image.palette[index]
      if (!color) throw new Error('palette')
      pixels.set([color[0], color[1], color[2], color[3] ?? 255], i * 4)
    } else if (image.channels === 4)
      pixels.set(image.data.subarray(i * 4, i * 4 + 4), i * 4)
    else if (image.channels === 3) {
      const rgb = Array.from(image.data.subarray(i * 3, i * 3 + 3))
      const transparent = image.transparency?.every((v, j) => v === rgb[j])
      pixels.set([...rgb, transparent ? 0 : 255], i * 4)
    } else throw new Error('channels')
  }
  validateSkin(pixels, model)
  return pixels
}
