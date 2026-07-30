type YoutubeVideo = {
  id: string
  title: string
  href?: string
  thumbnail?: string
  publishedAt?: string
}

type YoutubeVideosResponse = {
  videos?: YoutubeVideo[]
}

type YoutubeUi = {
  thumbnailAlt: string
  errorLabel: string
  dateLocale: string
}

export function initYoutubeVideosRuntime() {
  document
    .querySelectorAll<HTMLElement>('[data-youtube-feed]')
    .forEach((container) => {
      if (container.dataset.youtubeFeedReady === 'true') {
        return
      }

      container.dataset.youtubeFeedReady = 'true'
      void hydrateYoutubeVideos(container)
    })
}

async function hydrateYoutubeVideos(container: HTMLElement) {
  const list = container.querySelector<HTMLElement>('[data-youtube-video-list]')
  const status = container.querySelector<HTMLElement>(
    '[data-youtube-video-status]',
  )
  const apiPath = container.dataset.apiPath ?? '/api/youtube-videos'
  const ui: YoutubeUi = {
    thumbnailAlt: container.dataset.thumbnailAlt ?? '{title}のサムネイル',
    errorLabel:
      container.dataset.errorLabel ?? '最新動画を取得できませんでした',
    dateLocale: container.dataset.dateLocale ?? 'ja-JP',
  }

  if (!list) {
    return
  }

  try {
    const response = await fetch(apiPath, {
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`YouTube feed returned ${response.status}`)
    }

    const data = (await response.json()) as YoutubeVideosResponse
    const videos = data.videos?.filter(isValidVideo).slice(0, 12) ?? []

    if (videos.length === 0) {
      throw new Error('YouTube feed did not include videos')
    }

    list.replaceChildren(...videos.map((video) => createVideoCard(video, ui)))

    if (status) {
      status.hidden = true
      status.textContent = ''
    }
  } catch {
    if (status) {
      const hasFallbackVideos = list.querySelector('.video-card') !== null

      status.textContent = hasFallbackVideos ? '' : ui.errorLabel
      status.hidden = hasFallbackVideos
    }
  }
}

function createVideoCard(video: YoutubeVideo, ui: YoutubeUi) {
  const link = document.createElement('a')
  link.className = 'video-card'
  link.href = video.href || `https://www.youtube.com/watch?v=${video.id}`
  link.target = '_blank'
  link.rel = 'noopener noreferrer'

  const thumbnail = document.createElement('span')
  thumbnail.className = 'video-card__thumbnail'

  const image = document.createElement('img')
  image.src =
    video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
  image.alt = ui.thumbnailAlt.replace('{title}', video.title)
  image.loading = 'lazy'
  image.decoding = 'async'
  thumbnail.append(image)

  const play = document.createElement('span')
  play.className = 'video-card__play'
  play.textContent = '▶'
  thumbnail.append(play)

  const body = document.createElement('span')
  body.className = 'video-card__body'

  const title = document.createElement('span')
  title.className = 'video-card__title'
  title.textContent = video.title
  body.append(title)

  const publishedAt = formatDate(video.publishedAt, ui.dateLocale)

  if (publishedAt) {
    const meta = document.createElement('span')
    meta.className = 'video-card__meta'
    meta.textContent = publishedAt
    body.append(meta)
  }

  link.append(thumbnail, body)
  return link
}

function isValidVideo(video: YoutubeVideo) {
  return Boolean(video.id && video.title)
}

function formatDate(value: string | undefined, locale: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
