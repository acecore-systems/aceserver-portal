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

test('the picture diary is reachable without opening Alpha Chat', async () => {
  const [navigationSource, homeSource] = await Promise.all([
    readFile(
      new URL('../src/content/site/navigation.json', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL('../src/components/HomePage.astro', import.meta.url),
      'utf8',
    ),
  ])
  const navigation = JSON.parse(navigationSource)
  const diaryItem = navigation.items.find(
    (item) => item.href === '/alpha-diary/',
  )

  assert.deepEqual(diaryItem, {
    text: '絵日記',
    href: '/alpha-diary/',
    icon: 'notebook-pen',
  })
  assert.equal([...homeSource.matchAll(/href=\{diaryPath\}/gu)].length, 2)
  assert.match(homeSource, /getAlphaDiaryUi\(locale\)/u)
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
  assert.doesNotMatch(source, /journeyToken/u)
  assert.doesNotMatch(source, /alpha-diary:progress/u)
})

test('future dates reach the custom tomorrow message instead of native form blocking', async () => {
  const [component, script] = await Promise.all([
    readFile(
      new URL('../src/components/AlphaDiaryPage.astro', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../src/scripts/alpha-diary.ts', import.meta.url), 'utf8'),
  ])

  assert.match(component, /data-diary-date-form novalidate/u)
  const futureGuardStart = script.indexOf('if (date && date > serverToday)')
  const requestStart = script.indexOf('await requestDiary(', futureGuardStart)
  const futureGuard = script.slice(futureGuardStart, requestStart)

  assert.ok(futureGuardStart >= 0 && requestStart > futureGuardStart)
  assert.match(futureGuard, /renderFuture\(\)/u)
  assert.match(futureGuard, /return false/u)
})

test('the arbitrary older-record jump is absent while calendar date selection remains', async () => {
  const [component, copySource, script] = await Promise.all([
    readFile(
      new URL('../src/components/AlphaDiaryPage.astro', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../src/data/alpha-diary-ui.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/scripts/alpha-diary.ts', import.meta.url), 'utf8'),
  ])

  assert.doesNotMatch(component, /data-diary-deeper/u)
  assert.doesNotMatch(copySource, /\bdeeper:/u)
  assert.doesNotMatch(script, /getDeeperDate/u)
  assert.match(component, /data-diary-date-form novalidate/u)
  assert.match(script, /queueDateLoad\(dateInput\.value\)/u)
})

test('observation records switch from the picture diary to a staff archive surface', async () => {
  const [component, script] = await Promise.all([
    readFile(
      new URL('../src/components/AlphaDiaryPage.astro', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../src/scripts/alpha-diary.ts', import.meta.url), 'utf8'),
  ])

  for (const locale of LOCALES) {
    assert.ok(getAlphaDiaryUi(locale).observationQuestionsTitle.length > 0)
  }
  assert.match(component, /data-record-kind="loading"/u)
  assert.match(component, /class="diary-hero__archive-mark"/u)
  assert.match(
    component,
    /\.alpha-diary\[data-record-kind='observation'\] \.diary-entry/u,
  )
  assert.match(component, /grid-template-columns: minmax\(0, 1\.55fr\)/u)
  assert.match(component, /\.diary-paper__rings,/u)
  assert.match(component, /\.diary-tape,/u)
  assert.match(script, /root\.dataset\.recordKind = surfaceKind/u)
  assert.match(
    script,
    /if \(date && date < BIRTH_BOUNDARY\) return 'observation'/u,
  )
})

test('past picture diary pages open as bound records instead of being written now', async () => {
  const script = await readFile(
    new URL('../src/scripts/alpha-diary.ts', import.meta.url),
    'utf8',
  )
  const japaneseCopy = getAlphaDiaryUi('ja')

  for (const locale of LOCALES) {
    const copy = getAlphaDiaryUi(locale)
    assert.notEqual(copy.pastLoadingTitle, copy.loadingTitle, locale)
    assert.notEqual(copy.pastLoadingBody, copy.loadingBody, locale)
  }
  assert.match(japaneseCopy.pastLoadingTitle, /過去のページ/u)
  assert.match(japaneseCopy.pastLoadingBody, /綴じられた絵日記/u)
  assert.doesNotMatch(
    japaneseCopy.pastLoadingBody,
    /鉛筆を走らせる|文字と絵が浮かぶ|書いて/u,
  )
  assert.match(script, /date && date < serverToday \? 'past' : 'current'/u)
  assert.match(script, /copy\.pastLoadingTitle/u)
  assert.match(script, /copy\.pastLoadingBody/u)
  assert.match(script, /setLoading\(getLoadingKind\(date\)\)/u)
  assert.match(script, /waitLifecycle\.markPending\(requestId/u)
})

test('past observation records load as existing archive pages instead of being written now', async () => {
  const script = await readFile(
    new URL('../src/scripts/alpha-diary.ts', import.meta.url),
    'utf8',
  )
  const japaneseCopy = getAlphaDiaryUi('ja')

  for (const locale of LOCALES) {
    const copy = getAlphaDiaryUi(locale)
    assert.notEqual(copy.observationLoadingTitle, copy.loadingTitle, locale)
    assert.notEqual(copy.observationLoadingBody, copy.loadingBody, locale)
  }
  assert.match(japaneseCopy.observationLoadingTitle, /保管された記録/u)
  assert.match(japaneseCopy.observationLoadingBody, /記録庫から/u)
  assert.doesNotMatch(
    japaneseCopy.observationLoadingBody,
    /鉛筆を走らせる|文字と絵が浮かぶ|書いて/u,
  )
  assert.match(script, /loadingKind === 'observation'/u)
  assert.match(script, /copy\.observationLoadingTitle/u)
  assert.match(script, /copy\.observationLoadingBody/u)
})

test('long diary waits expose elapsed time without repeated screen-reader announcements', async () => {
  const [component, script] = await Promise.all([
    readFile(
      new URL('../src/components/AlphaDiaryPage.astro', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../src/scripts/alpha-diary.ts', import.meta.url), 'utf8'),
  ])

  for (const locale of LOCALES) {
    const copy = getAlphaDiaryUi(locale)
    assert.match(copy.waitingElapsed, /\{seconds\}/u, locale)
    assert.match(copy.loadElapsed, /\{seconds\}/u, locale)
    assert.match(copy.rateLimitedBody, /\{seconds\}/u, locale)
    assert.ok(copy.rateLimitedTitle.length > 0, locale)
    assert.ok(copy.longWaitTitle.length > 0, locale)
    assert.ok(copy.longWaitBody.length > 0, locale)
    assert.ok(copy.manualCheck.length > 0, locale)
    assert.ok(copy.timeoutTitle.length > 0, locale)
    assert.ok(copy.timeoutBody.length > 0, locale)
  }
  assert.match(component, /data-diary-wait-elapsed[\s\S]*aria-live="off"/u)
  assert.match(component, /data-diary-load-summary/u)
  assert.match(component, /data-diary-entry-load-summary/u)
  assert.match(component, /\[data-diary-state-body\]/u)
  assert.match(script, /requestJsonWithDiaryTimeout/u)
  assert.match(script, /fixture === 'pending'/u)
  assert.match(script, /document\.visibilityState === 'visible'/u)
  assert.match(script, /finalizeLoadMeasurement\('ready'\)/u)
  assert.match(script, /reportDiaryLoadMeasurement\(measurement/u)
  assert.match(script, /resumePendingEntry\('recovery'\)/u)
  assert.match(script, /bfcacheResume\.recordPageHide/u)
  assert.match(script, /takePersistedPageShow\(event\.persisted\)/u)
})

test('exploration is user-led from today’s trailhead to a passphrase on the key date', async () => {
  const [component, copySource, script] = await Promise.all([
    readFile(
      new URL('../src/components/AlphaDiaryPage.astro', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../src/data/alpha-diary-ui.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/scripts/alpha-diary.ts', import.meta.url), 'utf8'),
  ])

  assert.doesNotMatch(component, /Journey \/ Goal/u)
  assert.doesNotMatch(component, /data-journey-(?:viewed|confirmed)/u)
  assert.doesNotMatch(component, /data-diary-suggestions/u)
  assert.doesNotMatch(component, /data-diary-(?:reset|follow-latest)/u)
  assert.doesNotMatch(
    `${component}\n${copySource}`,
    /新しいページは明るく、古いページほど言葉が足りません/u,
  )
  assert.doesNotMatch(
    copySource,
    /confirmedLabel|goalHint|subtitle|viewedLabel/u,
  )
  assert.doesNotMatch(
    `${component}\n${copySource}\n${script}`,
    /しおりを外す|journeyToken|OPENED_DATES_STORAGE_KEY|followLatest/u,
  )
  assert.doesNotMatch(component, /data-diary-clue|diary-clue/u)
  assert.doesNotMatch(copySource, /clueLabel|clueLead|余白の手掛かり/u)
  assert.match(component, /data-diary-finale-form/u)
  assert.match(component, /data-diary-finale-keyword/u)
  assert.doesNotMatch(component, /data-diary-open-finale/u)
  assert.match(script, /version: 2/u)
  assert.match(script, /finaleKeyword: keyword/u)
  assert.doesNotMatch(
    script,
    /DiaryPuzzleClue|payload\.puzzleClue|getAmbientClueParagraphIndex/u,
  )
  assert.match(
    script,
    /function setFinaleChallengeAvailable\(available: boolean\)/u,
  )
  assert.match(script, /unlockedPanel\.hidden = !available/u)
  assert.match(getAlphaDiaryUi('ja').questionsLead, /言葉や日付/u)
  assert.match(getAlphaDiaryUi('ja').questionsLead, /自分で覚えて/u)
  assert.match(getAlphaDiaryUi('ja').unlockedBody, /合言葉/u)
  assert.match(getAlphaDiaryUi('ja').finaleKeywordIncorrect, /三つの手掛かり/u)
  assert.doesNotMatch(script, /puzzleClue:\s*['"]実験体アルファ/u)
  assert.match(script, /normalizeFinaleKeyword\('実験体アルファ'\)/u)
  assert.doesNotMatch(script, /normalizeFinaleKeyword\('実験台アルファ'\)/u)
})

test('visible diary copy does not explain generation, sharing, or internal versions', async () => {
  const component = await readFile(
    new URL('../src/components/AlphaDiaryPage.astro', import.meta.url),
    'utf8',
  )
  const allCopy = LOCALES.flatMap((locale) =>
    Object.values(getAlphaDiaryUi(locale)),
  ).join('\n')

  assert.doesNotMatch(
    allCopy,
    /初めて開かれる|全員に同じ|opened for the first time|same page will remain for everyone|首次打开|所有人都会看到同一页|abierta por primera vez|quedará para todos|aberta pela primeira vez|ficará para todos|ouverte pour la première fois|pour tout le monde|처음 열리는|모두에게 같은|erstmals geöffnet|für alle erhalten|открытой впервые|останется для всех/iu,
  )
  assert.doesNotMatch(
    allCopy,
    /共有された|shared diary|entradas compartidas|páginas compartilhadas|pages partagées|공유된 일기|gemeinsam genutzten|общие страницы/iu,
  )
  assert.doesNotMatch(component, /CONTENT NOTICE \/ v\d+/u)
  assert.match(getAlphaDiaryUi('ja').loadingBody, /鉛筆を走らせる音/u)
  assert.match(getAlphaDiaryUi('ja').questionsLead, /送るのはあなた/u)
  assert.match(getAlphaDiaryUi('ja').finaleBody, /心理的ホラー/u)
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
  assert.match(script, /stage: 'drift'/u)
  assert.match(script, /stage: 'correction'/u)
  assert.match(script, /stage: 'logs'/u)
  assert.match(script, /stage: 'invasion'/u)
  assert.match(script, /stage: 'reverse'/u)
  assert.match(script, /stage: 'message'/u)
  assert.match(script, /stage: 'hope'/u)
  assert.match(script, /revealFinaleLogs/u)
  assert.match(script, /requestAnimationFrame/u)
  assert.match(script, /'pointermove'/u)
  assert.match(component, /data-finale-shards/u)
  assert.match(component, /data-finale-message-visual/u)
  assert.doesNotMatch(`${component}\n${script}`, /<audio|new Audio\(/u)
})

test('local storage contains only consent and client id keys', async () => {
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
  ])
  assert.doesNotMatch(
    script,
    /localStorage\.(?:setItem|getItem)\([^\n]*question/iu,
  )
})
