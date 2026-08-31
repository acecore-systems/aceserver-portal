import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { getAlphaDiaryUi } from '../src/data/alpha-diary-ui.ts'
import { LOCALES } from '../src/i18n/config.ts'

test('the picture diary has complete fixed safety and navigation copy in all nine locales', () => {
  const japaneseKeys = Object.keys(getAlphaDiaryUi('ja')).sort()
  assert.equal(LOCALES.length, 9)
  for (const locale of LOCALES) {
    const copy = getAlphaDiaryUi(locale)
    assert.deepEqual(Object.keys(copy).sort(), japaneseKeys, locale)
    assert.ok(
      Object.values(copy).every(
        (value) => typeof value === 'string' && value.trim().length > 0,
      ),
      locale,
    )
  }
})

test('the diary handoff pre-fills Alpha Chat without automatically submitting', async () => {
  const source = await readFile(
    new URL('../src/components/AlphaGuide.astro', import.meta.url),
    'utf8',
  )
  const openerStart = source.indexOf(
    "const opener = target.closest('[data-alpha-open]')",
  )
  const openerEnd = source.indexOf(
    "document.addEventListener(\n      'keydown'",
    openerStart,
  )
  const openerHandler = source.slice(openerStart, openerEnd)

  assert.ok(openerStart >= 0 && openerEnd > openerStart)
  assert.match(openerHandler, /data-alpha-question/u)
  assert.match(openerHandler, /input\.value = question/u)
  assert.doesNotMatch(openerHandler, /sendAlphaQuestion/u)
  assert.match(source, /diaryEntryId/u)
  assert.match(source, /journeyToken/u)
  assert.match(source, /alpha-diary:progress/u)
})

test('the final sequence keeps explicit choices, escape, reduced motion, and no audio', async () => {
  const [component, script] = await Promise.all([
    readFile(
      new URL('../src/components/AlphaDiaryPage.astro', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../src/scripts/alpha-diary.ts', import.meta.url), 'utf8'),
  ])

  assert.match(component, /data-finale-mode="horror"/u)
  assert.match(component, /data-finale-mode="reduced"/u)
  assert.match(component, /data-finale-mode="text"/u)
  assert.match(component, /prefers-reduced-motion: reduce/u)
  assert.match(script, /requestFullscreen\(\)/u)
  assert.match(script, /event\.key === 'Escape'/u)
  assert.match(script, /document\.exitFullscreen/u)
  assert.match(script, /searchParams\.set\('fixture', 'current'\)/u)
  assert.doesNotMatch(`${component}\n${script}`, /<audio|new Audio\(/u)
})

test('local storage contains only consent, opaque journey, opened dates, and client id keys', async () => {
  const script = await readFile(
    new URL('../src/scripts/alpha-diary.ts', import.meta.url),
    'utf8',
  )
  const storageKeys = [...script.matchAll(/'alpha-diary\.[^']+'/gu)].map(
    (match) => match[0],
  )

  assert.deepEqual([...new Set(storageKeys)].sort(), [
    "'alpha-diary.client.v1'",
    "'alpha-diary.content-consent.v1'",
    "'alpha-diary.journey.v1'",
    "'alpha-diary.opened-dates.v1'",
  ])
  assert.doesNotMatch(
    script,
    /localStorage\.(?:setItem|getItem)\([^\n]*question/iu,
  )
})
