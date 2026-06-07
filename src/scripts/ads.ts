import { ADSENSE } from '../data/ads'

declare global {
  interface Window {
    __asvAdsRuntimeInitialized?: boolean
    __asvAdsScriptPromise?: Promise<void> | null
    __asvAdsScriptLoaded?: boolean
    adsbygoogle?: unknown[]
  }
}

const ADS_SCRIPT_ID = 'asv-adsense-script'
const MIN_SLOT_WIDTH = 160
const RETRYABLE_AD_ERROR_PATTERN =
  /availableWidth=0|No slot size|already have ads in them/i

type AdSlotState = 'pending' | 'requested' | 'empty' | 'error'

function getAdContainer(slot: HTMLElement) {
  return slot.closest<HTMLElement>('[data-asv-ad-container]') ?? slot
}

function setAdState(slot: HTMLElement, state: AdSlotState) {
  const container = getAdContainer(slot)
  slot.dataset.asvAdState = state
  container.dataset.asvAdState = state
}

function hideAd(
  slot: HTMLElement,
  state: Extract<AdSlotState, 'empty' | 'error'>,
) {
  const container = getAdContainer(slot)
  setAdState(slot, state)
  container.hidden = true
}

function ensureAdsScript() {
  if (window.__asvAdsScriptPromise) return window.__asvAdsScriptPromise

  window.__asvAdsScriptPromise = new Promise<void>((resolve, reject) => {
    if (window.__asvAdsScriptLoaded) {
      resolve()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `#${ADS_SCRIPT_ID}`,
    )
    const script = existingScript ?? document.createElement('script')

    function cleanup() {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }

    function handleLoad() {
      window.__asvAdsScriptLoaded = true
      cleanup()
      resolve()
    }

    function handleError() {
      cleanup()
      window.__asvAdsScriptPromise = null
      script.remove()
      reject(new Error('AdSense script failed to load'))
    }

    script.id = ADS_SCRIPT_ID
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE.clientId}`
    script.crossOrigin = 'anonymous'
    script.async = true
    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) document.head.appendChild(script)
  })

  return window.__asvAdsScriptPromise
}

function canRequestAd(slot: HTMLElement) {
  if (slot.dataset.asvAdPushed === '1') return false
  if (slot.getAttribute('data-adsbygoogle-status')) return false

  const container = getAdContainer(slot)
  const rect = container.getBoundingClientRect()
  const style = window.getComputedStyle(container)

  if (container.hidden) return false
  if (rect.width < MIN_SLOT_WIDTH) return false
  if (style.display === 'none' || style.visibility === 'hidden') return false

  return true
}

async function requestAd(slot: HTMLElement) {
  if (!canRequestAd(slot)) return false

  setAdState(slot, 'requested')

  try {
    await ensureAdsScript()
  } catch {
    hideAd(slot, 'error')
    return false
  }

  if (!canRequestAd(slot)) return false

  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    slot.dataset.asvAdPushed = '1'
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (RETRYABLE_AD_ERROR_PATTERN.test(message)) {
      setAdState(slot, 'pending')
      return false
    }

    console.warn('AdSense load failed:', error)
    hideAd(slot, 'error')
    return false
  }
}

function observeAdSlot(slot: HTMLElement) {
  if (slot.dataset.asvAdObserved === '1') return
  slot.dataset.asvAdObserved = '1'

  const container = getAdContainer(slot)
  let intersectionObserver: IntersectionObserver | null = null
  let resizeObserver: ResizeObserver | null = null
  let isNearViewport = !('IntersectionObserver' in window)

  const cleanup = () => {
    intersectionObserver?.disconnect()
    resizeObserver?.disconnect()
  }

  const attemptRequest = async () => {
    if (!isNearViewport) return

    const requested = await requestAd(slot)
    if (requested) cleanup()
  }

  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          isNearViewport = true
          void attemptRequest()
        }
      },
      { rootMargin: '220px' },
    )
    intersectionObserver.observe(container)
  }

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      void attemptRequest()
    })
    resizeObserver.observe(container)
  }

  if (isNearViewport) {
    void attemptRequest()
  }
}

function initAdSlots(root: ParentNode = document) {
  root
    .querySelectorAll<HTMLElement>('[data-asv-ad-slot].adsbygoogle')
    .forEach((slot) => observeAdSlot(slot))
}

export function initAdsRuntime() {
  if (!ADSENSE.enabled) return

  if (window.__asvAdsRuntimeInitialized) {
    initAdSlots()
    return
  }

  window.__asvAdsRuntimeInitialized = true
  initAdSlots()
  document.addEventListener('astro:page-load', () => initAdSlots())
}
