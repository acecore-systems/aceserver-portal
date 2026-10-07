import type { Region } from './skin-maker.ts'

export type EditorTool =
  'pencil' | 'fill' | 'erase' | 'picker' | 'select' | 'rotate'
export type Point = { x: number; y: number }
export type SkinSnapshot = {
  pixels: Uint8Array
  storeTicket?: string
  manuallyEdited?: boolean
}

export function equalPixels(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}
export function pixelColor(
  pixels: Uint8Array,
  region: Region,
  point: Point,
): number[] {
  if (point.x < 0 || point.y < 0 || point.x >= region.w || point.y >= region.h)
    throw new Error('pixel')
  const offset = ((region.y + point.y) * 64 + region.x + point.x) * 4
  return Array.from(pixels.subarray(offset, offset + 4))
}
export function editPixel(
  pixels: Uint8Array,
  region: Region,
  point: Point,
  color: number[],
  fill = false,
): void {
  if (
    color.length !== 4 ||
    color.some((v) => !Number.isInteger(v) || v < 0 || v > 255) ||
    (region.layer === 'base' && color[3] !== 255)
  )
    throw new Error('color')
  const original = pixelColor(pixels, region, point)
  if (original.every((v, i) => v === color[i])) return
  const queue = [point]
  const visited = new Set<number>()
  while (queue.length) {
    const p = queue.pop()!
    if (p.x < 0 || p.y < 0 || p.x >= region.w || p.y >= region.h) continue
    const index = p.y * region.w + p.x
    if (visited.has(index)) continue
    visited.add(index)
    if (
      fill &&
      !pixelColor(pixels, region, p).every((v, i) => v === original[i])
    )
      continue
    pixels.set(color, ((region.y + p.y) * 64 + region.x + p.x) * 4)
    if (fill)
      queue.push(
        { x: p.x - 1, y: p.y },
        { x: p.x + 1, y: p.y },
        { x: p.x, y: p.y - 1 },
        { x: p.x, y: p.y + 1 },
      )
  }
}
export function paintLine(
  pixels: Uint8Array,
  region: Region,
  from: Point,
  to: Point,
  color: number[],
): void {
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y))
  for (let i = 0; i <= steps; i++) {
    const t = steps ? i / steps : 0
    editPixel(
      pixels,
      region,
      {
        x: Math.round(from.x + (to.x - from.x) * t),
        y: Math.round(from.y + (to.y - from.y) * t),
      },
      color,
    )
  }
}

// Store copied snapshots so a stroke or a later AI request cannot mutate undo data.
export class SkinHistory {
  private states: SkinSnapshot[] = []
  private index = -1
  private readonly limit: number
  constructor(limit = 50) {
    this.limit = limit
  }
  get canUndo() {
    return this.index > 0
  }
  get canRedo() {
    return this.index < this.states.length - 1
  }
  reset(state?: SkinSnapshot) {
    this.states = []
    this.index = -1
    if (state) this.push(state)
  }
  invalidateTicket(ticket: string) {
    for (const state of this.states)
      if (state.storeTicket === ticket) state.storeTicket = undefined
  }
  push(state: SkinSnapshot) {
    const previous = this.states[this.index]
    if (previous && equalPixels(previous.pixels, state.pixels)) return
    this.states.splice(this.index + 1)
    this.states.push({ ...state, pixels: new Uint8Array(state.pixels) })
    if (this.states.length > this.limit) this.states.shift()
    this.index = this.states.length - 1
  }
  move(direction: -1 | 1): SkinSnapshot | undefined {
    if (direction === -1 ? !this.canUndo : !this.canRedo) return
    this.index += direction
    const state = this.states[this.index]
    return { ...state, pixels: new Uint8Array(state.pixels) }
  }
}
