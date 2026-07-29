import assert from 'node:assert/strict'
import test from 'node:test'

import {
  addGuideResourceLinks,
  buildConversationInput,
  buildWikiSearchQuery,
  isAllowedRequestOrigin,
  onRequestPost,
  trimIncompleteMarkdown,
} from '../functions/api/alpha-chat.js'
import {
  ACESERVER_WIKI_CORPUS_URL,
  buildWikiGroundingContext,
  searchAceserverWiki,
  WIKI_EMBEDDING_MODEL,
} from '../functions/api/alpha-wiki-search.js'

const ENDPOINT = 'https://asv.acecore.net/api/alpha-chat'
const WIKI_EMBEDDING = Array.from({ length: 1024 }, (_, index) => index / 1024)

function createRequest(payload, headers = {}) {
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://asv.acecore.net',
      'Sec-Fetch-Site': 'same-origin',
      ...headers,
    },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  })
}

test('uses the dialogue model and only stable navigation context', async () => {
  let invocation
  const env = {
    AI: {
      async run(model, input) {
        invocation = { model, input }
        return {
          choices: [
            {
              message: {
                content:
                  '参加方法は公式Discordで確認して、詳しい内容はAceserver WIKIを見てね。',
              },
            },
          ],
        }
      },
    },
  }

  const response = await onRequestPost({
    request: createRequest({ question: '参加方法を教えて' }),
    env,
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.ok, true)
  assert.match(body.answer, /\[公式Discord\]\(https:\/\/discord\.gg\/acsv\)/)
  assert.match(
    body.answer,
    /\[Aceserver WIKI\]\(https:\/\/asv-wiki\.acecore\.net\)/,
  )
  assert.equal(invocation.model, '@cf/zai-org/glm-4.7-flash')
  assert.equal(invocation.input.max_completion_tokens, 320)
  assert.deepEqual(invocation.input.chat_template_kwargs, {
    enable_thinking: false,
  })

  const systemPrompt = invocation.input.messages[0].content
  assert.match(systemPrompt, /https:\/\/discord\.gg\/acsv/)
  assert.match(systemPrompt, /Rules, commands, plugins/)
  assert.doesNotMatch(systemPrompt, /vKTdU4k8ur|\/article\/Reset|32チャンク/)
})

test('grounds concrete answers with Vectorize WIKI evidence and its article link', async () => {
  const aiInvocations = []
  let vectorizeInvocation
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    assert.equal(url, ACESERVER_WIKI_CORPUS_URL)
    assert.equal(init.redirect, 'manual')
    assert.deepEqual(init.cf, {
      cacheEverything: true,
      cacheTtl: 300,
    })
    return Response.json({
      schemaVersion: 1,
      embedding: {
        model: WIKI_EMBEDDING_MODEL,
        dimensions: 1024,
      },
      chunks: [
        {
          id: 'rule-explosives',
          namespace: 'ja',
          text: 'ルール・BAN条件 爆破物の使用について メインサーバーでの爆破物（エンドクリスタル・TNTなど）の使用は禁止です。',
          metadata: {
            locale: 'ja',
            title: 'ルール・BAN条件',
            section: '爆破物',
            excerpt: '爆破物のルールです。',
            url: '/article/rule/',
          },
        },
      ],
    })
  }

  try {
    const response = await onRequestPost({
      request: createRequest({ question: 'TNTは使える？' }),
      env: {
        AI: {
          async run(model, input) {
            aiInvocations.push({ model, input })
            if (model === WIKI_EMBEDDING_MODEL) {
              return { data: [WIKI_EMBEDDING] }
            }

            return {
              response:
                'メインサーバーではTNTは禁止だよ。[ルール・BAN条件](https://asv-wiki.acecore.net/article/rule/)で確認してね。',
            }
          },
        },
        WIKI_SEARCH_ENABLED: 'true',
        WIKI_SEARCH_MIN_SCORE: '0.40',
        WIKI_SEARCH_INDEX: {
          async query(vector, options) {
            vectorizeInvocation = { vector, options }
            return {
              matches: [
                {
                  id: 'rule-explosives',
                  score: 0.91,
                  metadata: {
                    locale: 'ja',
                    title: 'ルール・BAN条件',
                    section: '爆破物',
                    excerpt: '爆破物のルールです。',
                    url: '/article/rule/',
                  },
                },
              ],
            }
          },
        },
      },
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.ok, true)
    assert.match(body.answer, /メインサーバーではTNTは禁止/)
    assert.match(
      body.answer,
      /\[ルール・BAN条件\]\(https:\/\/asv-wiki\.acecore\.net\/article\/rule\/\)/,
    )
    assert.deepEqual(
      aiInvocations.map(({ model }) => model),
      [WIKI_EMBEDDING_MODEL, '@cf/zai-org/glm-4.7-flash'],
    )
    assert.deepEqual(vectorizeInvocation.vector, WIKI_EMBEDDING)
    assert.deepEqual(vectorizeInvocation.options, {
      namespace: 'ja',
      topK: 15,
      returnMetadata: 'all',
      returnValues: false,
    })

    const systemPrompt = aiInvocations[1].input.messages[0].content
    assert.match(systemPrompt, /Aceserver WIKI retrieved evidence/)
    assert.match(systemPrompt, /メインサーバーでの爆破物/)
    assert.match(
      systemPrompt,
      /\[ルール・BAN条件\]\(https:\/\/asv-wiki\.acecore\.net\/article\/rule\/\)/,
    )
    assert.doesNotMatch(systemPrompt, /Content: 爆破物のルールです。/)
    assert.match(systemPrompt, /Do not invent .*approvals/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('continues with navigation guidance when WIKI retrieval fails', async () => {
  const aiInvocations = []
  let vectorizeInvoked = false
  const originalConsoleError = console.error
  console.error = () => {}

  try {
    const response = await onRequestPost({
      request: createRequest({ question: '参加方法を教えて' }),
      env: {
        AI: {
          async run(model, input) {
            aiInvocations.push({ model, input })
            if (model === WIKI_EMBEDDING_MODEL) {
              throw new Error('embedding unavailable')
            }

            return {
              response: '参加方法は公式DiscordとAceserver WIKIを確認してね。',
            }
          },
        },
        WIKI_SEARCH_INDEX: {
          async query() {
            vectorizeInvoked = true
            return { matches: [] }
          },
        },
      },
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.ok, true)
    assert.equal(vectorizeInvoked, false)
    assert.deepEqual(
      aiInvocations.map(({ model }) => model),
      [WIKI_EMBEDDING_MODEL, '@cf/zai-org/glm-4.7-flash'],
    )
    assert.match(body.answer, /\[公式Discord\]/)
    assert.doesNotMatch(
      aiInvocations[1].input.messages[0].content,
      /<wiki-evidence/,
    )
  } finally {
    console.error = originalConsoleError
  }
})

test('filters low-score, duplicate, and non-WIKI Vectorize metadata', async () => {
  const entries = await searchAceserverWiki(
    'ルールを教えて',
    {
      AI: {
        async run() {
          return { data: [WIKI_EMBEDDING] }
        },
      },
      WIKI_SEARCH_MIN_SCORE: '0.40',
      WIKI_SEARCH_INDEX: {
        async query() {
          return {
            matches: [
              {
                id: 'external',
                score: 0.99,
                metadata: {
                  locale: 'ja',
                  title: '外部',
                  section: '外部',
                  excerpt: '採用してはいけない内容',
                  url: 'https://example.com/article/rule/',
                },
              },
              {
                id: 'valid',
                score: 0.415,
                metadata: {
                  locale: 'ja',
                  title: 'ルール・BAN条件',
                  section: '建築',
                  excerpt: '自分の敷地には所有者を示す看板を設置します。',
                  url: '/article/rule/',
                },
              },
              {
                id: 'duplicate',
                score: 0.414,
                metadata: {
                  locale: 'ja',
                  title: 'ルール・BAN条件',
                  section: '建築',
                  excerpt: '自分の敷地には所有者を示す看板を設置します。',
                  url: '/article/rule/',
                },
              },
              {
                id: 'low-score',
                score: 0.3,
                metadata: {
                  locale: 'ja',
                  title: '参加方法',
                  section: '参加方法',
                  excerpt: '公式Discordを確認します。',
                  url: '/article/in/',
                },
              },
            ],
          }
        },
      },
    },
    null,
  )

  assert.deepEqual(entries, [
    {
      id: 'valid',
      score: 0.415,
      title: 'ルール・BAN条件',
      section: '建築',
      excerpt: '自分の敷地には所有者を示す看板を設置します。',
      url: 'https://asv-wiki.acecore.net/article/rule/',
    },
  ])
  assert.match(
    buildWikiGroundingContext(entries),
    /\[ルール・BAN条件\]\(https:\/\/asv-wiki\.acecore\.net\/article\/rule\/\)/,
  )
})

test('rejects cross-origin browser requests before invoking AI', async () => {
  let invoked = false
  const response = await onRequestPost({
    request: createRequest(
      { question: '参加方法を教えて' },
      {
        Origin: 'https://example.com',
        'Sec-Fetch-Site': 'cross-site',
      },
    ),
    env: {
      AI: {
        async run() {
          invoked = true
          return { response: 'unexpected' }
        },
      },
    },
  })

  assert.equal(response.status, 403)
  assert.equal(invoked, false)
})

test('requires JSON and bounds the streamed request body', async () => {
  const nonJsonResponse = await onRequestPost({
    request: createRequest('question=hello', {
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    env: {},
  })
  assert.equal(nonJsonResponse.status, 400)

  const oversizedResponse = await onRequestPost({
    request: createRequest(JSON.stringify({ question: 'a'.repeat(12_100) })),
    env: {},
  })
  assert.equal(oversizedResponse.status, 413)
})

test('validates question and conversation limits', async () => {
  const longQuestionResponse = await onRequestPost({
    request: createRequest({ question: 'a'.repeat(501) }),
    env: {},
  })
  assert.equal(longQuestionResponse.status, 400)

  const longConversationResponse = await onRequestPost({
    request: createRequest({
      question: '続き',
      messages: Array.from({ length: 8 }, (_, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: 'あ'.repeat(400),
      })),
    }),
    env: {},
  })
  assert.equal(longConversationResponse.status, 400)
})

test('returns controlled fallbacks when binding or inference is unavailable', async () => {
  const unconfiguredResponse = await onRequestPost({
    request: createRequest({ question: '参加方法を教えて' }),
    env: {},
  })
  assert.equal(unconfiguredResponse.status, 503)
  assert.match((await unconfiguredResponse.json()).answer, /discord\.gg\/acsv/)

  const failedResponse = await onRequestPost({
    request: createRequest({ question: '参加方法を教えて' }),
    env: {
      AI: {
        async run() {
          throw new Error('inference failed')
        },
      },
    },
  })
  assert.equal(failedResponse.status, 502)
  assert.match((await failedResponse.json()).answer, /discord\.gg\/acsv/)
})

test('normalizes conversation roles and keeps only recent messages', () => {
  const messages = Array.from({ length: 10 }, (_, index) => ({
    role: index % 2 === 0 ? 'assistant' : 'user',
    content: `message-${index}`,
  }))
  const conversation = buildConversationInput({ messages })

  assert.doesNotMatch(conversation, /message-0|message-1/)
  assert.match(conversation, /Alpha-kun: message-2/)
  assert.match(conversation, /Visitor: message-9/)
})

test('uses the latest two visitor turns as the semantic search query', () => {
  const query = buildWikiSearchQuery(
    {
      messages: [
        { role: 'assistant', content: '何を案内しようか？' },
        { role: 'user', content: 'TNTのルールを教えて' },
        { role: 'assistant', content: '確認するね。' },
        { role: 'user', content: '資源サーバーでは？' },
      ],
    },
    '資源サーバーでは？',
  )

  assert.equal(query, 'TNTのルールを教えて\n資源サーバーでは？')
})

test('post-processes only canonical guide links and trims dangling Markdown', () => {
  assert.equal(
    addGuideResourceLinks('公式DiscordとAceserver WIKIを確認してね。'),
    '[公式Discord](https://discord.gg/acsv)と[Aceserver WIKI](https://asv-wiki.acecore.net)を確認してね。',
  )
  assert.equal(
    trimIncompleteMarkdown(
      '案内はこちら。\n[公式Discord](https://discord.gg/ac',
    ),
    '案内はこちら。',
  )
  assert.equal(
    addGuideResourceLinks(
      '[ワールドマップ](/world-map/) と [マップ](/world-map/)を見てね。',
    ),
    '[ワールドマップ](/world-map/) と マップを見てね。',
  )
})

test('origin comparison includes the scheme and honors Fetch Metadata', () => {
  assert.equal(
    isAllowedRequestOrigin(
      new Request(ENDPOINT, {
        headers: { Origin: 'http://asv.acecore.net' },
      }),
    ),
    false,
  )
  assert.equal(
    isAllowedRequestOrigin(
      new Request(ENDPOINT, {
        headers: { 'Sec-Fetch-Site': 'cross-site' },
      }),
    ),
    false,
  )
})
