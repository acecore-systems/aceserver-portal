import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DiaryRequestTimeoutError,
  DiaryWaitLifecycle,
  requestJsonWithDiaryTimeout,
  withDiaryRequestTimeout,
} from '../src/scripts/alpha-diary-wait.ts'

function createScheduler() {
  let now = 0
  let nextTimer = 1
  const intervals = new Map()
  const timeouts = new Map()

  function nextDueTimer() {
    const candidates = [
      ...[...timeouts.entries()].map(([id, timer]) => ({
        dueAt: timer.dueAt,
        id,
        kind: 'timeout',
      })),
      ...[...intervals.entries()].map(([id, timer]) => ({
        dueAt: timer.dueAt,
        id,
        kind: 'interval',
      })),
    ].sort((left, right) => left.dueAt - right.dueAt || left.id - right.id)
    return candidates[0]
  }

  return {
    activeTimerCount: () => intervals.size + timeouts.size,
    advance(milliseconds) {
      const target = now + milliseconds
      while (true) {
        const timer = nextDueTimer()
        if (!timer || timer.dueAt > target) break
        now = timer.dueAt
        if (timer.kind === 'timeout') {
          const callback = timeouts.get(timer.id)?.callback
          timeouts.delete(timer.id)
          callback?.()
        } else {
          const interval = intervals.get(timer.id)
          if (!interval) continue
          interval.dueAt += interval.delay
          interval.callback()
        }
      }
      now = target
    },
    clearInterval(id) {
      intervals.delete(id)
    },
    clearTimeout(id) {
      timeouts.delete(id)
    },
    now: () => now,
    setInterval(callback, delay) {
      const id = nextTimer++
      intervals.set(id, { callback, delay, dueAt: now + delay })
      return id
    },
    setTimeout(callback, delay) {
      const id = nextTimer++
      timeouts.set(id, { callback, dueAt: now + delay })
      return id
    },
  }
}

test('pending checks retain elapsed time through a four-second poll and then finish the waiting state', () => {
  const scheduler = createScheduler()
  const snapshots = []
  let polls = 0
  const lifecycle = new DiaryWaitLifecycle({
    onChange: (snapshot) => snapshots.push(snapshot),
    onPoll: () => {
      polls += 1
    },
    scheduler,
  })

  const firstRequest = lifecycle.startRequest()
  assert.equal(lifecycle.markPending(firstRequest, 4_000), true)
  scheduler.advance(4_000)
  assert.equal(polls, 1)
  assert.equal(snapshots.at(-1).elapsedSeconds, 4)

  const readyRequest = lifecycle.startRequest()
  assert.equal(snapshots.at(-1).elapsedSeconds, 4)
  assert.equal(lifecycle.complete(readyRequest), true)
  assert.equal(snapshots.at(-1).isWaiting, false)
  assert.equal(scheduler.activeTimerCount(), 0)
})

test('a finite request timeout fails independently, and a later retry can resolve', async () => {
  const scheduler = createScheduler()
  const caller = new AbortController()
  let requestWasAborted = false
  const timedOut = withDiaryRequestTimeout(
    (requestSignal) =>
      new Promise((resolve, reject) => {
        requestSignal.addEventListener('abort', () => {
          requestWasAborted = true
          reject(new DOMException('Aborted', 'AbortError'))
        })
      }),
    caller.signal,
    20_000,
    scheduler,
  )

  scheduler.advance(20_000)
  await assert.rejects(timedOut, DiaryRequestTimeoutError)
  assert.equal(requestWasAborted, true)
  assert.equal(scheduler.activeTimerCount(), 0)

  const retried = await withDiaryRequestTimeout(
    async () => 'ready',
    new AbortController().signal,
    20_000,
    scheduler,
  )
  assert.equal(retried, 'ready')
  assert.equal(scheduler.activeTimerCount(), 0)
})

test('a response whose headers arrive but whose body stalls still times out', async () => {
  const scheduler = createScheduler()
  const caller = new AbortController()
  let bodyWasAborted = false
  const request = requestJsonWithDiaryTimeout(
    async (requestSignal) => ({
      json: () =>
        new Promise((resolve, reject) => {
          requestSignal.addEventListener('abort', () => {
            bodyWasAborted = true
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }),
    }),
    caller.signal,
    20_000,
    scheduler,
  )

  await Promise.resolve()
  await Promise.resolve()
  scheduler.advance(20_000)
  await assert.rejects(request, DiaryRequestTimeoutError)
  assert.equal(bodyWasAborted, true)
  assert.equal(scheduler.activeTimerCount(), 0)
})

test('a user cancellation is not reported as a request timeout', async () => {
  const scheduler = createScheduler()
  const caller = new AbortController()
  const cancelled = withDiaryRequestTimeout(
    (requestSignal) =>
      new Promise((resolve, reject) => {
        requestSignal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      }),
    caller.signal,
    20_000,
    scheduler,
  )

  caller.abort()
  await assert.rejects(cancelled, (error) => {
    assert.notEqual(error.name, 'DiaryRequestTimeoutError')
    return true
  })
  assert.equal(scheduler.activeTimerCount(), 0)
})

test('an already-cancelled request is rejected before its timeout or request work starts', async () => {
  const scheduler = createScheduler()
  const caller = new AbortController()
  caller.abort()
  let calls = 0

  await assert.rejects(
    withDiaryRequestTimeout(
      async () => {
        calls += 1
        return 'unexpected'
      },
      caller.signal,
      20_000,
      scheduler,
    ),
    (error) => error.name === 'AbortError',
  )
  assert.equal(calls, 0)
  assert.equal(scheduler.activeTimerCount(), 0)
})

test('a late response for an earlier date cannot replace the newer date', () => {
  const scheduler = createScheduler()
  const renderedDates = []
  const lifecycle = new DiaryWaitLifecycle({
    onChange: () => {},
    onPoll: () => {},
    scheduler,
  })

  const firstDateRequest = lifecycle.startRequest()
  const secondDateRequest = lifecycle.startRequest()
  if (lifecycle.complete(firstDateRequest)) renderedDates.push('2016-12-07')
  if (lifecycle.complete(secondDateRequest)) renderedDates.push('2020-10-01')

  assert.deepEqual(renderedDates, ['2020-10-01'])
})

test('long waits keep elapsed time for a manual check and reject duplicate checks in flight', () => {
  const scheduler = createScheduler()
  const snapshots = []
  const lifecycle = new DiaryWaitLifecycle({
    onChange: (snapshot) => snapshots.push(snapshot),
    onPoll: () => {},
    scheduler,
  })

  const pendingRequest = lifecycle.startRequest()
  lifecycle.markPending(pendingRequest, 4_000)
  scheduler.advance(30_000)
  assert.equal(snapshots.at(-1).elapsedSeconds, 30)
  assert.equal(snapshots.at(-1).isLongWait, true)

  assert.equal(lifecycle.requestManualCheck(), true)
  const manualCheckRequest = lifecycle.startRequest()
  assert.equal(snapshots.at(-1).elapsedSeconds, 30)
  assert.equal(lifecycle.requestManualCheck(), false)
  lifecycle.complete(manualCheckRequest)
})

test('stopping the diary clears scheduled polls and elapsed-time updates', () => {
  const scheduler = createScheduler()
  let polls = 0
  const lifecycle = new DiaryWaitLifecycle({
    onChange: () => {},
    onPoll: () => {
      polls += 1
    },
    scheduler,
  })

  const request = lifecycle.startRequest()
  lifecycle.markPending(request, 4_000)
  assert.equal(scheduler.activeTimerCount(), 2)
  lifecycle.stop()
  scheduler.advance(60_000)

  assert.equal(polls, 0)
  assert.equal(scheduler.activeTimerCount(), 0)
})
