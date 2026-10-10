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

test('schemaと同じtrimを適用し、Article用の内部空白は維持する', () => {
  assert.deepEqual(
    readStoryMetadata(
      '---\ntitle: "  案内  "\ndescription: |\n  一行目\n  二行目\n---\n',
      'example',
    ),
    { title: '案内', description: '一行目\n二行目' },
  )
})

test('HTML文字参照を復号してmeta・リンク・見えるパンくずを照合する', async () => {
  const { attributeValue, visibleText } =
    await import('../scripts/story-output-values.mjs')
  assert.equal(
    attributeValue(
      '<meta content="Reader&#39;s &amp; &quot;Guide&quot;">',
      'content',
    ),
    `Reader's & "Guide"`,
  )
  assert.equal(
    attributeValue(' type="application/ld+json"', 'type'),
    'application/ld+json',
  )
  assert.equal(
    attributeValue('<a href="/stories/" aria-label="A &amp; B">', 'aria-label'),
    'A & B',
  )
  assert.equal(
    attributeValue('<figure><img src="/example.webp"></figure>', 'src'),
    null,
  )
  assert.equal(
    visibleText('<a href="/">ホーム</a><span>Reader&#39;s &amp; Guide</span>'),
    "ホームReader's & Guide",
  )
  assert.equal(
    visibleText('<script>not visible</script><style>not visible</style>案内'),
    '案内',
  )
})

test('metaのdescriptionはレイアウトと同じ補足・空白整理・上限を使う', async () => {
  const { storyMetaDescription } =
    await import('../scripts/story-output-values.mjs')
  const shortStory = { description: '  参加方法\nを確認  ' }
  const settings = { description: '公式の参加案内を掲載しています。' }
  assert.equal(
    storyMetaDescription(shortStory, settings),
    '参加方法 を確認 公式の参加案内を掲載しています。',
  )
  const longStory = { description: '長'.repeat(200) }
  assert.equal(
    storyMetaDescription(longStory, settings),
    '長'.repeat(159) + '…',
  )
  assert.equal(longStory.description.length, 200)
})
