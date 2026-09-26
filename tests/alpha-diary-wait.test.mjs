import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  DiaryBfcacheResumeLifecycle,
  DIARY_METRICS_ENDPOINT,
  DiaryLoadMeasurementLifecycle,
  DiaryReadyEntryCache,
  DiaryRequestTimeoutError,
  DiaryWaitLifecycle,
  diaryEntryRequestTimeoutMs,
  diaryPendingPollDelayMs,
  diaryRateLimitRetryAfterSeconds,
  isRetryableDiaryFailure,
  isRetryableDiaryTransportError,
  requestJsonWithDiaryTimeout,
  reportDiaryLoadMeasurement,
  withDiaryRequestTimeout,
} from '../src/scripts/alpha-diary-wait.ts'

test('Cloudflare 1015 and diary quota responses use a safe retry delay', () => {
  assert.equal(
    diaryRateLimitRetryAfterSeconds(
      429,
      { error_code: 1015, retry_after: 30 },
      '10',
    ),
    30,
  )
  assert.equal(
    diaryRateLimitRetryAfterSeconds(
      429,
      { status: 'rate_limited', retryAfter: 2_400 },
      '2400',
    ),
    2_400,
  )
  assert.equal(diaryRateLimitRetryAfterSeconds(429, null, null), 30)
  assert.equal(
    diaryRateLimitRetryAfterSeconds(200, { status: 'ready' }, null),
    null,
  )
})

test('preparation and service outages retry twice, while permanent failures do not', () => {
  for (const errorCode of ['canon_unavailable', 'generation_unavailable']) {
    assert.equal(isRetryableDiaryFailure(errorCode, 0), true)
    assert.equal(isRetryableDiaryFailure(errorCode, 1), true)
    assert.equal(isRetryableDiaryFailure(errorCode, 2), false)
  }
  for (const errorCode of [
    'invalid_request',
    'unconfigured',
    'entry_state_error',
    null,
  ]) {
    assert.equal(isRetryableDiaryFailure(errorCode, 0), false)
  }
})

test('network transport errors retry, but unrelated errors and request timeouts do not', () => {
  assert.equal(
    isRetryableDiaryTransportError(new TypeError('Failed to fetch'), 0),
    true,
  )
  assert.equal(
    isRetryableDiaryTransportError(new TypeError('Failed to fetch'), 2),
    false,
  )
  assert.equal(
    isRetryableDiaryTransportError(new Error('SchemaError'), 0),
    false,
  )
  assert.equal(
    isRetryableDiaryTransportError(new DiaryRequestTimeoutError(), 0),
    false,
  )
})

test('switching dates resets transient retries before the debounced request', async () => {
  const script = await readFile(
    new URL('../src/scripts/alpha-diary.ts', import.meta.url),
    'utf8',
  )
  const start = script.indexOf('  function queueDateLoad(')
  const end = script.indexOf('\n  function isCurrentEntryRequest(', start)
  assert.ok(start >= 0 && end > start)
  const navigation = script.slice(start, end)
  const reset = navigation.indexOf('transientFailureRetries = 0')
  const delayedRequest = navigation.indexOf('window.setTimeout(')
  assert.ok(reset >= 0 && delayedRequest > reset)
})

test('pending polls detect ready pages promptly while respecting the server retry delay', () => {
  assert.equal(diaryPendingPollDelayMs(0, 4_000), 4_000)
  assert.equal(diaryPendingPollDelayMs(1, 4_000), 4_000)
  assert.equal(diaryPendingPollDelayMs(14, 4_000), 4_000)
  assert.equal(diaryPendingPollDelayMs(15, 4_000), 8_000)
  assert.equal(diaryPendingPollDelayMs(10, 30_000), 30_000)
})

test('ready past pages are reused briefly without persisting navigation history', () => {
  let now = 1_000
  const cache = new DiaryReadyEntryCache(() => now)
  const page = { title: 'The saved page' }
  cache.set('2026-09-06', page)
  assert.equal(cache.get('2026-09-06'), page)
  now += 5 * 60_000
  assert.equal(cache.get('2026-09-06'), null)
})

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

  const secondRequest = lifecycle.startRequest()
  assert.equal(lifecycle.markPending(secondRequest, 4_000), true)
  scheduler.advance(3_999)
  assert.equal(polls, 1)
  scheduler.advance(1)
  assert.equal(polls, 2)

  const thirdRequest = lifecycle.startRequest()
  assert.equal(lifecycle.markPending(thirdRequest, 4_000), true)
  scheduler.advance(4_000)
  assert.equal(polls, 3)

  const readyRequest = lifecycle.startRequest()
  assert.equal(snapshots.at(-1).elapsedSeconds, 12)
  assert.equal(lifecycle.complete(readyRequest), true)
  assert.equal(snapshots.at(-1).isWaiting, false)
  assert.equal(scheduler.activeTimerCount(), 0)
})

test('a recovered preparation failure starts normal pending polls without losing elapsed time', () => {
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

  const failedPreparation = lifecycle.startRequest()
  scheduler.advance(16_000)
  assert.equal(lifecycle.markPending(failedPreparation, 4_000), true)
  scheduler.advance(4_000)
  assert.equal(polls, 1)

  const acceptedPreparation = lifecycle.startRequest()
  assert.equal(
    lifecycle.markPending(acceptedPreparation, 4_000, { resetBackoff: true }),
    true,
  )
  scheduler.advance(4_000)
  assert.equal(polls, 2)
  assert.equal(snapshots.at(-1).elapsedSeconds, 24)
  const readyRequest = lifecycle.startRequest()
  assert.equal(lifecycle.complete(readyRequest), true)
  assert.equal(scheduler.activeTimerCount(), 0)
})

test('a transient rate limit during generation preserves the wait and its measurement', async () => {
  const script = await readFile(
    new URL('../src/scripts/alpha-diary.ts', import.meta.url),
    'utf8',
  )
  const start = script.indexOf("      if (payload.status === 'rate_limited') {")
  const end = script.indexOf("\n      if (payload.status === 'future')", start)
  assert.ok(start >= 0 && end > start)
  const branch = script.slice(start, end)
  const applyRateLimit = new Function(
    'hasPendingEntry',
    `const payload = { status: 'rate_limited', retryAfter: 30 };
     const performance = { now: () => 1_000 };
     const requestId = 1;
     let rateLimitStreak = 0;
     let pendingRateLimitUntil = 0;
     const calls = [];
     const waitLifecycle = {
       markPending(id, delay) { calls.push(['pending', id, delay]); },
       complete(id) { calls.push(['complete', id]); }
     };
     const finalizeLoadMeasurement = (outcome) => calls.push(['finalize', outcome]);
     const beginRateLimit = (seconds) => calls.push(['rateLimit', seconds]);
     (function () { ${branch} })();
     return { calls, pendingRateLimitUntil, rateLimitStreak };`,
  )
  assert.deepEqual(applyRateLimit(true), {
    calls: [['pending', 1, 30_000]],
    pendingRateLimitUntil: 31_000,
    rateLimitStreak: 1,
  })
  assert.deepEqual(applyRateLimit(false).calls, [
    ['complete', 1],
    ['finalize', 'failed'],
    ['rateLimit', 30],
  ])
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

test('first historical preparation can return pending after the ordinary request limit', async () => {
  const scheduler = createScheduler()
  const historicalTimeout = diaryEntryRequestTimeoutMs(
    '2026-09-04',
    '2026-09-25',
    false,
  )
  assert.equal(historicalTimeout, 60_000)
  assert.equal(
    diaryEntryRequestTimeoutMs('2026-09-04', '2026-09-25', true),
    20_000,
  )
  assert.equal(
    diaryEntryRequestTimeoutMs('2026-09-25', '2026-09-25', false),
    20_000,
  )

  const request = withDiaryRequestTimeout(
    () =>
      new Promise((resolve) => {
        scheduler.setTimeout(() => resolve('pending'), 35_000)
      }),
    new AbortController().signal,
    historicalTimeout,
    scheduler,
  )
  scheduler.advance(35_000)
  assert.equal(await request, 'pending')
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

test('load measurement retains monotonic elapsed time, visibility time, and pending retry counts', () => {
  let monotonicNow = 1_000
  let wallClockNow = 1_726_000_000_000
  const lifecycle = new DiaryLoadMeasurementLifecycle({
    clock: {
      monotonicNow: () => monotonicNow,
      wallClockNow: () => wallClockNow,
    },
  })

  lifecycle.begin({ hidden: false })
  lifecycle.recordRequest()
  monotonicNow = 3_500
  lifecycle.recordPending()
  lifecycle.setHidden(true)
  monotonicNow = 6_000
  lifecycle.recordManualCheck()
  lifecycle.recordRequest()
  monotonicNow = 8_500
  lifecycle.setHidden(false)
  lifecycle.recordPending()
  monotonicNow = 11_000

  assert.deepEqual(lifecycle.finalize('ready'), {
    elapsedMs: 10_000,
    hiddenMs: 5_000,
    manualCheckCount: 1,
    outcome: 'ready',
    pendingCount: 2,
    requestCount: 2,
    startedAtWallClockMs: wallClockNow,
  })
  assert.equal(lifecycle.finalize('cancelled'), null)
  wallClockNow += 5_000
  assert.equal(lifecycle.isActive(), false)
})

test('discarding a fixture, future, or consent run leaves no metric to report', () => {
  const lifecycle = new DiaryLoadMeasurementLifecycle({
    clock: {
      monotonicNow: () => 1_000,
      wallClockNow: () => 1_726_000_000_000,
    },
  })

  lifecycle.begin({ hidden: false })
  lifecycle.recordRequest()
  lifecycle.discard()

  assert.equal(lifecycle.finalize('cancelled'), null)
})

test('a BFCache return reloads one incomplete date and never reloads an already-ready page', () => {
  const lifecycle = new DiaryBfcacheResumeLifecycle()

  lifecycle.recordPageHide('2026-09-14', true)
  assert.equal(lifecycle.takePersistedPageShow(true), '2026-09-14')
  assert.equal(lifecycle.takePersistedPageShow(true), null)

  lifecycle.recordPageHide('2026-09-14', false)
  assert.equal(lifecycle.takePersistedPageShow(true), null)

  lifecycle.recordPageHide('2026-09-14', true)
  assert.equal(lifecycle.takePersistedPageShow(false), null)
})

test('measurement reports the bounded anonymous contract with a non-blocking keepalive request', () => {
  const sent = []
  const measurement = {
    elapsedMs: 42_000,
    hiddenMs: 2_000,
    manualCheckCount: 1,
    outcome: 'ready',
    pendingCount: 10,
    requestCount: 11,
    startedAtWallClockMs: 1_726_000_000_000,
  }

  assert.equal(
    reportDiaryLoadMeasurement(measurement, {
      eventId: () => '00000000-0000-4000-8000-000000000001',
      fetch: (input, init) => {
        sent.push({ input, init })
        return Promise.resolve(new Response(null, { status: 204 }))
      },
    }),
    true,
  )
  assert.equal(sent.length, 1)
  assert.equal(sent[0].input, DIARY_METRICS_ENDPOINT)
  assert.equal(sent[0].init.keepalive, true)
  assert.equal(sent[0].init.method, 'POST')
  assert.deepEqual(JSON.parse(sent[0].init.body), {
    elapsedMs: 42_000,
    eventId: '00000000-0000-4000-8000-000000000001',
    hiddenMs: 2_000,
    manualCheckCount: 1,
    outcome: 'ready',
    pendingCount: 10,
    release: 'diary-wait-v2',
    requestCount: 11,
    version: 1,
  })
})

test('page departure prefers a beacon and invalid measurements never send', async () => {
  let beaconBody
  let fetchCalls = 0
  const measurement = {
    elapsedMs: 1_000,
    hiddenMs: 400,
    manualCheckCount: 0,
    outcome: 'cancelled',
    pendingCount: 0,
    requestCount: 1,
    startedAtWallClockMs: 1_726_000_000_000,
  }

  assert.equal(
    reportDiaryLoadMeasurement(measurement, {
      eventId: () => '00000000-0000-4000-8000-000000000002',
      fetch: () => {
        fetchCalls += 1
        return Promise.resolve(new Response())
      },
      preferBeacon: true,
      sendBeacon: (_endpoint, body) => {
        beaconBody = body
        return true
      },
    }),
    true,
  )
  assert.equal(fetchCalls, 0)
  const serialized =
    typeof beaconBody === 'string' ? beaconBody : await beaconBody.text()
  assert.equal(JSON.parse(serialized).outcome, 'cancelled')
  assert.equal(
    reportDiaryLoadMeasurement(measurement, {
      eventId: () => '00000000-0000-4000-8000-000000000004',
      fetch: () => {
        fetchCalls += 1
        return Promise.resolve(new Response())
      },
      preferBeacon: true,
      sendBeacon: () => {
        throw new Error('BeaconUnavailable')
      },
    }),
    true,
  )
  assert.equal(fetchCalls, 1)
  assert.equal(
    reportDiaryLoadMeasurement(
      { ...measurement, elapsedMs: 1.5 },
      { eventId: () => '00000000-0000-4000-8000-000000000003' },
    ),
    false,
  )
})

test('pending retries keep the first server day across the JST boundary', async () => {
  const script = await readFile(
    new URL('../src/scripts/alpha-diary.ts', import.meta.url),
    'utf8',
  )
  const start = script.indexOf("      if (payload.status === 'pending') {")
  const end = script.indexOf(
    "\n      if (\n        payload.status === 'failed'",
    start,
  )
  assert.ok(start >= 0 && end > start)
  const branch = script.slice(start, end)
  // Execute the production pending branch without a browser or network.
  const applyPending = new Function(
    'date',
    'serverToday',
    'fixture',
    `let currentDate = date;
     const dateInput = { value: date };
     const payload = { status: 'pending', retryAfter: 4 };
     const requestId = 1;
     let transientFailureRetries = 0;
     let pendingCount = 0;
     let scheduled;
     const loadMeasurement = { recordPending() { pendingCount += 1; } };
     const waitLifecycle = {
       markPending(id, delay) { scheduled = { id, delay }; }
     };
     const readRetryAfter = (value) => value;
     (function () { ${branch} })();
     return {
       currentDate, inputDate: dateInput.value, pendingCount, scheduled
     };`,
  )
  const first = applyPending('', '2026-09-15', false)
  assert.deepEqual(first, {
    currentDate: '2026-09-15',
    inputDate: '2026-09-15',
    pendingCount: 1,
    scheduled: { id: 1, delay: 4_000 },
  })
  assert.deepEqual(applyPending(first.currentDate, '2026-09-16', false), first)
  const explicit = applyPending('2026-09-11', '2026-09-16', false)
  assert.equal(explicit.currentDate, '2026-09-11')
  assert.equal(explicit.inputDate, '2026-09-11')
  assert.equal(applyPending('', '2026-09-15', true).pendingCount, 0)
})
