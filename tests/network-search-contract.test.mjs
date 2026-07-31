import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getSafePublicPathname,
  normalizeNetworkSearchResults,
} from '../src/scripts/network-search-contract.js'

const REQUEST_ID = '018f7e5a-7b4d-7c6a-8e9f-0123456789ab'

function networkPayload(results, requestId = REQUEST_ID) {
  return { ok: true, requestId, results }
}

function result(overrides = {}) {
  return {
    excerpt: '公開ページの抜粋です。',
    rank: 1,
    section: '案内',
    source: 'wiki',
    sourceLabel: 'Aceserver WIKI',
    title: 'WIKIの記事',
    url: 'https://asv-wiki.acecore.net/article/rule/',
    ...overrides,
  }
}

test('accepts only schema-valid, allowlisted related-site results', () => {
  const results = normalizeNetworkSearchResults(
    networkPayload([
      result({ rank: 2 }),
      result({ source: 'portal', sourceLabel: 'Aceserver Portal' }),
      result({
        rank: 1,
        url: 'https://systems.acecore.net/services/',
        source: 'systems',
        sourceLabel: 'Acecore Systems',
      }),
    ]),
    'portal',
  )

  assert.deepEqual(
    results.map(({ rank, sourceLabel, url }) => ({ rank, sourceLabel, url })),
    [
      {
        rank: 1,
        sourceLabel: 'Acecore Systems',
        url: 'https://systems.acecore.net/services/',
      },
      {
        rank: 2,
        sourceLabel: 'Aceserver WIKI',
        url: 'https://asv-wiki.acecore.net/article/rule/',
      },
    ],
  )
})

test('rejects source-specific non-document related-site paths', () => {
  const unsafeResults = [
    result({ url: 'https://asv.acecore.net/stories/aceserver-hijacked/' }),
    result({ url: 'https://asv-wiki.acecore.net/search/' }),
    result({
      source: 'portal',
      sourceLabel: 'Aceserver Portal',
      url: 'https://asv.acecore.net/vector-corpus.json',
    }),
    result({
      source: 'portal',
      sourceLabel: 'Aceserver Portal',
      url: 'https://asv.acecore.net/404',
    }),
    result({
      source: 'portal',
      sourceLabel: 'Aceserver Portal',
      url: 'https://asv.acecore.net/404/',
    }),
    result({
      source: 'portal',
      sourceLabel: 'Aceserver Portal',
      url: 'https://asv.acecore.net/404.html',
    }),
    result({
      source: 'portal',
      sourceLabel: 'Aceserver Portal',
      url: 'https://asv.acecore.net/404.html/',
    }),
  ]

  assert.deepEqual(
    normalizeNetworkSearchResults(networkPayload(unsafeResults), 'systems'),
    [],
  )
})

test('rejects unsafe raw paths before URL parsing and returns canonical paths', () => {
  const unsafePaths = [
    ' /services/',
    '\t/services/',
    '/safe/../services/',
    '/safe\\private/',
    '/safe/' + String.fromCharCode(0) + 'private/',
    '/safe/\tprivate/',
    '/safe%2fprivate/',
    '/safe%252fprivate/',
    '/safe/%252e%252e/services/',
    '/safe/%2509private/',
    '/safe/%3Fprivate/',
    '/safe/%EF%BC%8E%EF%BC%8E/services/',
    '/safe/%EF%BC%BCprivate/',
    '/%EF%BC%85%36%31dmin/',
  ]

  for (const path of unsafePaths) {
    assert.equal(getSafePublicPathname(path), null, path)
  }
  assert.equal(getSafePublicPathname('/services/'), '/services/')
})

test('rejects response IDs and ranks outside the central contract', () => {
  assert.deepEqual(
    normalizeNetworkSearchResults(
      networkPayload([result()], '018f7e5a-7b4d-0c6a-8e9f-0123456789ab'),
      'portal',
    ),
    [],
  )
  assert.deepEqual(
    normalizeNetworkSearchResults(
      networkPayload([result()], '018f7e5a-7b4d-7c6a-7e9f-0123456789ab'),
      'portal',
    ),
    [],
  )
  assert.deepEqual(
    normalizeNetworkSearchResults(
      networkPayload([result()], '\t' + REQUEST_ID + '\n'),
      'portal',
    ),
    [],
  )
  assert.deepEqual(
    normalizeNetworkSearchResults(
      networkPayload([result({ rank: 4 })]),
      'portal',
    ),
    [],
  )
})

test('rejects malformed central response IDs and URL query or fragment payloads', () => {
  const unsafeResults = [
    result({ url: 'https://asv-wiki.acecore.net/article/rule/?next=admin' }),
    result({ url: 'https://asv-wiki.acecore.net/article/rule/#private' }),
    result({ url: 'https://asv-wiki.acecore.net/admin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%61dmin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%61pi/search' }),
    result({ url: 'https://asv-wiki.acecore.net/%2561dmin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%2561pi/search' }),
    result({ url: 'https://asv-wiki.acecore.net/%252e%252e/admin/' }),
    result({ url: 'https://asv-wiki.acecore.net//admin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%2fadmin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%252fadmin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%5cadmin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%255cadmin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%255capi/search' }),
    result({ url: 'https://asv-wiki.acecore.net/%2500admin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%EF%BC%8Fadmin/' }),
    result({ url: 'https://asv-wiki.acecore.net/%EF%BC%85%36%31dmin/' }),
    result({ url: 'https://asv-wiki.acecore.net/\\admin/' }),
    result({ url: 'https://asv-wiki.acecore.net/safe/../services/' }),
    result({ url: 'https://asv-wiki.acecore.net/safe\\private/' }),
    result({ url: 'https://asv-wiki.acecore.net/\tservices/' }),
    result({ url: 'https://asv-wiki.acecore.net/safe/%252e%252e/services/' }),
    result({ url: 'https://asv-wiki.acecore.net/safe%252fprivate/' }),
    result({ url: 'https://asv-wiki.acecore.net/%ZZ/' }),
  ]

  assert.deepEqual(
    normalizeNetworkSearchResults(
      networkPayload([result()], 'not-a-uuid'),
      'portal',
    ),
    [],
  )
  assert.deepEqual(
    normalizeNetworkSearchResults(networkPayload(unsafeResults), 'portal'),
    [],
  )
})
