import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  serializeCssUrl,
  serializeJsonForHtmlScript,
} from '../src/data/safe-json.ts'

test('JSON-LD内のscript終端とHTML有効文字をescapeする', () => {
  const serialized = serializeJsonForHtmlScript({
    description: '</script><script>alert(1)</script>&\u2028\u2029',
  })

  assert.equal(serialized.includes('</script'), false)
  assert.equal(serialized.includes('<script'), false)
  assert.equal(serialized.includes('&'), false)
  assert.match(serialized, /\\u003c\/script\\u003e/)
  assert.match(serialized, /\\u2028\\u2029/)
  assert.deepEqual(JSON.parse(serialized), {
    description: '</script><script>alert(1)</script>&\u2028\u2029',
  })
})

test('CMS由来URLをCSS url()の文字列境界からescapeする', () => {
  const serialized = serializeCssUrl(
    '/uploads/example"); color: red; --escape: url("x',
  )

  assert.equal(
    serialized,
    'url("/uploads/example\\"); color: red; --escape: url(\\"x")',
  )
})
