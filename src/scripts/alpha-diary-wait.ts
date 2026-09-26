export const DIARY_LONG_WAIT_MS = 30_000
export const DIARY_REQUEST_TIMEOUT_MS = 20_000
export const DIARY_HISTORICAL_PREPARATION_TIMEOUT_MS = 60_000
export const DIARY_METRICS_ENDPOINT = '/api/alpha-diary-metrics'
export const DIARY_METRICS_RELEASE = 'diary-wait-v2'
export const DIARY_TRANSIENT_FAILURE_RETRY_LIMIT = 2

export function isRetryableDiaryFailure(
  errorCode: unknown,
  retries: number,
): boolean {
  return (
    retries < DIARY_TRANSIENT_FAILURE_RETRY_LIMIT &&
    (errorCode === 'canon_unavailable' ||
      errorCode === 'generation_unavailable')
  )
}

export function isRetryableDiaryTransportError(
  error: unknown,
  retries: number,
): boolean {
  return (
    retries < DIARY_TRANSIENT_FAILURE_RETRY_LIMIT && error instanceof TypeError
  )
}

export function diaryPendingPollDelayMs(
  pendingCount: number,
  retryAfterMs: number,
): number {
  const minimum =
    pendingCount <= 0 ? 4_000 : pendingCount === 1 ? 10_000 : 15_000
  return Math.max(retryAfterMs, minimum)
}

export function diaryEntryRequestTimeoutMs(
  recordDate: string,
  serverToday: string,
  resumeWaiting: boolean,
): number {
  return recordDate && recordDate < serverToday && !resumeWaiting
    ? DIARY_HISTORICAL_PREPARATION_TIMEOUT_MS
    : DIARY_REQUEST_TIMEOUT_MS
}

export function diaryRateLimitRetryAfterSeconds(
  httpStatus: number,
  payload: unknown,
  retryAfterHeader: string | null,
): number | null {
  const body =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null
  if (httpStatus !== 429 && body?.status !== 'rate_limited') return null

  const seconds = [retryAfterHeader, body?.retryAfter, body?.retry_after]
    .map((value) => {
      const numeric = typeof value === 'string' ? Number(value) : value
      return Number.isInteger(numeric) && Number(numeric) > 0
        ? Number(numeric)
        : 0
    })
    .reduce((largest, value) => Math.max(largest, value), 30)
  return Math.min(seconds, 86_400)
}

export class DiaryReadyEntryCache<T> {
  #entries = new Map<string, { expiresAt: number; value: T }>()
  #now: () => number

  constructor(now: () => number) {
    this.#now = now
  }

  get(date: string): T | null {
    const cached = this.#entries.get(date)
    if (!cached) return null
    if (cached.expiresAt <= this.#now()) {
      this.#entries.delete(date)
      return null
    }
    this.#entries.delete(date)
    this.#entries.set(date, cached)
    return cached.value
  }

  set(date: string, value: T) {
    this.#entries.delete(date)
    this.#entries.set(date, {
      expiresAt: this.#now() + 5 * 60_000,
      value,
    })
    if (this.#entries.size > 24) {
      const oldest = this.#entries.keys().next().value
      if (oldest) this.#entries.delete(oldest)
    }
  }
}

export type DiaryLoadOutcome = 'ready' | 'timeout' | 'failed' | 'cancelled'

export type DiaryLoadMeasurement = {
  elapsedMs: number
  hiddenMs: number
  manualCheckCount: number
  outcome: DiaryLoadOutcome
  pendingCount: number
  requestCount: number
  startedAtWallClockMs: number
}

export type DiaryLoadMetricPayload = {
  elapsedMs: number
  eventId: string
  hiddenMs: number
  manualCheckCount: number
  outcome: DiaryLoadOutcome
  pendingCount: number
  release: typeof DIARY_METRICS_RELEASE
  requestCount: number
  version: 1
}

export type DiaryLoadMeasurementClock = {
  monotonicNow: () => number
  wallClockNow: () => number
}

type DiaryLoadMeasurementLifecycleOptions = {
  clock: DiaryLoadMeasurementClock
}

export class DiaryLoadMeasurementLifecycle {
  #clock: DiaryLoadMeasurementClock
  #hiddenMs = 0
  #hiddenStartedAt: number | null = null
  #manualCheckCount = 0
  #pendingCount = 0
  #requestCount = 0
  #startedAtMonotonic: number | null = null
  #startedAtWallClockMs: number | null = null

  constructor({ clock }: DiaryLoadMeasurementLifecycleOptions) {
    this.#clock = clock
  }

  begin(options: { hidden: boolean }) {
    this.discard()
    const startedAt = this.#clock.monotonicNow()
    this.#startedAtMonotonic = startedAt
    this.#startedAtWallClockMs = this.#clock.wallClockNow()
    this.#hiddenStartedAt = options.hidden ? startedAt : null
  }

  recordRequest() {
    if (!this.isActive()) return
    this.#requestCount += 1
  }

  recordPending() {
    if (!this.isActive()) return
    this.#pendingCount += 1
  }

  recordManualCheck() {
    if (!this.isActive()) return
    this.#manualCheckCount += 1
  }

  setHidden(hidden: boolean) {
    if (!this.isActive()) return
    const now = this.#clock.monotonicNow()
    if (hidden && this.#hiddenStartedAt === null) {
      this.#hiddenStartedAt = now
      return
    }
    if (!hidden && this.#hiddenStartedAt !== null) {
      this.#hiddenMs += Math.max(0, now - this.#hiddenStartedAt)
      this.#hiddenStartedAt = null
    }
  }

  finalize(outcome: DiaryLoadOutcome): DiaryLoadMeasurement | null {
    if (
      this.#startedAtMonotonic === null ||
      this.#startedAtWallClockMs === null
    ) {
      return null
    }
    const now = this.#clock.monotonicNow()
    const elapsedMs = Math.max(0, now - this.#startedAtMonotonic)
    const hiddenMs = Math.min(
      elapsedMs,
      this.#hiddenMs +
        (this.#hiddenStartedAt === null
          ? 0
          : Math.max(0, now - this.#hiddenStartedAt)),
    )
    const measurement: DiaryLoadMeasurement = {
      elapsedMs: Math.floor(elapsedMs),
      hiddenMs: Math.floor(hiddenMs),
      manualCheckCount: this.#manualCheckCount,
      outcome,
      pendingCount: this.#pendingCount,
      requestCount: this.#requestCount,
      startedAtWallClockMs: this.#startedAtWallClockMs,
    }
    this.discard()
    return measurement
  }

  discard() {
    this.#hiddenMs = 0
    this.#hiddenStartedAt = null
    this.#manualCheckCount = 0
    this.#pendingCount = 0
    this.#requestCount = 0
    this.#startedAtMonotonic = null
    this.#startedAtWallClockMs = null
  }

  isActive(): boolean {
    return this.#startedAtMonotonic !== null
  }
}

export class DiaryBfcacheResumeLifecycle {
  #date: string | null = null

  recordPageHide(date: string, hasIncompleteLoad: boolean) {
    this.#date = hasIncompleteLoad && date ? date : null
  }

  takePersistedPageShow(persisted: boolean): string | null {
    const date = persisted ? this.#date : null
    this.#date = null
    return date
  }
}

export type DiaryWaitSnapshot = {
  elapsedSeconds: number
  isLongWait: boolean
  isRequestActive: boolean
  isWaiting: boolean
}

export type DiaryWaitScheduler = {
  clearInterval: (timer: number) => void
  clearTimeout: (timer: number) => void
  now: () => number
  setInterval: (callback: () => void, delay: number) => number
  setTimeout: (callback: () => void, delay: number) => number
}

type DiaryWaitLifecycleOptions = {
  onChange: (snapshot: DiaryWaitSnapshot) => void
  onPoll: () => void
  scheduler: DiaryWaitScheduler
}

export class DiaryWaitLifecycle {
  #activeRequestId = 0
  #elapsedTimer = 0
  #onChange: (snapshot: DiaryWaitSnapshot) => void
  #onPoll: () => void
  #pendingCount = 0
  #pollTimer = 0
  #requestActive = false
  #scheduler: DiaryWaitScheduler
  #startedAt: number | null = null

  constructor({ onChange, onPoll, scheduler }: DiaryWaitLifecycleOptions) {
    this.#onChange = onChange
    this.#onPoll = onPoll
    this.#scheduler = scheduler
  }

  startRequest(): number {
    this.#clearPollTimer()
    this.#activeRequestId += 1
    this.#requestActive = true
    if (this.#startedAt === null) {
      this.#startedAt = this.#scheduler.now()
      this.#elapsedTimer = this.#scheduler.setInterval(
        () => this.#publish(),
        1_000,
      )
    }
    this.#publish()
    return this.#activeRequestId
  }

  isCurrentRequest(requestId: number): boolean {
    return this.#startedAt !== null && requestId === this.#activeRequestId
  }

  markPending(
    requestId: number,
    retryAfterMs: number,
    options: { resetBackoff?: boolean } = {},
  ): boolean {
    if (!this.isCurrentRequest(requestId)) return false
    this.#requestActive = false
    this.#clearPollTimer()
    if (options.resetBackoff) this.#pendingCount = 0
    const delay = diaryPendingPollDelayMs(this.#pendingCount, retryAfterMs)
    this.#pendingCount += 1
    this.#pollTimer = this.#scheduler.setTimeout(() => {
      this.#pollTimer = 0
      if (!this.isWaiting() || this.#requestActive) return
      this.#onPoll()
    }, delay)
    this.#publish()
    return true
  }

  complete(requestId: number): boolean {
    if (!this.isCurrentRequest(requestId)) return false
    this.stop()
    return true
  }

  requestManualCheck(): boolean {
    if (!this.isWaiting() || this.#requestActive) return false
    this.#clearPollTimer()
    return true
  }

  isWaiting(): boolean {
    return this.#startedAt !== null
  }

  stop() {
    this.#activeRequestId += 1
    this.#requestActive = false
    this.#pendingCount = 0
    this.#startedAt = null
    this.#clearPollTimer()
    if (this.#elapsedTimer) this.#scheduler.clearInterval(this.#elapsedTimer)
    this.#elapsedTimer = 0
    this.#publish()
  }

  #clearPollTimer() {
    if (this.#pollTimer) this.#scheduler.clearTimeout(this.#pollTimer)
    this.#pollTimer = 0
  }

  #publish() {
    const elapsedMs =
      this.#startedAt === null
        ? 0
        : Math.max(0, this.#scheduler.now() - this.#startedAt)
    this.#onChange({
      elapsedSeconds: Math.floor(elapsedMs / 1_000),
      isLongWait: elapsedMs >= DIARY_LONG_WAIT_MS,
      isRequestActive: this.#requestActive,
      isWaiting: this.isWaiting(),
    })
  }
}

export type DiaryRequestTimeoutScheduler = Pick<
  DiaryWaitScheduler,
  'clearTimeout' | 'setTimeout'
>

export class DiaryRequestTimeoutError extends Error {
  constructor() {
    super('AlphaDiaryRequestTimedOut')
    this.name = 'DiaryRequestTimeoutError'
  }
}

export async function withDiaryRequestTimeout<T>(
  request: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
  timeoutMs: number,
  scheduler: DiaryRequestTimeoutScheduler,
): Promise<T> {
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
  const timeoutController = new AbortController()
  let timedOut = false
  const abortFromCaller = () => timeoutController.abort()
  signal.addEventListener('abort', abortFromCaller, { once: true })
  const timeoutTimer = scheduler.setTimeout(() => {
    timedOut = true
    timeoutController.abort()
  }, timeoutMs)

  try {
    return await request(timeoutController.signal)
  } catch (error) {
    if (timedOut && !signal.aborted) throw new DiaryRequestTimeoutError()
    throw error
  } finally {
    scheduler.clearTimeout(timeoutTimer)
    signal.removeEventListener('abort', abortFromCaller)
  }
}

export async function requestJsonWithDiaryTimeout<T>(
  request: (signal: AbortSignal) => Promise<{ json: () => Promise<T> }>,
  signal: AbortSignal,
  timeoutMs: number,
  scheduler: DiaryRequestTimeoutScheduler,
): Promise<T | null> {
  return withDiaryRequestTimeout(
    async (requestSignal) => {
      const response = await request(requestSignal)
      try {
        return await response.json()
      } catch (error) {
        if (isAbortError(error)) throw error
        return null
      }
    },
    signal,
    timeoutMs,
    scheduler,
  )
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

type DiaryMetricReporterOptions = {
  endpoint?: string
  eventId?: () => string | undefined
  fetch?: (
    input: string,
    init: {
      body: string
      headers: { 'Content-Type': string }
      keepalive: true
      method: 'POST'
    },
  ) => Promise<unknown>
  preferBeacon?: boolean
  sendBeacon?: (url: string, data: Blob | string) => boolean
}

export function reportDiaryLoadMeasurement(
  measurement: DiaryLoadMeasurement,
  options: DiaryMetricReporterOptions = {},
): boolean {
  if (
    !Number.isInteger(measurement.elapsedMs) ||
    !Number.isInteger(measurement.hiddenMs) ||
    !Number.isInteger(measurement.requestCount) ||
    !Number.isInteger(measurement.pendingCount) ||
    !Number.isInteger(measurement.manualCheckCount)
  )
    return false
  if (
    measurement.elapsedMs < 0 ||
    measurement.elapsedMs > 86_400_000 ||
    measurement.hiddenMs < 0 ||
    measurement.hiddenMs > measurement.elapsedMs ||
    measurement.requestCount < 1 ||
    measurement.requestCount > 10_000 ||
    measurement.pendingCount < 0 ||
    measurement.pendingCount > measurement.requestCount ||
    measurement.manualCheckCount < 0 ||
    measurement.manualCheckCount > measurement.requestCount
  ) {
    return false
  }
  const eventId =
    options.eventId?.() ||
    (typeof crypto === 'undefined' ? undefined : crypto.randomUUID?.())
  if (!eventId) return false
  const payload: DiaryLoadMetricPayload = {
    elapsedMs: measurement.elapsedMs,
    eventId,
    hiddenMs: measurement.hiddenMs,
    manualCheckCount: measurement.manualCheckCount,
    outcome: measurement.outcome,
    pendingCount: measurement.pendingCount,
    release: DIARY_METRICS_RELEASE,
    requestCount: measurement.requestCount,
    version: 1,
  }
  const endpoint = options.endpoint || DIARY_METRICS_ENDPOINT
  const serialized = JSON.stringify(payload)
  const sendBeacon =
    options.sendBeacon ||
    (typeof navigator === 'undefined' ||
    typeof navigator.sendBeacon !== 'function'
      ? undefined
      : navigator.sendBeacon.bind(navigator))
  if (options.preferBeacon && sendBeacon) {
    try {
      const body =
        typeof Blob === 'undefined'
          ? serialized
          : new Blob([serialized], { type: 'application/json' })
      if (sendBeacon(endpoint, body)) return true
    } catch {
      // Fall through to the keepalive request; metrics must not affect the diary.
    }
  }
  const sendFetch =
    options.fetch || (typeof fetch === 'function' ? fetch : null)
  if (!sendFetch) return false
  try {
    void sendFetch(endpoint, {
      body: serialized,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      method: 'POST',
    }).catch(() => {})
    return true
  } catch {
    return false
  }
}
