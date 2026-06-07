const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const LOCAL_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/

export function parseCmsDateTime(value: string | undefined): Date | undefined {
  if (!value) return undefined

  const raw = value.trim()
  if (!raw) return undefined

  const normalized = DATE_ONLY_PATTERN.test(raw)
    ? `${raw}T00:00:00+09:00`
    : LOCAL_DATETIME_PATTERN.test(raw)
      ? `${raw}+09:00`
      : raw
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function isWithinPublicationWindow(
  startsAt: string | undefined,
  endsAt: string | undefined,
  now = new Date(),
): boolean {
  const start = parseCmsDateTime(startsAt)
  const end = parseCmsDateTime(endsAt)

  if (start && now < start) return false
  if (end && now > end) return false

  return true
}
