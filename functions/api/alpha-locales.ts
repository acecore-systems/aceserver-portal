export const DISCORD_URL = 'https://discord.gg/acsv'
export const WIKI_URL = 'https://asv-wiki.acecore.net'
export const WORLD_MAP_URL = '/world-map/'

const RESOURCE_COPY_BY_LOCALE = {
  ja: {
    discord: ['公式Discord', '公式ディスコード', 'Discord', 'ディスコード'],
    wiki: [
      'Aceserver WIKI',
      'エースサーバーWIKI',
      'Aceserver Wiki',
      'エースサーバーWiki',
      'WIKI',
      'Wiki',
      'ウィキ',
    ],
    map: ['ワールドマップ', 'マップ'],
  },
  en: {
    discord: ['Official Discord', 'Discord'],
    wiki: ['Aceserver WIKI', 'Aceserver Wiki', 'WIKI', 'Wiki'],
    map: ['World map', 'Map'],
  },
  'zh-cn': {
    discord: ['官方 Discord', 'Discord'],
    wiki: ['Aceserver WIKI', 'WIKI', 'Wiki', '维基'],
    map: ['世界地图', '地图'],
  },
  es: {
    discord: ['Discord oficial', 'Discord'],
    wiki: ['Aceserver WIKI', 'WIKI', 'Wiki'],
    map: ['Mapa de mundos', 'Mapa'],
  },
  pt: {
    discord: ['Discord oficial', 'Discord'],
    wiki: ['Aceserver WIKI', 'WIKI', 'Wiki'],
    map: ['Mapa dos mundos', 'Mapa'],
  },
  fr: {
    discord: ['Discord officiel', 'Discord'],
    wiki: ['Aceserver WIKI', 'WIKI', 'Wiki'],
    map: ['Carte des mondes', 'Carte'],
  },
  ko: {
    discord: ['공식 Discord', 'Discord', '디스코드'],
    wiki: ['Aceserver WIKI', 'WIKI', 'Wiki', '위키'],
    map: ['월드 맵', '지도'],
  },
  de: {
    discord: ['Offizielles Discord', 'Discord'],
    wiki: ['Aceserver WIKI', 'WIKI', 'Wiki'],
    map: ['Weltkarte', 'Karte'],
  },
  ru: {
    discord: ['Официальный Discord', 'Discord'],
    wiki: ['Aceserver WIKI', 'WIKI', 'Wiki', 'вики'],
    map: ['Карта миров', 'Карта'],
  },
}

export const SOURCE_LABELS = {
  ja: '参照',
  en: 'Source',
  'zh-cn': '来源',
  es: 'Fuente',
  pt: 'Fonte',
  fr: 'Source',
  ko: '출처',
  de: 'Quelle',
  ru: 'Источник',
}

export function getGuideLinkResources(locale = 'ja') {
  const resolvedLocale = resolveGuideLocale(locale)
  const copy = RESOURCE_COPY_BY_LOCALE[resolvedLocale]

  return [
    {
      href: DISCORD_URL,
      label: copy.discord[0],
      terms: copy.discord,
    },
    {
      href: WIKI_URL,
      label: 'Aceserver WIKI',
      terms: copy.wiki,
    },
    {
      href: getLocalizedWorldMapUrl(resolvedLocale),
      label: copy.map[0],
      terms: copy.map,
    },
  ]
}

export function hasExplicitAceserverIntent(value, locale = 'ja') {
  const text = String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase()
  if (
    /(?:\baceserver\b|エースサーバー|このサーバー|aceserver\s*wiki|エースサーバー\s*wiki|公式(?:discord|ディスコード)|\bminecraft\b|マインクラフト|マイクラ|\btnt\b|サーバー(?:ip|アドレス)|ホワイトリスト|ワールド|プラグイン)/iu.test(
      text,
    )
  ) {
    return true
  }
  const resources = getGuideLinkResources(locale)
  const terms = [
    'aceserver',
    'エースサーバー',
    ...resources.flatMap((resource) => resource.terms),
  ]

  return terms.some((term) =>
    text.includes(term.normalize('NFKC').toLocaleLowerCase()),
  )
}

export const GUIDE_MESSAGES = {
  invalidRequest: 'リクエスト形式が正しくないみたい。もう一度送ってね。',
  requestTooLarge: '送信内容が大きすぎるみたい。質問を短くして送ってね。',
  unconfigured: `いまはまだうまく答えられないんだ。参加方法は[公式Discord](${DISCORD_URL})、ルールは[Aceserver WIKI](${WIKI_URL})、ワールドは[ワールドマップ](${WORLD_MAP_URL})を見てね。`,
  failed: `いまはうまく答えを届けられなかったよ。参加方法は[公式Discord](${DISCORD_URL})、詳しい案内は[Aceserver WIKI](${WIKI_URL})を見てね。`,
}

export const TARGET_LANGUAGES = {
  ja: 'Japanese',
  en: 'English',
  'zh-cn': 'Simplified Chinese',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  ko: 'Korean',
  de: 'German',
  ru: 'Russian',
}

export const GUIDE_MESSAGES_BY_LOCALE = {
  ja: GUIDE_MESSAGES,
  en: {
    invalidRequest: "I couldn't read that request. Send it again.",
    requestTooLarge:
      'That message is too large. Shorten your question and send it again.',
    unconfigured: `I can't answer properly right now. For joining, check [Official Discord](${DISCORD_URL}); for rules, check [Aceserver WIKI](${WIKI_URL}); and for worlds, check the [World map](/en/world-map/).`,
    failed: `I couldn't deliver an answer this time. Check [Official Discord](${DISCORD_URL}) or [Aceserver WIKI](${WIKI_URL}).`,
  },
  'zh-cn': {
    invalidRequest: '我没看懂这次请求。再发一次吧。',
    requestTooLarge: '你发的内容太多了。把问题缩短一点再发吧。',
    unconfigured: `我现在还没法好好回答。参加方式看[官方 Discord](${DISCORD_URL})，规则看 [Aceserver WIKI](${WIKI_URL})，世界看[世界地图](/zh-cn/world-map/)。`,
    failed: `这次我没能把答案送过来。去看[官方 Discord](${DISCORD_URL})或 [Aceserver WIKI](${WIKI_URL})吧。`,
  },
  es: {
    invalidRequest: 'No pude leer esa solicitud. Envíala otra vez.',
    requestTooLarge:
      'Ese mensaje es demasiado grande. Acorta la pregunta y envíala otra vez.',
    unconfigured: `Ahora mismo no puedo responder bien. Para unirte, mira el [Discord oficial](${DISCORD_URL}); para las reglas, [Aceserver WIKI](${WIKI_URL}); y para los mundos, el [mapa](/es/world-map/).`,
    failed: `Esta vez no pude enviarte una respuesta. Mira el [Discord oficial](${DISCORD_URL}) o [Aceserver WIKI](${WIKI_URL}).`,
  },
  pt: {
    invalidRequest: 'Não consegui ler esse pedido. Manda de novo.',
    requestTooLarge:
      'Essa mensagem é grande demais. Encurta a pergunta e manda de novo.',
    unconfigured: `Agora eu não consigo responder direito. Para entrar, olha o [Discord oficial](${DISCORD_URL}); para regras, a [Aceserver WIKI](${WIKI_URL}); e para os mundos, o [mapa](/pt/world-map/).`,
    failed: `Dessa vez eu não consegui entregar uma resposta. Olha o [Discord oficial](${DISCORD_URL}) ou a [Aceserver WIKI](${WIKI_URL}).`,
  },
  fr: {
    invalidRequest: 'Je n’ai pas réussi à lire ta demande. Renvoie-la.',
    requestTooLarge: 'Ton message est trop long. Raccourcis ta question.',
    unconfigured: `Je n’arrive pas à répondre correctement pour le moment. Pour rejoindre, regarde le [Discord officiel](${DISCORD_URL}) ; pour les règles, [Aceserver WIKI](${WIKI_URL}) ; et pour les mondes, la [carte](/fr/world-map/).`,
    failed: `Je n’ai pas réussi à t’envoyer une réponse cette fois. Regarde le [Discord officiel](${DISCORD_URL}) ou [Aceserver WIKI](${WIKI_URL}).`,
  },
  ko: {
    invalidRequest: '요청을 읽지 못했어. 다시 보내 줘.',
    requestTooLarge: '보낸 내용이 너무 커. 질문을 짧게 줄여서 다시 보내 줘.',
    unconfigured: `지금은 내가 제대로 답하기 어려워. 참여는 [공식 Discord](${DISCORD_URL}), 규칙은 [Aceserver WIKI](${WIKI_URL}), 월드는 [월드 맵](/ko/world-map/)을 확인해 봐.`,
    failed: `이번에는 답을 전해 주지 못했어. [공식 Discord](${DISCORD_URL}) 또는 [Aceserver WIKI](${WIKI_URL})를 확인해 봐.`,
  },
  de: {
    invalidRequest:
      'Ich konnte die Anfrage nicht lesen. Schick sie noch einmal.',
    requestTooLarge:
      'Die Nachricht ist zu groß. Kürze deine Frage und schick sie noch einmal.',
    unconfigured: `Ich kann gerade nicht richtig antworten. Zum Beitreten sieh ins [offizielle Discord](${DISCORD_URL}), für Regeln in die [Aceserver WIKI](${WIKI_URL}) und für Welten auf die [Weltkarte](/de/world-map/).`,
    failed: `Diesmal konnte ich dir keine Antwort schicken. Sieh im [offiziellen Discord](${DISCORD_URL}) oder in der [Aceserver WIKI](${WIKI_URL}) nach.`,
  },
  ru: {
    invalidRequest: 'Я не смог прочитать запрос. Отправь его ещё раз.',
    requestTooLarge:
      'Сообщение слишком большое. Сократи вопрос и отправь его ещё раз.',
    unconfigured: `Сейчас я не могу нормально ответить. Для входа загляни в [официальный Discord](${DISCORD_URL}), для правил — в [Aceserver WIKI](${WIKI_URL}), для миров — на [карту](/ru/world-map/).`,
    failed: `В этот раз я не смог передать ответ. Загляни в [официальный Discord](${DISCORD_URL}) или [Aceserver WIKI](${WIKI_URL}).`,
  },
}

export function resolveGuideLocale(value) {
  return Object.hasOwn(TARGET_LANGUAGES, value) ? value : 'ja'
}

export function getLocalizedWorldMapUrl(locale) {
  return locale === 'ja' ? WORLD_MAP_URL : `/${locale}${WORLD_MAP_URL}`
}
