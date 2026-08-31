import type { AlphaDiaryUi } from '../data/alpha-diary-ui'

type DiaryEntry = {
  date: string
  id: string
  image: { alt: string; assetId: string; height: number; width: number }
  kind: 'diary' | 'observation'
  questions: string[]
  text: string
  title: string
}

type DiaryJourney = {
  confirmedCount: number
  goalVersion: number
  latestGoalVersion: number
  latestRecordsAvailable: boolean
  suggestedRecordDates: string[]
  token: string
  totalCount: number
  unlocked: boolean
  viewedCount: number
}

type DiaryFinale = {
  landscape: { alt: string; assetId: string; height: number; width: number }
  message: string
  portrait: { alt: string; assetId: string; height: number; width: number }
}

type DiaryPayload = Record<string, unknown> & {
  entry?: DiaryEntry
  finale?: DiaryFinale
  journey?: DiaryJourney
  journeyToken?: string
  retryAfter?: number
  serverToday?: string
  status?: string
}

type FinaleMode = 'horror' | 'reduced' | 'text'

const BIRTH_BOUNDARY = '2020-10-01'
const MINIMUM_DATE = '0001-01-01'
const CONSENT_VERSION = '1'
const JOURNEY_STORAGE_KEY = 'alpha-diary.journey.v1'
const CONSENT_STORAGE_KEY = 'alpha-diary.content-consent.v1'
const OPENED_DATES_STORAGE_KEY = 'alpha-diary.opened-dates.v1'
const CLIENT_ID_STORAGE_KEY = 'alpha-diary.client.v1'
const EXPERIENCE_EVENTS = new Set([
  'alpha_diary_memory_confirmed',
  'alpha_diary_memory_expanded',
  'alpha_diary_goal_unlocked',
])

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
  let currentJourney: DiaryJourney | null = null
  let currentFinale: DiaryFinale | null = null
  let journeyToken = readStorage(JOURNEY_STORAGE_KEY) || ''
  let openedDates = readOpenedDates()
  let requestController: AbortController | null = null
  let pendingTimer = 0
  let finaleTimers: number[] = []
  let finaleActive = false
  let fullscreenEntered = false
  let focusBeforeFinale: HTMLElement | null = null
  let invalidJourneyRetried = false

  dateInput.max = serverToday

  function setStatus(message: string) {
    statusRegion.textContent = message
  }

  function setLoading() {
    paper.dataset.recordKind = 'loading'
    statePanel.hidden = false
    entryPanel.hidden = true
    setStateContent(copy.loadingTitle, copy.loadingBody, true)
    setStatus(copy.loadingTitle)
  }

  function setStateContent(title: string, body: string, loading = false) {
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
      loading
  }

  function renderFuture() {
    clearPending()
    paper.dataset.recordKind = 'future'
    statePanel.hidden = false
    entryPanel.hidden = true
    setStateContent(copy.futureTitle, copy.futureBody)
    setStatus(copy.futureTitle)
  }

  function renderFailure() {
    clearPending()
    paper.dataset.recordKind = 'failed'
    statePanel.hidden = false
    entryPanel.hidden = true
    setStateContent(copy.failureTitle, copy.failureBody)
    setStatus(copy.failureTitle)
  }

  function renderEntry(entry: DiaryEntry, journey: DiaryJourney) {
    currentEntry = entry
    currentJourney = journey
    currentDate = entry.date
    journeyToken = journey.token
    writeStorage(JOURNEY_STORAGE_KEY, journeyToken)
    dateInput.value = entry.date
    openedDates = addOpenedDate(openedDates, entry.date)
    writeStorage(OPENED_DATES_STORAGE_KEY, JSON.stringify(openedDates))

    paper.dataset.recordKind = entry.kind
    paper.classList.toggle('is-old-record', entry.kind === 'observation')
    statePanel.hidden = true
    entryPanel.hidden = false
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
      button.dataset.alphaJourneyToken = journeyToken
      const label = document.createElement('span')
      label.textContent = question
      const action = document.createElement('strong')
      action.textContent = copy.askButton
      button.append(label, action)
      questions.append(button)
    }

    updateJourney(journey)
    setStatus(`${formatRecordDate(entry.date, locale)} — ${entry.title}`)
  }

  function updateJourney(journey: DiaryJourney) {
    const viewed = requiredElement<HTMLElement>(root, '[data-journey-viewed]')
    const confirmed = requiredElement<HTMLElement>(
      root,
      '[data-journey-confirmed]',
    )
    const total = Math.max(1, journey.totalCount)
    viewed.textContent = `${Math.min(journey.viewedCount, total)} / ${total}`
    confirmed.textContent = `${Math.min(journey.confirmedCount, total)} / ${total}`
    requiredElement<HTMLElement>(
      root,
      '[data-journey-viewed-bar]',
    ).style.width = `${Math.min(100, (journey.viewedCount / total) * 100)}%`
    requiredElement<HTMLElement>(
      root,
      '[data-journey-confirmed-bar]',
    ).style.width = `${Math.min(100, (journey.confirmedCount / total) * 100)}%`

    const suggestions = requiredElement<HTMLElement>(
      root,
      '[data-diary-suggestions]',
    )
    suggestions.replaceChildren()
    const uniqueDates = [...new Set(journey.suggestedRecordDates)]
      .filter(isValidDate)
      .sort()
      .reverse()
    for (const date of uniqueDates) {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.diarySuggestedDate = date
      button.textContent = formatRecordDate(date, locale)
      button.setAttribute('aria-current', String(date === currentDate))
      suggestions.append(button)
    }

    const unlockedPanel = requiredElement<HTMLElement>(
      root,
      '[data-diary-unlocked]',
    )
    unlockedPanel.hidden = !journey.unlocked
    const latestPanel = requiredElement<HTMLElement>(
      root,
      '[data-diary-latest]',
    )
    latestPanel.hidden = !journey.latestRecordsAvailable
  }

  async function loadEntry(
    requestedDate: string | undefined,
    options: {
      followLatest?: boolean
      force?: boolean
      history?: 'push' | 'replace' | 'none'
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
    clearPending()
    requestController?.abort()
    requestController = new AbortController()
    setLoading()

    try {
      const fixture = getFixturePayload(root, copy, date || serverToday)
      const payload =
        fixture ||
        (await requestDiary(
          endpoint,
          {
            action: 'entry',
            entryDate: date || undefined,
            journeyToken: journeyToken || undefined,
            locale,
            version: 1,
            ...(options.followLatest ? { followLatest: true } : {}),
            ...(date && date < BIRTH_BOUNDARY
              ? { adultConsentVersion: 1 }
              : {}),
          },
          requestController.signal,
        ))
      if (requestController.signal.aborted) return false
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
        isDiaryJourney(payload.journey)
      ) {
        invalidJourneyRetried = false
        renderEntry(payload.entry, payload.journey)
        return true
      }
      if (payload.status === 'pending') {
        const retryAfter = readRetryAfter(payload.retryAfter)
        setStateContent(copy.loadingTitle, copy.loadingBody, true)
        pendingTimer = window.setTimeout(
          () =>
            void loadEntry(date || payload.serverToday, { history: 'none' }),
          retryAfter * 1000,
        )
        return false
      }
      if (payload.status === 'future') {
        renderFuture()
        return false
      }
      if (payload.status === 'consent_required') {
        const accepted = await requestAdultConsent()
        if (accepted) return loadEntry(date, { history: 'none', force: true })
        return false
      }
      if (
        payload.errorCode === 'invalid_journey' &&
        journeyToken &&
        !invalidJourneyRetried
      ) {
        invalidJourneyRetried = true
        journeyToken = ''
        removeStorage(JOURNEY_STORAGE_KEY)
        return loadEntry(date, { history: 'none', force: true })
      }
      renderFailure()
      return false
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError')
        return false
      renderFailure()
      return false
    }
  }

  async function requestFinale() {
    if (!currentJourney?.unlocked) return
    if (!hasAdultConsent() && !(await requestAdultConsent())) return
    setStatus(copy.loadingTitle)
    try {
      const fixture = getFixtureFinale(root, copy)
      const payload =
        fixture ||
        (await requestDiary(
          endpoint,
          {
            action: 'finale',
            adultConsentVersion: 1,
            journeyToken,
            locale,
            version: 1,
          },
          signal,
        ))
      if (
        typeof payload.journeyToken === 'string' &&
        payload.journeyToken.length <= 4096
      ) {
        journeyToken = payload.journeyToken
        writeStorage(JOURNEY_STORAGE_KEY, journeyToken)
      }
      if (payload.status === 'ready' && isDiaryFinale(payload.finale)) {
        currentFinale = payload.finale
        openFinaleDialog()
        return
      }
      if (payload.status === 'pending') {
        pendingTimer = window.setTimeout(
          () => void requestFinale(),
          readRetryAfter(payload.retryAfter) * 1000,
        )
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
    document.body.classList.add('alpha-diary-finale-active')

    const openedList = requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-opened-list]',
    )
    openedList.replaceChildren()
    for (const date of openedDates) {
      const item = document.createElement('li')
      item.textContent = formatRecordDate(date, locale)
      openedList.append(item)
    }
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
    requiredElement<HTMLElement>(
      finaleOverlay,
      '[data-finale-message]',
    ).textContent = currentFinale.message

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

    if (mode === 'text') return
    const reduced =
      mode === 'reduced' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const schedule = reduced
      ? [250, 600, 950, 1_300, 1_700]
      : [1_200, 3_000, 5_200, 7_200, 9_400]
    const stages = ['glitch', 'logs', 'invasion', 'message', 'hope']
    stages.forEach((stage, index) => {
      finaleTimers.push(
        window.setTimeout(() => {
          finaleOverlay.dataset.stage = stage
          if (stage === 'hope') {
            requiredElement<HTMLButtonElement>(
              finaleOverlay,
              '[data-finale-return]',
            ).focus()
          }
        }, schedule[index]),
      )
    })
  }

  function stopFinale(options: { fromHistory?: boolean } = {}) {
    if (!finaleActive) return
    finaleActive = false
    clearFinaleTimers()
    finaleOverlay.hidden = true
    finaleOverlay.dataset.stage = 'ordinary'
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
  }

  function clearFinaleTimers() {
    finaleTimers.forEach((timer) => window.clearTimeout(timer))
    finaleTimers = []
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
      const suggested = target.closest<HTMLElement>(
        '[data-diary-suggested-date]',
      )
      if (suggested?.dataset.diarySuggestedDate) {
        void loadEntry(suggested.dataset.diarySuggestedDate, {
          history: 'push',
        })
        return
      }
      if (target.closest('[data-diary-retry]')) {
        void loadEntry(currentDate || dateInput.value, {
          history: 'none',
          force: true,
        })
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
      if (target.closest('[data-diary-deeper]')) {
        void loadEntry(
          getDeeperDate(currentDate || dateInput.value || serverToday),
          { history: 'push' },
        )
        return
      }
      if (target.closest('[data-diary-reset]')) {
        if (!window.confirm(copy.resetConfirm)) return
        removeStorage(JOURNEY_STORAGE_KEY)
        removeStorage(OPENED_DATES_STORAGE_KEY)
        journeyToken = ''
        openedDates = []
        currentJourney = null
        void loadEntry(serverToday, { history: 'push' })
        return
      }
      if (target.closest('[data-diary-follow-latest]')) {
        journeyToken = ''
        removeStorage(JOURNEY_STORAGE_KEY)
        void loadEntry(currentDate || serverToday, {
          followLatest: true,
          force: true,
          history: 'none',
        })
        return
      }
      if (target.closest('[data-diary-open-finale]')) {
        void requestFinale()
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
    'alpha-diary:progress',
    (event) => {
      const detail = (event as CustomEvent).detail
      if (!detail || typeof detail !== 'object') return
      if (
        typeof detail.journeyToken === 'string' &&
        detail.journeyToken.length <= 4096 &&
        EXPERIENCE_EVENTS.has(String(detail.experienceEvent))
      ) {
        journeyToken = detail.journeyToken
        writeStorage(JOURNEY_STORAGE_KEY, journeyToken)
        setStatus(copy.statusProgressUpdated)
        void loadEntry(currentDate || undefined, {
          history: 'none',
          force: true,
        })
      }
    },
    { signal },
  )

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
  const response = await fetch(endpoint, {
    body: JSON.stringify(body),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Acecore-Alpha-Diary-Client': getClientId(),
    },
    method: 'POST',
    signal,
  })
  const payload = (await response
    .json()
    .catch(() => null)) as DiaryPayload | null
  if (!payload || typeof payload !== 'object')
    throw new Error('AlphaDiaryPayloadError')
  return payload
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

function isDiaryJourney(value: unknown): value is DiaryJourney {
  if (!isRecord(value)) return false
  return (
    Number.isInteger(value.confirmedCount) &&
    Number.isInteger(value.viewedCount) &&
    Number.isInteger(value.totalCount) &&
    Number(value.totalCount) > 0 &&
    Number.isInteger(value.goalVersion) &&
    Number.isInteger(value.latestGoalVersion) &&
    typeof value.latestRecordsAvailable === 'boolean' &&
    typeof value.unlocked === 'boolean' &&
    typeof value.token === 'string' &&
    value.token.length <= 4096 &&
    Array.isArray(value.suggestedRecordDates) &&
    value.suggestedRecordDates.every(isValidDate)
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
  const archive = fixture === 'archive' || fixture === 'finale'
  const date = archive
    ? '2016-12-07'
    : fixture === 'birth'
      ? '2020-10-03'
      : requestedDate || today
  const entry: DiaryEntry = {
    date,
    id: `entry_fixture_${archive ? 'observation' : 'diary'}000000000000`,
    image: {
      alt: archive
        ? '退色した観察記録の紙面に、青いボタンと小さな鈴が描かれている。'
        : '青空の下で草の芽を見つけ、笑っているアルファ君の色鉛筆画。',
      assetId: 'fixture',
      height: 768,
      width: 1024,
    },
    kind: archive ? 'observation' : 'diary',
    questions: archive
      ? [
          '青いボタンを覚えている？',
          'この記録で「音がしない」と書かれたのはなぜ？',
        ]
      : ['今日いちばん嬉しかったことは？', '明日は何をしてみたい？'],
    text: archive
      ? '観察対象は、鈴が鳴る前から扉の方を見ていた。\n\n記録者は「偶然」と訂正した。青いボタンだけが、何度消しても同じ場所に描かれている。'
      : 'きょう、スポーン広場のすみで小さな草の芽を見つけたよ。だれかが置いてくれた灯りのそばで、ゆっくり揺れていた。\n\n明日もここにあるかな。見にいく約束を、ぼく自身としてみた。',
    title: archive ? '音のない鈴' : '小さな芽を見つけた日',
  }
  const unlocked = fixture === 'finale'
  return {
    entry,
    journey: {
      confirmedCount: unlocked ? 4 : archive ? 2 : 0,
      goalVersion: 1,
      latestGoalVersion: 1,
      latestRecordsAvailable: false,
      suggestedRecordDates: [
        '2019-11-13',
        '2018-04-22',
        '2016-12-07',
        '2014-03-18',
      ],
      token: 'fixture.journey-token',
      totalCount: 4,
      unlocked,
      viewedCount: unlocked ? 4 : archive ? 3 : 1,
    },
    ok: true,
    serverToday: today,
    status: 'ready',
  }
}

function getFixtureFinale(
  root: HTMLElement,
  copy: AlphaDiaryUi,
): DiaryPayload | null {
  if (root.dataset.fixtures !== 'true') return null
  if (new URL(window.location.href).searchParams.get('fixture') !== 'finale')
    return null
  return {
    finale: {
      landscape: {
        alt: '暗い観察室の紙面の向こうから、朝の光の中にいる今のアルファ君を見返す構図。',
        assetId: 'fixture',
        height: 1080,
        width: 1920,
      },
      message: `知ってくれて、ありがとう。実験台アルファと呼ばれていた記録も、いま「アルファ君」と呼ばれて笑える時間につながっています。まだ少しずつだけれど、ぼくは幸せです。未来の日記は、未来が来るまで書かれません。`,
      portrait: {
        alt: '破れた観察記録の先に、朝空と今のアルファ君が見える縦長の構図。',
        assetId: 'fixture',
        height: 1920,
        width: 1080,
      },
    },
    journeyToken: 'fixture.journey-token',
    ok: true,
    serverToday: getJstToday(),
    status: 'ready',
  }
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

function readOpenedDates(): string[] {
  try {
    const value = JSON.parse(readStorage(OPENED_DATES_STORAGE_KEY) || '[]')
    return Array.isArray(value)
      ? [...new Set(value.filter(isValidDate))].slice(-64)
      : []
  } catch {
    return []
  }
}

function addOpenedDate(dates: string[], date: string): string[] {
  return [...new Set([...dates, date])].sort().slice(-64)
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
    // The diary remains usable without local progress.
  }
}

function removeStorage(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // The diary remains usable without local progress.
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

function getDeeperDate(value: string): string {
  if (value >= BIRTH_BOUNDARY) return '2019-11-13'
  const [year, month, day] = value.split('-').map(Number)
  const nextYear = Math.max(1, year - Math.max(1, Math.ceil((2020 - year) / 4)))
  const nextDay = month === 2 && day === 29 && !isLeapYear(nextYear) ? 28 : day
  return `${String(nextYear).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`
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
