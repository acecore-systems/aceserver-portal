import { getSkinMakerUi } from '../data/skin-maker-ui'
import { getSkinStoreUi } from '../data/skin-store-ui'
import { getSkinEditorUi } from '../data/skin-editor-ui'
import { initSkinEditor } from './skin-editor'
import { equalPixels, SkinHistory, type SkinSnapshot } from '../lib/skin-editor'
import { isLocale } from '../i18n/config'
import {
  decodePixels,
  encodePixels,
  validateSkin,
  type Model,
  type SkinRequest,
  type CreateRequest,
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
  const store = getSkinStoreUi(locale)
  const editCopy = getSkinEditorUi(locale)
  const el = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!
  const form = el<HTMLFormElement>('[data-form]')
  const inputs = el<HTMLFieldSetElement>('[data-inputs]')
  const modelSelect = el<HTMLSelectElement>('[name=model]')
  const atlas = el<HTMLCanvasElement>('[data-atlas]')
  const download = el<HTMLAnchorElement>('[data-download]')
  const generate = el<HTMLButtonElement>('[data-generate]')
  const status = el('[data-status]')
  const loading = el('.loading')
  const editForm = el<HTMLFormElement>('[data-edit-form]')
  const editStatus = el('[data-edit-status]')
  const aiEdit = el<HTMLButtonElement>('[data-ai-edit]')
  const history = new SkinHistory()
  let pixelEditor: ReturnType<typeof initSkinEditor> | undefined
  let activeMode: SkinRequest['mode'] = 'create'
  let manuallyEdited = false,
    publishedTicket: string | undefined
  const activeStatus = () => (activeMode === 'edit' ? editStatus : status)
  let generationStarted: number | undefined
  let loadingTimer: ReturnType<typeof setInterval> | undefined
  const updateLoadingTime = () => {
    if (generationStarted === undefined) return
    const seconds = Math.floor((performance.now() - generationStarted) / 1000)
    const elapsed = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    root.querySelectorAll('[data-elapsed]').forEach((element) => {
      element.textContent = elapsed
    })
    if (
      seconds >= 60 &&
      activeStatus().textContent ===
        (activeMode === 'edit' ? editCopy.busy : c.busy)
    ) {
      activeStatus().textContent = c.waiting
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
    el('[data-edit-spinner]').hidden = true
    el('[data-edit-elapsed-row]').hidden = true
    el('[data-generate-label]').textContent = c.generate
    el('[data-edit-label]').textContent = editCopy.edit
    generate.removeAttribute('data-loading')
    el('[data-stage]').removeAttribute('aria-busy')
    el('[data-empty]').hidden = !!current
  }
  let current: Uint8Array | undefined
  let storeTicket: string | undefined, removeTicket: string | undefined
  const publishForm = el<HTMLFormElement>('[data-publish-form]')
  const publishStatus = el('[data-publish-status]')
  const unpublish = el<HTMLButtonElement>('[data-unpublish]')
  let reference: CreateRequest['reference']
  let skinModel: Model = 'classic'
  let viewer: SkinViewer | undefined
  let enabled = false,
    busy = false,
    token = '',
    editToken = '',
    widget: string | undefined,
    editWidget: string | undefined,
    siteKey = '',
    disposed = false
  const model = () => modelSelect.value as Model
  const sync = () => {
    generate.disabled = !enabled || busy || !token
    aiEdit.disabled = !enabled || busy || !editToken || !current
    inputs.disabled = busy
    modelSelect.disabled = busy
    el<HTMLButtonElement>('[data-clear]').disabled = busy
    el<HTMLButtonElement>('[data-publish]').disabled = busy
    unpublish.disabled = busy
    publishForm.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      input.disabled = busy
    })
    pixelEditor?.sync(busy, history.canUndo, history.canRedo)
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
    el('[data-open-editor]').hidden = !current
    publishForm.hidden =
      !current || !storeTicket || storeTicket === publishedTicket
    el('[data-publication]').hidden =
      !current || (!storeTicket && !removeTicket && !publishStatus.textContent)
    el('[data-manual-publish]').hidden = !current || !manuallyEdited
    pixelEditor?.render()
    ensureEditWidget()
    sync()
  }
  const restore = (state: SkinSnapshot | undefined) => {
    if (busy || !state) return
    current = state.pixels
    storeTicket = state.storeTicket
    manuallyEdited = !!state.manuallyEdited
    publishStatus.textContent = ''
    editStatus.textContent = ''
    render()
  }
  pixelEditor = initSkinEditor(root, locale, {
    skin: () => (current ? { pixels: current, model: skinModel } : undefined),
    change: (pixels) => {
      if (busy || !current || equalPixels(current, pixels)) return
      validateSkin(pixels, skinModel)
      current = pixels
      storeTicket = undefined
      manuallyEdited = true
      history.push({ pixels, manuallyEdited })
      publishStatus.textContent = ''
      editStatus.textContent = ''
      render()
    },
    undo: () => {
      if (!busy) restore(history.move(-1))
    },
    redo: () => {
      if (!busy) restore(history.move(1))
    },
  })
  function ensureEditWidget() {
    if (!enabled || !current || editWidget || !window.turnstile || disposed)
      return
    editWidget = window.turnstile.render(el('[data-edit-turnstile]'), {
      sitekey: siteKey,
      action: 'skin-maker',
      callback: (value) => {
        editToken = value
        sync()
      },
      'expired-callback': () => {
        editToken = ''
        sync()
      },
      'error-callback': () => {
        editToken = ''
        editStatus.textContent = c.verify
        sync()
      },
    })
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
    if (busy) return
    current = undefined
    storeTicket = undefined
    removeTicket = undefined
    publishedTicket = undefined
    manuallyEdited = false
    history.reset()
    pixelEditor?.reset()
    editForm.reset()
    editStatus.textContent = ''
    if (editWidget) window.turnstile?.remove(editWidget)
    editWidget = undefined
    editToken = ''
    publishForm.hidden = true
    publishForm.reset()
    publishStatus.textContent = ''
    unpublish.hidden = true
    el('[data-published-link]').hidden = true
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
  const requestSkin = async (input: SkinRequest) => {
    activeMode = input.mode
    const message = activeStatus()
    busy = true
    sync()
    message.textContent = activeMode === 'edit' ? editCopy.busy : c.busy
    generationStarted = performance.now()
    loading.hidden = false
    el('[data-empty]').hidden = true
    el('[data-elapsed-row]').hidden = false
    el('[data-button-spinner]').hidden = activeMode === 'edit'
    el('[data-edit-spinner]').hidden = activeMode === 'create'
    el('[data-edit-elapsed-row]').hidden = activeMode === 'create'
    el(
      activeMode === 'edit' ? '[data-edit-label]' : '[data-generate-label]',
    ).textContent = activeMode === 'edit' ? editCopy.editing : c.generating
    el('[data-loading-title]').textContent =
      activeMode === 'edit' ? editCopy.editing : c.generating
    el('[data-loading-message]').textContent = message.textContent
    if (activeMode === 'create') generate.setAttribute('data-loading', '')
    el('[data-stage]').setAttribute('aria-busy', 'true')
    updateLoadingTime()
    loadingTimer = setInterval(updateLoadingTime, 1000)
    let requestId: string | null = null
    try {
      const response = await fetch('/api/skin-maker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(270_000),
      })
      const result = await response.json().catch(() => null)
      requestId =
        typeof result?.requestId === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
          result.requestId,
        )
          ? result.requestId
          : null
      if (!response.ok) {
        message.textContent =
          response.status === 429
            ? c.limit
            : response.status === 403
              ? c.verify
              : response.status === 503
                ? c.disabled
                : c.error
        if (requestId) message.textContent += ` (${c.requestId}: ${requestId})`
        return
      }
      const pixels = decodePixels(result.pixels, 64, 64)
      if (result.model !== input.model) throw new Error('model')
      validateSkin(pixels, input.model)
      current = pixels
      skinModel = input.model
      storeTicket =
        typeof result.storeTicket === 'string' ? result.storeTicket : undefined
      if (input.mode === 'create') {
        removeTicket = undefined
        publishedTicket = undefined
        manuallyEdited = false
        history.reset({ pixels, storeTicket })
        pixelEditor?.reset()
        editStatus.textContent = ''
        publishForm.reset()
        unpublish.hidden = true
        el('[data-published-link]').hidden = true
      } else history.push({ pixels, storeTicket, manuallyEdited })
      publishStatus.textContent = ''
      render()
      message.textContent =
        input.mode === 'create'
          ? c.ready
          : result.changed === 0
            ? editCopy.noChanges
            : `${editCopy.edited}: ${result.changed}`
    } catch {
      message.textContent = c.error
      if (requestId) message.textContent += ` (${c.requestId}: ${requestId})`
    } finally {
      busy = false
      stopLoading()
      if (input.mode === 'edit') {
        editToken = ''
        if (editWidget) window.turnstile?.reset(editWidget)
      } else {
        token = ''
        if (widget) window.turnstile?.reset(widget)
      }
      sync()
    }
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (busy || !enabled || !token || !form.reportValidity()) return
    const data = new FormData(form)
    if (data.get('consent') !== 'on') return
    await requestSkin({
      mode: 'create',
      model: model(),
      prompt: String(data.get('prompt')),
      token,
      consent: true,
      reference,
    })
  })
  editForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (
      busy ||
      !enabled ||
      !editToken ||
      !current ||
      !pixelEditor ||
      !editForm.reportValidity()
    )
      return
    const data = new FormData(editForm)
    if (data.get('edit-consent') !== 'on') return
    await requestSkin({
      mode: 'edit',
      model: skinModel,
      prompt: String(data.get('edit-prompt')),
      token: editToken,
      consent: true,
      current: encodePixels(current),
      selection: pixelEditor.selection(),
      ...(storeTicket ? { storeTicket } : {}),
    })
  })
  publishForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (busy || !current || !storeTicket || !publishForm.reportValidity())
      return
    const data = new FormData(publishForm)
    busy = true
    sync()
    publishStatus.textContent = store.publishing
    try {
      const response = await fetch('/api/skin-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('skin-name')),
          model: skinModel,
          pixels: encodePixels(current),
          ticket: storeTicket,
          consent: data.get('public-consent') === 'on',
        }),
        signal: AbortSignal.timeout(20000),
      })
      const result = await response.json()
      if (!response.ok || typeof result.removeTicket !== 'string')
        throw new Error('publish')
      removeTicket = result.removeTicket
      publishedTicket = storeTicket
      publishForm.hidden = true
      unpublish.hidden = false
      el('[data-published-link]').hidden = false
      publishStatus.textContent = store.published
    } catch {
      publishStatus.textContent = store.publishError
    } finally {
      busy = false
      sync()
    }
  })
  unpublish.addEventListener('click', async () => {
    if (busy || !removeTicket) return
    busy = true
    sync()
    try {
      const response = await fetch('/api/skin-store', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket: removeTicket }),
        signal: AbortSignal.timeout(20000),
      })
      if (!response.ok) throw new Error('remove')
      if (publishedTicket) {
        history.invalidateTicket(publishedTicket)
        if (storeTicket === publishedTicket) storeTicket = undefined
      }
      publishedTicket = undefined
      removeTicket = undefined
      unpublish.hidden = true
      el('[data-published-link]').hidden = true
      publishStatus.textContent = store.removed
      render()
    } catch {
      publishStatus.textContent = store.publishError
    } finally {
      busy = false
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
      siteKey = config.siteKey
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
      ensureEditWidget()
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
      pixelEditor?.dispose()
      if (widget) window.turnstile?.remove(widget)
      if (editWidget) window.turnstile?.remove(editWidget)
      current = undefined
      reference = undefined
      history.reset()
    },
    { once: true },
  )
}
