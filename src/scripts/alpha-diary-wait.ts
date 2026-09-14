export const DIARY_LONG_WAIT_MS = 30_000

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

  markPending(requestId: number, retryAfterMs: number): boolean {
    if (!this.isCurrentRequest(requestId)) return false
    this.#requestActive = false
    this.#clearPollTimer()
    this.#pollTimer = this.#scheduler.setTimeout(() => {
      this.#pollTimer = 0
      if (!this.isWaiting() || this.#requestActive) return
      this.#onPoll()
    }, retryAfterMs)
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
