import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { GUIDE_MESSAGES_BY_LOCALE } from '../functions/api/alpha-locales.ts'
import { LOCALES } from '../src/i18n/config.ts'
import { JA_UI, TRANSLATIONS } from '../src/i18n/translations.ts'

const EXPECTED_ALPHA_COPY = {
  ja: {
    greeting: 'やあ、ぼくはアルファくんだよ。エースサーバーを案内するね。',
    loading: 'ちょっと考えているよ...',
    error:
      'いまはうまく答えを届けられなかったよ。[公式Discord]({discord}) と [Aceserver WIKI]({wiki}) を見てね。',
  },
  en: {
    greeting:
      "Hi, I'm Alpha-kun. I'll help you find your way around Aceserver.",
    loading: "I'm thinking...",
    error:
      "I couldn't deliver an answer this time. Check [official Discord]({discord}) and the [Aceserver WIKI]({wiki}).",
  },
  'zh-cn': {
    greeting: '你好，我是 Alpha-kun。我来带你了解 Aceserver。',
    loading: '我正在想……',
    error:
      '这次我没能把答案送过来。去看[官方 Discord]({discord})和 [Aceserver WIKI]({wiki})吧。',
  },
  es: {
    greeting: 'Hola, soy Alpha-kun. Te ayudo a orientarte en Aceserver.',
    loading: 'Estoy pensando...',
    error:
      'Esta vez no pude enviarte una respuesta. Mira el [Discord oficial]({discord}) y la [WIKI de Aceserver]({wiki}).',
  },
  pt: {
    greeting:
      'Olá, eu sou o Alpha-kun. Vou ajudar você a conhecer o Aceserver.',
    loading: 'Tô pensando...',
    error:
      'Dessa vez eu não consegui entregar uma resposta. Olha o [Discord oficial]({discord}) e a [WIKI do Aceserver]({wiki}).',
  },
  fr: {
    greeting: 'Salut, je suis Alpha-kun. Je vais te guider dans Aceserver.',
    loading: 'Je réfléchis...',
    error:
      'Je n’ai pas réussi à t’envoyer une réponse cette fois. Regarde le [Discord officiel]({discord}) et le [WIKI Aceserver]({wiki}).',
  },
  ko: {
    greeting: '안녕, 나는 Alpha-kun이야. Aceserver를 안내해 줄게.',
    loading: '지금 생각하고 있어...',
    error:
      '이번에는 답을 전해 주지 못했어. [공식 Discord]({discord})와 [Aceserver WIKI]({wiki})를 확인해 봐.',
  },
  de: {
    greeting:
      'Hallo, ich bin Alpha-kun. Ich helfe dir, dich bei Aceserver zurechtzufinden.',
    loading: 'Ich denke nach...',
    error:
      'Diesmal konnte ich dir keine Antwort schicken. Sieh im [offiziellen Discord]({discord}) und im [Aceserver WIKI]({wiki}) nach.',
  },
  ru: {
    greeting: 'Привет, я Alpha-kun. Я помогу тебе разобраться в Aceserver.',
    loading: 'Я думаю...',
    error:
      'В этот раз я не смог передать ответ. Загляни в [официальный Discord]({discord}) и [Aceserver WIKI]({wiki}).',
  },
}

const HIGH_CONFIDENCE_VIOLATIONS = {
  ja: /(?:私|わたし|僕|俺)|(?:です|ます|ください)(?:[。！？!?…]|$)/u,
  en: /\b(?:please be advised|we apologize|kindly|do not hesitate to)\b/iu,
  'zh-cn': /(?:您|阁下|敬请)/u,
  es: /\b(?:usted|le rogamos|tenga a bien)\b/iu,
  pt: /\b(?:o senhor|a senhora|queira por gentileza)\b/iu,
  fr: /\b(?:vous|votre|vos|veuillez)\b/iu,
  ko: /저(?:는|가|를|에게|도|의)?|(?:해요|이에요|예요|돼요|주세요|하세요|습니다|습니까|십시오|세요)(?:[.!?…。！？]|$)/u,
  de: /\b(?:Sie|Ihnen|Ihr|Ihre|Ihren|Ihrem|Ihrer|Ihres)\b/u,
  ru: /(?<![\p{L}\p{N}_])(?:вы|вас|вам|вами|ваш(?:а|е|и|его|ему|ей|их)?)(?![\p{L}\p{N}_])/iu,
}

test('Portalの挨拶・読込中・障害文は9言語の確認済み口調へ固定する', () => {
  assert.deepEqual(Object.keys(EXPECTED_ALPHA_COPY), [...LOCALES])
  for (const locale of LOCALES) {
    const ui = locale === 'ja' ? JA_UI : TRANSLATIONS[locale].ui
    const actual = {
      greeting: ui.alpha.greeting,
      loading: ui.alpha.loading,
      error: ui.alpha.error,
    }
    assert.deepEqual(actual, EXPECTED_ALPHA_COPY[locale], locale)
    assert.doesNotMatch(
      Object.values(actual).join('\n'),
      HIGH_CONFIDENCE_VIOLATIONS[locale],
      locale,
    )
  }
})

test('Portalアダプターの固定障害文も9言語の口調に適合する', () => {
  assert.deepEqual(Object.keys(GUIDE_MESSAGES_BY_LOCALE), [...LOCALES])
  for (const locale of LOCALES) {
    const messages = GUIDE_MESSAGES_BY_LOCALE[locale]
    assert.deepEqual(Object.keys(messages), [
      'invalidRequest',
      'requestTooLarge',
      'unconfigured',
      'failed',
    ])
    assert.doesNotMatch(
      Object.values(messages).join('\n'),
      HIGH_CONFIDENCE_VIOLATIONS[locale],
      locale,
    )
  }
})

test('Portalの公開endpointは共有Service Binding専用でローカル生成を持たない', async () => {
  const source = await readFile(
    new URL('../functions/api/alpha-chat.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /ALPHA_CHAT_SERVICE/u)
  assert.match(source, /SEARCH_RATE_LIMIT_DB/u)
  assert.doesNotMatch(source, /ALPHA_CHAT_SHARED_ENABLED/u)
  assert.doesNotMatch(source, /legacyOnRequestPost/u)
  assert.doesNotMatch(source, /createOpenAiResponse/u)
  assert.doesNotMatch(source, /OPENAI_API_KEY/u)
})

test('チャットUIは既存のリンクallowlistと長い正史応答timeoutを保つ', async () => {
  const source = await readFile(
    new URL('../src/components/AlphaGuide.astro', import.meta.url),
    'utf8',
  )
  const allowedExternalLinks = source.match(
    /allowedExternalLinks:\s*\[([\s\S]*?)\],\s*resources(?:\s*:|,)/,
  )?.[1]

  assert.ok(allowedExternalLinks)
  assert.match(allowedExternalLinks, /\bschoolsHref\b/u)
  assert.match(allowedExternalLinks, /\bsystemsHref\b/u)
  assert.match(source, /const ALPHA_RESPONSE_TIMEOUT_MS = 240_000/u)
})
