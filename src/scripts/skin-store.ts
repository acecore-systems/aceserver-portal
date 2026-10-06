import { getSkinStoreUi } from '../data/skin-store-ui'
import { isLocale } from '../i18n/config'
import { readSkinPng } from '../lib/skin-png'
import { STORE_ID, type StoreSkin } from '../lib/skin-store'
import type { SkinViewer } from 'skinview3d'

export function initSkinStore(root: HTMLElement) {
  if (!isLocale(root.dataset.locale)) return
  const c = getSkinStoreUi(root.dataset.locale)
  const el = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!
  const grid = el('[data-store-grid]')
  const status = el('[data-store-status]')
  const more = el<HTMLButtonElement>('[data-store-more]')
  const retry = el<HTMLButtonElement>('[data-store-retry]')
  const search = el<HTMLInputElement>('[data-search]')
  const dialog = el<HTMLDialogElement>('[data-skin-dialog]')
  let model = 'all',
    cursor: string | null = null,
    disposed = false
  let listing: AbortController | undefined, detail: AbortController | undefined
  let debounce: ReturnType<typeof setTimeout> | undefined
  let selected: StoreSkin | undefined, viewer: SkinViewer | undefined
  let resize: ResizeObserver | undefined

  const downloadUrl = (id: string) =>
    `/api/skin-store?id=${encodeURIComponent(id)}&download=1`
  const closeDetail = () => {
    detail?.abort()
    resize?.disconnect()
    viewer?.dispose()
    viewer = undefined
    selected = undefined
  }
  dialog.addEventListener('close', closeDetail)
  el('[data-detail-close]').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return
    const bounds = dialog.getBoundingClientRect()
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close()
  })
  const openDetail = async (item: StoreSkin) => {
    closeDetail()
    selected = item
    const controller = new AbortController()
    detail = controller
    const active = () =>
      !disposed && !controller.signal.aborted && selected?.id === item.id
    el('[data-detail-name]').textContent = item.name
    el('[data-detail-status]').textContent = c.loading
    el('[data-report-status]').textContent = ''
    el<HTMLFormElement>('[data-report-form]').reset()
    el<HTMLButtonElement>('[data-report-form] button').disabled = false
    el<HTMLDetailsElement>('.report').open = false
    const download = el<HTMLAnchorElement>('[data-detail-download]')
    download.removeAttribute('href')
    download.setAttribute('aria-disabled', 'true')
    const portrait = el<HTMLImageElement>('[data-detail-portrait]')
    portrait.src = item.preview
    portrait.hidden = false
    dialog.showModal()
    try {
      const response = await fetch(`/api/skin-store?id=${item.id}`, {
        cache: 'no-store',
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(15000),
        ]),
      })
      if (!response.ok) throw new Error('detail')
      const data = await response.json()
      if (!active()) return
      if (
        data.model !== item.model ||
        typeof data.png !== 'string' ||
        !/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(data.png)
      )
        throw new Error('detail')
      readSkinPng(
        Uint8Array.from(atob(data.png.split(',')[1]), (v) => v.charCodeAt(0)),
        item.model,
      )
      download.href = downloadUrl(item.id)
      download.setAttribute('aria-disabled', 'false')
      el('[data-detail-status]').textContent =
        `${item.model === 'slim' ? 'Slim · 3px' : 'Classic · 4px'} · 64 × 64 PNG`
      // A portrait and download remain available if WebGL is unavailable.
      try {
        const { SkinViewer } = await import('skinview3d')
        if (!active()) return
        const stage = el('[data-detail-stage]')
        viewer = new SkinViewer({
          canvas: el<HTMLCanvasElement>('[data-detail-viewer]'),
          width: stage.clientWidth,
          height: stage.clientHeight,
          pixelRatio: Math.min(devicePixelRatio, 2),
        })
        viewer.controls.enablePan = false
        viewer.zoom = 0.85
        viewer.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)')
          .matches
        await viewer.loadSkin(data.png, {
          model: item.model === 'slim' ? 'slim' : 'default',
        })
        if (!active()) return
        portrait.hidden = true
        resize = new ResizeObserver(() => {
          if (viewer) {
            viewer.width = stage.clientWidth
            viewer.height = stage.clientHeight
          }
        })
        resize.observe(stage)
      } catch {
        if (active()) {
          viewer?.dispose()
          viewer = undefined
          portrait.hidden = false
        }
      }
    } catch {
      if (active()) el('[data-detail-status]').textContent = c.unavailable
    }
  }
  el<HTMLFormElement>('[data-report-form]').addEventListener(
    'submit',
    async (event) => {
      event.preventDefault()
      const item = selected
      if (!item) return
      const button = el<HTMLButtonElement>('[data-report-form] button')
      if (button.disabled) return
      button.disabled = true
      try {
        const response = await fetch('/api/skin-store?action=report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.id,
            reason: el<HTMLSelectElement>('[name=reason]').value,
          }),
          signal: AbortSignal.timeout(15000),
        })
        if (!response.ok) throw new Error('report')
        if (selected?.id === item.id)
          el('[data-report-status]').textContent = c.reported
      } catch {
        if (selected?.id === item.id) {
          el('[data-report-status]').textContent = c.reportError
          button.disabled = false
        }
      }
    },
  )

  const card = (item: StoreSkin) => {
    const fragment = el<HTMLTemplateElement>(
      '[data-skin-card]',
    ).content.cloneNode(true) as DocumentFragment
    fragment.querySelector<HTMLElement>('[data-card-name]')!.textContent =
      item.name
    fragment.querySelector<HTMLElement>('[data-card-model]')!.textContent =
      item.model === 'slim' ? 'Slim · 3px' : 'Classic · 4px'
    const img = fragment.querySelector<HTMLImageElement>('[data-portrait]')!
    img.src = item.preview
    img.alt = item.name
    const button = fragment.querySelector<HTMLButtonElement>('[data-open]')!
    button.setAttribute('aria-label', `${c.preview}: ${item.name}`)
    button.addEventListener('click', () => {
      void openDetail(item)
    })
    fragment.querySelector<HTMLAnchorElement>('[data-card-download]')!.href =
      downloadUrl(item.id)
    return fragment
  }
  const load = async (append = false) => {
    listing?.abort()
    const controller = new AbortController()
    listing = controller
    grid.setAttribute('aria-busy', 'true')
    status.textContent = c.loading
    retry.hidden = true
    more.disabled = true
    if (!append) {
      grid.replaceChildren()
      cursor = null
      more.hidden = true
      el('[data-store-empty]').hidden = true
    }
    const query = search.value.trim()
    const params = new URLSearchParams({ model, q: query })
    if (append && cursor) params.set('cursor', cursor)
    try {
      const response = await fetch(`/api/skin-store?${params}`, {
        cache: 'no-store',
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(15000),
        ]),
      })
      if (!response.ok) throw new Error('store')
      const data = await response.json()
      if (
        !Array.isArray(data.items) ||
        data.items.length > 24 ||
        (data.cursor !== null && typeof data.cursor !== 'string')
      )
        throw new Error('store')
      for (const item of data.items) {
        if (
          !STORE_ID.test(item.id) ||
          !['classic', 'slim'].includes(item.model) ||
          typeof item.name !== 'string' ||
          typeof item.preview !== 'string' ||
          !/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(item.preview)
        )
          throw new Error('store')
      }
      if (controller.signal.aborted || disposed) return
      for (const item of data.items) grid.append(card(item))
      cursor = data.cursor
      more.hidden = !cursor
      const filtered = model !== 'all' || !!query
      el('[data-store-empty]').hidden = grid.childElementCount > 0
      el('[data-empty-message]').textContent = filtered ? c.noMatches : c.empty
      el('[data-empty-create]').hidden = filtered
      status.textContent = ''
    } catch {
      if (!controller.signal.aborted && !disposed) {
        status.textContent = c.unavailable
        retry.hidden = false
      }
    } finally {
      if (listing === controller && !disposed) {
        grid.setAttribute('aria-busy', 'false')
        more.disabled = false
      }
    }
  }
  root.querySelectorAll<HTMLButtonElement>('[data-model]').forEach((button) => {
    button.addEventListener('click', () => {
      clearTimeout(debounce)
      model = button.dataset.model!
      root
        .querySelectorAll<HTMLButtonElement>('[data-model]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === button)))
      void load()
    })
  })
  search.addEventListener('input', () => {
    clearTimeout(debounce)
    listing?.abort()
    debounce = setTimeout(() => {
      void load()
    }, 300)
  })
  more.addEventListener('click', () => {
    if (cursor && !more.disabled) void load(true)
  })
  retry.addEventListener('click', () => {
    void load()
  })
  window.addEventListener(
    'pagehide',
    () => {
      disposed = true
      listing?.abort()
      clearTimeout(debounce)
      closeDetail()
    },
    { once: true },
  )
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload()
  })
  void load()
}
