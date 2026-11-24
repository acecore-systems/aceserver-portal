import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import test from 'node:test'
import modelConfig from '../config/ai-models.generated.json' with { type: 'json' }

const updatedModel = 'voyage-future-model'
const updatedConfig = structuredClone(modelConfig)
updatedConfig.features['search.embedding'].api_model_id = updatedModel

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '../../config/ai-models.cjs')
      return {
        url:
          'data:text/javascript,' +
          encodeURIComponent(`export default ${JSON.stringify(updatedConfig)}`),
        shortCircuit: true,
      }
    return nextResolve(specifier, context)
  },
})
const { canUseAlphaSearchEmbedding, createAlphaSearchEmbedding } =
  await import('../functions/api/alpha-search-embedding.ts')
const { VOYAGE_INDEX_NAME, probeVoyageDocument, syncPortalVectorize } =
  await import('../scripts/sync-portal-vectorize.mjs')
hook.deregister()

test('同じ次元の別モデルを配布しても既存Voyage索引への検索・同期を拒否する', async (t) => {
  const unexpected = t.mock.fn(() => {
    throw new Error('Unexpected external request')
  })
  for (const model of ['voyage-4-lite', updatedModel]) {
    const env = {
      SEARCH_EMBEDDING_MODEL: model,
      SEARCH_EMBEDDING_DIMENSIONS: '1024',
      VOYAGE_EMBEDDER: { fetch: unexpected },
      AI: { run: unexpected },
    }
    assert.equal(canUseAlphaSearchEmbedding(env), false)
    assert.equal(await createAlphaSearchEmbedding('検索', env), null)
  }

  await assert.rejects(
    syncPortalVectorize({
      indexName: VOYAGE_INDEX_NAME,
      voyageApiKey: 'synthetic',
      fetchImpl: unexpected,
    }),
    /incompatible with the existing Voyage index/u,
  )
  await assert.rejects(
    probeVoyageDocument({ voyageApiKey: 'synthetic', fetchImpl: unexpected }),
    /incompatible with the existing Voyage index/u,
  )
  assert.equal(unexpected.mock.callCount(), 0)
})
