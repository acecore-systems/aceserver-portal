import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildSeoDescription,
  buildSeoTitle,
  SEO_DESCRIPTION_LENGTH,
  SEO_TITLE_LENGTH,
} from '../src/utils/seo-meta.ts'

test('短いワールドマップタイトルにサイトと用途を補う', () => {
  const title = buildSeoTitle({
    title: 'ワールドマップ',
    siteTitle: 'エースサーバー',
    titleContext: 'Minecraft無料公開サーバーの公式ポータル',
    isHome: false,
  })

  assert.equal(
    title,
    'ワールドマップ | エースサーバー | Minecraft無料公開サーバーの公式ポータル',
  )
  assert.ok(Array.from(title).length <= SEO_TITLE_LENGTH.max)
})

test('長い多言語タイトルはブランドと用途を残して上限へ収める', () => {
  const title = buildSeoTitle({
    title: 'Complete guide to joining the Aceserver public Minecraft community',
    siteTitle: 'Aceserver',
    titleContext: 'Official portal for the free public Minecraft server',
    isHome: false,
  })

  assert.ok(Array.from(title).length <= SEO_TITLE_LENGTH.max)
  assert.match(title, /Aceserver/u)
})

test('短いdescriptionには既存のサイト説明を一度だけ補う', () => {
  const siteDescription =
    '誰でも参加可能なMinecraft無料公開サーバー、エースサーバーの公式ポータルです。参加方法、ワールドマップ、Wiki、動画、最新案内をまとめています。'
  const description = buildSeoDescription({
    description: 'サイト内検索',
    shortDescriptionContext: siteDescription,
  })

  assert.match(description, /サイト内検索/u)
  assert.match(description, /参加方法/u)
  assert.ok(Array.from(description).length >= SEO_DESCRIPTION_LENGTH.min)
  assert.ok(Array.from(description).length <= SEO_DESCRIPTION_LENGTH.max)
  assert.equal(
    buildSeoDescription({
      description: siteDescription,
      shortDescriptionContext: siteDescription,
    }),
    siteDescription,
  )
})
