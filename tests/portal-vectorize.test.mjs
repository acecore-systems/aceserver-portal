import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test, { after } from 'node:test'

import { OPENAI_API_BASE_URL } from '../functions/api/openai-api.ts'
import {
  buildPortalVectorCorpus,
  chunkPortalSearchDocument,
  extractPortalSearchDocument,
  PORTAL_EMBEDDING_DIMENSIONS,
  PORTAL_EMBEDDING_MODEL,
} from '../scripts/build-portal-vector-corpus.mjs'
import {
  extractEmbeddingData,
  PRODUCTION_INDEX_NAME,
  REPLACEMENT_INDEX_NAME,
  syncPortalVectorize,
  validatePortalCorpus,
  validateDeletePlan,
  validateReconciliation,
} from '../scripts/sync-portal-vectorize.mjs'
import {
  assertDeployedPortalBuild,
  parsePortalBuildMetadata,
} from '../scripts/wait-for-portal-deployment.mjs'

const createHtml = ({ title, description, canonical = '' }) => `<!doctype html>
<html lang="ja">
  <head>
    <title>${title} | エースサーバー</title>
    <meta name="description" content="${description}">
    ${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
  </head>
  <body>
    <nav>検索対象に含めないナビゲーション</nav>
    <main>
      <h1>${title}</h1>
      <p>${description}</p>
      <h2>詳しい案内</h2>
      <p>${description} 公開ページに掲載している情報をアルファくんの案内根拠として利用します。</p>
    </main>
    <footer>検索対象に含めないフッター</footer>
  </body>
</html>`

const TEST_OPENAI_API_KEY = 'test-openai-api-key'
const TEST_EMBEDDING = Array.from(
  { length: PORTAL_EMBEDDING_DIMENSIONS },
  () => 0.01,
)
const temporaryRoots = []

after(async () => {
  await Promise.all(
    temporaryRoots.map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  )
})

test('sync tooling does not load the HTML corpus builder', async () => {
  const source = await readFile(
    new URL('../scripts/sync-portal-vectorize.mjs', import.meta.url),
    'utf8',
  )

  assert.doesNotMatch(source, /build-portal-vector-corpus/u)
  assert.match(source, /portal-vectorize-config/u)
})

test('keeps the sync workflow production-only with explicit safety gates', async () => {
  const workflow = await readFile(
    new URL('../.github/workflows/sync-portal-vectorize.yml', import.meta.url),
    'utf8',
  )
  const wrangler = await readFile(
    new URL('../wrangler.jsonc', import.meta.url),
    'utf8',
  )

  assert.doesNotMatch(
    workflow,
    /sync-preview|cloudflare-portal-search-preview|openai-1536-preview/u,
  )
  assert.match(workflow, /cloudflare-portal-search-production/u)
  assert.match(workflow, new RegExp(REPLACEMENT_INDEX_NAME, 'u'))
  assert.match(workflow, /--confirm-production "\$VECTORIZE_INDEX_NAME"/u)
  assert.doesNotMatch(workflow, /--allow-large-delete|allow_large_delete/u)
  assert.match(
    workflow,
    /vars\.ACESERVER_PORTAL_VECTORIZE_SYNC_ENABLED == 'true'/u,
  )
  assert.match(
    wrangler,
    new RegExp(
      `"binding": "PORTAL_SEARCH_INDEX",[^}]*"index_name": "${REPLACEMENT_INDEX_NAME}"`,
      'u',
    ),
  )
  assert.doesNotMatch(
    wrangler,
    new RegExp(`"index_name": "${PRODUCTION_INDEX_NAME}"`, 'u'),
  )
})

test('extracts a public story from built portal HTML', () => {
  const html = createHtml({
    title: 'エースサーバーの物語',
    description:
      'エースサーバーで起きた出来事を、公開されている記録に基づいて紹介する読みものです。',
    canonical: 'https://asv.acecore.net/stories/server-story/',
  })
  const document = extractPortalSearchDocument(
    html,
    'C:/site/dist/stories/server-story/index.html',
    'C:/site/dist',
  )

  assert.equal(document.url, '/stories/server-story/')
  assert.equal(document.locale, 'ja')
  assert.equal(document.contentType, 'story')
  assert.equal(document.title, 'エースサーバーの物語')
  assert.doesNotMatch(
    document.blocks.map(({ text }) => text).join(' '),
    /ナビゲーション|フッター/u,
  )

  const chunks = chunkPortalSearchDocument(document)
  assert.ok(chunks.length >= 1)
  assert.match(chunks[0].id, /^v1-[0-9a-f]{48}$/u)
  assert.equal(chunks[0].metadata.url, '/stories/server-story/')
  assert.equal(chunks[0].metadata.contentType, 'story')
  assert.ok(chunks[0].text.length <= 1200)
})

test('excludes ignored and hidden descendants from portal content blocks', () => {
  const description =
    'エースサーバーの公開情報を案内するために十分な長さを持つページ本文です。'
  const html = `<!doctype html>
    <html lang="ja">
      <head>
        <title>公開ページ | エースサーバー</title>
        <meta name="description" content="${description}">
      </head>
      <body>
        <main>
          <h1>公開ページ</h1>
          <p>検索に使う公開本文です。<span aria-hidden="true">隠す語句</span><span data-pagefind-ignore>除外語句</span>利用者に必要な情報を十分な長さで案内します。</p>
          <p data-pagefind-ignore>この本文は検索対象に含めません。</p>
          <button>この操作文言は検索対象に含めません。</button>
        </main>
      </body>
    </html>`

  const document = extractPortalSearchDocument(
    html,
    'C:/site/dist/public/index.html',
    'C:/site/dist',
  )
  const texts = document.blocks.map(({ text }) => text).join(' ')

  assert.match(texts, /検索に使う公開本文/u)
  assert.doesNotMatch(texts, /隠す語句|除外語句|検索対象に含めません/u)
})

test('uses metadata copy for public iframe pages with sparse body text', () => {
  const description =
    'エースサーバーのメインワールドをブラウザで確認できる公開マップです。拠点、建築、地形を見ながら位置関係を把握できます。'
  const html = `<!doctype html>
    <html lang="ja">
      <head>
        <title>メインサーバーワールドマップ | エースサーバー</title>
        <meta name="description" content="${description}">
        <link rel="canonical" href="https://asv.acecore.net/world-map-main/">
      </head>
      <body>
        <main>
          <h1>メインサーバーワールドマップ</h1>
          <iframe title="メインサーバーワールドマップ"></iframe>
        </main>
      </body>
    </html>`

  const document = extractPortalSearchDocument(
    html,
    'C:/site/dist/world-map-main/index.html',
    'C:/site/dist',
  )

  assert.equal(document.url, '/world-map-main/')
  assert.equal(document.contentType, 'world-map')
  assert.deepEqual(document.blocks, [
    {
      heading: 'メインサーバーワールドマップ',
      text: description,
    },
  ])
})

test('excludes admin and noindex pages from the portal corpus', () => {
  const publicHtml = createHtml({
    title: '公開ページ',
    description:
      'エースサーバーの公開情報を案内するために十分な長さを持つページ本文です。',
  })
  const noIndexHtml = publicHtml.replace(
    '</head>',
    '<meta name="robots" content="noindex"></head>',
  )

  assert.equal(
    extractPortalSearchDocument(
      publicHtml,
      'C:/site/dist/admin/users/index.html',
      'C:/site/dist',
    ),
    null,
  )
  assert.equal(
    extractPortalSearchDocument(
      noIndexHtml,
      'C:/site/dist/private/index.html',
      'C:/site/dist',
    ),
    null,
  )
})

test('excludes translated mirrors from the canonical portal corpus', () => {
  const translatedHtml = createHtml({
    title: 'Aceserver stories',
    description:
      'Public stories from Aceserver are available here for international visitors.',
    canonical: 'https://asv.acecore.net/en/stories/',
  }).replace('<html lang="ja">', '<html lang="en">')

  assert.equal(
    extractPortalSearchDocument(
      translatedHtml,
      'C:/site/dist/en/stories/index.html',
      'C:/site/dist',
    ),
    null,
  )
})

test('builds a deterministic corpus for the complete public portal', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'portal-vector-corpus-'))

  try {
    for (let index = 0; index < 10; index += 1) {
      const pageDirectory = join(directory, `page-${index}`)
      await mkdir(pageDirectory, { recursive: true })
      await writeFile(
        join(pageDirectory, 'index.html'),
        createHtml({
          title: `公開ページ ${index}`,
          description: `エースサーバーの公開ページ${index}です。ワールド、動画、読みものなどportal全体の情報を検索できるようにするための説明です。`,
        }),
        'utf8',
      )
    }

    const first = await buildPortalVectorCorpus({
      distDir: directory,
      write: false,
    })
    const second = await buildPortalVectorCorpus({
      distDir: directory,
      write: false,
    })

    assert.equal(first.sourceCount, 10)
    assert.ok(first.vectorCount >= 10)
    assert.equal(first.version, second.version)
    assert.equal(first.embedding.model, PORTAL_EMBEDDING_MODEL)
    assert.equal(first.embedding.dimensions, PORTAL_EMBEDDING_DIMENSIONS)
    assert.equal(first.localeCounts.ja, first.vectorCount)
    validatePortalCorpus(first)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('fails the build when too few public portal pages are extracted', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'portal-vector-sparse-'))

  try {
    await assert.rejects(
      buildPortalVectorCorpus({
        distDir: directory,
        write: false,
      }),
      /at least 10 are required/u,
    )
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('rejects unsafe portal metadata before an index mutation', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'portal-vector-invalid-'))

  try {
    for (let index = 0; index < 10; index += 1) {
      const pageDirectory = join(directory, `page-${index}`)
      await mkdir(pageDirectory, { recursive: true })
      await writeFile(
        join(pageDirectory, 'index.html'),
        createHtml({
          title: `検証ページ ${index}`,
          description: `Vectorize同期前のmetadata検証に使う公開ページ${index}の十分な長さの本文です。`,
        }),
        'utf8',
      )
    }
    const corpus = await buildPortalVectorCorpus({
      distDir: directory,
      write: false,
    })
    corpus.chunks[0].metadata.url = 'https://example.com/private'

    assert.throws(() => validatePortalCorpus(corpus), /invalid chunk/u)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('validates OpenAI embedding dimensions and ordering', () => {
  const embedding = Array.from(
    { length: PORTAL_EMBEDDING_DIMENSIONS },
    () => 0.25,
  )

  assert.deepEqual(
    extractEmbeddingData(
      {
        data: [{ object: 'embedding', index: 0, embedding }],
      },
      1,
    ),
    [embedding],
  )
  assert.throws(
    () =>
      extractEmbeddingData(
        {
          data: [{ object: 'embedding', index: 0, embedding: [0.25] }],
        },
        1,
      ),
    /OpenAIEmbeddingDimensionsError/u,
  )
})

test('limits portal Vectorize sync to managed indexes and safe deletions', async () => {
  const corpusFile = await writeCorpus(createPortalCorpus())

  await assert.doesNotReject(
    syncPortalVectorize({
      corpusFile,
      dryRun: true,
      indexName: REPLACEMENT_INDEX_NAME,
      logger: silentLogger,
    }),
  )

  await assert.rejects(
    syncPortalVectorize({
      corpusFile,
      dryRun: true,
      indexName: 'untrusted-index',
      logger: silentLogger,
    }),
    /must be one of/u,
  )
  assert.throws(
    () =>
      validateDeletePlan({
        currentCount: 20,
        deleteCount: 5,
        allowLargeDelete: false,
      }),
    /--allow-large-delete/u,
  )
  assert.doesNotThrow(() =>
    validateDeletePlan({
      currentCount: 20,
      deleteCount: 5,
      allowLargeDelete: true,
    }),
  )
})

test('requires exact confirmation before mutating the production index', async () => {
  const corpusFile = await writeCorpus(createPortalCorpus())

  for (const indexName of [PRODUCTION_INDEX_NAME, REPLACEMENT_INDEX_NAME]) {
    await assert.rejects(
      syncPortalVectorize({
        accountId: 'account',
        apiToken: 'token',
        openAiApiKey: TEST_OPENAI_API_KEY,
        indexName,
        corpusFile,
        fetchImpl: async () => {
          throw new Error('Production confirmation must fail before fetch.')
        },
        logger: silentLogger,
      }),
      new RegExp(`--confirm-production ${indexName}`, 'u'),
    )
  }
})

test('requires exact Vectorize ID convergence', () => {
  const expectedIds = new Set([managedId(1), managedId(2)])

  assert.doesNotThrow(() =>
    validateReconciliation(
      expectedIds,
      new Set(expectedIds),
      REPLACEMENT_INDEX_NAME,
    ),
  )
  assert.throws(
    () =>
      validateReconciliation(
        expectedIds,
        new Set([managedId(1), managedId(3)]),
        REPLACEMENT_INDEX_NAME,
      ),
    /1 missing and 1 unexpected/u,
  )
})

test('syncs only the portal corpus delta', async () => {
  const corpus = createPortalCorpus()
  const corpusFile = await writeCorpus(corpus)
  const newChunk = corpus.chunks.at(-1)
  const staleId = managedId(99)
  const existingIds = [
    ...corpus.chunks.slice(0, -1).map(({ id }) => id),
    staleId,
  ]
  const calls = []
  let listCalls = 0

  const fetchImpl = async (input, init = {}) => {
    const url = String(input)
    calls.push({ url, method: init.method || 'GET' })

    if (url.endsWith(`/vectorize/v2/indexes/${PRODUCTION_INDEX_NAME}`)) {
      return cloudflareResponse({
        name: PRODUCTION_INDEX_NAME,
        config: {
          dimensions: PORTAL_EMBEDDING_DIMENSIONS,
          metric: 'cosine',
        },
      })
    }
    if (url.includes('/list?')) {
      listCalls += 1
      const listedIds =
        listCalls === 1 ? existingIds : corpus.chunks.map(({ id }) => id)
      return cloudflareResponse({
        vectors: listedIds.map((id) => ({ id })),
        count: listedIds.length,
        totalCount: listedIds.length,
        isTruncated: false,
      })
    }
    if (url === `${OPENAI_API_BASE_URL}/embeddings`) {
      const requestBody = JSON.parse(init.body)
      assert.equal(
        new Headers(init.headers).get('Authorization'),
        `Bearer ${TEST_OPENAI_API_KEY}`,
      )
      assert.deepEqual(requestBody, {
        model: PORTAL_EMBEDDING_MODEL,
        input: [newChunk.text],
        dimensions: PORTAL_EMBEDDING_DIMENSIONS,
        encoding_format: 'float',
      })
      return Response.json({
        object: 'list',
        data: [
          {
            object: 'embedding',
            index: 0,
            embedding: TEST_EMBEDDING,
          },
        ],
        model: PORTAL_EMBEDDING_MODEL,
        usage: { prompt_tokens: 1, total_tokens: 1 },
      })
    }
    if (url.endsWith('/upsert')) {
      const ndjson = await init.body.get('vectors').text()
      const vector = JSON.parse(ndjson.trim())
      assert.equal(vector.id, newChunk.id)
      assert.equal(vector.values.length, PORTAL_EMBEDDING_DIMENSIONS)
      return cloudflareResponse({ mutationId: 'mutation-upsert' })
    }
    if (url.endsWith('/delete_by_ids')) {
      assert.deepEqual(JSON.parse(init.body), { ids: [staleId] })
      return cloudflareResponse({ mutationId: 'mutation-delete' })
    }
    if (url.endsWith('/info')) {
      return cloudflareResponse({
        processedUpToMutation: 'mutation-delete',
      })
    }
    if (url.endsWith('/query')) {
      assert.deepEqual(JSON.parse(init.body), {
        vector: TEST_EMBEDDING,
        namespace: 'ja',
        topK: 10,
        returnMetadata: 'none',
        returnValues: false,
      })
      return cloudflareResponse({
        matches: [{ id: newChunk.id, score: 1 }],
        count: 1,
      })
    }

    throw new Error(`Unexpected request: ${url}`)
  }

  const result = await syncPortalVectorize({
    accountId: 'account',
    apiToken: 'token',
    openAiApiKey: TEST_OPENAI_API_KEY,
    indexName: PRODUCTION_INDEX_NAME,
    productionConfirmation: PRODUCTION_INDEX_NAME,
    corpusFile,
    fetchImpl,
    logger: silentLogger,
  })

  assert.equal(result.upserted, 1)
  assert.equal(result.deleted, 1)
  assert.equal(result.mutationId, 'mutation-delete')
  assert.equal(result.verified, true)
  assert.equal(result.queryVerified, true)
  assert.equal(listCalls, 2)
  assert.equal(
    calls.filter(({ url }) => url === `${OPENAI_API_BASE_URL}/embeddings`)
      .length,
    1,
  )
})

test('enumerates and verifies every Vectorize list page', async () => {
  const corpus = createPortalCorpus()
  const corpusFile = await writeCorpus(corpus)
  let listCalls = 0

  const fetchImpl = async (input) => {
    const url = String(input)
    if (url.endsWith(`/vectorize/v2/indexes/${PRODUCTION_INDEX_NAME}`)) {
      return cloudflareResponse({
        config: {
          dimensions: PORTAL_EMBEDDING_DIMENSIONS,
          metric: 'cosine',
        },
      })
    }
    if (url.includes('/list?')) {
      listCalls += 1
      const cursor = new URL(url).searchParams.get('cursor')
      if (listCalls === 1) {
        assert.equal(cursor, null)
        return cloudflareResponse({
          vectors: corpus.chunks.slice(0, 5).map(({ id }) => ({ id })),
          count: 5,
          totalCount: corpus.vectorCount,
          isTruncated: true,
          nextCursor: 'page-2',
        })
      }

      assert.equal(cursor, 'page-2')
      return cloudflareResponse({
        vectors: corpus.chunks.slice(5).map(({ id }) => ({ id })),
        count: corpus.vectorCount - 5,
        totalCount: corpus.vectorCount,
        isTruncated: false,
      })
    }
    throw new Error(`Unexpected request: ${url}`)
  }

  const result = await syncPortalVectorize({
    accountId: 'account',
    apiToken: 'token',
    openAiApiKey: TEST_OPENAI_API_KEY,
    indexName: PRODUCTION_INDEX_NAME,
    productionConfirmation: PRODUCTION_INDEX_NAME,
    corpusFile,
    fetchImpl,
    logger: silentLogger,
  })

  assert.equal(listCalls, 2)
  assert.equal(result.existing, corpus.vectorCount)
  assert.equal(result.upserted, 0)
  assert.equal(result.deleted, 0)
  assert.equal(result.verified, true)
  assert.equal(result.queryVerified, false)
})

test('rejects an inconsistent Vectorize list before mutation', async () => {
  const corpusFile = await writeCorpus(createPortalCorpus())
  let mutated = false

  const fetchImpl = async (input) => {
    const url = String(input)
    if (url.endsWith(`/vectorize/v2/indexes/${PRODUCTION_INDEX_NAME}`)) {
      return cloudflareResponse({
        config: {
          dimensions: PORTAL_EMBEDDING_DIMENSIONS,
          metric: 'cosine',
        },
      })
    }
    if (url.includes('/list?')) {
      return cloudflareResponse({
        vectors: [{ id: managedId(0) }],
        count: 1,
        totalCount: 2,
        isTruncated: false,
      })
    }
    mutated = true
    throw new Error(`Unexpected request: ${url}`)
  }

  await assert.rejects(
    syncPortalVectorize({
      accountId: 'account',
      apiToken: 'token',
      openAiApiKey: TEST_OPENAI_API_KEY,
      indexName: PRODUCTION_INDEX_NAME,
      productionConfirmation: PRODUCTION_INDEX_NAME,
      corpusFile,
      fetchImpl,
      logger: silentLogger,
    }),
    /invalid list response/u,
  )
  assert.equal(mutated, false)
})

test('requires the deployed commit and corpus version to match', async () => {
  const commit = 'a'.repeat(40)
  const corpusVersion = 'b'.repeat(20)
  const marker = JSON.stringify({
    commit: commit.toUpperCase(),
    searchCorpusVersion: corpusVersion.toUpperCase(),
  })

  assert.deepEqual(parsePortalBuildMetadata(marker), {
    commit,
    searchCorpusVersion: corpusVersion,
  })
  await assert.doesNotReject(
    assertDeployedPortalBuild(
      'https://asv.acecore.net/.well-known/aceserver-portal-build.json',
      commit,
      corpusVersion,
      {
        fetchImpl: async () =>
          new Response(marker, {
            headers: { 'Content-Type': 'application/json' },
          }),
        logger: { log() {} },
      },
    ),
  )
  await assert.rejects(
    assertDeployedPortalBuild(
      'https://asv.acecore.net/.well-known/aceserver-portal-build.json',
      'c'.repeat(40),
      corpusVersion,
      {
        fetchImpl: async () => Response.json(JSON.parse(marker)),
        logger: { log() {} },
      },
    ),
    /Production changed/u,
  )
})

function createPortalCorpus() {
  const chunks = Array.from({ length: 10 }, (_, index) => ({
    id: managedId(index),
    namespace: 'ja',
    text: `エースサーバー公開ページ${index}の検索本文`,
    metadata: {
      url: `/page-${index}/`,
      title: `公開ページ${index}`,
      section: `案内${index}`,
      excerpt: `公開ページ${index}の概要`,
      contentType: 'page',
      locale: 'ja',
    },
  }))

  return {
    schemaVersion: 1,
    version: 'a'.repeat(20),
    embedding: {
      model: PORTAL_EMBEDDING_MODEL,
      dimensions: PORTAL_EMBEDDING_DIMENSIONS,
      metric: 'cosine',
    },
    chunking: {
      targetCharacters: 850,
      maximumCharacters: 1200,
      overlapCharacters: 120,
    },
    sourceCount: chunks.length,
    vectorCount: chunks.length,
    localeCounts: { ja: chunks.length },
    chunks,
  }
}

function managedId(index) {
  return `v1-${index.toString(16).padStart(48, '0')}`
}

async function writeCorpus(corpus) {
  const root = await mkdtemp(join(tmpdir(), 'portal-vectorize-sync-'))
  temporaryRoots.push(root)
  const corpusFile = join(root, 'corpus.json')
  await writeFile(corpusFile, JSON.stringify(corpus), 'utf8')
  return corpusFile
}

function cloudflareResponse(result, status = 200) {
  return Response.json(
    {
      success: status >= 200 && status < 300,
      result,
      errors: [],
      messages: [],
    },
    { status },
  )
}

const silentLogger = { log() {} }
