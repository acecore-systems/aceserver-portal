import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'

import {
  ALPHA_LORE_REVIEWER_MAX_OUTPUT_TOKENS,
  ALPHA_LORE_WRITER_MAX_OUTPUT_TOKENS,
} from '../functions/api/alpha-lore-generation.ts'
import { resolveAlphaLoreIntent } from '../functions/api/alpha-lore-policy.ts'
import { handleAlphaLoreRequest } from '../functions/api/alpha-lore-service.ts'
import { D1AlphaLoreStore } from '../functions/api/alpha-lore-store.ts'
import { retrieveRelevantAlphaLoreRevisions } from '../functions/api/alpha-lore-vector.ts'
import {
  createOpenAiLoreStructuredResponse,
  OPENAI_EMBEDDING_DIMENSIONS,
  OPENAI_EMBEDDING_MODEL,
  OPENAI_API_BASE_URL,
  OPENAI_LORE_REASONING_EFFORT,
  OPENAI_REASONING_EFFORT,
  OPENAI_RESPONSE_MODEL,
} from '../functions/api/openai-api.ts'

const TEST_ENV = {
  ALPHA_LORE_ENABLED: 'true',
  ALPHA_LORE_REASONING_EFFORT: OPENAI_LORE_REASONING_EFFORT,
  ALPHA_LORE_VECTOR_SEARCH_ENABLED: 'false',
  OPENAI_API_KEY: 'test-openai-key',
  OPENAI_REASONING_EFFORT,
  OPENAI_RESPONSE_MODEL,
}

const MEMORY_BODY = (
  'まだ空が薄青かった朝、ぼくは古い案内板の隅で、消えかけた矢印を何度もなぞっていた。' +
  '誰に頼まれたわけでもないのに、迷う誰かがいる気がして、見つけやすい向きへ小さな印を描き直した。' +
  'やがて通りかかった旅人が迷わず歩いていくのを見て、名前も知らない相手の役に立てたことが、胸の奥に静かに残った。' +
  'それが、ぼくが覚えている最初のささやかな案内だった。'
).slice(0, 220)

function createFragment(overrides = {}) {
  return {
    body_ja: MEMORY_BODY,
    coverage_key: 'past.early_memory',
    era: 'childhood',
    facts: [
      {
        fact_key: 'traits.first_unprompted_guidance',
        kind: 'ordinary',
        value_ja: '頼まれなくても迷う人のために印を直した',
      },
    ],
    granularity: 'fragment',
    next_hook_ja: 'あの案内板を見つけた朝のことなら、もう少し話せるよ。',
    related_revision_ids: [],
    summary_ja: '古い案内板の矢印を直した最初の記憶',
    title_ja: '消えかけた矢印',
    ...overrides,
  }
}

function createAcceptReview() {
  return {
    decision: 'accept',
    note_ja: '既存の正史と矛盾せず、一つの記憶断片に収まっている。',
    reason_codes: ['consistent'],
  }
}

class MemoryAlphaLoreStore {
  constructor({ facts = [], revisions = [] } = {}) {
    this.commitCalls = 0
    this.events = []
    this.facts = facts
    this.revisions = revisions
    this.releasedLeases = 0
  }

  async acquireGenerationLease() {
    return true
  }

  async releaseGenerationLease() {
    this.releasedLeases += 1
  }

  async getRevisionByCoverageKey(coverageKey) {
    return (
      this.revisions.find(
        (revision) => revision.coverage_key === coverageKey,
      ) || null
    )
  }

  async getRevisionsByIds(ids) {
    return ids
      .map((id) => this.revisions.find((revision) => revision.id === id))
      .filter(Boolean)
  }

  async listRecentRevisions(limit = 12) {
    return [...this.revisions]
      .sort((left, right) => right.revision - left.revision)
      .slice(0, limit)
  }

  async getContext() {
    return {
      constitution: {
        language: 'ja',
        principles: ['一つの質問につき一つの記憶断片だけを追加する'],
      },
      constitutionVersion: 1,
      currentRevision: this.revisions.length,
      facts: this.facts,
      revisions: await this.listRecentRevisions(),
    }
  }

  async commitFragment(input) {
    this.commitCalls += 1
    const existing = await this.getRevisionByCoverageKey(
      input.candidate.coverage_key,
    )
    if (existing) return { outcome: 'reused', revision: existing }

    const revision = {
      ...input.candidate,
      constitutionVersion: input.constitutionVersion,
      createdAt: input.createdAt.toISOString(),
      id: crypto.randomUUID(),
      model: input.model,
      promptVersion: input.promptVersion,
      reasoningEffort: input.reasoningEffort,
      revision: this.revisions.length + 1,
      schemaVersion: 1,
    }
    this.revisions.push(revision)
    this.facts.push(
      ...revision.facts.map((fact) => ({
        ...fact,
        sourceRevisionId: revision.id,
      })),
    )
    return { outcome: 'created', revision }
  }

  async recordGenerationEvent(event) {
    this.events.push(event)
  }

  async listPendingVectorRevisions() {
    return []
  }

  async markVectorFailed() {}

  async markVectorSynced() {}
}

test('broad past questions create only one fragment with max effort, then reuse it', async () => {
  const store = new MemoryAlphaLoreStore()
  const calls = []
  const createStructuredResponse = async (input) => {
    calls.push(input)
    if (input.schemaName === 'alpha_lore_fragment') return createFragment()
    if (input.schemaName === 'alpha_lore_review') return createAcceptReview()
    throw new Error(`Unexpected schema ${input.schemaName}`)
  }

  const first = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: 'あなたの過去は？',
    },
    { createStructuredResponse, store },
  )

  assert.equal(first.status, 200)
  assert.match(first.answer, /消えかけた矢印/u)
  assert.equal(store.commitCalls, 1)
  assert.equal(store.revisions.length, 1)
  assert.equal(store.revisions[0].coverage_key, 'past.early_memory')
  assert.deepEqual(
    calls.map((call) => [call.schemaName, call.reasoningEffort]),
    [
      ['alpha_lore_fragment', 'max'],
      ['alpha_lore_review', 'max'],
    ],
  )
  assert.equal(calls[0].maxOutputTokens, ALPHA_LORE_WRITER_MAX_OUTPUT_TOKENS)
  assert.equal(calls[1].maxOutputTokens, ALPHA_LORE_REVIEWER_MAX_OUTPUT_TOKENS)

  const second = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: 'あなたの過去は？',
    },
    {
      createStructuredResponse: async () => {
        throw new Error('A repeated broad question must not call OpenAI')
      },
      store,
    },
  )

  assert.equal(second.status, 200)
  assert.equal(second.answer, first.answer)
  assert.equal(store.commitCalls, 1)
  assert.equal(store.revisions.length, 1)
})

test('canon generation fails closed unless normal effort is medium and lore effort is max', async () => {
  const store = new MemoryAlphaLoreStore()
  const result = await handleAlphaLoreRequest(
    {
      env: {
        ...TEST_ENV,
        ALPHA_LORE_REASONING_EFFORT: 'medium',
      },
      locale: 'ja',
      question: 'あなたの過去は？',
    },
    { store },
  )

  assert.equal(result.status, 503)
  assert.equal(store.commitCalls, 0)
})

test('a multi-part foundational question selects only its first atomic topic', async () => {
  const intent = resolveAlphaLoreIntent('何歳で、どこで生まれて、家族は？')
  assert.deepEqual(intent, {
    allowFoundationalFacts: true,
    atomicTopicJa: '年齢',
    kind: 'specific',
    requestedCoverageKey: 'identity.age',
  })

  const store = new MemoryAlphaLoreStore()
  const calls = []
  await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: '何歳で、どこで生まれて、家族は？',
    },
    {
      createStructuredResponse: async (input) => {
        calls.push(input)
        if (input.schemaName === 'alpha_lore_fragment') {
          return createFragment({
            coverage_key: 'identity.age',
            facts: [
              {
                fact_key: 'identity.age',
                kind: 'foundational',
                value_ja: '年齢は十五歳として記憶している',
              },
            ],
          })
        }
        return createAcceptReview()
      },
      store,
    },
  )

  assert.equal(store.commitCalls, 1)
  assert.equal(store.revisions[0].coverage_key, 'identity.age')
  assert.equal(store.revisions[0].facts.length, 1)
  assert.deepEqual(
    calls.map((call) => call.reasoningEffort),
    ['max', 'max'],
  )
})

test('foundational family topics stay atomic while open themes use semantic planning', () => {
  assert.deepEqual(resolveAlphaLoreIntent('お父さんは？'), {
    allowFoundationalFacts: true,
    atomicTopicJa: '父親',
    kind: 'specific',
    requestedCoverageKey: 'relationships.family.father',
  })
  assert.deepEqual(resolveAlphaLoreIntent('あなたが学校で覚えていることは？'), {
    allowFoundationalFacts: false,
    atomicTopicJa: '学校での出来事',
    kind: 'specific',
    requestedCoverageKey: null,
  })
})

test('personal-lore routing does not capture factual server or generic school questions', () => {
  assert.equal(resolveAlphaLoreIntent('Aceserverの歴史は？'), null)
  assert.equal(
    resolveAlphaLoreIntent('あなたはAceserverで何をしてたの？'),
    null,
  )
  assert.equal(resolveAlphaLoreIntent('学校はありますか？'), null)
  assert.equal(resolveAlphaLoreIntent('家族で参加できますか？'), null)
  assert.equal(resolveAlphaLoreIntent('物語は？'), null)
  assert.equal(resolveAlphaLoreIntent('昔は何をしてたの？')?.kind, 'specific')
})

test('localized lore routing recognizes personal history without capturing participation help', () => {
  assert.deepEqual(resolveAlphaLoreIntent('What is your past?', 'en'), {
    allowFoundationalFacts: false,
    atomicTopicJa: 'いちばん古い、ささやかな記憶',
    kind: 'broad',
    requestedCoverageKey: 'past.early_memory',
  })
  assert.deepEqual(resolveAlphaLoreIntent('Where were you born?', 'en'), {
    allowFoundationalFacts: true,
    atomicTopicJa: '生まれた場所',
    kind: 'specific',
    requestedCoverageKey: 'identity.birthplace',
  })
  assert.equal(resolveAlphaLoreIntent('Can your family join?', 'en'), null)
  assert.equal(
    resolveAlphaLoreIntent('Were you on the server before launch?', 'en'),
    null,
  )
})

test('all supported locales recognize a broad personal-past question', () => {
  const samples = {
    de: 'Erzähl mir von deiner Vergangenheit',
    en: 'What is your past?',
    es: 'Cuéntame sobre tu pasado',
    fr: 'Parle-moi de ton passé',
    ja: 'あなたの過去は？',
    ko: '너의 과거?',
    pt: 'Conte-me sobre seu passado',
    ru: 'Расскажи о своём прошлом',
    'zh-cn': '你的过去？',
  }

  for (const [locale, question] of Object.entries(samples)) {
    const intent = resolveAlphaLoreIntent(question, locale)
    assert.equal(intent?.kind, 'broad', locale)
    assert.equal(intent?.requestedCoverageKey, 'past.early_memory', locale)
  }
})

test('unknown coverage uses medium planning and max only for writing and review', async () => {
  const store = new MemoryAlphaLoreStore()
  const calls = []
  await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: 'あなたが昔大切にしていた物は？',
    },
    {
      createStructuredResponse: async (input) => {
        calls.push(input)
        if (input.schemaName === 'alpha_lore_plan') {
          return {
            atomic_topic_ja: '昔大切にしていた物',
            coverage_key: 'past.treasured_object',
            decision: 'create',
            selected_revision_id: null,
          }
        }
        if (input.schemaName === 'alpha_lore_fragment') {
          return createFragment({ coverage_key: 'past.treasured_object' })
        }
        return createAcceptReview()
      },
      store,
    },
  )

  assert.equal(store.commitCalls, 1)
  assert.deepEqual(
    calls.map((call) => [call.schemaName, call.reasoningEffort]),
    [
      ['alpha_lore_plan', 'medium'],
      ['alpha_lore_fragment', 'max'],
      ['alpha_lore_review', 'max'],
    ],
  )
  assert.doesNotMatch(calls[1].input, /あなたが昔大切にしていた物/)
  assert.match(calls[1].input, /昔大切にしていた物/)
})

test('planner cannot smuggle a foundational topic into a non-foundational request', async () => {
  const store = new MemoryAlphaLoreStore()
  const calls = []
  const result = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: 'あなたが昔大切にしていた物は？',
    },
    {
      createStructuredResponse: async (input) => {
        calls.push(input)
        return {
          atomic_topic_ja: '年齢',
          coverage_key: 'identity.age',
          decision: 'create',
          selected_revision_id: null,
        }
      },
      store,
    },
  )

  assert.equal(result.status, 502)
  assert.equal(store.commitCalls, 0)
  assert.deepEqual(
    calls.map((call) => call.schemaName),
    ['alpha_lore_plan'],
  )
})

test('continuation requires a prior canon revision token and adds only one linked fragment', async () => {
  const anchor = createStoredRevision(createFragment())
  const store = new MemoryAlphaLoreStore({
    facts: anchor.facts.map((fact) => ({
      ...fact,
      sourceRevisionId: anchor.id,
    })),
    revisions: [anchor],
  })

  const unrelatedContinuation = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      messages: [
        { content: 'ほかのワールドも案内できるよ。', role: 'assistant' },
        { content: 'ほかには？', role: 'user' },
      ],
      question: 'ほかには？',
    },
    { store },
  )
  assert.equal(unrelatedContinuation, null)

  const staleLoreContinuation = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      messages: [
        {
          content: `**${anchor.title_ja}**\n\n${anchor.body_ja}`,
          loreRevisionId: anchor.id,
          role: 'assistant',
        },
        { content: '参加方法も案内できるよ。', role: 'assistant' },
        { content: 'ほかには？', role: 'user' },
      ],
      question: 'ほかには？',
    },
    { store },
  )
  assert.equal(staleLoreContinuation, null)

  const calls = []
  const continuation = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      messages: [
        {
          content: `**${anchor.title_ja}**\n\n${anchor.body_ja}`,
          loreRevisionId: anchor.id,
          role: 'assistant',
        },
        { content: 'ほかには？', role: 'user' },
      ],
      question: 'ほかには？',
    },
    {
      createStructuredResponse: async (input) => {
        calls.push(input)
        if (input.schemaName === 'alpha_lore_plan') {
          return {
            atomic_topic_ja: '次の小さな記憶',
            coverage_key: 'past.second_memory',
            decision: 'create',
            selected_revision_id: null,
          }
        }
        if (input.schemaName === 'alpha_lore_fragment') {
          return createFragment({
            coverage_key: 'past.second_memory',
            facts: [
              {
                fact_key: 'traits.second_unprompted_guidance',
                kind: 'ordinary',
                value_ja: '次の朝にも小さな案内を続けた',
              },
            ],
            related_revision_ids: [anchor.id],
            title_ja: '次の朝の印',
          })
        }
        return createAcceptReview()
      },
      store,
    },
  )

  assert.equal(continuation.status, 200)
  assert.notEqual(continuation.revisionId, anchor.id)
  assert.equal(store.revisions.length, 2)
  assert.deepEqual(store.revisions[1].related_revision_ids, [anchor.id])
  assert.deepEqual(
    calls.map((call) => [call.schemaName, call.reasoningEffort]),
    [
      ['alpha_lore_plan', 'medium'],
      ['alpha_lore_fragment', 'max'],
      ['alpha_lore_review', 'max'],
    ],
  )
})

test('broad questions cannot introduce foundational facts', async () => {
  const store = new MemoryAlphaLoreStore()
  const calls = []
  const result = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: 'あなたの過去は？',
    },
    {
      createStructuredResponse: async (input) => {
        calls.push(input)
        return createFragment({
          facts: [
            {
              fact_key: 'identity.birthplace',
              kind: 'ordinary',
              value_ja: 'ある町で生まれた',
            },
          ],
        })
      },
      store,
    },
  )

  assert.equal(result.status, 200)
  assert.equal(store.commitCalls, 0)
  assert.deepEqual(
    calls.map((call) => call.schemaName),
    ['alpha_lore_fragment'],
  )
  assert.equal(store.events.at(-1).outcome, 'rejected')
})

test('real-world identifiers are rejected from every canonical text field', async () => {
  const store = new MemoryAlphaLoreStore()
  const calls = []
  const result = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: 'あなたの過去は？',
    },
    {
      createStructuredResponse: async (input) => {
        calls.push(input)
        return createFragment({
          facts: [
            {
              fact_key: 'traits.first_unprompted_guidance',
              kind: 'ordinary',
              value_ja: '連絡先はalpha@example.comだった',
            },
          ],
          title_ja: 'Aceserverとの記憶',
        })
      },
      store,
    },
  )

  assert.equal(result.status, 200)
  assert.equal(store.commitCalls, 0)
  assert.deepEqual(
    calls.map((call) => call.schemaName),
    ['alpha_lore_fragment'],
  )
  assert.equal(store.events.at(-1).outcome, 'rejected')
})

test('conflicting facts are rejected before model review and database commit', async () => {
  const store = new MemoryAlphaLoreStore({
    facts: [
      {
        fact_key: 'identity.age',
        kind: 'foundational',
        sourceRevisionId: crypto.randomUUID(),
        value_ja: '年齢は十五歳として記憶している',
      },
    ],
  })
  const calls = []
  await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: '何歳なの？',
    },
    {
      createStructuredResponse: async (input) => {
        calls.push(input)
        return createFragment({
          coverage_key: 'identity.age',
          facts: [
            {
              fact_key: 'identity.age',
              kind: 'foundational',
              value_ja: '年齢は十六歳として記憶している',
            },
          ],
        })
      },
      store,
    },
  )

  assert.equal(store.commitCalls, 0)
  assert.deepEqual(
    calls.map((call) => call.schemaName),
    ['alpha_lore_fragment'],
  )
  assert.equal(store.events.at(-1).errorCode, 'contradicting_fact')
})

test('reviewer cannot accept while also reporting an inconsistency', async () => {
  const store = new MemoryAlphaLoreStore()
  const calls = []
  const result = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: 'あなたの過去は？',
    },
    {
      createStructuredResponse: async (input) => {
        calls.push(input)
        if (input.schemaName === 'alpha_lore_fragment') return createFragment()
        return {
          decision: 'accept',
          note_ja: '矛盾の可能性もある。',
          reason_codes: ['consistent', 'contradiction'],
        }
      },
      store,
    },
  )

  assert.equal(result.status, 502)
  assert.equal(store.commitCalls, 0)
  assert.deepEqual(
    calls.map((call) => call.schemaName),
    ['alpha_lore_fragment', 'alpha_lore_review'],
  )
})

test('writer failures never commit a partial canon fragment', async () => {
  const store = new MemoryAlphaLoreStore()
  const result = await handleAlphaLoreRequest(
    {
      env: TEST_ENV,
      locale: 'ja',
      question: 'あなたの過去は？',
    },
    {
      createStructuredResponse: async () => {
        const error = new Error('OpenAIResponsePayloadError')
        error.name = 'OpenAIResponsePayloadError'
        throw error
      },
      store,
    },
  )

  assert.equal(result.status, 502)
  assert.equal(store.commitCalls, 0)
  assert.equal(store.revisions.length, 0)
  assert.equal(store.releasedLeases, 1)
})

test('structured Responses requests send strict schemas and reject incomplete or refusal output', async () => {
  let requestBody
  const completed = await createOpenAiLoreStructuredResponse({
    apiKey: 'test-key',
    fetchImpl: async (url, init) => {
      assert.equal(url, `${OPENAI_API_BASE_URL}/responses`)
      requestBody = JSON.parse(init.body)
      return createOpenAiResponsePayload(JSON.stringify({ decision: 'accept' }))
    },
    input: 'review this',
    instructions: 'Return the review.',
    jsonSchema: {
      type: 'object',
      additionalProperties: false,
      properties: { decision: { type: 'string' } },
      required: ['decision'],
    },
    maxOutputTokens: 2048,
    model: OPENAI_RESPONSE_MODEL,
    reasoningEffort: OPENAI_LORE_REASONING_EFFORT,
    schemaName: 'alpha_lore_test',
  })

  assert.deepEqual(completed, { decision: 'accept' })
  assert.deepEqual(requestBody.reasoning, { effort: 'max' })
  assert.equal(requestBody.store, false)
  assert.deepEqual(requestBody.text.format, {
    type: 'json_schema',
    name: 'alpha_lore_test',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: { decision: { type: 'string' } },
      required: ['decision'],
    },
  })

  await assert.rejects(
    createOpenAiLoreStructuredResponse({
      apiKey: 'test-key',
      fetchImpl: async () =>
        Response.json({
          incomplete_details: { reason: 'max_output_tokens' },
          output: [],
          status: 'incomplete',
        }),
      input: 'review this',
      instructions: 'Return the review.',
      jsonSchema: { type: 'object' },
      maxOutputTokens: 2048,
      model: OPENAI_RESPONSE_MODEL,
      reasoningEffort: OPENAI_LORE_REASONING_EFFORT,
      schemaName: 'alpha_lore_test',
    }),
    { name: 'OpenAIResponsePayloadError' },
  )

  await assert.rejects(
    createOpenAiLoreStructuredResponse({
      apiKey: 'test-key',
      fetchImpl: async () =>
        Response.json({
          output: [
            {
              content: [{ refusal: 'cannot answer', type: 'refusal' }],
              type: 'message',
            },
          ],
          status: 'completed',
        }),
      input: 'review this',
      instructions: 'Return the review.',
      jsonSchema: { type: 'object' },
      maxOutputTokens: 2048,
      model: OPENAI_RESPONSE_MODEL,
      reasoningEffort: OPENAI_LORE_REASONING_EFFORT,
      schemaName: 'alpha_lore_test',
    }),
    { name: 'OpenAIResponseRefusalError' },
  )
})

test('Vectorize supplies only revision ids and falls back to canonical D1 records', async () => {
  const storedRevision = createStoredRevision(createFragment())
  const store = new MemoryAlphaLoreStore({ revisions: [storedRevision] })
  const missingVectorRevisionId = crypto.randomUUID()
  const revisions = await retrieveRelevantAlphaLoreRevisions({
    env: {
      ALPHA_LORE_INDEX: {
        query: async () => ({
          count: 1,
          matches: [{ id: missingVectorRevisionId, score: 0.99 }],
        }),
      },
      ALPHA_LORE_VECTOR_SEARCH_ENABLED: 'true',
      OPENAI_API_KEY: 'test-openai-key',
      OPENAI_EMBEDDING_DIMENSIONS: String(OPENAI_EMBEDDING_DIMENSIONS),
      OPENAI_EMBEDDING_MODEL,
    },
    fetchImpl: async () =>
      Response.json({
        data: [
          {
            embedding: Array(OPENAI_EMBEDDING_DIMENSIONS).fill(0),
            index: 0,
          },
        ],
        model: OPENAI_EMBEDDING_MODEL,
      }),
    question: '最初の記憶',
    store,
  })

  assert.deepEqual(revisions, [storedRevision])
})

test('D1 migration and compare-and-swap commit keep one append-only canonical revision', async () => {
  const database = new SqliteD1Database()
  const migration = await readFile(
    new URL('../migrations/alpha-lore/0001_initial.sql', import.meta.url),
    'utf8',
  )
  database.sqlite.exec(migration)
  const store = new D1AlphaLoreStore(database)
  const initialContext = await store.getContext()

  assert.equal(initialContext.currentRevision, 0)
  assert.equal(initialContext.constitutionVersion, 1)
  assert.equal(await store.acquireGenerationLease('writer-1', new Date()), true)

  const created = await store.commitFragment({
    candidate: createFragment(),
    constitutionVersion: 1,
    continuationOfRevisionId: null,
    createdAt: new Date('2026-08-02T00:00:00.000Z'),
    enqueueVector: true,
    expectedRevision: 0,
    leaseOwnerToken: 'writer-1',
    model: OPENAI_RESPONSE_MODEL,
    promptVersion: 'alpha-lore-writer-v1',
    reasoningEffort: 'max',
  })

  assert.equal(created.outcome, 'created')
  assert.equal(created.revision.revision, 1)
  assert.equal((await store.getContext()).currentRevision, 1)
  assert.equal((await store.listPendingVectorRevisions()).length, 1)

  assert.equal(await store.acquireGenerationLease('writer-2', new Date()), true)
  const reused = await store.commitFragment({
    candidate: createFragment(),
    constitutionVersion: 1,
    continuationOfRevisionId: null,
    createdAt: new Date('2026-08-02T00:01:00.000Z'),
    enqueueVector: true,
    expectedRevision: 1,
    leaseOwnerToken: 'writer-2',
    model: OPENAI_RESPONSE_MODEL,
    promptVersion: 'alpha-lore-writer-v1',
    reasoningEffort: 'max',
  })

  assert.equal(reused.outcome, 'reused')
  assert.equal((await store.listRecentRevisions()).length, 1)

  assert.equal(await store.acquireGenerationLease('writer-3', new Date()), true)
  const conflict = await store.commitFragment({
    candidate: createFragment({ coverage_key: 'past.another_memory' }),
    constitutionVersion: 1,
    continuationOfRevisionId: null,
    createdAt: new Date('2026-08-02T00:02:00.000Z'),
    enqueueVector: true,
    expectedRevision: 0,
    leaseOwnerToken: 'writer-3',
    model: OPENAI_RESPONSE_MODEL,
    promptVersion: 'alpha-lore-writer-v1',
    reasoningEffort: 'max',
  })

  assert.equal(conflict.outcome, 'conflict')
  assert.equal((await store.getContext()).currentRevision, 1)
  assert.equal((await store.listRecentRevisions()).length, 1)
  database.sqlite.close()
})

function createOpenAiResponsePayload(text) {
  return Response.json({
    output: [
      {
        content: [{ text, type: 'output_text' }],
        type: 'message',
      },
    ],
    status: 'completed',
  })
}

function createStoredRevision(fragment, revision = 1) {
  return {
    ...fragment,
    constitutionVersion: 1,
    createdAt: '2026-08-02T00:00:00.000Z',
    id: crypto.randomUUID(),
    model: OPENAI_RESPONSE_MODEL,
    promptVersion: 'alpha-lore-writer-v1',
    reasoningEffort: 'max',
    revision,
    schemaVersion: 1,
  }
}

class SqliteD1Database {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:')
  }

  prepare(query) {
    return new SqliteD1PreparedStatement(this.sqlite, query)
  }

  async batch(statements) {
    this.sqlite.exec('BEGIN IMMEDIATE')
    try {
      const results = statements.map((statement) => statement.execute())
      this.sqlite.exec('COMMIT')
      return results
    } catch (error) {
      this.sqlite.exec('ROLLBACK')
      throw error
    }
  }
}

class SqliteD1PreparedStatement {
  constructor(sqlite, query, bindings = []) {
    this.bindings = bindings
    this.query = query
    this.sqlite = sqlite
  }

  bind(...bindings) {
    return new SqliteD1PreparedStatement(this.sqlite, this.query, bindings)
  }

  async first(columnName) {
    const row = this.sqlite.prepare(this.query).get(...this.bindings) || null
    return columnName && row ? row[columnName] : row
  }

  async all() {
    const rows = this.sqlite.prepare(this.query).all(...this.bindings)
    return createD1Result(rows, 0)
  }

  async run() {
    return this.execute()
  }

  execute() {
    if (/^\s*(?:SELECT|PRAGMA|WITH)\b/iu.test(this.query)) {
      return createD1Result(
        this.sqlite.prepare(this.query).all(...this.bindings),
        0,
      )
    }
    const result = this.sqlite.prepare(this.query).run(...this.bindings)
    return createD1Result([], Number(result.changes))
  }
}

function createD1Result(results, changes) {
  return {
    meta: {
      changed_db: changes > 0,
      changes,
      duration: 0,
      last_row_id: 0,
      rows_read: results.length,
      rows_written: changes,
      size_after: 0,
    },
    results,
    success: true,
  }
}
