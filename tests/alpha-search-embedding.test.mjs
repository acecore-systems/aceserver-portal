import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { createAlphaSearchEmbedding } from '../functions/api/alpha-search-embedding.ts'
import { searchAceserverPortal } from '../functions/api/alpha-portal-search.ts'
import { searchAceserverWiki } from '../functions/api/alpha-wiki-search.ts'
import { searchAcecore } from '../functions/api/alpha-acecore-search.ts'
import { searchSchools } from '../functions/api/alpha-schools-search.ts'
import { searchSystems } from '../functions/api/alpha-systems-search.ts'
import { searchWorldFoundation } from '../functions/api/alpha-world-foundation-search.ts'
import { PORTAL_MAX_CORPUS_BYTES } from '../scripts/build-portal-vector-corpus.mjs'

const embedding = Array(1024).fill(0.1)
const model = 'voyage-4-lite'
function environment(response) {
  const index = {
    async query(values, options) {
      assert.deepEqual(values, embedding)
      assert.equal(options.namespace, 'ja')
      return { matches: [] }
    },
  }
  return {
    SEARCH_EMBEDDING_MODEL: model,
    SEARCH_EMBEDDING_DIMENSIONS: '1024',
    AI: {
      run() {
        assert.fail('BGE must not run')
      },
    },
    VOYAGE_EMBEDDER: {
      async fetch(url, init) {
        assert.equal(url, 'https://voyage-embeddings.internal/v1/embeddings')
        assert.deepEqual(JSON.parse(init.body), {
          model,
          input: ['検索について'],
          input_type: 'query',
          output_dimension: 1024,
          output_dtype: 'float',
          truncation: false,
        })
        return response()
      },
    },
    PORTAL_SEARCH_INDEX: index,
    WIKI_SEARCH_INDEX: index,
    ACECORE_SEARCH_INDEX: index,
    SCHOOLS_SEARCH_INDEX: index,
    SYSTEMS_SEARCH_INDEX: index,
    WORLD_FOUNDATION_SEARCH_INDEX: index,
  }
}
const good = () => Response.json({ model, data: [{ index: 0, embedding }] })

test('全6検索adapterがVoyage queryと対応indexを使う', async () => {
  const targets = [
    [searchAceserverPortal, 'PORTAL_SEARCH_INDEX'],
    [searchAceserverWiki, 'WIKI_SEARCH_INDEX'],
    [searchAcecore, 'ACECORE_SEARCH_INDEX'],
    [searchSchools, 'SCHOOLS_SEARCH_INDEX'],
    [searchSystems, 'SYSTEMS_SEARCH_INDEX'],
    [searchWorldFoundation, 'WORLD_FOUNDATION_SEARCH_INDEX'],
  ]
  for (const [search, binding] of targets) {
    const env = environment(good)
    let embeds = 0,
      queries = 0
    const fetch = env.VOYAGE_EMBEDDER.fetch
    env.VOYAGE_EMBEDDER.fetch = (...args) => {
      embeds += 1
      return fetch(...args)
    }
    const selected = env[binding]
    for (const [, name] of targets) delete env[name]
    env[binding] = {
      async query(...args) {
        queries += 1
        return selected.query(...args)
      },
    }
    assert.deepEqual(await search('検索について', env), [])
    assert.equal(embeds, 1)
    assert.equal(queries, 1)
  }
})

test('Voyage応答とbindingの異常はBGEへfallbackせず空結果にする', async () => {
  const invalid = [
    () => Response.json({ model: 'wrong', data: [{ index: 0, embedding }] }),
    () => Response.json({ model, data: [] }),
    () => Response.json({ model, data: [{ index: 1, embedding }] }),
    () => Response.json({ model, data: [{ index: 0, embedding: [1] }] }),
    () =>
      Response.json({
        model,
        data: [{ index: 0, embedding: [...embedding.slice(1), null] }],
      }),
    () => new Response('private detail', { status: 503 }),
  ]
  const original = console.error
  const logs = []
  console.error = (x) => logs.push(String(x))
  try {
    for (const response of invalid)
      assert.equal(
        await createAlphaSearchEmbedding('検索について', environment(response)),
        null,
      )
    assert.doesNotMatch(logs.join(' '), /検索について|private detail/)
  } finally {
    console.error = original
  }
})

test('Productionの6つの検索bindingは同じVoyage世代を使う', async () => {
  const raw = await readFile(
    new URL('../wrangler.jsonc', import.meta.url),
    'utf8',
  )
  const production = raw.slice(raw.indexOf('    "production": {'))
  const indexes = [
    'aceserver-wiki',
    'aceserver-portal',
    'acecore-net',
    'acecore-schools',
    'acecore-systems',
    'world-foundation',
  ]
  for (const name of indexes)
    assert.match(
      production,
      new RegExp(`${name}-search-voyage-4-lite-1024-production-v1`, 'u'),
    )
  assert.doesNotMatch(production, /search-bge-m3-1024-production-v1/u)
  assert.match(
    production,
    /"binding": "VOYAGE_EMBEDDER",\s*"service": "acecore-chat-worker",\s*"entrypoint": "VoyageEmbedding"/u,
  )
})

test('ポータルコーパスは生成時と同じUTF-8バイト上限で検索結果を補完する', async (t) => {
  assert.equal(PORTAL_MAX_CORPUS_BYTES, 512_000)
  const env = environment(good)
  const metadata = {
    url: '/stories/sample/',
    title: '記事',
    section: '案内',
    excerpt: '概要',
    contentType: 'story',
    locale: 'ja',
  }
  env.PORTAL_SEARCH_INDEX = {
    async query() {
      return { matches: [{ id: 'id', score: 0.9, metadata }] }
    },
  }
  const corpus = {
    schemaVersion: 1,
    embedding: { model: '@cf/baai/bge-m3', dimensions: 1024 },
    chunks: [{ id: 'id', namespace: 'ja', metadata, text: '確認済み本文' }],
    padding: '',
  }
  const paddingBytes =
    PORTAL_MAX_CORPUS_BYTES - Buffer.byteLength(JSON.stringify(corpus))
  corpus.padding =
    '日'.repeat(Math.floor(paddingBytes / 3)) + ' '.repeat(paddingBytes % 3)
  const body = JSON.stringify(corpus)
  assert.equal(Buffer.byteLength(body), PORTAL_MAX_CORPUS_BYTES)
  assert.ok(body.length + 1 < PORTAL_MAX_CORPUS_BYTES)

  const searchWithCorpus = (response) =>
    searchAceserverPortal(
      '検索について',
      env,
      undefined,
      async (_url, init) => {
        assert.ok(init.signal instanceof AbortSignal)
        return response
      },
    )
  const entries = await searchWithCorpus(new Response(body))
  assert.equal(entries.length, 1)
  assert.equal(entries[0].content, '確認済み本文')

  const errors = t.mock.method(console, 'error', () => {})
  const oversizedBody = new Response(body + ' ')
  assert.equal(oversizedBody.headers.get('Content-Length'), null)
  const oversizedHeader = new Response(body, {
    headers: { 'Content-Length': String(PORTAL_MAX_CORPUS_BYTES + 1) },
  })
  const { content, ...fallback } = entries[0]
  assert.deepEqual(await searchWithCorpus(oversizedBody), [fallback])
  assert.deepEqual(await searchWithCorpus(oversizedHeader), [fallback])
  assert.equal(oversizedHeader.bodyUsed, false)
  assert.deepEqual(
    errors.mock.calls.map(
      ({ arguments: [message] }) => JSON.parse(message).errorCode,
    ),
    ['PortalCorpusSizeError', 'PortalCorpusResponseError'],
  )
})
