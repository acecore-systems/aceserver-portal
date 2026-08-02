import {
  ALPHA_LORE_SCHEMA_VERSION,
  parseAlphaLoreFragment,
  type AlphaLoreFact,
  type AlphaLoreFragment,
} from './alpha-lore-schema.ts'

export const ALPHA_LORE_WORLD_ID = 'alpha'
export const ALPHA_LORE_CONSTITUTION_VERSION = 1

export type StoredAlphaLoreFact = AlphaLoreFact & {
  sourceRevisionId: string
}

export type StoredAlphaLoreRevision = AlphaLoreFragment & {
  constitutionVersion: number
  createdAt: string
  id: string
  model: string
  promptVersion: string
  reasoningEffort: string
  revision: number
  schemaVersion: number
}

export type AlphaLoreContext = {
  constitution: Record<string, unknown>
  constitutionVersion: number
  currentRevision: number
  facts: StoredAlphaLoreFact[]
  revisions: StoredAlphaLoreRevision[]
}

export type AlphaLoreGenerationOutcome =
  'busy' | 'conflict' | 'created' | 'failed' | 'rejected' | 'reused'

export type AlphaLoreCommitResult =
  | { outcome: 'created'; revision: StoredAlphaLoreRevision }
  | { outcome: 'reused'; revision: StoredAlphaLoreRevision }
  | { outcome: 'conflict' }

export interface AlphaLoreStore {
  acquireGenerationLease(ownerToken: string, now: Date): Promise<boolean>
  commitFragment(input: {
    candidate: AlphaLoreFragment
    constitutionVersion: number
    continuationOfRevisionId: string | null
    enqueueVector: boolean
    expectedRevision: number
    leaseOwnerToken: string
    model: string
    promptVersion: string
    reasoningEffort: string
    createdAt: Date
  }): Promise<AlphaLoreCommitResult>
  getContext(extraRevisionIds?: string[]): Promise<AlphaLoreContext>
  getRevisionByCoverageKey(
    coverageKey: string,
  ): Promise<StoredAlphaLoreRevision | null>
  getRevisionsByIds(ids: string[]): Promise<StoredAlphaLoreRevision[]>
  listPendingVectorRevisions(
    limit?: number,
    now?: Date,
  ): Promise<StoredAlphaLoreRevision[]>
  listRecentRevisions(limit?: number): Promise<StoredAlphaLoreRevision[]>
  markVectorFailed(
    revisionId: string,
    errorCode: string,
    retryAt: Date,
  ): Promise<void>
  markVectorSynced(revisionId: string, syncedAt: Date): Promise<void>
  recordGenerationEvent(input: {
    coverageKey?: string | null
    errorCode?: string | null
    outcome: AlphaLoreGenerationOutcome
    revisionId?: string | null
    createdAt?: Date
  }): Promise<void>
  releaseGenerationLease(ownerToken: string): Promise<void>
}

type WorldRow = {
  constitution_json: string
  constitution_version: number
  current_revision: number
}

type RevisionRow = {
  body_ja: string
  constitution_version: number
  coverage_key: string
  created_at: string
  era: AlphaLoreFragment['era']
  facts_json: string
  granularity: 'fragment'
  id: string
  model: string
  next_hook_ja: string | null
  prompt_version: string
  reasoning_effort: string
  related_revision_ids_json: string
  revision_no: number
  schema_version: number
  summary_ja: string
  title_ja: string
}

type FactRow = {
  fact_key: string
  kind: AlphaLoreFact['kind']
  source_revision_id: string
  value_ja: string
}

const REVISION_COLUMNS = `
  id,
  revision_no,
  coverage_key,
  granularity,
  era,
  title_ja,
  summary_ja,
  body_ja,
  next_hook_ja,
  facts_json,
  related_revision_ids_json,
  model,
  reasoning_effort,
  prompt_version,
  schema_version,
  constitution_version,
  created_at
`

export class D1AlphaLoreStore implements AlphaLoreStore {
  database: D1Database

  constructor(database: D1Database) {
    this.database = database
  }

  async getRevisionByCoverageKey(
    coverageKey: string,
  ): Promise<StoredAlphaLoreRevision | null> {
    const row = await this.database
      .prepare(
        `SELECT ${REVISION_COLUMNS}
         FROM alpha_lore_revisions
         WHERE world_id = ?1 AND coverage_key = ?2 AND status = 'active'
         LIMIT 1`,
      )
      .bind(ALPHA_LORE_WORLD_ID, coverageKey)
      .first<RevisionRow>()
    return row ? mapRevisionRow(row) : null
  }

  async getRevisionsByIds(ids: string[]): Promise<StoredAlphaLoreRevision[]> {
    const uniqueIds = [...new Set(ids)].slice(0, 20)
    if (uniqueIds.length === 0) return []

    const placeholders = uniqueIds.map((_, index) => `?${index + 2}`).join(', ')
    const result = await this.database
      .prepare(
        `SELECT ${REVISION_COLUMNS}
         FROM alpha_lore_revisions
         WHERE world_id = ?1 AND status = 'active' AND id IN (${placeholders})`,
      )
      .bind(ALPHA_LORE_WORLD_ID, ...uniqueIds)
      .all<RevisionRow>()
    const rowsById = new Map(
      result.results.map((row) => [row.id, mapRevisionRow(row)]),
    )
    return uniqueIds
      .map((id) => rowsById.get(id))
      .filter((revision): revision is StoredAlphaLoreRevision =>
        Boolean(revision),
      )
  }

  async listRecentRevisions(limit = 12): Promise<StoredAlphaLoreRevision[]> {
    const safeLimit = Math.max(1, Math.min(30, Math.trunc(limit)))
    const result = await this.database
      .prepare(
        `SELECT ${REVISION_COLUMNS}
         FROM alpha_lore_revisions
         WHERE world_id = ?1 AND status = 'active'
         ORDER BY revision_no DESC
         LIMIT ?2`,
      )
      .bind(ALPHA_LORE_WORLD_ID, safeLimit)
      .all<RevisionRow>()
    return result.results.map(mapRevisionRow)
  }

  async getContext(extraRevisionIds: string[] = []): Promise<AlphaLoreContext> {
    const [worldResult, revisionResult, factResult] = await this.database.batch(
      [
        this.database
          .prepare(
            `SELECT current_revision, constitution_json, constitution_version
           FROM alpha_lore_world
           WHERE id = ?1
           LIMIT 1`,
          )
          .bind(ALPHA_LORE_WORLD_ID),
        this.database
          .prepare(
            `SELECT ${REVISION_COLUMNS}
           FROM alpha_lore_revisions
           WHERE world_id = ?1 AND status = 'active'
           ORDER BY revision_no DESC
           LIMIT 12`,
          )
          .bind(ALPHA_LORE_WORLD_ID),
        this.database
          .prepare(
            `SELECT fact_key, value_ja, kind, source_revision_id
           FROM alpha_lore_facts
           WHERE world_id = ?1 AND status = 'active'
           ORDER BY CASE kind WHEN 'foundational' THEN 0 ELSE 1 END, created_at DESC`,
          )
          .bind(ALPHA_LORE_WORLD_ID),
      ],
    )

    const world = (worldResult.results as WorldRow[])[0]
    if (!world) throw namedError('AlphaLoreWorldMissingError')

    const recentRevisions = (revisionResult.results as RevisionRow[]).map(
      mapRevisionRow,
    )
    const missingIds = [...new Set(extraRevisionIds)].filter(
      (id) => !recentRevisions.some((revision) => revision.id === id),
    )
    const additionalRevisions = await this.getRevisionsByIds(missingIds)

    return {
      constitution: parseJsonObject(
        world.constitution_json,
        'AlphaLoreConstitutionJsonError',
      ),
      constitutionVersion: world.constitution_version,
      currentRevision: world.current_revision,
      facts: (factResult.results as FactRow[]).map((row) => ({
        fact_key: row.fact_key,
        kind: row.kind,
        sourceRevisionId: row.source_revision_id,
        value_ja: row.value_ja,
      })),
      revisions: deduplicateRevisions([
        ...additionalRevisions,
        ...recentRevisions,
      ]),
    }
  }

  async acquireGenerationLease(
    ownerToken: string,
    now: Date,
  ): Promise<boolean> {
    const expiresAt = new Date(now.getTime() + 3 * 60_000).toISOString()
    const result = await this.database
      .prepare(
        `INSERT INTO alpha_lore_generation_locks (
           world_id, owner_token, expires_at, created_at
         ) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(world_id) DO UPDATE SET
           owner_token = excluded.owner_token,
           expires_at = excluded.expires_at,
           created_at = excluded.created_at
         WHERE alpha_lore_generation_locks.expires_at <= ?4`,
      )
      .bind(ALPHA_LORE_WORLD_ID, ownerToken, expiresAt, now.toISOString())
      .run()
    return result.meta.changes === 1
  }

  async releaseGenerationLease(ownerToken: string): Promise<void> {
    await this.database
      .prepare(
        `DELETE FROM alpha_lore_generation_locks
         WHERE world_id = ?1 AND owner_token = ?2`,
      )
      .bind(ALPHA_LORE_WORLD_ID, ownerToken)
      .run()
  }

  async commitFragment({
    candidate,
    constitutionVersion,
    continuationOfRevisionId,
    enqueueVector,
    expectedRevision,
    leaseOwnerToken,
    model,
    promptVersion,
    reasoningEffort,
    createdAt,
  }: Parameters<
    AlphaLoreStore['commitFragment']
  >[0]): Promise<AlphaLoreCommitResult> {
    const revisionId = crypto.randomUUID()
    const revisionNumber = expectedRevision + 1
    const createdAtIso = createdAt.toISOString()
    const factsJson = JSON.stringify(candidate.facts)
    const relatedRevisionIdsJson = JSON.stringify(
      candidate.related_revision_ids,
    )

    const statements: D1PreparedStatement[] = [
      this.database
        .prepare(
          `INSERT INTO alpha_lore_revisions (
             id, world_id, revision_no, coverage_key, granularity, era,
             title_ja, summary_ja, body_ja, next_hook_ja, facts_json,
             related_revision_ids_json, status, model, reasoning_effort,
             prompt_version, schema_version, constitution_version, created_at
           )
           SELECT
             ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12,
             'active', ?13, ?14, ?15, ?16, ?17, ?18
           WHERE EXISTS (
             SELECT 1 FROM alpha_lore_world
             WHERE id = ?2 AND current_revision = ?19
           )
           AND NOT EXISTS (
             SELECT 1 FROM alpha_lore_revisions
             WHERE world_id = ?2 AND coverage_key = ?4 AND status = 'active'
           )`,
        )
        .bind(
          revisionId,
          ALPHA_LORE_WORLD_ID,
          revisionNumber,
          candidate.coverage_key,
          candidate.granularity,
          candidate.era,
          candidate.title_ja,
          candidate.summary_ja,
          candidate.body_ja,
          candidate.next_hook_ja,
          factsJson,
          relatedRevisionIdsJson,
          model,
          reasoningEffort,
          promptVersion,
          ALPHA_LORE_SCHEMA_VERSION,
          constitutionVersion,
          createdAtIso,
          expectedRevision,
        ),
    ]

    for (const fact of candidate.facts) {
      statements.push(
        this.database
          .prepare(
            `INSERT INTO alpha_lore_facts (
               id, world_id, fact_key, value_ja, kind, status,
               source_revision_id, created_at
             )
             SELECT ?1, ?2, ?3, ?4, ?5, 'active', ?6, ?7
             WHERE EXISTS (
               SELECT 1 FROM alpha_lore_revisions WHERE id = ?6
             )`,
          )
          .bind(
            crypto.randomUUID(),
            ALPHA_LORE_WORLD_ID,
            fact.fact_key,
            fact.value_ja,
            fact.kind,
            revisionId,
            createdAtIso,
          ),
      )
    }

    for (const referencedRevisionId of candidate.related_revision_ids) {
      statements.push(
        this.database
          .prepare(
            `INSERT INTO alpha_lore_revision_refs (
               revision_id, referenced_revision_id, relation, created_at
             )
             SELECT ?1, ?2, ?3, ?4
             WHERE EXISTS (
               SELECT 1 FROM alpha_lore_revisions WHERE id = ?1
             )`,
          )
          .bind(
            revisionId,
            referencedRevisionId,
            referencedRevisionId === continuationOfRevisionId
              ? 'continues'
              : 'context',
            createdAtIso,
          ),
      )
    }

    statements.push(
      this.database
        .prepare(
          `UPDATE alpha_lore_world
           SET current_revision = ?1, updated_at = ?2
           WHERE id = ?3 AND current_revision = ?4
             AND EXISTS (
               SELECT 1 FROM alpha_lore_revisions WHERE id = ?5
             )`,
        )
        .bind(
          revisionNumber,
          createdAtIso,
          ALPHA_LORE_WORLD_ID,
          expectedRevision,
          revisionId,
        ),
    )

    if (enqueueVector) {
      statements.push(
        this.database
          .prepare(
            `INSERT INTO alpha_lore_vector_outbox (
               revision_id, operation, status, attempt_count,
               available_at, created_at, updated_at
             )
             SELECT ?1, 'upsert', 'pending', 0, ?2, ?2, ?2
             WHERE EXISTS (
               SELECT 1 FROM alpha_lore_revisions WHERE id = ?1
             )`,
          )
          .bind(revisionId, createdAtIso),
      )
    }

    statements.push(
      this.database
        .prepare(
          `INSERT INTO alpha_lore_generation_events (
             id, world_id, outcome, coverage_key, revision_id,
             error_code, created_at
           )
           SELECT ?1, ?2, 'created', ?3, ?4, NULL, ?5
           WHERE EXISTS (
             SELECT 1 FROM alpha_lore_revisions WHERE id = ?4
           )`,
        )
        .bind(
          crypto.randomUUID(),
          ALPHA_LORE_WORLD_ID,
          candidate.coverage_key,
          revisionId,
          createdAtIso,
        ),
      this.database
        .prepare(
          `DELETE FROM alpha_lore_generation_locks
           WHERE world_id = ?1 AND owner_token = ?2`,
        )
        .bind(ALPHA_LORE_WORLD_ID, leaseOwnerToken),
    )

    const results = await this.database.batch(statements)
    if (results[0]?.meta.changes === 1) {
      const revision = await this.getRevisionByCoverageKey(
        candidate.coverage_key,
      )
      if (!revision) throw namedError('AlphaLoreCommitReadError')
      return { outcome: 'created', revision }
    }

    const existingRevision = await this.getRevisionByCoverageKey(
      candidate.coverage_key,
    )
    return existingRevision
      ? { outcome: 'reused', revision: existingRevision }
      : { outcome: 'conflict' }
  }

  async recordGenerationEvent({
    coverageKey = null,
    errorCode = null,
    outcome,
    revisionId = null,
    createdAt = new Date(),
  }: Parameters<AlphaLoreStore['recordGenerationEvent']>[0]): Promise<void> {
    await this.database
      .prepare(
        `INSERT INTO alpha_lore_generation_events (
           id, world_id, outcome, coverage_key, revision_id,
           error_code, created_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .bind(
        crypto.randomUUID(),
        ALPHA_LORE_WORLD_ID,
        outcome,
        coverageKey,
        revisionId,
        errorCode,
        createdAt.toISOString(),
      )
      .run()
  }

  async listPendingVectorRevisions(
    limit = 3,
    now = new Date(),
  ): Promise<StoredAlphaLoreRevision[]> {
    const safeLimit = Math.max(1, Math.min(10, Math.trunc(limit)))
    const result = await this.database
      .prepare(
        `SELECT ${REVISION_COLUMNS.replaceAll('\n  ', '\n  revision.')}
         FROM alpha_lore_vector_outbox AS outbox
         JOIN alpha_lore_revisions AS revision
           ON revision.id = outbox.revision_id
         WHERE outbox.status IN ('pending', 'retry')
           AND outbox.available_at <= ?1
           AND revision.status = 'active'
         ORDER BY outbox.available_at ASC
         LIMIT ?2`,
      )
      .bind(now.toISOString(), safeLimit)
      .all<RevisionRow>()
    return result.results.map(mapRevisionRow)
  }

  async markVectorSynced(revisionId: string, syncedAt: Date): Promise<void> {
    await this.database
      .prepare(
        `UPDATE alpha_lore_vector_outbox
         SET status = 'synced', attempt_count = attempt_count + 1,
             last_error_code = NULL, updated_at = ?2
         WHERE revision_id = ?1`,
      )
      .bind(revisionId, syncedAt.toISOString())
      .run()
  }

  async markVectorFailed(
    revisionId: string,
    errorCode: string,
    retryAt: Date,
  ): Promise<void> {
    await this.database
      .prepare(
        `UPDATE alpha_lore_vector_outbox
         SET status = 'retry', attempt_count = attempt_count + 1,
             available_at = ?2, last_error_code = ?3, updated_at = ?4
         WHERE revision_id = ?1`,
      )
      .bind(
        revisionId,
        retryAt.toISOString(),
        errorCode.slice(0, 80),
        new Date().toISOString(),
      )
      .run()
  }
}

function mapRevisionRow(row: RevisionRow): StoredAlphaLoreRevision {
  const fragment = parseAlphaLoreFragment({
    body_ja: row.body_ja,
    coverage_key: row.coverage_key,
    era: row.era,
    facts: parseJsonArray(row.facts_json, 'AlphaLoreFactsJsonError'),
    granularity: row.granularity,
    next_hook_ja: row.next_hook_ja,
    related_revision_ids: parseJsonArray(
      row.related_revision_ids_json,
      'AlphaLoreReferencesJsonError',
    ),
    summary_ja: row.summary_ja,
    title_ja: row.title_ja,
  })
  return {
    ...fragment,
    constitutionVersion: row.constitution_version,
    createdAt: row.created_at,
    id: row.id,
    model: row.model,
    promptVersion: row.prompt_version,
    reasoningEffort: row.reasoning_effort,
    revision: row.revision_no,
    schemaVersion: row.schema_version,
  }
}

function parseJsonArray(value: string, errorName: string): unknown[] {
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  throw namedError(errorName)
}

function parseJsonObject(
  value: string,
  errorName: string,
): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed
    }
  } catch {}
  throw namedError(errorName)
}

function deduplicateRevisions(
  revisions: StoredAlphaLoreRevision[],
): StoredAlphaLoreRevision[] {
  const seen = new Set<string>()
  return revisions.filter((revision) => {
    if (seen.has(revision.id)) return false
    seen.add(revision.id)
    return true
  })
}

function namedError(name: string): Error {
  const error = new Error(name)
  error.name = name
  return error
}
