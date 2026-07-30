import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getGuideLinkResources,
  hasExplicitAceserverIntent,
  resolveGuideLocale,
  SOURCE_LABELS,
  TARGET_LANGUAGES,
} from '../functions/api/alpha-locales.js'
import {
  buildTranslationProblemStatement,
  classifyCmsCommitSet,
  normalizeSha,
  parseChangedFiles,
} from '../scripts/create-translation-task.mjs'
import {
  getAlternatePaths,
  localizePath,
  LOCALES,
  stripLocalePrefix,
  TRANSLATED_LOCALES,
} from '../src/i18n/config.ts'
import { TRANSLATIONS } from '../src/i18n/translations.ts'
import {
  createAlphaInlineMarkdownPattern,
  escapeRegExpLiteral,
} from '../src/utils/alpha-link-pattern.ts'

test('公開localeは日本語を既定とする9言語で固定する', () => {
  assert.deepEqual(LOCALES, [
    'ja',
    'en',
    'zh-cn',
    'es',
    'pt',
    'fr',
    'ko',
    'de',
    'ru',
  ])
  assert.deepEqual(
    Object.keys(TRANSLATIONS).sort(),
    [...TRANSLATED_LOCALES].sort(),
  )
  assert.deepEqual(Object.keys(TARGET_LANGUAGES).sort(), [...LOCALES].sort())
  assert.deepEqual(Object.keys(SOURCE_LABELS).sort(), [...LOCALES].sort())
})

test('内部routeだけをlocale化し、URL・hash・管理routeを壊さない', () => {
  assert.equal(
    localizePath('fr', '/world-map/?view=all#main'),
    '/fr/world-map/?view=all#main',
  )
  assert.equal(localizePath('ja', '/fr/stories/example/'), '/stories/example/')
  assert.equal(
    localizePath('de', 'https://example.com/path'),
    'https://example.com/path',
  )
  assert.equal(localizePath('ru', '#alpha-guide'), '#alpha-guide')
  assert.equal(localizePath('ko', '/admin/'), '/admin/')
  assert.equal(
    localizePath('es', '/uploads/example.webp'),
    '/uploads/example.webp',
  )
  assert.equal(stripLocalePrefix('/zh-cn/world-map/'), '/world-map/')

  const alternates = getAlternatePaths('/pt/stories/example/')
  assert.equal(alternates.length, 9)
  assert.equal(
    alternates.find(({ locale }) => locale === 'ja')?.href,
    '/stories/example/',
  )
  assert.equal(
    alternates.find(({ locale }) => locale === 'en')?.href,
    '/en/stories/example/',
  )
})

test('Alphaの主要リンクは全localeで同一allowlistとlocale内マップを使う', () => {
  for (const locale of LOCALES) {
    const resources = getGuideLinkResources(locale)
    assert.equal(resources.length, 3)
    assert.equal(resources[0].href, 'https://discord.gg/acsv')
    assert.equal(resources[1].href, 'https://asv-wiki.acecore.net')
    assert.equal(
      resources[2].href,
      locale === 'ja' ? '/world-map/' : `/${locale}/world-map/`,
    )
    assert.ok(resources.every((resource) => resource.terms.length > 0))
    assert.equal(resolveGuideLocale(locale), locale)
    assert.equal(
      hasExplicitAceserverIntent(resources[0].terms[0], locale),
      true,
    )
  }

  assert.equal(resolveGuideLocale('invalid'), 'ja')
})

test('Alphaの自動リンクregexは翻訳語中の正規表現記号を文字として扱う', () => {
  const dangerousTerm = 'Map (A+B)? [official]'
  assert.equal(
    escapeRegExpLiteral(dangerousTerm),
    'Map \\(A\\+B\\)\\? \\[official\\]',
  )

  const pattern = createAlphaInlineMarkdownPattern('(?!)', [
    { terms: [dangerousTerm, 'Карта миров', '세계 지도'] },
  ])
  const text = `Open ${dangerousTerm}; Карта миров; 세계 지도.`
  assert.deepEqual(
    [...text.matchAll(pattern)].map((match) => match[1]),
    [dangerousTerm, 'Карта миров', '세계 지도'],
  )
  assert.equal(pattern.test('Map ABBBB official'), false)
})

test('翻訳task入力はshellへ渡さず、許可した日本語正本pathだけを受け入れる', () => {
  assert.deepEqual(
    parseChangedFiles(
      'src/content/pages/top.json, src/content/stories/aceserver-hijacked.md',
    ),
    ['src/content/pages/top.json', 'src/content/stories/aceserver-hijacked.md'],
  )
  assert.throws(
    () => parseChangedFiles('src/content/pages/top.json;touch injected'),
    /Unsupported Japanese translation source path/u,
  )
  assert.throws(
    () => parseChangedFiles('src/content/stories/en/aceserver-hijacked.md'),
    /Unsupported Japanese translation source path/u,
  )
  assert.throws(
    () => normalizeSha('main && curl example.invalid'),
    /Invalid Git SHA/u,
  )

  assert.equal(
    classifyCmsCommitSet([
      {
        parentShas: ['a'],
        subject: 'cms: update src/content/pages/top.json',
      },
    ]),
    'cms-only',
  )
  assert.equal(
    classifyCmsCommitSet([
      {
        parentShas: ['a'],
        subject: 'cms: update src/content/pages/top.json',
      },
      { parentShas: ['b'], subject: '通常のコード変更' },
    ]),
    'mixed',
  )

  const problemStatement = buildTranslationProblemStatement({
    repository: 'acecore-systems/aceserver-portal',
    headSha: 'a'.repeat(40),
    changedFiles: ['src/content/pages/top.json'],
  })
  assert.match(problemStatement, /日本語正本は変更しない/u)
  assert.match(problemStatement, /placeholder、URL、route/u)
  assert.match(problemStatement, /translation-source-sha:a{40}/u)
})
