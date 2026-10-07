import { SkinViewer } from 'skinview3d'
import {
  Box3,
  BufferGeometry,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MOUSE,
  Raycaster,
  Spherical,
  Vector2,
  Vector3,
} from 'three'
import {
  PARTS,
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
} from '../lib/skin-editor'
import {
  faceSurface,
  skinHit,
  surfaceOutline,
  type SkinHit,
  type SkinSurface,
} from '../lib/skin-editor-3d'

export type ViewState = {
  pixels: Uint8Array
  model: Model
  part: Part
  layer: Layer
  face: Face
  tool: EditorTool
  color: number[]
  rectangle?: Selection['rectangle']
  busy: boolean
  isolate: boolean
}
type Options = {
  state: () => ViewState | undefined
  target: (hit: SkinHit) => void
  select: (rectangle: NonNullable<Selection['rectangle']>) => void
  pick: (color: string) => void
  preview: (pixels?: Uint8Array) => void
  change: (pixels: Uint8Array) => void
}
const sameFace = (a: SkinSurface, b: SkinSurface) =>
  a.region.part === b.region.part &&
  a.region.layer === b.region.layer &&
  a.region.face === b.region.face

export function initSkin3dEditor(root: HTMLElement, options: Options) {
  const stage = root.querySelector<HTMLElement>('[data-edit-stage]')!,
    canvas = root.querySelector<HTMLCanvasElement>('[data-edit-3d]')!
  const source = document.createElement('canvas')
  source.width = source.height = 64
  const viewer = new SkinViewer({
    canvas,
    width: stage.clientWidth,
    height: stage.clientHeight,
    pixelRatio: Math.min(devicePixelRatio, 2),
    skin: source,
    model: options.state()?.model === 'slim' ? 'slim' : 'default',
  })
  viewer.controls.mouseButtons.RIGHT = MOUSE.ROTATE
  viewer.controls.enablePan = false
  viewer.controls.enableDamping = false
  viewer.controls.minDistance = 8
  viewer.controls.maxDistance = 160
  const ray = new Raycaster()
  let lastPixels: Uint8Array | undefined,
    lastIsolate = false,
    lastPart: Part | undefined
  let stroke:
    | {
        pixels: Uint8Array
        start: SkinHit
        last?: SkinHit
        tool: EditorTool
        pointerId: number
      }
    | undefined
  const blockedPointers = new Set<number>()
  let hover: LineLoop | undefined, selectionLine: LineLoop | undefined
  const hoverMaterial = new LineBasicMaterial({ color: '#ffffff' }),
    selectionMaterial = new LineBasicMaterial({ color: '#287bcc' })
  const removeLine = (line?: LineLoop) => {
    line?.removeFromParent()
    line?.geometry.dispose()
  }
  const line = (
    surface: SkinSurface,
    box: { x: number; y: number; w: number; h: number },
    material: LineBasicMaterial,
  ) => {
    const result = new LineLoop(
      new BufferGeometry().setFromPoints(surfaceOutline(surface, box)),
      material,
    )
    surface.mesh.add(result)
    return result
  }
  const meshFor = (part: Part, layer: Layer) =>
    viewer.playerObject.skin[part][
      layer === 'base' ? 'innerLayer' : 'outerLayer'
    ] as Mesh
  const home = () => {
    viewer.controls.target.set(0, 0, 0)
    viewer.camera.position.set(18, 8, 40)
    viewer.controls.update()
  }
  const focus = (state: ViewState) => {
    viewer.scene.updateMatrixWorld(true)
    const bounds = new Box3().setFromObject(meshFor(state.part, state.layer)),
      center = bounds.getCenter(new Vector3()),
      size = bounds.getSize(new Vector3()),
      direction = viewer.camera.position
        .clone()
        .sub(viewer.controls.target)
        .normalize()
    viewer.controls.target.copy(center)
    viewer.camera.position
      .copy(center)
      .addScaledVector(direction, Math.max(size.x, size.y, size.z) * 1.6)
    viewer.controls.update()
  }
  const render = (forceTexture = false) => {
    const state = options.state()
    viewer.renderPaused = !state
    if (!state) return
    viewer.controls.enabled = !state.busy
    canvas.tabIndex = state.busy ? -1 : 0
    canvas.setAttribute('aria-disabled', String(state.busy))
    canvas.style.cursor = state.tool === 'rotate' ? 'grab' : 'crosshair'
    const pixels = stroke?.pixels ?? state.pixels
    if (forceTexture || pixels !== lastPixels) {
      const texture = viewer.playerObject.skin.map!
      const image = texture.image as HTMLCanvasElement
      image
        .getContext('2d')!
        .putImageData(
          new ImageData(new Uint8ClampedArray(pixels), 64, 64),
          0,
          0,
        )
      texture.needsUpdate = true
      lastPixels = pixels
    }
    const modelType = state.model === 'slim' ? 'slim' : 'default'
    if (viewer.playerObject.skin.modelType !== modelType)
      viewer.playerObject.skin.modelType = modelType
    for (const part of PARTS) {
      viewer.playerObject.skin[part].visible =
        !state.isolate || part === state.part
      viewer.playerObject.skin[part].outerLayer.visible =
        state.layer === 'outer'
    }
    if (state.isolate && (!lastIsolate || lastPart !== state.part)) focus(state)
    else if (!state.isolate && lastIsolate) home()
    lastIsolate = state.isolate
    lastPart = state.part
    removeLine(selectionLine)
    selectionLine = undefined
    if (state.rectangle) {
      const region = regions(state.model).find(
        (r) =>
          r.part === state.part &&
          r.layer === state.layer &&
          r.face === state.face,
      )!
      const surface = faceSurface(meshFor(state.part, state.layer), region)
      if (surface)
        selectionLine = line(surface, state.rectangle, selectionMaterial)
    }
    if (state.busy || state.tool === 'rotate') {
      removeLine(hover)
      hover = undefined
    }
  }
  const hitAt = (event: PointerEvent): SkinHit | undefined => {
    const state = options.state()
    if (!state) return
    const bounds = canvas.getBoundingClientRect()
    if (
      event.clientX < bounds.left ||
      event.clientX >= bounds.right ||
      event.clientY < bounds.top ||
      event.clientY >= bounds.bottom
    )
      return
    viewer.scene.updateMatrixWorld(true)
    viewer.camera.updateMatrixWorld(true)
    ray.setFromCamera(
      new Vector2(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        1 - ((event.clientY - bounds.top) / bounds.height) * 2,
      ),
      viewer.camera,
    )
    const parts = PARTS.filter((p) => !state.isolate || p === state.part)
    const hits = ray.intersectObjects(
      parts.map((p) => meshFor(p, state.layer)),
      false,
    )
    const first = hits[0]
    if (!first) return
    const part = parts.find((p) => meshFor(p, state.layer) === first.object)!
    return skinHit(state.model, part, state.layer, first)
  }
  const highlight = (hit?: SkinHit) => {
    removeLine(hover)
    hover = hit
      ? line(hit, { ...hit.point, w: 1, h: 1 }, hoverMaterial)
      : undefined
  }
  const stop = (event: Event) => {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
  const cancel = () => {
    const previous = stroke
    stroke = undefined
    if (previous && canvas.hasPointerCapture(previous.pointerId))
      canvas.releasePointerCapture(previous.pointerId)
    options.preview()
    render()
  }
  const advance = (event: PointerEvent) => {
    if (!stroke) return
    const hit = hitAt(event),
      state = options.state()!
    highlight(hit)
    if (!hit) {
      stroke.last = undefined
      return
    }
    if (stroke.tool === 'select') {
      if (!sameFace(stroke.start, hit)) return
      const a = stroke.start.point,
        b = hit.point
      options.select({
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        w: Math.abs(a.x - b.x) + 1,
        h: Math.abs(a.y - b.y) + 1,
      })
    } else if (stroke.tool === 'pencil' || stroke.tool === 'erase') {
      options.target(hit)
      const color = stroke.tool === 'erase' ? [0, 0, 0, 0] : state.color
      if (stroke.last && sameFace(stroke.last, hit))
        paintLine(
          stroke.pixels,
          hit.region,
          stroke.last.point,
          hit.point,
          color,
        )
      else editPixel(stroke.pixels, hit.region, hit.point, color)
      options.preview(stroke.pixels)
      render(true)
    }
    stroke.last = hit
  }
  const pointerdown = (event: PointerEvent) => {
    const state = options.state()
    if (!state || state.busy) {
      stop(event)
      return
    }
    if (stroke) {
      blockedPointers.add(stroke.pointerId)
      blockedPointers.add(event.pointerId)
      cancel()
      canvas.setPointerCapture(event.pointerId)
      stop(event)
      return
    }
    if (blockedPointers.size) {
      stop(event)
      return
    }
    if (event.button !== 0 || state.tool === 'rotate') return
    const hit = hitAt(event)
    if (!hit) return // Dragging empty space still rotates the model.
    stop(event)
    canvas.focus({ preventScroll: true })
    options.target(hit)
    stroke = {
      pixels: new Uint8Array(state.pixels),
      start: hit,
      last: hit,
      tool: state.tool,
      pointerId: event.pointerId,
    }
    canvas.setPointerCapture(event.pointerId)
    if (state.tool === 'select') options.select({ ...hit.point, w: 1, h: 1 })
    else if (state.tool === 'picker') {
      const values = pixelColor(state.pixels, hit.region, hit.point)
      if (values[3])
        options.pick(
          '#' +
            values
              .slice(0, 3)
              .map((v) => v.toString(16).padStart(2, '0'))
              .join(''),
        )
    } else {
      editPixel(
        stroke.pixels,
        hit.region,
        hit.point,
        state.tool === 'erase' ? [0, 0, 0, 0] : state.color,
        state.tool === 'fill',
      )
      options.preview(stroke.pixels)
    }
    highlight(hit)
    render(true)
  }
  const pointermove = (event: PointerEvent) => {
    if (blockedPointers.has(event.pointerId)) {
      stop(event)
      return
    }
    if (stroke?.pointerId === event.pointerId) {
      stop(event)
      advance(event)
      return
    }
    const state = options.state()
    if (state && !state.busy && state.tool !== 'rotate' && !event.buttons)
      highlight(hitAt(event))
    else highlight()
  }
  const pointerup = (event: PointerEvent) => {
    if (blockedPointers.delete(event.pointerId)) {
      stop(event)
      if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId)
      return
    }
    if (stroke?.pointerId !== event.pointerId) return
    stop(event)
    advance(event)
    const completed = stroke!
    stroke = undefined
    canvas.releasePointerCapture(event.pointerId)
    options.preview()
    if (completed.tool !== 'select' && completed.tool !== 'picker')
      options.change(completed.pixels)
    render()
  }
  const pointercancel = (event: PointerEvent) => {
    blockedPointers.delete(event.pointerId)
    if (stroke?.pointerId === event.pointerId) {
      stop(event)
      cancel()
    }
  }
  const lostcapture = (event: PointerEvent) => {
    blockedPointers.delete(event.pointerId)
    if (stroke?.pointerId === event.pointerId) cancel()
  }
  const pointerleave = () => highlight()
  const keydown = (event: KeyboardEvent) => {
    if (options.state()?.busy) return
    const spherical = new Spherical().setFromVector3(
      viewer.camera.position.clone().sub(viewer.controls.target),
    )
    if (event.key === 'ArrowLeft') spherical.theta -= 0.15
    else if (event.key === 'ArrowRight') spherical.theta += 0.15
    else if (event.key === 'ArrowUp') spherical.phi -= 0.15
    else if (event.key === 'ArrowDown') spherical.phi += 0.15
    else if (event.key === '+' || event.key === '=') spherical.radius *= 0.85
    else if (event.key === '-') spherical.radius /= 0.85
    else if (event.key === '0') {
      home()
      event.preventDefault()
      return
    } else return
    event.preventDefault()
    spherical.phi = Math.max(0.02, Math.min(Math.PI - 0.02, spherical.phi))
    spherical.radius = Math.max(8, Math.min(160, spherical.radius))
    viewer.camera.position
      .copy(viewer.controls.target)
      .add(new Vector3().setFromSpherical(spherical))
    viewer.controls.update()
    highlight()
  }
  const resetView = () => {
    if (options.state()?.busy) return
    home()
    const state = options.state()
    if (state?.isolate) focus(state)
    highlight()
  }
  const resetButton =
    root.querySelector<HTMLButtonElement>('[data-reset-view]')!
  resetButton.addEventListener('click', resetView)
  canvas.addEventListener('pointerdown', pointerdown, true)
  canvas.addEventListener('pointermove', pointermove, true)
  canvas.addEventListener('pointerup', pointerup, true)
  canvas.addEventListener('pointercancel', pointercancel, true)
  canvas.addEventListener('lostpointercapture', lostcapture)
  canvas.addEventListener('pointerleave', pointerleave)
  canvas.addEventListener('keydown', keydown)
  const resize = new ResizeObserver(() => {
    if (stage.clientWidth && stage.clientHeight) {
      viewer.width = stage.clientWidth
      viewer.height = stage.clientHeight
    }
  })
  resize.observe(stage)
  home()
  render()
  return {
    render,
    cancel,
    dispose: () => {
      stroke = undefined
      resize.disconnect()
      resetButton.removeEventListener('click', resetView)
      canvas.removeEventListener('pointerdown', pointerdown, true)
      canvas.removeEventListener('pointermove', pointermove, true)
      canvas.removeEventListener('pointerup', pointerup, true)
      canvas.removeEventListener('pointercancel', pointercancel, true)
      canvas.removeEventListener('lostpointercapture', lostcapture)
      canvas.removeEventListener('pointerleave', pointerleave)
      canvas.removeEventListener('keydown', keydown)
      removeLine(hover)
      removeLine(selectionLine)
      hoverMaterial.dispose()
      selectionMaterial.dispose()
      viewer.dispose()
    },
  }
}
