import {
  generateAlphaLoreFragment,
  planAlphaLoreCoverage,
  reviewAlphaLoreFragment,
  type AlphaLoreOpenAiEnv,
  type AlphaLoreStructuredResponseCreator,
  ALPHA_LORE_WRITER_PROMPT_VERSION,
} from './alpha-lore-generation.ts'
import {
  resolveAlphaLoreIntent,
  validateAlphaLoreCandidate,
  type AlphaLoreIntent,
} from './alpha-lore-policy.ts'
import {
  D1AlphaLoreStore,
  type AlphaLoreStore,
  type StoredAlphaLoreRevision,
} from './alpha-lore-store.ts'
import {
  isAlphaLoreVectorEnabled,
  retrieveRelevantAlphaLoreRevisions,
  syncAlphaLoreVectorOutbox,
  type AlphaLoreVectorEnv,
} from './alpha-lore-vector.ts'
import { TARGET_LANGUAGES } from './alpha-locales.ts'
import {
  createOpenAiResponse,
  OPENAI_LORE_REASONING_EFFORT,
  OPENAI_REASONING_EFFORT,
  OPENAI_RESPONSE_MODEL,
} from './openai-api.ts'

export type AlphaLoreEnv = AlphaLoreOpenAiEnv &
  AlphaLoreVectorEnv & {
    ALPHA_LORE_DB?: D1Database
    ALPHA_LORE_ENABLED?: string
  }

export type AlphaLoreHandledResult = {
  answer: string
  ok: boolean
  revisionId?: string
  status: number
}

type AlphaLoreServiceDependencies = {
  createStructuredResponse?: AlphaLoreStructuredResponseCreator
  now?: () => Date
  randomUUID?: () => string
  retrieveRelevantRevisions?: typeof retrieveRelevantAlphaLoreRevisions
  store?: AlphaLoreStore
}

const LORE_MESSAGES = {
  ja: {
    busy: 'いま別の記憶をひとつ整理しているところなんだ。少し待ってから、もう一度聞いてね。',
    failed:
      'その記憶はまだ辻褄を合わせきれなかったから、正史には残さなかったよ。少し言い方を変えて、もう一度聞いてみてね。',
    unconfigured: '正史をしまう場所がまだ準備できていないみたい。',
  },
  en: {
    busy: 'I am sorting out one other memory right now. Ask me again in a moment.',
    failed:
      'That memory did not fit the canon cleanly, so I did not save it. Try asking again a little differently.',
    unconfigured: 'The place where I keep canon is not ready yet.',
  },
} as const

export async function handleAlphaLoreRequest(
  {
    env,
    fetchImpl = globalThis.fetch,
    locale = 'ja',
    messages = [],
    question,
    waitUntil,
  }: {
    env: AlphaLoreEnv
    fetchImpl?: typeof globalThis.fetch
    locale?: string
    messages?: Array<{
      content?: unknown
      loreRevisionId?: unknown
      role?: unknown
    }>
    question: string
    waitUntil?: (promise: Promise<unknown>) => void
  },
  dependencies: AlphaLoreServiceDependencies = {},
): Promise<AlphaLoreHandledResult | null> {
  const intent = resolveAlphaLoreIntent(question, locale)
  if (!intent || env?.ALPHA_LORE_ENABLED !== 'true') return null

  const loreMessages = resolveLoreMessages(locale)
  if (
    env.ALPHA_LORE_REASONING_EFFORT !== OPENAI_LORE_REASONING_EFFORT ||
    env.OPENAI_REASONING_EFFORT !== OPENAI_REASONING_EFFORT ||
    env.OPENAI_RESPONSE_MODEL !== OPENAI_RESPONSE_MODEL
  ) {
    return { answer: loreMessages.unconfigured, ok: false, status: 503 }
  }
  const store =
    dependencies.store ||
    (env.ALPHA_LORE_DB ? new D1AlphaLoreStore(env.ALPHA_LORE_DB) : null)
  if (!store) {
    return { answer: loreMessages.unconfigured, ok: false, status: 503 }
  }

  const createStructuredResponse = dependencies.createStructuredResponse
  const retrieveRelevantRevisions =
    dependencies.retrieveRelevantRevisions || retrieveRelevantAlphaLoreRevisions
  const now = dependencies.now || (() => new Date())
  const randomUUID = dependencies.randomUUID || (() => crypto.randomUUID())
  const vectorEnabled = isAlphaLoreVectorEnabled(env)

  scheduleBackgroundTask(
    waitUntil,
    vectorEnabled
      ? () => syncAlphaLoreVectorOutbox({ env, fetchImpl, store })
      : null,
    'alpha_lore_vector_retry_error',
  )

  let leaseOwnerToken: string | null = null
  let plannedCoverageKey = intent.requestedCoverageKey
  let generationIntent = intent
  let continuationAnchor: StoredAlphaLoreRevision | null = null

  try {
    continuationAnchor =
      intent.kind === 'continuation'
        ? await resolveContinuationAnchor(messages, store)
        : null
    if (intent.kind === 'continuation' && !continuationAnchor) return null

    if (plannedCoverageKey) {
      const existing = await store.getRevisionByCoverageKey(plannedCoverageKey)
      if (existing) {
        await safelyRecordEvent(store, {
          coverageKey: plannedCoverageKey,
          outcome: 'reused',
          revisionId: existing.id,
        })
        return {
          answer: await renderAlphaLoreRevision(
            existing,
            locale,
            env,
            fetchImpl,
          ),
          ok: true,
          revisionId: existing.id,
          status: 200,
        }
      }
    }

    const candidates = await getPlanningCandidates({
      env,
      fetchImpl,
      intent,
      continuationAnchor,
      question,
      retrieveRelevantRevisions,
      store,
    })

    if (!plannedCoverageKey) {
      const plan = await planAlphaLoreCoverage({
        candidates,
        createStructuredResponse,
        env,
        fetchImpl,
        intent,
        question,
      })
      if (intent.kind === 'continuation' && plan.decision !== 'create') {
        throw namedError('AlphaLoreContinuationPlanError')
      }
      if (plan.decision === 'reuse') {
        const existing = candidates.find(
          (candidate) => candidate.id === plan.selected_revision_id,
        )!
        await safelyRecordEvent(store, {
          coverageKey: existing.coverage_key,
          outcome: 'reused',
          revisionId: existing.id,
        })
        return {
          answer: await renderAlphaLoreRevision(
            existing,
            locale,
            env,
            fetchImpl,
          ),
          ok: true,
          revisionId: existing.id,
          status: 200,
        }
      }
      plannedCoverageKey = plan.coverage_key
      generationIntent = {
        ...intent,
        atomicTopicJa: plan.atomic_topic_ja,
      }
    }

    const plannedExisting =
      await store.getRevisionByCoverageKey(plannedCoverageKey)
    if (plannedExisting) {
      await safelyRecordEvent(store, {
        coverageKey: plannedCoverageKey,
        outcome: 'reused',
        revisionId: plannedExisting.id,
      })
      return {
        answer: await renderAlphaLoreRevision(
          plannedExisting,
          locale,
          env,
          fetchImpl,
        ),
        ok: true,
        revisionId: plannedExisting.id,
        status: 200,
      }
    }

    leaseOwnerToken = randomUUID()
    const acquired = await store.acquireGenerationLease(leaseOwnerToken, now())
    if (!acquired) {
      await safelyRecordEvent(store, {
        coverageKey: plannedCoverageKey,
        outcome: 'busy',
      })
      return { answer: loreMessages.busy, ok: true, status: 200 }
    }

    const afterLeaseExisting =
      await store.getRevisionByCoverageKey(plannedCoverageKey)
    if (afterLeaseExisting) {
      await safelyRecordEvent(store, {
        coverageKey: plannedCoverageKey,
        outcome: 'reused',
        revisionId: afterLeaseExisting.id,
      })
      return {
        answer: await renderAlphaLoreRevision(
          afterLeaseExisting,
          locale,
          env,
          fetchImpl,
        ),
        ok: true,
        revisionId: afterLeaseExisting.id,
        status: 200,
      }
    }

    const context = await store.getContext(
      candidates.map((candidate) => candidate.id),
    )
    const continuationOfRevisionId = continuationAnchor?.id || null
    const candidate = await generateAlphaLoreFragment({
      context,
      createStructuredResponse,
      env,
      expectedCoverageKey: plannedCoverageKey,
      fetchImpl,
      intent: generationIntent,
    })
    const deterministicErrors = validateAlphaLoreCandidate({
      allowFoundationalFacts: intent.allowFoundationalFacts,
      allowedRelatedRevisionIds: new Set(
        context.revisions.map((revision) => revision.id),
      ),
      candidate,
      existingFacts: context.facts,
      expectedCoverageKey: plannedCoverageKey,
    })
    if (
      continuationOfRevisionId &&
      !candidate.related_revision_ids.includes(continuationOfRevisionId)
    ) {
      deterministicErrors.push('missing_continuation_reference')
    }
    if (deterministicErrors.length > 0) {
      await safelyRecordEvent(store, {
        coverageKey: plannedCoverageKey,
        errorCode: deterministicErrors[0],
        outcome: 'rejected',
      })
      return { answer: loreMessages.failed, ok: true, status: 200 }
    }

    const review = await reviewAlphaLoreFragment({
      candidate,
      context,
      createStructuredResponse,
      env,
      expectedCoverageKey: plannedCoverageKey,
      fetchImpl,
      intent: generationIntent,
    })
    if (review.decision !== 'accept') {
      await safelyRecordEvent(store, {
        coverageKey: plannedCoverageKey,
        errorCode: review.reason_codes[0] || 'model_review_reject',
        outcome: 'rejected',
      })
      return { answer: loreMessages.failed, ok: true, status: 200 }
    }

    const committed = await store.commitFragment({
      candidate,
      constitutionVersion: context.constitutionVersion,
      continuationOfRevisionId,
      createdAt: now(),
      enqueueVector: vectorEnabled,
      expectedRevision: context.currentRevision,
      leaseOwnerToken,
      model: env.OPENAI_RESPONSE_MODEL || OPENAI_RESPONSE_MODEL,
      promptVersion: ALPHA_LORE_WRITER_PROMPT_VERSION,
      reasoningEffort:
        env.ALPHA_LORE_REASONING_EFFORT || OPENAI_LORE_REASONING_EFFORT,
    })

    if (committed.outcome === 'conflict') {
      await safelyRecordEvent(store, {
        coverageKey: plannedCoverageKey,
        errorCode: 'revision_compare_and_swap',
        outcome: 'conflict',
      })
      return { answer: loreMessages.busy, ok: true, status: 200 }
    }

    if (committed.outcome === 'reused') {
      await safelyRecordEvent(store, {
        coverageKey: committed.revision.coverage_key,
        outcome: 'reused',
        revisionId: committed.revision.id,
      })
    } else {
      scheduleBackgroundTask(
        waitUntil,
        vectorEnabled
          ? () =>
              syncAlphaLoreVectorOutbox({
                env,
                fetchImpl,
                revisions: [committed.revision],
                store,
              })
          : null,
        'alpha_lore_vector_sync_error',
      )
    }

    return {
      answer: await renderAlphaLoreRevision(
        committed.revision,
        locale,
        env,
        fetchImpl,
      ),
      ok: true,
      revisionId: committed.revision.id,
      status: 200,
    }
  } catch (error) {
    const errorCode = getErrorCode(error)
    console.error(
      JSON.stringify({
        event: 'alpha_lore_request_error',
        errorCode,
      }),
    )
    await safelyRecordEvent(store, {
      coverageKey: plannedCoverageKey,
      errorCode,
      outcome: 'failed',
    })
    return { answer: loreMessages.failed, ok: false, status: 502 }
  } finally {
    if (leaseOwnerToken) {
      await store.releaseGenerationLease(leaseOwnerToken).catch((error) => {
        console.error(
          JSON.stringify({
            event: 'alpha_lore_lease_release_error',
            errorCode: getErrorCode(error),
          }),
        )
      })
    }
  }
}

async function getPlanningCandidates({
  continuationAnchor,
  env,
  fetchImpl,
  intent,
  question,
  retrieveRelevantRevisions,
  store,
}: {
  continuationAnchor: StoredAlphaLoreRevision | null
  env: AlphaLoreEnv
  fetchImpl: typeof globalThis.fetch
  intent: AlphaLoreIntent
  question: string
  retrieveRelevantRevisions: typeof retrieveRelevantAlphaLoreRevisions
  store: AlphaLoreStore
}) {
  if (intent.kind === 'broad') return []
  if (intent.kind === 'continuation') {
    const recent = await store.listRecentRevisions(6)
    return deduplicateRevisions([
      ...(continuationAnchor ? [continuationAnchor] : []),
      ...recent,
    ])
  }
  return retrieveRelevantRevisions({ env, fetchImpl, question, store })
}

async function renderAlphaLoreRevision(
  revision: StoredAlphaLoreRevision,
  locale: string,
  env: AlphaLoreEnv,
  fetchImpl: typeof globalThis.fetch,
): Promise<string> {
  const japanese = formatJapaneseRevision(revision)
  if (locale === 'ja' || !Object.hasOwn(TARGET_LANGUAGES, locale)) {
    return japanese
  }

  try {
    return await createOpenAiResponse({
      apiKey: env.OPENAI_API_KEY,
      fetchImpl,
      input: JSON.stringify({
        body_ja: revision.body_ja,
        next_hook_ja: revision.next_hook_ja,
        title_ja: revision.title_ja,
      }),
      instructions: [
        `Translate this established Alpha-kun canon faithfully into ${TARGET_LANGUAGES[locale]}.`,
        'Preserve every fact and uncertainty. Add no facts, explanations, links, dates, names, or real-world claims.',
        'Format the translated title in bold, followed by the body and then the optional next hook.',
      ].join('\n'),
      maxOutputTokens: 480,
      model: env.OPENAI_RESPONSE_MODEL || OPENAI_RESPONSE_MODEL,
      reasoningEffort: env.OPENAI_REASONING_EFFORT || OPENAI_REASONING_EFFORT,
    })
  } catch {
    return japanese
  }
}

function formatJapaneseRevision(revision: StoredAlphaLoreRevision): string {
  return [`**${revision.title_ja}**`, revision.body_ja, revision.next_hook_ja]
    .filter(Boolean)
    .join('\n\n')
}

async function resolveContinuationAnchor(
  messages: Array<{
    content?: unknown
    loreRevisionId?: unknown
    role?: unknown
  }>,
  store: AlphaLoreStore,
): Promise<StoredAlphaLoreRevision | null> {
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message?.role === 'assistant')
  const anchorId = lastAssistantMessage?.loreRevisionId
  if (typeof anchorId !== 'string') return null
  const [revision] = await store.getRevisionsByIds([anchorId])
  return revision || null
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

function resolveLoreMessages(locale: string) {
  return locale === 'ja' ? LORE_MESSAGES.ja : LORE_MESSAGES.en
}

async function safelyRecordEvent(
  store: AlphaLoreStore,
  input: Parameters<AlphaLoreStore['recordGenerationEvent']>[0],
) {
  await store.recordGenerationEvent(input).catch((error) => {
    console.error(
      JSON.stringify({
        event: 'alpha_lore_event_write_error',
        errorCode: getErrorCode(error),
      }),
    )
  })
}

function scheduleBackgroundTask(
  waitUntil: ((promise: Promise<unknown>) => void) | undefined,
  task: (() => Promise<unknown>) | null,
  event: string,
) {
  if (!waitUntil || !task) return
  waitUntil(
    task().catch((error) => {
      console.error(JSON.stringify({ event, errorCode: getErrorCode(error) }))
    }),
  )
}

function getErrorCode(error: unknown): string {
  return error instanceof Error && error.name ? error.name : 'provider_error'
}

function namedError(name: string): Error {
  const error = new Error(name)
  error.name = name
  return error
}
