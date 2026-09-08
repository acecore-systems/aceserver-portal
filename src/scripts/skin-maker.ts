import { getSkinMakerUi } from '../data/skin-maker-ui'
import { isLocale } from '../i18n/config'
import {
  decodePixels,
  encodePixels,
  validateSkin,
  type Model,
  type SkinRequest,
} from '../lib/skin-maker'
import { skinPngUrl } from '../lib/skin-png'
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
  const status = el('[data-status]')
  const loading = el('.loading')
  let generationStarted: number | undefined
  let loadingTimer: ReturnType<typeof setInterval> | undefined
  const updateLoadingTime = () => {
    if (generationStarted === undefined) return
    const seconds = Math.floor((performance.now() - generationStarted) / 1000)
    const elapsed = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    root.querySelectorAll('[data-elapsed]').forEach((element) => {
      element.textContent = elapsed
    })
    if (seconds >= 60 && status.textContent === c.busy) {
      status.textContent = c.waiting
      el('[data-loading-message]').textContent = c.waiting
    }
  }
  const stopLoading = () => {
    clearInterval(loadingTimer)
    loadingTimer = undefined
    generationStarted = undefined
    loading.hidden = true
    el('[data-elapsed-row]').hidden = true
    el('[data-button-spinner]').hidden = true
    el('[data-generate-label]').textContent = c.generate
    generate.removeAttribute('data-loading')
    el('[data-stage]').removeAttribute('aria-busy')
    el('[data-empty]').hidden = !!current
  }
  let current: Uint8Array | undefined
  let reference: SkinRequest['reference']
  let skinModel: Model = 'classic'
  let viewer: SkinViewer | undefined
  let enabled = false,
    busy = false,
    token = '',
    widget: string | undefined,
    disposed = false
  const model = () => modelSelect.value as Model
  const sync = () => {
    generate.disabled = !enabled || busy || !token
    inputs.disabled = busy
    modelSelect.disabled = busy
    el<HTMLButtonElement>('[data-clear]').disabled = busy
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
    el('[data-empty]').hidden = !!current || generationStarted !== undefined
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
  el('[data-clear]').addEventListener('click', () => {
    current = undefined
    removeReference()
    form.reset()
    skinModel = model()
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
    const input = {
      mode: 'create',
      model: model(),
      prompt: String(data.get('prompt')),
      token,
      consent: data.get('consent') === 'on',
      reference,
    }
    busy = true
    sync()
    status.textContent = c.busy
    generationStarted = performance.now()
    loading.hidden = false
    el('[data-empty]').hidden = true
    el('[data-elapsed-row]').hidden = false
    el('[data-button-spinner]').hidden = false
    el('[data-generate-label]').textContent = c.generating
    el('[data-loading-message]').textContent = c.busy
    generate.setAttribute('data-loading', '')
    el('[data-stage]').setAttribute('aria-busy', 'true')
    updateLoadingTime()
    loadingTimer = setInterval(updateLoadingTime, 1000)
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
      current = pixels
      skinModel = model()
      render()
      status.textContent = c.ready
    } catch {
      status.textContent = c.error
    } finally {
      busy = false
      stopLoading()
      token = ''
      if (widget) window.turnstile?.reset(widget)
      sync()
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
      stopLoading()
      resize.disconnect()
      viewer?.dispose()
      if (widget) window.turnstile?.remove(widget)
      current = undefined
      reference = undefined
    },
    { once: true },
  )
}
