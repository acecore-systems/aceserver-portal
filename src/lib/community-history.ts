// Match the JST dates displayed in the observation table, including manual runs.
export function activityDay(observedAt: string): number {
  return Math.floor((Date.parse(observedAt) + 9 * 3600_000) / 86400_000)
}
