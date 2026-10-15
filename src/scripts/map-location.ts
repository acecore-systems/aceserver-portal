import { mapEmbedUrl, mapLocationLink } from '../lib/map-location'

document
  .querySelectorAll<HTMLIFrameElement>('[data-map-embed-source]')
  .forEach((frame) => {
    const url = mapEmbedUrl(
      frame.dataset.mapEmbedSource ?? '',
      window.location.search,
    )
    if (url) frame.src = url
  })

document
  .querySelectorAll<HTMLAnchorElement>('[data-map-external-source]')
  .forEach((link) => {
    const url = mapEmbedUrl(
      link.dataset.mapExternalSource ?? '',
      window.location.search,
    )
    if (url) link.href = url
  })

if (document.querySelector('[data-map-embed-source]')) {
  document
    .querySelectorAll<HTMLOptionElement>('[data-locale-select] option')
    .forEach((option) => {
      option.value = mapLocationLink(option.value, window.location.search)
    })
}
