import assert from 'node:assert/strict'
import test from 'node:test'

import { readStoryMetadata } from '../scripts/story-source-metadata.mjs'

test('改訂したタイトルと説明を正本から読み、固定値へ戻さない', () => {
  const source = `---
title: '新しい WIKI 案内: 質問例'
description: "原文を確認する手順"
author: Gui
image: /unchanged.webp
---
本文
`
  assert.deepEqual(readStoryMetadata(source, 'wiki-alpha-guide'), {
    title: '新しい WIKI 案内: 質問例',
    description: '原文を確認する手順',
  })
})

test('引用符・コメント・折り返し・CRLFをYAMLの意味で読む', () => {
  const source = `---
title: 'Reader''s guide' # publication title
description: >-
  First line
  second line
---
title: 本文の行をmetadataにしない
`.replaceAll('\n', '\r\n')
  assert.deepEqual(readStoryMetadata(source, 'example'), {
    title: "Reader's guide",
    description: 'First line second line',
  })
})

test('欠落・重複・空文字・非文字列のmetadataを合格にしない', () => {
  for (const source of [
    'title: body only',
    '---\ntitle: ok\n---\nbody',
    '---\ntitle: first\ntitle: duplicate\ndescription: ok\n---\n',
    '---\ntitle: \"\"\ndescription: ok\n---\n',
    '---\ntitle: 123\ndescription: ok\n---\n',
    '---\ntitle: ok\ndescription: [array]\n---\n',
    '---\ntitle: ok\ndescription: !unsupported value\n---\n',
  ]) {
    assert.throws(() => readStoryMetadata(source, 'example'))
  }
})
