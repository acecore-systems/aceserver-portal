// Runs on the map origin, so only already-visible, same-origin tiles are sampled.
// Keep the client self-contained: it is served by the Worker without a build step.
export const INITIAL_VIEW_PATH = '/acecore-initial-view-v1.js'
export const INITIAL_VIEW_SCRIPT = String.raw`(() => {
  const query = new URLSearchParams(location.search)
  if (location.hash || ['zoom', 'x', 'y', 'z', 'playername'].some(key => query.has(key))) return
  const deadline = Date.now() + 12000
  const events = ['pointerdown', 'wheel', 'touchstart', 'keydown']
  let stopped = false
  let timer
  let initialZoom
  let initialLayer
  let initialCenter
  let expectedZoom
  let previousSignature = ''
  let stable = 0
  const stop = () => {
    stopped = true
    clearTimeout(timer)
    events.forEach(type => document.removeEventListener(type, stop, true))
  }
  events.forEach(type => document.addEventListener(type, stop, { capture: true, passive: true }))
  function inspect() {
    if (stopped) return
    if (Date.now() >= deadline) return stop()
    timer = setTimeout(inspect, 200)
    const dynmap = window.dynmap
    const map = dynmap && dynmap.map
    const layer = dynmap && dynmap.maptype
    if (!map || !layer || map._animatingZoom) return
    const zoom = map.getZoom()
    if (initialZoom === undefined) {
      initialZoom = expectedZoom = zoom
      initialLayer = layer
      const center = map.getCenter()
      initialCenter = [center.lat, center.lng]
    }
    // Never continue after an external pan, zoom, map switch or follow operation.
    const center = map.getCenter()
    if (layer !== initialLayer || zoom !== expectedZoom || center.lat !== initialCenter[0] || center.lng !== initialCenter[1] || dynmap.followingPlayer) return stop()
    if (zoom >= initialZoom + 4 || zoom >= map.getMaxZoom()) return stop()
    const container = map.getContainer()
    const rect = container.getBoundingClientRect()
    if (rect.width < 100 || rect.height < 100) return
    const width = Math.min(640, rect.width * 0.65)
    const height = Math.min(480, rect.height * 0.75)
    const left = rect.left + (rect.width - width) / 2
    const top = rect.top + (rect.height - height) / 2
    const canvas = document.createElement('canvas')
    canvas.width = 96
    canvas.height = 72
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return stop()
    context.fillStyle = '#000'
    context.fillRect(0, 0, 96, 72)
    let covered = 0
    let centerCovered = false
    const signature = [zoom]
    for (const image of container.querySelectorAll('img.leaflet-tile')) {
      const tile = image.getBoundingClientRect()
      const overlapWidth = Math.min(left + width, tile.right) - Math.max(left, tile.left)
      const overlapHeight = Math.min(top + height, tile.bottom) - Math.max(top, tile.top)
      if (overlapWidth <= 0 || overlapHeight <= 0) continue
      const url = new URL(image.src, location.href)
      if (!image.complete) {
        previousSignature = ''
        stable = 0
        return
      }
      // Some sparse worlds have no rendered tile in a peripheral quadrant.
      // Its blank fallback is safe only with a healthy center and 70% coverage.
      if (!image.naturalWidth || url.origin !== location.origin || !url.pathname.startsWith('/tiles/')) continue
      covered += overlapWidth * overlapHeight
      if (tile.left <= rect.left + rect.width / 2 && tile.right > rect.left + rect.width / 2 && tile.top <= rect.top + rect.height / 2 && tile.bottom > rect.top + rect.height / 2) centerCovered = true
      signature.push(image.src, tile.left, tile.top)
      try {
        context.drawImage(image, (tile.left - left) * 96 / width, (tile.top - top) * 72 / height, tile.width * 96 / width, tile.height * 72 / height)
      } catch { return stop() }
    }
    if (!centerCovered || covered < width * height * 0.70) return
    const currentSignature = signature.join('|')
    stable = currentSignature === previousSignature ? stable + 1 : 0
    previousSignature = currentSignature
    if (stable < 2) return
    let data
    try { data = context.getImageData(0, 0, 96, 72).data } catch { return stop() }
    let terrain = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 32 && Math.max(data[i], data[i + 1], data[i + 2]) > 18) terrain++
    }
    const occupancy = terrain / (96 * 72)
    // Completely black/transparent samples may be an absent render. Leave them alone.
    if (occupancy === 0 || occupancy >= 0.24) return stop()
    expectedZoom = zoom + 1
    previousSignature = ''
    stable = 0
    map.setZoom(expectedZoom, { animate: false })
    const adjustedCenter = map.getCenter()
    initialCenter = [adjustedCenter.lat, adjustedCenter.lng]
  }
  inspect()
})();`
