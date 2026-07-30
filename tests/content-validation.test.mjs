import assert from 'node:assert/strict'
import test from 'node:test'

import {
  extractMarkdownTargets,
  extractStoryMarkdownTargets,
} from '../scripts/markdown-targets.mjs'

test('CommonMarkのangle destinationとURL内括弧を完全に抽出する', () => {
  const result = extractMarkdownTargets(
    '[space](</missing path/>)\n[nested](/stories/example_(one)/)',
  )

  assert.deepEqual(
    result.links.map(({ target }) => target),
    ['/missing path/', '/stories/example_(one)/'],
  )
  assert.deepEqual(result.images, [])
  assert.deepEqual(result.missingReferences, [])
})

test('reference形式のリンクと画像をdefinitionから解決する', () => {
  const result = extractMarkdownTargets(`
[story][target]
![仮想空間の画像][image]

[target]: /stories/aceserver-hijacked/
[image]: /uploads/stories/metaverse-is-close.webp
`)

  assert.deepEqual(result.links[0], {
    label: 'target',
    line: 2,
    target: '/stories/aceserver-hijacked/',
  })
  assert.deepEqual(result.images[0], {
    alt: '仮想空間の画像',
    label: 'image',
    line: 3,
    target: '/uploads/stories/metaverse-is-close.webp',
  })
  assert.deepEqual(result.missingReferences, [])
})

test('コード内のMarkdown風文字列をリンクとして扱わない', () => {
  const result = extractMarkdownTargets(`
\`[inline](/missing/)\`

\`\`\`md
![image](/missing.webp)
\`\`\`

\\[escaped][missing]

<!-- [comment][missing] -->
`)

  assert.deepEqual(result.links, [])
  assert.deepEqual(result.images, [])
  assert.deepEqual(result.missingReferences, [])
})

test('重複definitionはCommonMarkどおり最初のtargetを使う', () => {
  const result = extractMarkdownTargets(`
[story][target]

[target]: /stories/first/
[target]: /stories/second/
`)

  assert.equal(result.links[0]?.target, '/stories/first/')
  assert.deepEqual(result.missingReferences, [])
})

test('未解決のfull・collapsed referenceを検出する', () => {
  const result = extractMarkdownTargets(`
[missing link][link]
![missing image][image]
[collapsed][]

\`[code][missing]\`
`)

  assert.deepEqual(result.links, [])
  assert.deepEqual(result.images, [])
  assert.deepEqual(
    result.missingReferences.map(({ label, line }) => ({ label, line })),
    [
      { label: 'link', line: 2 },
      { label: 'image', line: 3 },
      { label: 'collapsed', line: 4 },
    ],
  )
})

test('空destinationを検証対象として保持する', () => {
  const result = extractMarkdownTargets(`
[inline]()
![inline image](<>)
[reference][empty]
![reference image][empty]

[empty]: <>
`)

  assert.deepEqual(
    result.links.map(({ target }) => target),
    ['', ''],
  )
  assert.deepEqual(
    result.images.map(({ target }) => target),
    ['', ''],
  )
  assert.deepEqual(result.missingReferences, [])
})

test('Storiesのfrontmatterを本文リンクとして扱わず行番号を維持する', () => {
  const result = extractStoryMarkdownTargets(`---
title: "[例](/frontmatter-only/)"
description: "![例](/frontmatter-only.webp)"
---

[本文](/stories/aceserver-hijacked/)
`)

  assert.deepEqual(result.links, [
    {
      label: undefined,
      line: 6,
      target: '/stories/aceserver-hijacked/',
    },
  ])
  assert.deepEqual(result.images, [])
  assert.deepEqual(result.missingReferences, [])
})
