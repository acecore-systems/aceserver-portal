import type { AlphaDiaryUi } from '../data/alpha-diary-ui'
import {
  DiaryRequestTimeoutError,
  DiaryWaitLifecycle,
  requestJsonWithDiaryTimeout,
} from './alpha-diary-wait'

type DiaryEntry = {
  date: string
  id: string
  image: { alt: string; assetId: string; height: number; width: number }
  kind: 'diary' | 'observation'
  questions: string[]
  text: string
  title: string
}

type DiaryFinale = {
  landscape: { alt: string; assetId: string; height: number; width: number }
  message: string
  portrait: { alt: string; assetId: string; height: number; width: number }
}

type DiaryPayload = Record<string, unknown> & {
  entry?: DiaryEntry
  errorCode?: string
  finaleChallengeAvailable?: boolean
  finale?: DiaryFinale
  retryAfter?: number
  serverToday?: string
  status?: string
}

type FinaleMode = 'horror' | 'reduced' | 'text'
type LoadingKind = 'current' | 'observation' | 'past'
type FinaleStage =
  | 'ordinary'
  | 'drift'
  | 'correction'
  | 'logs'
  | 'invasion'
  | 'reverse'
  | 'message'
  | 'hope'

const BIRTH_BOUNDARY = '2020-10-01'
const MINIMUM_DATE = '0001-01-01'
const CONSENT_VERSION = '1'
const CONSENT_STORAGE_KEY = 'alpha-diary.content-consent.v1'
const CLIENT_ID_STORAGE_KEY = 'alpha-diary.client.v1'
const DIARY_REQUEST_TIMEOUT_MS = 20_000

let diaryController: AbortController | null = null

export function initAlphaDiary() {
  const root = document.querySelector<HTMLElement>('[data-alpha-diary]')
  if (!root || root.dataset.alphaDiaryBound === 'true') return

  diaryController?.abort()
  diaryController = new AbortController()
  root.dataset.alphaDiaryBound = 'true'
  const signal = diaryController.signal
  const copy = readCopy(root)
  if (!copy) return

  const locale = root.dataset.locale || 'ja'
  const endpoint = root.dataset.endpoint || '/api/alpha-diary'
  const dateInput = requiredElement<HTMLInputElement>(root, '[data-diary-date]')
  const paper = requiredElement<HTMLElement>(root, '[data-diary-paper]')
  const statePanel = requiredElement<HTMLElement>(root, '[data-diary-state]')
  const entryPanel = requiredElement<HTMLElement>(root, '[data-diary-entry]')
  const finaleKeywordInput = requiredElement<HTMLInputElement>(
    root,
    '[data-diary-finale-keyword]',
  )
  const finaleKeywordError = requiredElement<HTMLElement>(
    root,
    '[data-diary-finale-error]',
  )
  const statusRegion = requiredElement<HTMLElement>(root, '[data-diary-live]')
  const gateDialog = requiredElement<HTMLDialogElement>(
    root,
    '[data-diary-gate]',
  )
  const finaleDialog = requiredElement<HTMLDialogElement>(
    root,
    '[data-diary-finale-dialog]',
  )
  const finaleOverlay = requiredElement<HTMLElement>(
    root,
    '[data-diary-finale-overlay]',
  )

  let serverToday = getJstToday()
  let currentDate = ''
  let currentEntry: DiaryEntry | null = null
  let currentFinale: DiaryFinale | null = null
  let requestController: AbortController | null = null
  let pendingTimer = 0
  let waitingWasLong = false
  let finaleTimers: number[] = []
  let finaleAnimationFrame = 0
  let finaleActive = false
  let finaleMotionEnabled = false
  let fullscreenEntered = false
  let focusBeforeFinale: HTMLElement | null = null

  const waitLifecycle = new DiaryWaitLifecycle({
    onChange: renderWaitingState,
    onPoll: () => resumePendingEntry(),
    scheduler: {
      clearInterval: (timer) => window.clearInterval(timer),
      clearTimeout: (timer) => window.clearTimeout(timer),
      now: () => Date.now(),
      setInterval: (callback, delay) => window.setInterval(callback, delay),
      setTimeout: (callback, delay) => window.setTimeout(callback, delay),
    },
  })

  signal.addEventListener(
    'abort',
    () => {
      requestController?.abort()
      clearPending()
    },
    { once: true },
  )

  dateInput.max = serverToday

  function setStatus(message: string) {
    statusRegion.textContent = message
  }

  function setRecordKind(
    surfaceKind: 'diary' | 'observation' | 'loading' | 'future' | 'failed',
    paperKind = surfaceKind,
  ) {
    root.dataset.recordKind = surfaceKind
    paper.dataset.recordKind = paperKind
    paper.classList.toggle('is-old-record', surfaceKind === 'observation')
  }

  function getLoadingKind(date: string): LoadingKind {
    if (date && date < BIRTH_BOUNDARY) return 'observation'
    return date && date < serverToday ? 'past' : 'current'
  }

  function setLoading(loadingKind: LoadingKind = 'current') {
    waitingWasLong = false
    setFinaleChallengeAvailable(false)
    setRecordKind(
      loadingKind === 'observation' ? 'observation' : 'loading',
      'loading',
    )
    statePanel.hidden = false
    entryPanel.hidden = true
    const loadingTitle =
      loadingKind === 'observation'
        ? copy.observationLoadingTitle
        : loadingKind === 'past'
          ? copy.pastLoadingTitle
          : copy.loadingTitle
    const loadingBody =
      loadingKind === 'observation'
        ? copy.observationLoadingBody
        : loadingKind === 'past'
          ? copy.pastLoadingBody
          : copy.loadingBody
    setStateContent(loadingTitle, loadingBody, true)
    setStatus(loadingTitle)
  }

  function renderWaitingState({
    elapsedSeconds,
    isLongWait,
    isRequestActive,
    isWaiting,
  }: {
    elapsedSeconds: number
    isLongWait: boolean
    isRequestActive: boolean
    isWaiting: boolean
  }) {
    const elapsed = requiredElement<HTMLElement>(
      statePanel,
      '[data-diary-wait-elapsed]',
    )
    elapsed.hidden = !isWaiting
    if (!isWaiting) {
      elapsed.textContent = ''
      requiredElement<HTMLButtonElement>(
        statePanel,
        '[data-diary-retry]',
      ).disabled = false
      waitingWasLong = false
      return
    }
    elapsed.textContent = copy.waitingElapsed.replace(
      '{seconds}',
      String(elapsedSeconds),
    )
    requiredElement<HTMLButtonElement>(
      statePanel,
      '[data-diary-retry]',
    ).disabled = isRequestActive
    if (waitingWasLong === isLongWait) return
    waitingWasLong = isLongWait
    if (!isLongWait) return
    setStateContent(copy.longWaitTitle, copy.longWaitBody, true, true)
    setStatus(`${copy.longWaitTitle}. ${copy.longWaitBody}`)
  }

  function setStateContent(
    title: string,
    body: string,
    loading = false,
    showManualCheck = false,
  ) {
    const titleElement = requiredElement<HTMLElement>(
      statePanel,
      '[data-diary-state-title]',
    )
    const bodyElement = requiredElement<HTMLElement>(
      statePanel,
      '[data-diary-state-body]',
    )
    titleElement.textContent = title
    bodyElement.textContent = body
    statePanel.classList.toggle('is-loading', loading)
    requiredElement<HTMLElement>(statePanel, '[data-diary-retry]').hidden =
      loading && !showManualCheck
    requiredElement<HTMLElement>(
      statePanel,
      '[data-diary-retry-label]',
    ).textContent = showManualCheck ? copy.manualCheck : copy.retry
    if (!showManualCheck)
      requiredElement<HTMLButtonElement>(
        statePanel,
        '[data-diary-retry]',
      ).disabled = false
  }

  function renderFuture() {
    clearPending()
    setFinaleChallengeAvailable(false)
    setRecordKind('future')
    statePanel.hidden = false
    entryPanel.hidden = true
    setStateContent(copy.futureTitle, copy.futureBody)
    setStatus(copy.futureTitle)
  }

  function renderFailure() {
    clearPending()
    setFinaleChallengeAvailable(false)
    setRecordKind(
      currentDate < BIRTH_BOUNDARY ? 'observation' : 'failed',
      'failed',
    )
    statePanel.hidden = false
    entryPanel.hidden = true
    setStateContent(copy.failureTitle, copy.failureBody)
    setStatus(copy.failureTitle)
  }

  function renderTimeout() {
    clearPending()
    setFinaleChallengeAvailable(false)
    setRecordKind(
      currentDate < BIRTH_BOUNDARY ? 'observation' : 'failed',
      'failed',
    )
    statePanel.hidden = false
    entryPanel.hidden = true
    setStateContent(copy.timeoutTitle, copy.timeoutBody)
    setStatus(copy.timeoutTitle)
  }

  function renderEntry(entry: DiaryEntry, finaleChallengeAvailable: boolean) {
    currentEntry = entry
    currentDate = entry.date
    dateInput.value = entry.date

    setRecordKind(entry.kind)
    statePanel.hidden = true
    entryPanel.hidden = false
    entryPanel.dataset.alphaDiaryEntryId = entry.id
    requiredElement<HTMLElement>(entryPanel, '[data-diary-kind]').textContent =
      entry.kind === 'observation' ? copy.observationKind : copy.diaryKind
    requiredElement<HTMLElement>(
      entryPanel,
      '[data-diary-record-date]',
    ).textContent = formatRecordDate(entry.date, locale)
    requiredElement<HTMLElement>(
      entryPanel,
      '[data-diary-record-id]',
    ).textContent =
      entry.kind === 'observation'
        ? `OBS-${entry.id.slice(-8).toUpperCase()}`
        : entry.date.replaceAll('-', '.')
    requiredElement<HTMLElement>(entryPanel, '[data-diary-title]').textContent =
      entry.title

    const image = requiredElement<HTMLImageElement>(
      entryPanel,
      '[data-diary-image]',
    )
    image.src =
      entry.image.assetId === 'fixture'
        ? '/uploads/alpha-kun.png'
        : `/api/alpha-diary-image/${encodeURIComponent(entry.image.assetId)}`
    image.alt = entry.image.alt
    image.width = entry.image.width
    image.height = entry.image.height

    const body = requiredElement<HTMLElement>(entryPanel, '[data-diary-body]')
    body.replaceChildren()
    const paragraphs = entry.text
      .split(/\n{2,}/u)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
    for (const paragraphText of paragraphs.length ? paragraphs : [entry.text]) {
      const paragraph = document.createElement('p')
      paragraph.textContent = paragraphText
      body.append(paragraph)
    }

    const questions = requiredElement<HTMLElement>(
      entryPanel,
      '[data-diary-questions]',
    )
    questions.replaceChildren()
    for (const question of entry.questions.slice(0, 3)) {
      if (!question || question.length > 300) continue
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'diary-question'
      button.dataset.alphaOpen = ''
      button.dataset.alphaQuestion = question
      button.dataset.alphaDiaryEntryId = entry.id
      const label = document.createElement('span')
      label.textContent = question
      const action = document.createElement('strong')
      action.textContent = copy.askButton
      button.append(label, action)
      questions.append(button)
    }

    finaleKeywordInput.value = ''
    finaleKeywordError.hidden = true
    setFinaleChallengeAvailable(finaleChallengeAvailable)
    setStatus(`${formatRecordDate(entry.date, locale)} — ${entry.title}`)
  }

  function setFinaleChallengeAvailable(available: boolean) {
    const unlockedPanel = requiredElement<HTMLElement>(
      root,
      '[data-diary-unlocked]',
    )
    unlockedPanel.hidden = !available
  }

  function showFinaleKeywordError() {
    finaleKeywordError.hidden = false
    setStatus(copy.finaleKeywordIncorrect)
    finaleKeywordInput.focus()
    finaleKeywordInput.select()
  }

  async function loadEntry(
    requestedDate: string | undefined,
    options: {
      history?: 'push' | 'replace' | 'none'
      resumeWaiting?: boolean
    } = {},
  ): Promise<boolean> {
    const date =
      requestedDate && isValidDate(requestedDate) ? requestedDate : ''
    if (date && date < BIRTH_BOUNDARY && !hasAdultConsent()) {
      const accepted = await requestAdultConsent()
      if (!accepted) return false
    }
    if (date && date > serverToday) {
      currentDate = date
      dateInput.value = date
      updateDateHistory(date, options.history || 'push')
      renderFuture()
      return false
    }

    updateDateHistory(date, options.history || 'none')
    currentDate = date
    dateInput.value = date || serverToday
    if (!options.resumeWaiting) clearPending()
    requestController?.abort()
    const controller = new AbortController()
    requestController = controller
    if (!options.resumeWaiting) setLoading(getLoadingKind(date))
    const requestId = waitLifecycle.startRequest()

    try {
      const fixture = getFixturePayload(root, copy, date || serverToday)
      const payload =
        fixture ||
        (await requestDiary(
          endpoint,
          {
            action: 'entry',
            entryDate: date || undefined,
            locale,
            version: 2,
            ...(date && date < BIRTH_BOUNDARY
              ? { adultConsentVersion: 1 }
              : {}),
          },
          controller.signal,
        ))
      if (!isCurrentEntryRequest(requestId, controller)) return false
      if (
        typeof payload.serverToday === 'string' &&
        isValidDate(payload.serverToday)
      ) {
        serverToday = payload.serverToday
        dateInput.max = serverToday
      }
      if (
        payload.status === 'ready' &&
        isDiaryEntry(payload.entry) &&
        typeof payload.finaleChallengeAvailable === 'boolean'
      ) {
        waitLifecycle.complete(requestId)
        renderEntry(payload.entry, payload.finaleChallengeAvailable)
        return true
      }
      if (payload.status === 'pending') {
        const retryAfter = readRetryAfter(payload.retryAfter)
        waitLifecycle.markPending(requestId, retryAfter * 1_000)
        return false
      }
      if (payload.status === 'future') {
        waitLifecycle.complete(requestId)
        renderFuture()
        return false
      }
      if (payload.status === 'consent_required') {
        waitLifecycle.complete(requestId)
        const accepted = await requestAdultConsent()
        if (accepted) return loadEntry(date, { history: 'none' })
        return false
      }
      waitLifecycle.complete(requestId)
      renderFailure()
      return false
    } catch (error) {
      if (!isCurrentEntryRequest(requestId, controller)) return false
      waitLifecycle.complete(requestId)
      if (error instanceof DiaryRequestTimeoutError) renderTimeout()
      else renderFailure()
      return false
    }
  }

  async function requestFinale(finaleKeyword: string) {
    if (!isValidDate(currentDate)) return
    const keyword = finaleKeyword.trim()
    if (!keyword || keyword.length > 80) {
      showFinaleKeywordError()
      return
    }
    if (!hasAdultConsent() && !(await requestAdultConsent())) return
    finaleKeywordError.hidden = true
    setStatus(copy.loadingTitle)
    try {
      const fixture = getFixtureFinale(root, copy, keyword)
      const payload =
        fixture ||
        (await requestDiary(
          endpoint,
          {
            action: 'finale',
            adultConsentVersion: 1,
            entryDate: currentDate,
            finaleKeyword: keyword,
            locale,
            version: 2,
          },
          signal,
        ))
      if (payload.status === 'ready' && isDiaryFinale(payload.finale)) {
        currentFinale = payload.finale
        openFinaleDialog()
        return
      }
      if (payload.status === 'pending') {
        pendingTimer = window.setTimeout(
          () => void requestFinale(keyword),
          readRetryAfter(payload.retryAfter) * 1000,
        )
        return
      }
      if (payload.errorCode === 'keyword_incorrect') {
        showFinaleKeywordError()
        return
      }
      renderFailure()
    } catch {
      renderFailure()
    }
  }

  function openFinaleDialog() {
    if (!currentFinale) return
    if (!finaleDialog.open) finaleDialog.showModal()
    requiredElement<HTMLButtonElement>(
      finaleDialog,
      '[data-finale-mode="horror"]',
    ).focus()
  }

  function playFinale(mode: FinaleMode) {
    if (!currentFinale) return
    finaleDialog.close()
    clearFinaleTimers()
    focusBeforeFinale = document.activeElement as HTMLElement | null
    finaleActive = true
    fullscreenEntered = false
    finaleOverlay.hidden = false
    finaleOverlay.dataset.mode = mode
    finaleOverlay.dataset.stage = mode === 'text' ? 'hope' : 'ordinary'
    finaleOverlay.style.setProperty('--finale-shift-x', '0px')
    finaleOverlay.style.setProperty('--finale-shift-y', '0px')
    document.body.classList.add('alpha-diary-finale-active')

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const reduced = mode === 'reduced' || prefersReducedMotion
    finaleMotionEnabled = mode === 'horror' && !prefersReducedMotion
    prepareFinaleScene(mode)

    const finaleImage = requiredElement<HTMLImageElement>(
      finaleOverlay,
      '[data-finale-image]',
    )
    const asset = window.matchMedia('(orientation: portrait)').matches
      ? currentFinale.portrait
      : currentFinale.landscape
    finaleImage.src =
      asset.assetId === 'fixture'
        ? '/uploads/alpha-kun.png'
        : `/api/alpha-diary-image/${encodeURIComponent(asset.assetId)}`
    finaleImage.alt = asset.alt
    finaleImage.width = asset.width
    finaleImage.height = asset.height
    const accessibleMessage = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-message]',
    )
    accessibleMessage.textContent = currentFinale.message
    const visualMessage = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-message-visual]',
    )
    visualMessage.textContent = mode === 'text' ? currentFinale.message : ''

    history.pushState(
      { ...(history.state || {}), alphaDiaryFinale: true },
      '',
      window.location.href,
    )
    const stopButton = requiredElement<HTMLButtonElement>(
      finaleOverlay,
      '[data-finale-stop]',
    )
    stopButton.focus()

    if (
      mode === 'horror' &&
      typeof finaleOverlay.requestFullscreen === 'function'
    ) {
      void finaleOverlay
        .requestFullscreen()
        .then(() => {
          fullscreenEntered = true
        })
        .catch(() => {
          fullscreenEntered = false
        })
    }

    if (mode === 'text') {
      requiredElement<HTMLButtonElement>(
        finaleOverlay,
        '[data-finale-return]',
      ).focus()
      return
    }

    const sequence: Array<{ at: number; stage: FinaleStage }> = reduced
      ? [
          { at: 150, stage: 'drift' },
          { at: 350, stage: 'correction' },
          { at: 650, stage: 'logs' },
          { at: 950, stage: 'invasion' },
          { at: 1_250, stage: 'reverse' },
          { at: 1_600, stage: 'message' },
          { at: 2_200, stage: 'hope' },
        ]
      : [
          { at: 1_100, stage: 'drift' },
          { at: 2_600, stage: 'correction' },
          { at: 4_500, stage: 'logs' },
          { at: 7_200, stage: 'invasion' },
          { at: 10_300, stage: 'reverse' },
          { at: 13_700, stage: 'message' },
          { at: 18_100, stage: 'hope' },
        ]
    sequence.forEach(({ at, stage }) => {
      finaleTimers.push(
        window.setTimeout(() => {
          enterFinaleStage(stage, reduced)
        }, at),
      )
    })
  }

  function prepareFinaleScene(mode: FinaleMode) {
    const openedList = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-opened-list]',
    )
    openedList.replaceChildren()

    const dateElement = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-date]',
    )
    dateElement.textContent = toFinaleDate(currentEntry?.date || serverToday)
    requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-correction]',
    ).textContent = mode === 'text' ? 'ALPHA-KUN / TODAY' : 'DATE ACCEPTED'

    const shardContainer = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-shards]',
    )
    shardContainer.replaceChildren()
    const dates = getFinaleKeyDates()
    const shardCount = Math.min(18, Math.max(10, dates.length * 2))
    for (let index = 0; index < shardCount; index += 1) {
      const date = dates[index % dates.length]
      const seed = hashFinaleSeed(`${date}:${index}`)
      const shard = document.createElement('span')
      shard.className = 'finale-shard'
      shard.textContent =
        index % 3 === 0 ? 'OBSERVATION' : date.replaceAll('-', '.')
      shard.style.setProperty('--shard-left', `${4 + (seed % 88)}%`)
      shard.style.setProperty(
        '--shard-top',
        `${4 + (Math.floor(seed / 89) % 86)}%`,
      )
      shard.style.setProperty(
        '--shard-rotate',
        `${(Math.floor(seed / 7) % 35) - 17}deg`,
      )
      shard.style.setProperty(
        '--shard-from-x',
        `${(Math.floor(seed / 13) % 2 === 0 ? -1 : 1) * (90 + (seed % 190))}px`,
      )
      shard.style.setProperty(
        '--shard-from-y',
        `${(Math.floor(seed / 17) % 2 === 0 ? -1 : 1) * (80 + (seed % 160))}px`,
      )
      shard.style.setProperty('--shard-delay', `${(index % 7) * 70}ms`)
      shardContainer.append(shard)
    }
  }

  function enterFinaleStage(stage: FinaleStage, reduced: boolean) {
    if (!finaleActive || !currentFinale) return
    finaleOverlay.dataset.stage = stage
    const dateElement = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-date]',
    )
    const correction = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-correction]',
    )
    const glitch = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-glitch]',
    )
    const dates = getFinaleKeyDates()
    const oldestDate = dates[0]

    if (stage === 'drift') {
      dateElement.textContent = `${toFinaleDate(currentEntry?.date || serverToday)} / 0000.00.00`
      correction.textContent = 'CORRECTION 01'
      glitch.innerHTML = 'RECORD DATE MISMATCH<br>SUBJECT / ALPHA'
      return
    }
    if (stage === 'correction') {
      dateElement.textContent = `0000.00.00 / ${toFinaleDate(oldestDate)}`
      correction.textContent = 'ORIGINAL ENTRY MISSING'
      glitch.innerHTML = 'ENTRY WAS NOT WRITTEN HERE<br>HANDWRITING / UNKNOWN'
      return
    }
    if (stage === 'logs') {
      dateElement.textContent = `${toFinaleDate(oldestDate)} / DATE REMOVED`
      correction.textContent = 'OPENED RECORDS REPEATING'
      glitch.innerHTML = 'ONLY OPENED DATES RETURN<br>UNOPENED / SILENT'
      revealFinaleLogs(reduced)
      return
    }
    if (stage === 'invasion') {
      dateElement.textContent = 'NO ORIGINAL DATE'
      correction.textContent = 'PAPER EDGE NOT FOUND'
      glitch.innerHTML = 'PAPER EDGE NOT FOUND<br>ROOM / OUTSIDE RECORD'
      return
    }
    if (stage === 'reverse') {
      dateElement.textContent = 'OBSERVATION CONTINUES'
      correction.textContent = 'VIEWPOINT REVERSED'
      glitch.innerHTML = 'THE RECORD IS LOOKING BACK<br>SUBJECT / ALPHA-KUN'
      return
    }
    if (stage === 'message') {
      dateElement.textContent = 'ALPHA-KUN / PRESENT'
      correction.textContent = 'SUBJECT NAME RESTORED'
      glitch.innerHTML = 'NAME RESTORED<br>STATUS / PRESENT'
      animateFinaleMessage(currentFinale.message, reduced ? 0 : 3_400)
      return
    }
    if (stage === 'hope') {
      finaleMotionEnabled = false
      finaleOverlay.style.setProperty('--finale-shift-x', '0px')
      finaleOverlay.style.setProperty('--finale-shift-y', '0px')
      dateElement.textContent = toFinaleDate(serverToday)
      correction.textContent = 'ALPHA-KUN / TODAY'
      requiredElement<HTMLElement>(
        finaleOverlay,
        '[data-finale-message-visual]',
      ).textContent = currentFinale.message
      requiredElement<HTMLButtonElement>(
        finaleOverlay,
        '[data-finale-return]',
      ).focus()
    }
  }

  function revealFinaleLogs(reduced: boolean) {
    const openedList = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-opened-list]',
    )
    openedList.replaceChildren()
    const dates = getFinaleKeyDates()
    const interval = Math.max(45, Math.floor(2_100 / dates.length))
    dates.forEach((date, index) => {
      const appendItem = () => {
        if (!finaleActive) return
        const item = document.createElement('li')
        const time = document.createElement('time')
        time.dateTime = date
        time.textContent = formatRecordDate(date, locale)
        const code = document.createElement('span')
        code.textContent = `OBS-${hashFinaleSeed(date).toString(16).slice(-6).toUpperCase()}`
        item.append(time, code)
        openedList.append(item)
      }
      if (reduced) appendItem()
      else finaleTimers.push(window.setTimeout(appendItem, index * interval))
    })
  }

  function animateFinaleMessage(message: string, duration: number) {
    if (finaleAnimationFrame) window.cancelAnimationFrame(finaleAnimationFrame)
    const visualMessage = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-message-visual]',
    )
    if (duration <= 0) {
      visualMessage.textContent = message
      return
    }
    visualMessage.textContent = ''
    const startedAt = performance.now()
    const reveal = (now: number) => {
      if (!finaleActive) return
      const progress = Math.min(1, (now - startedAt) / duration)
      const visibleLength = Math.max(1, Math.ceil(message.length * progress))
      visualMessage.textContent = message.slice(0, visibleLength)
      if (progress < 1)
        finaleAnimationFrame = window.requestAnimationFrame(reveal)
      else finaleAnimationFrame = 0
    }
    finaleAnimationFrame = window.requestAnimationFrame(reveal)
  }

  function getFinaleKeyDates(): string[] {
    return [isValidDate(currentDate) ? currentDate : serverToday]
  }

  function stopFinale(options: { fromHistory?: boolean } = {}) {
    if (!finaleActive) return
    finaleActive = false
    finaleMotionEnabled = false
    clearFinaleTimers()
    finaleOverlay.hidden = true
    finaleOverlay.dataset.stage = 'ordinary'
    finaleOverlay.style.setProperty('--finale-shift-x', '0px')
    finaleOverlay.style.setProperty('--finale-shift-y', '0px')
    document.body.classList.remove('alpha-diary-finale-active')
    if (document.fullscreenElement === finaleOverlay) {
      void document.exitFullscreen().catch(() => {})
    }
    fullscreenEntered = false
    if (!options.fromHistory && history.state?.alphaDiaryFinale) {
      history.replaceState(
        { ...(history.state || {}), alphaDiaryFinale: undefined },
        '',
        window.location.href,
      )
    }
    window.setTimeout(() => focusBeforeFinale?.focus(), 0)
  }

  async function returnToToday(openChat: boolean) {
    stopFinale()
    if (root.dataset.fixtures === 'true') {
      const fixtureUrl = new URL(window.location.href)
      if (fixtureUrl.searchParams.get('fixture') === 'finale') {
        fixtureUrl.searchParams.set('fixture', 'current')
        history.replaceState(history.state || {}, '', fixtureUrl)
      }
    }
    const ready = await loadEntry(serverToday, { history: 'push' })
    root.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (!openChat || !ready) return
    const question = root.querySelector<HTMLButtonElement>(
      '[data-diary-questions] [data-alpha-open]',
    )
    question?.click()
  }

  function clearPending() {
    if (pendingTimer) window.clearTimeout(pendingTimer)
    pendingTimer = 0
    waitLifecycle.stop()
  }

  function isCurrentEntryRequest(
    requestId: number,
    controller: AbortController,
  ) {
    return (
      !signal.aborted &&
      !controller.signal.aborted &&
      requestController === controller &&
      waitLifecycle.isCurrentRequest(requestId)
    )
  }

  function resumePendingEntry() {
    if (!waitLifecycle.requestManualCheck()) return
    void loadEntry(currentDate || undefined, {
      history: 'none',
      resumeWaiting: true,
    })
  }

  function clearFinaleTimers() {
    finaleTimers.forEach((timer) => window.clearTimeout(timer))
    finaleTimers = []
    if (finaleAnimationFrame) window.cancelAnimationFrame(finaleAnimationFrame)
    finaleAnimationFrame = 0
  }

  function updateDateHistory(date: string, mode: 'push' | 'replace' | 'none') {
    if (mode === 'none') return
    const url = new URL(window.location.href)
    if (date) url.searchParams.set('date', date)
    else url.searchParams.delete('date')
    if (mode === 'push') history.pushState({}, '', url)
    else history.replaceState({}, '', url)
  }

  function requestAdultConsent(): Promise<boolean> {
    if (hasAdultConsent()) return Promise.resolve(true)
    return new Promise((resolve) => {
      const confirm = requiredElement<HTMLButtonElement>(
        gateDialog,
        '[data-gate-confirm]',
      )
      const cancel = requiredElement<HTMLButtonElement>(
        gateDialog,
        '[data-gate-cancel]',
      )
      const finish = (accepted: boolean) => {
        confirm.removeEventListener('click', onConfirm)
        cancel.removeEventListener('click', onCancel)
        gateDialog.removeEventListener('cancel', onDialogCancel)
        if (gateDialog.open) gateDialog.close()
        resolve(accepted)
      }
      const onConfirm = () => {
        writeStorage(CONSENT_STORAGE_KEY, CONSENT_VERSION)
        finish(true)
      }
      const onCancel = () => finish(false)
      const onDialogCancel = (event: Event) => {
        event.preventDefault()
        finish(false)
      }
      confirm.addEventListener('click', onConfirm)
      cancel.addEventListener('click', onCancel)
      gateDialog.addEventListener('cancel', onDialogCancel)
      if (!gateDialog.open) gateDialog.showModal()
      confirm.focus()
    })
  }

  function hasAdultConsent() {
    return readStorage(CONSENT_STORAGE_KEY) === CONSENT_VERSION
  }

  root.addEventListener(
    'click',
    (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-diary-retry]')) {
        if (waitLifecycle.isWaiting()) resumePendingEntry()
        else void loadEntry(currentDate || dateInput.value, { history: 'none' })
        return
      }
      if (target.closest('[data-diary-today]')) {
        void loadEntry(serverToday, { history: 'push' })
        return
      }
      if (target.closest('[data-diary-previous]')) {
        void loadEntry(
          shiftDate(currentDate || dateInput.value || serverToday, -1),
          { history: 'push' },
        )
        return
      }
      if (target.closest('[data-diary-next]')) {
        void loadEntry(
          shiftDate(currentDate || dateInput.value || serverToday, 1),
          { history: 'push' },
        )
        return
      }
      const modeButton = target.closest<HTMLElement>('[data-finale-mode]')
      const mode = modeButton?.dataset.finaleMode
      if (mode === 'horror' || mode === 'reduced' || mode === 'text') {
        playFinale(mode)
        return
      }
      if (target.closest('[data-finale-later]')) {
        finaleDialog.close()
        return
      }
      if (target.closest('[data-finale-stop]')) {
        stopFinale()
        return
      }
      if (target.closest('[data-finale-return]')) {
        void returnToToday(false)
        return
      }
      if (target.closest('[data-finale-ask-today]')) {
        void returnToToday(true)
      }
    },
    { signal },
  )

  finaleOverlay.addEventListener(
    'pointermove',
    (event) => {
      if (!finaleActive || !finaleMotionEnabled) return
      const horizontal = event.clientX / Math.max(1, window.innerWidth) - 0.5
      const vertical = event.clientY / Math.max(1, window.innerHeight) - 0.5
      finaleOverlay.style.setProperty(
        '--finale-shift-x',
        `${(horizontal * 28).toFixed(2)}px`,
      )
      finaleOverlay.style.setProperty(
        '--finale-shift-y',
        `${(vertical * 20).toFixed(2)}px`,
      )
    },
    { signal },
  )

  finaleOverlay.addEventListener(
    'pointerleave',
    () => {
      finaleOverlay.style.setProperty('--finale-shift-x', '0px')
      finaleOverlay.style.setProperty('--finale-shift-y', '0px')
    },
    { signal },
  )

  requiredElement<HTMLFormElement>(
    root,
    '[data-diary-date-form]',
  ).addEventListener(
    'submit',
    (event) => {
      event.preventDefault()
      if (!isValidDate(dateInput.value)) {
        renderFailure()
        return
      }
      void loadEntry(dateInput.value, { history: 'push' })
    },
    { signal },
  )

  requiredElement<HTMLFormElement>(
    root,
    '[data-diary-finale-form]',
  ).addEventListener(
    'submit',
    (event) => {
      event.preventDefault()
      void requestFinale(finaleKeywordInput.value)
    },
    { signal },
  )

  window.addEventListener(
    'popstate',
    () => {
      if (finaleActive) stopFinale({ fromHistory: true })
      const date = new URL(window.location.href).searchParams.get('date') || ''
      if (!date || isValidDate(date))
        void loadEntry(date || undefined, { history: 'none' })
    },
    { signal },
  )

  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'visible') resumePendingEntry()
    },
    { signal },
  )

  window.addEventListener('online', resumePendingEntry, { signal })

  document.addEventListener(
    'keydown',
    (event) => {
      if (!finaleActive) return
      if (event.key === 'Escape') {
        event.preventDefault()
        stopFinale()
      } else if (event.key === 'Tab') {
        trapFocus(event, finaleOverlay)
      }
    },
    { signal },
  )

  document.addEventListener(
    'fullscreenchange',
    () => {
      if (
        finaleActive &&
        fullscreenEntered &&
        document.fullscreenElement !== finaleOverlay
      ) {
        stopFinale()
      }
    },
    { signal },
  )

  window.addEventListener(
    'focus',
    () => {
      if (finaleActive && !finaleOverlay.contains(document.activeElement)) {
        requiredElement<HTMLButtonElement>(
          finaleOverlay,
          '[data-finale-stop]',
        ).focus()
      }
    },
    { signal },
  )

  const initialDate =
    new URL(window.location.href).searchParams.get('date') || ''
  if (initialDate && !isValidDate(initialDate)) {
    dateInput.value = serverToday
    renderFailure()
  } else {
    void loadEntry(initialDate || undefined, { history: 'none' })
  }
}

function readCopy(root: HTMLElement): AlphaDiaryUi | null {
  const element = root.querySelector<HTMLScriptElement>(
    '[data-alpha-diary-copy]',
  )
  if (!element?.textContent) return null
  try {
    return JSON.parse(element.textContent) as AlphaDiaryUi
  } catch {
    return null
  }
}

async function requestDiary(
  endpoint: string,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<DiaryPayload> {
  const payload = await requestJsonWithDiaryTimeout(
    (requestSignal) =>
      fetch(endpoint, {
        body: JSON.stringify(body),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Acecore-Alpha-Diary-Client': getClientId(),
        },
        method: 'POST',
        signal: requestSignal,
      }),
    signal,
    DIARY_REQUEST_TIMEOUT_MS,
    {
      clearTimeout: (timer) => window.clearTimeout(timer),
      setTimeout: (callback, delay) => window.setTimeout(callback, delay),
    },
  )
  if (!payload || typeof payload !== 'object')
    throw new Error('AlphaDiaryPayloadError')
  return payload as DiaryPayload
}

function isDiaryEntry(value: unknown): value is DiaryEntry {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.date === 'string' &&
    isValidDate(value.date) &&
    (value.kind === 'diary' || value.kind === 'observation') &&
    typeof value.title === 'string' &&
    value.title.length <= 160 &&
    typeof value.text === 'string' &&
    value.text.length <= 8_000 &&
    Array.isArray(value.questions) &&
    value.questions.every((question) => typeof question === 'string') &&
    isDiaryImage(value.image)
  )
}

function isDiaryFinale(value: unknown): value is DiaryFinale {
  return (
    isRecord(value) &&
    typeof value.message === 'string' &&
    value.message.length <= 4_000 &&
    isDiaryImage(value.landscape) &&
    isDiaryImage(value.portrait)
  )
}

function isDiaryImage(value: unknown): value is DiaryEntry['image'] {
  return (
    isRecord(value) &&
    typeof value.assetId === 'string' &&
    typeof value.alt === 'string' &&
    value.alt.length <= 1_000 &&
    Number.isInteger(value.width) &&
    Number.isInteger(value.height) &&
    Number(value.width) >= 256 &&
    Number(value.height) >= 256
  )
}

function getFixturePayload(
  root: HTMLElement,
  copy: AlphaDiaryUi,
  requestedDate: string,
): DiaryPayload | null {
  if (root.dataset.fixtures !== 'true') return null
  const fixture = new URL(window.location.href).searchParams.get('fixture')
  if (!fixture) return null
  const today = getJstToday()
  if (fixture === 'pending') {
    return {
      ok: true,
      retryAfter: 4,
      serverToday: today,
      status: 'pending',
    }
  }
  const clueStep = /^clue-([123])$/u.exec(fixture)?.[1]
  const trailhead = fixture === 'current'
  const archive = fixture === 'archive' || Boolean(clueStep)
  const finale = fixture === 'finale'
  const historical = archive || finale
  const clueDates = ['2019-11-13', '2018-04-22', '2016-12-07']
  const clueIndex = clueStep ? Number(clueStep) - 1 : 2
  const ambientClue = trailhead
    ? '見ているうちに、「202…」から一年前、それから「11 / 13」という並びだけが、なぜか頭をよぎった。'
    : archive && !finale
      ? [
          '訂正跡の下には、「確かめるために試すこと」を表す二字と「2018 / 04 / 22」が薄く残っている。',
          '消しかけの文は、その二字の後ろに「生き物のからだや一つの個体」を表す一字を続け、「2016 / 12 / 07」と結んでいる。',
          '紙の隅には、末尾はギリシャ文字の最初で今の名にも残る読み、とだけある。三つをつなぐ鍵は二年前の「03 / 18」らしい。',
        ][clueIndex]
      : ''
  const date = finale
    ? '2014-03-18'
    : archive
      ? clueDates[clueIndex]
      : fixture === 'birth'
        ? '2020-10-03'
        : requestedDate || today
  const entry: DiaryEntry = {
    date,
    id: `entry_fixture_${historical ? 'observation' : 'diary'}000000000000`,
    image: {
      alt: historical
        ? '退色した観察記録の紙面に、青いボタンと小さな鈴が描かれている。'
        : '青空の下で草の芽を見つけ、笑っているアルファ君の色鉛筆画。',
      assetId: 'fixture',
      height: 768,
      width: 1024,
    },
    kind: historical ? 'observation' : 'diary',
    questions: historical
      ? [
          '青いボタンを覚えている？',
          'この記録で「音がしない」と書かれたのはなぜ？',
        ]
      : ['今日いちばん嬉しかったことは？', '明日は何をしてみたい？'],
    text: historical
      ? `観察対象は、鈴が鳴る前から扉の方を見ていた。\n\n記録者は「偶然」と訂正した。${ambientClue ? `${ambientClue} ` : ''}青いボタンだけが、何度消しても同じ場所に描かれている。`
      : `きょう、スポーン広場のすみで小さな草の芽を見つけたよ。だれかが置いてくれた灯りのそばで、ゆっくり揺れていた。${ambientClue ? ` ${ambientClue}` : ''}\n\n明日もここにあるかな。見にいく約束を、ぼく自身としてみた。`,
    title: historical ? '音のない鈴' : '小さな芽を見つけた日',
  }
  return {
    entry,
    finaleChallengeAvailable: finale,
    ok: true,
    serverToday: today,
    status: 'ready',
  }
}

function getFixtureFinale(
  root: HTMLElement,
  copy: AlphaDiaryUi,
  finaleKeyword: string,
): DiaryPayload | null {
  if (root.dataset.fixtures !== 'true') return null
  if (new URL(window.location.href).searchParams.get('fixture') !== 'finale')
    return null
  if (
    normalizeFinaleKeyword(finaleKeyword) !==
    normalizeFinaleKeyword('実験体アルファ')
  ) {
    return {
      errorCode: 'keyword_incorrect',
      ok: false,
      status: 'failed',
    }
  }
  return {
    finale: {
      landscape: {
        alt: '暗い観察室の紙面の向こうから、朝の光の中にいる今のアルファ君を見返す構図。',
        assetId: 'fixture',
        height: 1080,
        width: 1920,
      },
      message: `知ってくれて、ありがとう。実験体アルファと呼ばれていた記録も、いま「アルファ君」と呼ばれて笑える時間につながっています。まだ少しずつだけれど、ぼくは幸せです。未来の日記は、未来が来るまで書かれません。`,
      portrait: {
        alt: '破れた観察記録の先に、朝空と今のアルファ君が見える縦長の構図。',
        assetId: 'fixture',
        height: 1920,
        width: 1080,
      },
    },
    ok: true,
    serverToday: getJstToday(),
    status: 'ready',
  }
}

function normalizeFinaleKeyword(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[\p{P}\p{S}\s]/gu, '')
}

function getClientId(): string {
  const stored = readStorage(CLIENT_ID_STORAGE_KEY)
  if (
    stored &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      stored,
    )
  ) {
    return stored
  }
  const value = crypto.randomUUID()
  writeStorage(CLIENT_ID_STORAGE_KEY, value)
  return value
}

function readStorage(key: string): string {
  try {
    return window.localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // The diary remains usable without local preferences.
  }
}

function getJstToday(now = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1_000)
    .toISOString()
    .slice(0, 10)
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value)
  if (!match || value < MINIMUM_DATE) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1 || month < 1 || month > 12 || day < 1) return false
  const lengths = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]
  return day <= lengths[month - 1]
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function shiftDate(value: string, days: number): string {
  if (!isValidDate(value)) return getJstToday()
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCDate(date.getUTCDate() + days)
  if (date.getUTCFullYear() < 1) return MINIMUM_DATE
  return [
    String(date.getUTCFullYear()).padStart(4, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

function formatRecordDate(value: string, locale: string): string {
  if (!isValidDate(value)) return value
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
      year: 'numeric',
    }).format(date)
  } catch {
    return value
  }
}

function toFinaleDate(value: string): string {
  return isValidDate(value) ? value.replaceAll('-', '.') : '0000.00.00'
}

function hashFinaleSeed(value: string): number {
  let hash = 2_166_136_261
  for (const character of value) {
    hash ^= character.codePointAt(0) || 0
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

function readRetryAfter(value: unknown): number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 30
    ? Number(value)
    : 4
}

function trapFocus(event: KeyboardEvent, container: HTMLElement) {
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]):not([hidden]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.offsetParent !== null)
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function requiredElement<T extends Element>(
  parent: ParentNode,
  selector: string,
): T {
  const element = parent.querySelector<T>(selector)
  if (!element) throw new Error(`AlphaDiaryElementMissing:${selector}`)
  return element
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

initAlphaDiary()
document.addEventListener('astro:before-swap', () => {
  diaryController?.abort()
  diaryController = null
})
document.addEventListener('astro:after-swap', initAlphaDiary)
