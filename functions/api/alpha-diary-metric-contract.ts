export type DiaryMetric = {
  version: 1
  eventId: string
  release: string
  outcome: 'ready' | 'timeout' | 'failed' | 'cancelled'
  elapsedMs: number
  hiddenMs: number
  requestCount: number
  pendingCount: number
  manualCheckCount: number
}

export function parseDiaryMetric(value: unknown): DiaryMetric | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const v = value as Record<string, unknown>
  const keys = [
    'version',
    'eventId',
    'release',
    'outcome',
    'elapsedMs',
    'hiddenMs',
    'requestCount',
    'pendingCount',
    'manualCheckCount',
  ]
  if (
    Object.keys(v).length !== keys.length ||
    Object.keys(v).some((key) => !keys.includes(key))
  )
    return null
  if (
    v.version !== 1 ||
    typeof v.eventId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      v.eventId,
    ) ||
    v.release !== 'diary-wait-v2' ||
    typeof v.outcome !== 'string' ||
    !['ready', 'timeout', 'failed', 'cancelled'].includes(v.outcome) ||
    !integer(v.elapsedMs, 0, 86_400_000) ||
    !integer(v.hiddenMs, 0, v.elapsedMs as number) ||
    !integer(v.requestCount, 1, 10_000) ||
    !integer(v.pendingCount, 0, v.requestCount as number) ||
    !integer(v.manualCheckCount, 0, v.requestCount as number)
  )
    return null
  return v as DiaryMetric
}

function integer(value: unknown, min: number, max: number): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  )
}

export async function readDiaryMetric(
  request: Request,
): Promise<DiaryMetric | null> {
  if (
    request.headers.get('Content-Type')?.split(';')[0].trim() !==
      'application/json' ||
    !request.body
  )
    return null
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 2048) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    return parseDiaryMetric(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}
