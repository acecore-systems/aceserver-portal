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
  const env = environment(good)
  for (const search of [
    searchAceserverPortal,
    searchAceserverWiki,
    searchAcecore,
    searchSchools,
    searchSystems,
    searchWorldFoundation,
  ]) {
    assert.deepEqual(await search('検索について', env), [])
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

test('既存corpus識別と本文根拠を維持してVoyage検索結果を補完する', async () => {
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
  let hydrationSignal
  const corpusFetcher = async (_url, init) => {
    hydrationSignal = init.signal
    return Response.json({
      schemaVersion: 1,
      embedding: { model: '@cf/baai/bge-m3', dimensions: 1024 },
      chunks: [{ id: 'id', namespace: 'ja', metadata, text: '確認済み本文' }],
    })
  }
  const entries = await searchAceserverPortal(
    '検索について',
    env,
    undefined,
    corpusFetcher,
  )
  assert.equal(entries.length, 1)
  assert.equal(entries[0].content, '確認済み本文')
  assert.ok(hydrationSignal instanceof AbortSignal)
})
