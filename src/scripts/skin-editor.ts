import { getSkinEditorUi } from '../data/skin-editor-ui'
import { getSkinMakerUi } from '../data/skin-maker-ui'
import type { Locale } from '../i18n/config'
import {
  regions,
  type Model,
  type Part,
  type Layer,
  type Face,
  type Selection,
} from '../lib/skin-maker'
import {
  editPixel,
  paintLine,
  pixelColor,
  type EditorTool,
  type Point,
} from '../lib/skin-editor'
import type { initSkin3dEditor } from './skin-editor-3d'

type Options = {
  skin: () => { pixels: Uint8Array; model: Model } | undefined
  change: (pixels: Uint8Array) => void
  undo: () => void
  redo: () => void
}
const SCALE = 32
export function initSkinEditor(
  root: HTMLElement,
  locale: Locale,
  options: Options,
) {
  const e = getSkinEditorUi(locale),
    c = getSkinMakerUi(locale)
  const el = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!
  const panel = el('[data-pixel-editor]')
  const canvas = el<HTMLCanvasElement>('[data-edit-canvas]')
  const part = el<HTMLSelectElement>('[data-edit-part]')
  const layer = el<HTMLSelectElement>('[data-edit-layer]')
  const face = el<HTMLSelectElement>('[data-edit-face]')
  const tool = el<HTMLSelectElement>('[data-edit-tool]')
  const color = el<HTMLInputElement>('[data-edit-color]')
  const scope = el<HTMLSelectElement>('[data-edit-scope]')
  const isolate = el<HTMLInputElement>('[data-edit-isolate]')
  let view: ReturnType<typeof initSkin3dEditor> | undefined
  let viewLoading = false,
    disposed = false
  let preview: Uint8Array | undefined
  let rectangle: Selection['rectangle']
  let selectionAnchor: Point | undefined
  let cursor: Point = { x: 0, y: 0 }
  let busy = false
  let stroke:
    | {
        pixels: Uint8Array
        start: Point
        last: Point
        tool: EditorTool
        pointerId: number
      }
    | undefined
  const region = () =>
    regions(options.skin()?.model ?? 'classic').find(
      (r) =>
        r.part === part.value &&
        r.layer === layer.value &&
        r.face === face.value,
    )!
  const rgba = () =>
    tool.value === 'erase'
      ? [0, 0, 0, 0]
      : [
          parseInt(color.value.slice(1, 3), 16),
          parseInt(color.value.slice(3, 5), 16),
          parseInt(color.value.slice(5, 7), 16),
          255,
        ]
  const box = (a: Point, b: Point) => ({
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x) + 1,
    h: Math.abs(a.y - b.y) + 1,
  })
  const selection = (): Selection => ({
    part: part.value as Part,
    layer: layer.value as Layer,
    ...(scope.value === 'part' ? {} : { face: face.value as Face }),
    ...(scope.value === 'selection' && rectangle
      ? { rectangle: { ...rectangle } }
      : {}),
  })
  const render = () => {
    const skin = options.skin()
    panel.hidden = !skin
    if (!skin) {
      view?.render()
      return
    }
    const r = region(),
      pixels = stroke?.pixels ?? preview ?? skin.pixels
    canvas.width = r.w * SCALE
    canvas.height = r.h * SCALE
    const ctx = canvas.getContext('2d')!
    for (let y = 0; y < r.h; y++)
      for (let x = 0; x < r.w; x++) {
        const [red, green, blue, alpha] = pixelColor(pixels, r, { x, y })
        ctx.fillStyle = (x + y) % 2 ? '#e3dac8' : '#fffdf5'
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE)
        ctx.fillStyle = `rgba(${red},${green},${blue},${alpha / 255})`
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE)
        ctx.strokeStyle = 'rgba(48,38,25,0.15)'
        ctx.strokeRect(x * SCALE + 0.5, y * SCALE + 0.5, SCALE - 1, SCALE - 1)
      }
    if (rectangle) {
      ctx.fillStyle = 'rgba(51,136,221,0.15)'
      ctx.fillRect(
        rectangle.x * SCALE,
        rectangle.y * SCALE,
        rectangle.w * SCALE,
        rectangle.h * SCALE,
      )
      ctx.lineWidth = 3
      ctx.strokeStyle = '#287bcc'
      ctx.strokeRect(
        rectangle.x * SCALE + 1.5,
        rectangle.y * SCALE + 1.5,
        rectangle.w * SCALE - 3,
        rectangle.h * SCALE - 3,
      )
    }
    if (document.activeElement === canvas) {
      ctx.lineWidth = 2
      ctx.strokeStyle = '#fff'
      ctx.strokeRect(
        cursor.x * SCALE + 3,
        cursor.y * SCALE + 3,
        SCALE - 6,
        SCALE - 6,
      )
      ctx.strokeStyle = '#302619'
      ctx.strokeRect(
        cursor.x * SCALE + 1,
        cursor.y * SCALE + 1,
        SCALE - 2,
        SCALE - 2,
      )
    }
    el('[data-face-size]').textContent =
      `${r.w} × ${r.h} · ${skin.model === 'classic' ? 'Classic' : 'Slim'}`
    el('[data-pixel-position]').textContent =
      `X: ${cursor.x + 1} · Y: ${cursor.y + 1}`
    el('[data-selection-info]').hidden = !rectangle
    el('[data-selection-info]').textContent = rectangle
      ? `${e.selected}: ${rectangle.w} × ${rectangle.h}`
      : ''
    el<HTMLButtonElement>('[data-clear-selection]').disabled =
      busy || !rectangle
    scope.querySelector<HTMLOptionElement>('[value=selection]')!.disabled =
      !rectangle
    if (!rectangle && scope.value === 'selection') scope.value = 'face'
    const selected = selection()
    el('[data-scope-summary]').textContent = [
      e.partNames[part.selectedIndex],
      c.layerNames[layer.selectedIndex],
      selected.face ? c.faceNames[face.selectedIndex] : e.scopeNames[2],
      selected.rectangle
        ? `${selected.rectangle.w} × ${selected.rectangle.h}`
        : '',
    ]
      .filter(Boolean)
      .join(' · ')
    tool.querySelector<HTMLOptionElement>('[value=erase]')!.disabled =
      layer.value === 'base'
    if (layer.value === 'base' && tool.value === 'erase') tool.value = 'pencil'
    canvas.setAttribute(
      'aria-label',
      `${e.canvas}: ${e.partNames[part.selectedIndex]} · ${c.layerNames[layer.selectedIndex]} · ${c.faceNames[face.selectedIndex]} · ${r.w} × ${r.h}`,
    )
    view?.render()
    if (!view && !viewLoading && !disposed) {
      viewLoading = true
      void import('./skin-editor-3d')
        .then(({ initSkin3dEditor }) => {
          if (disposed || !options.skin()) {
            viewLoading = false
            return
          }
          view = initSkin3dEditor(root, {
            state: () => {
              const skin = options.skin()
              return skin
                ? {
                    ...skin,
                    part: part.value as Part,
                    layer: layer.value as Layer,
                    face: face.value as Face,
                    tool: tool.value as EditorTool,
                    color: rgba(),
                    rectangle,
                    busy,
                    isolate: isolate.checked,
                  }
                : undefined
            },
            target: (hit) => {
              if (
                part.value !== hit.region.part ||
                face.value !== hit.region.face
              ) {
                rectangle = undefined
                selectionAnchor = undefined
                part.value = hit.region.part
                face.value = hit.region.face
              }
              cursor = { ...hit.point }
              render()
            },
            select: (box) => {
              rectangle = box
              scope.value = 'selection'
              render()
            },
            pick: (value) => {
              color.value = value
            },
            preview: (pixels) => {
              preview = pixels
              render()
            },
            change: options.change,
          })
        })
        .catch(() => {
          el('[data-edit-webgl]').hidden = false
          el<HTMLDetailsElement>('[data-edit-fine]').open = true
        })
    }
  }
  const clearSelection = () => {
    rectangle = undefined
    selectionAnchor = undefined
    render()
  }
  for (const select of [part, layer, face])
    select.addEventListener('change', () => {
      view?.cancel()
      stroke = undefined
      cursor = { x: 0, y: 0 }
      clearSelection()
    })
  scope.addEventListener('change', render)
  isolate.addEventListener('change', render)
  tool.addEventListener('change', () => {
    view?.cancel()
    stroke = undefined
    render()
  })
  el('[data-clear-selection]').addEventListener('click', clearSelection)
  el('[data-undo]').addEventListener('click', options.undo)
  el('[data-redo]').addEventListener('click', options.redo)
  const position = (event: PointerEvent): Point => {
    const bounds = canvas.getBoundingClientRect(),
      r = region()
    return {
      x: Math.max(
        0,
        Math.min(
          r.w - 1,
          Math.floor(((event.clientX - bounds.left) * r.w) / bounds.width),
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          r.h - 1,
          Math.floor(((event.clientY - bounds.top) * r.h) / bounds.height),
        ),
      ),
    }
  }
  const pick = (pixels: Uint8Array, point: Point) => {
    const values = pixelColor(pixels, region(), point)
    if (values[3] !== 0)
      color.value =
        '#' +
        values
          .slice(0, 3)
          .map((v) => v.toString(16).padStart(2, '0'))
          .join('')
  }
  const act = (point: Point) => {
    const skin = options.skin()
    if (!skin || busy) return
    if (tool.value === 'rotate') return
    if (tool.value === 'picker') pick(skin.pixels, point)
    else if (tool.value === 'select') {
      selectionAnchor = { ...point }
      rectangle = box(point, point)
      scope.value = 'selection'
    } else {
      const pixels = new Uint8Array(skin.pixels)
      editPixel(pixels, region(), point, rgba(), tool.value === 'fill')
      options.change(pixels)
    }
    render()
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (
      busy ||
      !options.skin() ||
      event.button !== 0 ||
      stroke ||
      tool.value === 'rotate'
    )
      return
    event.preventDefault()
    canvas.focus({ preventScroll: true })
    cursor = position(event)
    if (tool.value === 'picker' || tool.value === 'fill') {
      act(cursor)
      return
    }
    stroke = {
      pixels: new Uint8Array(options.skin()!.pixels),
      start: cursor,
      last: cursor,
      tool: tool.value as EditorTool,
      pointerId: event.pointerId,
    }
    canvas.setPointerCapture(event.pointerId)
    if (stroke.tool === 'select') {
      selectionAnchor = { ...cursor }
      rectangle = box(cursor, cursor)
      scope.value = 'selection'
    } else editPixel(stroke.pixels, region(), cursor, rgba())
    render()
  })
  canvas.addEventListener('pointermove', (event) => {
    if (!stroke || stroke.pointerId !== event.pointerId) return
    cursor = position(event)
    if (stroke.tool === 'select') rectangle = box(stroke.start, cursor)
    else paintLine(stroke.pixels, region(), stroke.last, cursor, rgba())
    stroke.last = cursor
    render()
  })
  const finish = (event: PointerEvent) => {
    if (!stroke || stroke.pointerId !== event.pointerId) return
    const completed = stroke
    cursor = position(event)
    if (completed.tool === 'select') rectangle = box(completed.start, cursor)
    else paintLine(completed.pixels, region(), completed.last, cursor, rgba())
    stroke = undefined
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId)
    if (completed.tool !== 'select') options.change(completed.pixels)
    render()
  }
  canvas.addEventListener('pointerup', finish)
  canvas.addEventListener('lostpointercapture', () => {
    stroke = undefined
    render()
  })
  canvas.addEventListener('pointercancel', () => {
    stroke = undefined
    render()
  })
  canvas.addEventListener('keydown', (event) => {
    if (busy || !options.skin()) return
    const moves: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    }
    if (moves[event.key]) {
      event.preventDefault()
      if (event.shiftKey && tool.value === 'select')
        selectionAnchor ??= { ...cursor }
      else selectionAnchor = undefined
      const r = region(),
        d = moves[event.key]
      cursor = {
        x: Math.max(0, Math.min(r.w - 1, cursor.x + d.x)),
        y: Math.max(0, Math.min(r.h - 1, cursor.y + d.y)),
      }
      if (event.shiftKey && tool.value === 'select') {
        rectangle = box(selectionAnchor!, cursor)
        scope.value = 'selection'
      }
      render()
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      act(cursor)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      clearSelection()
    }
  })
  canvas.addEventListener('focus', render)
  canvas.addEventListener('blur', render)
  return {
    render,
    selection,
    reset: () => {
      view?.cancel()
      stroke = undefined
      preview = undefined
      cursor = { x: 0, y: 0 }
      rectangle = undefined
      selectionAnchor = undefined
      scope.value = 'face'
      render()
    },
    sync: (working: boolean, canUndo: boolean, canRedo: boolean) => {
      busy = working
      if (busy) {
        stroke = undefined
        preview = undefined
        view?.cancel()
      }
      view?.render()
      el<HTMLFieldSetElement>('[data-edit-inputs]').disabled = busy
      el<HTMLButtonElement>('[data-undo]').disabled = busy || !canUndo
      el<HTMLButtonElement>('[data-redo]').disabled = busy || !canRedo
      el<HTMLButtonElement>('[data-clear-selection]').disabled =
        busy || !rectangle
      canvas.setAttribute('aria-disabled', String(busy))
      canvas.tabIndex = busy ? -1 : 0
    },
    dispose: () => {
      disposed = true
      stroke = undefined
      preview = undefined
      view?.dispose()
    },
  }
}
