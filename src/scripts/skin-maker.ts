import { getSkinMakerUi } from '../data/skin-maker-ui'
import { isLocale } from '../i18n/config'
import {
  decodePixels,
  PARTS,
  LAYERS,
  FACES,
  encodePixels,
  validateSkin,
  type Model,
  type SkinRequest,
} from '../lib/skin-maker'
import { readSkinPng, skinPngUrl } from '../lib/skin-png'
import type { SkinViewer } from 'skinview3d'

type Turnstile = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      action: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

export function initSkinMaker(root: HTMLElement) {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload()
  })
  const locale = root.dataset.locale
  if (!isLocale(locale)) return
  const c = getSkinMakerUi(locale)
  const el = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!
  const form = el<HTMLFormElement>('[data-form]')
  const inputs = el<HTMLFieldSetElement>('[data-inputs]')
  const modelSelect = el<HTMLSelectElement>('[name=model]')
  const atlas = el<HTMLCanvasElement>('[data-atlas]')
  const download = el<HTMLAnchorElement>('[data-download]')
  const generate = el<HTMLButtonElement>('[data-generate]')
  const undo = el<HTMLButtonElement>('[data-undo]')
  const status = el('[data-status]')
  let current: Uint8Array | undefined
  let history: Uint8Array[] = []
  let reference: SkinRequest['reference']
  let skinModel: Model = 'classic'
  let viewer: SkinViewer | undefined
  let enabled = false,
    busy = false,
    token = '',
    widget: string | undefined,
    disposed = false
  let loading = 0
  const model = () => modelSelect.value as Model
  const sync = () => {
    generate.disabled = !enabled || busy || !token
    inputs.disabled = busy
    // Model conversion is intentionally explicit: clear/import for a different UV.
    modelSelect.disabled = busy || !!current
    undo.disabled = busy || history.length === 0
    el<HTMLButtonElement>('[data-clear]').disabled = busy
  }
  const setMode = (mode: string) => {
    el<HTMLInputElement>(`[name=mode][value=${mode}]`).checked = true
    el<HTMLDetailsElement>('[data-scope]').open = mode === 'edit'
  }
  const render = () => {
    const ctx = atlas.getContext('2d')!
    ctx.clearRect(0, 0, 64, 64)
    if (current) {
      ctx.putImageData(
        new ImageData(new Uint8ClampedArray(current), 64, 64),
        0,
        0,
      )
      download.href = skinPngUrl(current)
      download.download = `minecraft-${skinModel}.png`
      download.setAttribute('aria-disabled', 'false')
      viewer?.loadSkin(atlas, {
        model: skinModel === 'classic' ? 'default' : 'slim',
      })
    } else {
      download.removeAttribute('href')
      download.setAttribute('aria-disabled', 'true')
      viewer?.loadSkin(null)
    }
    el('[data-empty]').hidden = !!current
    sync()
  }
  void (async () => {
    try {
      const { SkinViewer } = await import('skinview3d')
      if (disposed) return
      const stage = el('[data-stage]')
      viewer = new SkinViewer({
        canvas: el<HTMLCanvasElement>('[data-viewer]'),
        width: stage.clientWidth,
        height: stage.clientHeight,
        pixelRatio: Math.min(devicePixelRatio, 2),
      })
      viewer.controls.enablePan = false
      viewer.zoom = 0.82
      render()
    } catch {
      el('[data-webgl]').hidden = false
    }
  })()
  const resize = new ResizeObserver(() => {
    if (viewer) {
      viewer.width = el('[data-stage]').clientWidth
      viewer.height = el('[data-stage]').clientHeight
    }
  })
  resize.observe(el('[data-stage]'))
  root.querySelectorAll<HTMLButtonElement>('[data-angle]').forEach((button) =>
    button.addEventListener('click', () => {
      if (!viewer) return
      viewer.autoRotate = false
      el<HTMLInputElement>('[data-rotate]').checked = false
      viewer.playerObject.rotation.y = 0
      const positions: Record<string, [number, number, number]> = {
        front: [0, 0, 65],
        back: [0, 0, -65],
        right: [-65, 0, 0],
        left: [65, 0, 0],
      }
      viewer.camera.position.set(...positions[button.dataset.angle!])
      viewer.controls.update()
    }),
  )
  el<HTMLInputElement>('[data-rotate]').addEventListener('change', (e) => {
    if (viewer) viewer.autoRotate = (e.target as HTMLInputElement).checked
  })
  el<HTMLInputElement>('[data-outer]').addEventListener('change', (e) =>
    viewer?.playerObject.skin.setOuterLayerVisible(
      (e.target as HTMLInputElement).checked,
    ),
  )
  el<HTMLInputElement>('[name=skin]').addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement,
      file = input.files?.[0]
    if (!file) return
    const revision = ++loading
    busy = true
    sync()
    try {
      if (file.size > 1_000_000) throw new Error('file')
      const pixels = readSkinPng(
        new Uint8Array(await file.arrayBuffer()),
        model(),
      )
      if (disposed || revision !== loading) return
      if (current) history.push(current)
      history = history.slice(-10)
      current = pixels
      skinModel = model()
      setMode('edit')
      render()
      status.textContent = c.loaded
    } catch {
      status.textContent = c.invalid
    } finally {
      input.value = ''
      busy = false
      sync()
    }
  })
  el<HTMLInputElement>('[name=reference]').addEventListener(
    'change',
    async (e) => {
      const input = e.target as HTMLInputElement,
        file = input.files?.[0]
      if (!file) return
      busy = true
      sync()
      try {
        if (
          file.size > 5_000_000 ||
          !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
        )
          throw new Error('file')
        const bitmap = await createImageBitmap(file)
        try {
          if (bitmap.width * bitmap.height > 40_000_000)
            throw new Error('dimensions')
          const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height))
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(bitmap.width * scale))
          canvas.height = Math.max(1, Math.round(bitmap.height * scale))
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
          reference = {
            width: canvas.width,
            height: canvas.height,
            pixels: encodePixels(
              ctx.getImageData(0, 0, canvas.width, canvas.height).data,
            ),
          }
          el<HTMLImageElement>('[data-reference-image]').src =
            canvas.toDataURL('image/png')
          el('[data-reference]').hidden = false
        } finally {
          bitmap.close()
        }
      } catch {
        status.textContent = c.invalid
      } finally {
        input.value = ''
        busy = false
        sync()
      }
    },
  )
  const removeReference = () => {
    reference = undefined
    el('[data-reference]').hidden = true
    el<HTMLImageElement>('[data-reference-image]').removeAttribute('src')
  }
  el('[data-remove]').addEventListener('click', removeReference)
  undo.addEventListener('click', () => {
    current = history.pop()
    render()
    status.textContent = c.ready
  })
  el('[data-clear]').addEventListener('click', () => {
    loading++
    current = undefined
    history = []
    removeReference()
    form.reset()
    skinModel = model()
    setMode('create')
    if (viewer) {
      viewer.autoRotate = false
      viewer.playerObject.skin.setOuterLayerVisible(true)
    }
    el<HTMLInputElement>('[data-rotate]').checked = false
    el<HTMLInputElement>('[data-outer]').checked = true
    render()
    status.textContent = enabled ? c.ready : c.disabled
  })
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (busy || !enabled || !token || !form.reportValidity()) return
    const data = new FormData(form)
    const mode = data.get('mode') as 'create' | 'edit'
    if (mode === 'edit' && !current) {
      status.textContent = c.invalid
      return
    }
    const input = {
      mode,
      model: model(),
      prompt: String(data.get('prompt')),
      token,
      consent: data.get('consent') === 'on',
      reference,
      current: mode === 'edit' && current ? encodePixels(current) : undefined,
      parts: mode === 'create' ? [...PARTS] : data.getAll('parts'),
      layers: mode === 'create' ? [...LAYERS] : data.getAll('layers'),
      faces: mode === 'create' ? [...FACES] : data.getAll('faces'),
    }
    if (
      mode === 'edit' &&
      [input.parts, input.layers, input.faces].some((v) => !v.length)
    ) {
      status.textContent = c.scope
      return
    }
    busy = true
    sync()
    status.textContent = c.busy
    root.setAttribute('aria-busy', 'true')
    try {
      const response = await fetch('/api/skin-maker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(270_000),
      })
      if (!response.ok) {
        status.textContent =
          response.status === 429
            ? c.limit
            : response.status === 403
              ? c.verify
              : response.status === 503
                ? c.disabled
                : c.error
        return
      }
      const result = await response.json()
      const pixels = decodePixels(result.pixels, 64, 64)
      validateSkin(pixels, model())
      if (current) history.push(current)
      history = history.slice(-10)
      current = pixels
      skinModel = model()
      setMode('edit')
      render()
      status.textContent = c.changed + String(result.changed)
    } catch {
      status.textContent = c.error
    } finally {
      busy = false
      token = ''
      if (widget) window.turnstile?.reset(widget)
      sync()
      root.removeAttribute('aria-busy')
    }
  })
  void (async () => {
    try {
      const response = await fetch('/api/skin-maker', { cache: 'no-store' })
      if (!response.ok) return
      const config = await response.json()
      if (!config.enabled || !config.siteKey || disposed) return
      const script = document.createElement('script')
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve()
        script.onerror = reject
        document.head.append(script)
      })
      if (disposed || !window.turnstile) return
      enabled = true
      widget = window.turnstile.render(el('[data-turnstile]'), {
        sitekey: config.siteKey,
        action: 'skin-maker',
        callback: (value) => {
          token = value
          sync()
        },
        'expired-callback': () => {
          token = ''
          sync()
        },
        'error-callback': () => {
          token = ''
          status.textContent = c.verify
          sync()
        },
      })
      status.textContent = c.ready
      sync()
    } catch {
      status.textContent = c.disabled
    }
  })()
  window.addEventListener(
    'pagehide',
    () => {
      disposed = true
      resize.disconnect()
      viewer?.dispose()
      if (widget) window.turnstile?.remove(widget)
      current = undefined
      history = []
      reference = undefined
    },
    { once: true },
  )
}
