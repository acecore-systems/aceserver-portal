export type SkinStage =
  | 'request'
  | 'verification'
  | 'quota'
  | 'cleanup'
  | 'ai'
  | 'completion'
  | 'design'
  | 'response'

// Never serialize exceptions: provider messages, stacks and Zod issues may
// contain user input. Only locally defined classifications leave this function.
export function failureCode(stage: SkinStage, error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError')
      return 'timeout'
    if (stage === 'completion') {
      if (error instanceof SyntaxError) return 'invalid_json'
      if (error.message === 'incomplete') return 'incomplete'
      return 'invalid_completion'
    }
    if (stage === 'design') {
      if (error.name === 'ZodError') return 'invalid_schema'
      if (
        ['face_grid', 'palette', 'skin_size', 'transparent_base'].includes(
          error.message,
        )
      )
        return error.message
      return 'invalid_design'
    }
  }
  return `${stage}_failed`
}

export function skinDiagnostics(db: D1Database, id: string) {
  const started = Date.now()
  let reserved = false
  return {
    reserve() {
      reserved = true
    },
    async record(stage: SkinStage, code: string, status: number) {
      const entry = {
        event: 'skin_maker',
        requestId: id,
        stage,
        code,
        status,
        elapsedMs: Math.max(0, Date.now() - started),
      }
      if (status >= 400) console.error(JSON.stringify(entry))
      else console.info(JSON.stringify(entry))
      // Only quota-approved attempts are persisted: at most 100 per UTC day.
      if (!reserved) return
      try {
        await db
          .prepare(
            `INSERT INTO skin_maker_diagnostics
          (id, created, stage, code, status, elapsed_ms) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET stage=excluded.stage,
          code=excluded.code, status=excluded.status, elapsed_ms=excluded.elapsed_ms`,
          )
          .bind(
            id,
            Math.floor(started / 1000),
            stage,
            code,
            status,
            entry.elapsedMs,
          )
          .run()
        await db
          .prepare('DELETE FROM skin_maker_diagnostics WHERE created < ?')
          .bind(Math.floor(started / 1000) - 7 * 86400)
          .run()
      } catch {
        // A failed log write must never replace the original generation result.
        console.error(
          JSON.stringify({
            event: 'skin_maker',
            requestId: id,
            stage: 'diagnostics',
            code: 'persistence_failed',
          }),
        )
      }
    },
  }
}
