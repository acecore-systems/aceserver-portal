export const OBSERVATION_MAX_AGE_MS = 6 * 60 * 60 * 1000

// Keep the observation's original time. A failed refresh must never make it newer.
export function observationState(value: unknown, now: number, failed = false) {
  const age = typeof value === 'string' ? now - Date.parse(value) : NaN
  if (!Number.isFinite(age) || age < -60_000 || age > OBSERVATION_MAX_AGE_MS)
    return 'unavailable'
  return failed || age > 5 * 60_000 ? 'stale' : 'fresh'
}
