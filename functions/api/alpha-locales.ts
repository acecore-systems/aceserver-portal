import { ACESERVER_WIKI_URL } from './alpha-wiki-search.ts'
import { ACECORE_SCHOOLS_URL } from './alpha-schools-search.ts'
import { ACECORE_SYSTEMS_URL } from './alpha-systems-search.ts'
import { WORLD_FOUNDATION_URL } from './alpha-world-foundation-search.ts'

export const DISCORD_URL = 'https://discord.gg/acsv'
export const WIKI_URL = ACESERVER_WIKI_URL
export const WORLD_MAP_URL = '/world-map/'
export const ACECORE_URL = 'https://acecore.net/'
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
  required: '質問を入力してくれたら、アルファくんが案内するよ。',
  questionTooLong: '質問が長いみたい。少し短く分けて聞いてね。',
  conversationTooLong:
    '会話が長くなってきたよ。聞きたいことを短くまとめてもう一度送ってね。',
  unconfigured: `いまはアルファくんのAI応答が準備中だよ。参加方法は[公式Discord](${DISCORD_URL})、ルールは[Aceserver WIKI](${WIKI_URL})、ワールドは[ワールドマップ](${WORLD_MAP_URL})を見てね。`,
  failed: `いまはアルファくんのAI応答につながらなかったよ。参加方法は[公式Discord](${DISCORD_URL})、詳しい案内は[Aceserver WIKI](${WIKI_URL})を見てね。`,
  emptyAnswer:
    'その内容はまだうまく案内できなかったよ。参加方法、ワールド、ルールのどれかを短く聞いてみてね。',
  acecoreNotFound: `その内容は、いまのAcecore公式情報からは確認できなかったよ。最新情報は[Acecore公式サイト](${ACECORE_URL})を見てね。`,
  schoolsNotFound: `その内容は、いまのAcecore Schools公式情報からは確認できなかったよ。最新情報は[Acecore Schools公式サイト](${ACECORE_SCHOOLS_URL}/)を見てね。`,
  systemsNotFound: `その内容は、いまのAcecore Systems公式情報からは確認できなかったよ。最新情報は[Acecore Systems公式サイト](${ACECORE_SYSTEMS_URL}/)を見てね。`,
  worldFoundationNotFound: `その内容は、いまのWorld Foundation公式設計情報からは確認できなかったよ。最新情報は[World Foundation設計サイト](${WORLD_FOUNDATION_URL}/)を見てね。`,
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
    invalidRequest: 'That request could not be read. Please send it again.',
    requestTooLarge: 'That message is too large. Please shorten your question.',
    required: 'Enter a question and Alpha-kun will guide you.',
    questionTooLong:
      'That question is too long. Please split it into shorter questions.',
    conversationTooLong:
      'This conversation is getting long. Please summarize what you want to know.',
    unconfigured: `Alpha-kun’s AI reply is not ready right now. For joining, see [Official Discord](${DISCORD_URL}); for rules, see [Aceserver WIKI](${WIKI_URL}); and for worlds, see [World map](/en/world-map/).`,
    failed: `Alpha-kun could not reach the AI reply service. See [Official Discord](${DISCORD_URL}) or [Aceserver WIKI](${WIKI_URL}).`,
    emptyAnswer:
      'I could not guide you on that yet. Try asking briefly about joining, worlds, or rules.',
    acecoreNotFound: `I could not confirm that in Acecore’s current official information. See the [Acecore website](${ACECORE_URL}).`,
    schoolsNotFound: `I could not confirm that in the current official Acecore Schools information. See the [Acecore Schools website](${ACECORE_SCHOOLS_URL}/).`,
    systemsNotFound: `I could not confirm that in the current official Acecore Systems information. See the [Acecore Systems website](${ACECORE_SYSTEMS_URL}/).`,
    worldFoundationNotFound: `I could not confirm that in the current official World Foundation design information. See the [World Foundation design site](${WORLD_FOUNDATION_URL}/).`,
  },
  'zh-cn': {
    invalidRequest: '无法读取该请求，请重新发送。',
    requestTooLarge: '发送内容过大，请缩短问题后重试。',
    required: '请输入问题，Alpha-kun 会为你引导。',
    questionTooLong: '问题太长，请拆成更短的问题。',
    conversationTooLong: '对话已经很长，请简要整理想了解的内容后重试。',
    unconfigured: `Alpha-kun 的 AI 回复暂时未就绪。加入方式请查看[官方 Discord](${DISCORD_URL})，规则请查看 [Aceserver WIKI](${WIKI_URL})，世界请查看[世界地图](/zh-cn/world-map/)。`,
    failed: `Alpha-kun 暂时无法连接 AI 回复服务。请查看[官方 Discord](${DISCORD_URL})或 [Aceserver WIKI](${WIKI_URL})。`,
    emptyAnswer: '暂时无法回答该内容。请简短询问加入方式、世界或规则。',
    acecoreNotFound: `目前无法从 Acecore 官方信息中确认该内容。请查看 [Acecore 官网](${ACECORE_URL})。`,
    schoolsNotFound: `目前无法从 Acecore Schools 的官方信息中确认该内容。请查看 [Acecore Schools 官网](${ACECORE_SCHOOLS_URL}/)。`,
    systemsNotFound: `目前无法从 Acecore Systems 的官方信息中确认该内容。请查看 [Acecore Systems 官网](${ACECORE_SYSTEMS_URL}/)。`,
    worldFoundationNotFound: `目前无法从 World Foundation 官方设计资料中确认该内容。请查看 [World Foundation 设计站](${WORLD_FOUNDATION_URL}/)。`,
  },
  es: {
    invalidRequest: 'No se pudo leer la solicitud. Envíala de nuevo.',
    requestTooLarge: 'El mensaje es demasiado grande. Acorta la pregunta.',
    required: 'Escribe una pregunta y Alpha-kun te orientará.',
    questionTooLong:
      'La pregunta es demasiado larga. Divídela en preguntas más cortas.',
    conversationTooLong:
      'La conversación es larga. Resume lo que quieres saber.',
    unconfigured: `La respuesta de IA de Alpha-kun no está disponible ahora. Para unirte, consulta el [Discord oficial](${DISCORD_URL}); para las reglas, [Aceserver WIKI](${WIKI_URL}); y para los mundos, el [mapa](/es/world-map/).`,
    failed: `Alpha-kun no pudo conectar con el servicio de IA. Consulta el [Discord oficial](${DISCORD_URL}) o [Aceserver WIKI](${WIKI_URL}).`,
    emptyAnswer:
      'Todavía no puedo orientarte sobre eso. Pregunta brevemente por el acceso, los mundos o las reglas.',
    acecoreNotFound: `No pude confirmarlo en la información oficial actual de Acecore. Consulta el [sitio de Acecore](${ACECORE_URL}).`,
    schoolsNotFound: `No pude confirmarlo en la información oficial actual de Acecore Schools. Consulta el [sitio de Acecore Schools](${ACECORE_SCHOOLS_URL}/).`,
    systemsNotFound: `No pude confirmarlo en la información oficial actual de Acecore Systems. Consulta el [sitio de Acecore Systems](${ACECORE_SYSTEMS_URL}/).`,
    worldFoundationNotFound: `No pude confirmarlo en la información oficial actual de World Foundation. Consulta el [sitio de diseño de World Foundation](${WORLD_FOUNDATION_URL}/).`,
  },
  pt: {
    invalidRequest: 'Não foi possível ler a solicitação. Envie novamente.',
    requestTooLarge: 'A mensagem é grande demais. Encurte a pergunta.',
    required: 'Digite uma pergunta e o Alpha-kun vai orientar você.',
    questionTooLong:
      'A pergunta é longa demais. Divida-a em perguntas menores.',
    conversationTooLong: 'A conversa está longa. Resuma o que você quer saber.',
    unconfigured: `A resposta de IA do Alpha-kun não está disponível agora. Para entrar, veja o [Discord oficial](${DISCORD_URL}); para regras, a [Aceserver WIKI](${WIKI_URL}); e para os mundos, o [mapa](/pt/world-map/).`,
    failed: `O Alpha-kun não conseguiu acessar o serviço de IA. Veja o [Discord oficial](${DISCORD_URL}) ou a [Aceserver WIKI](${WIKI_URL}).`,
    emptyAnswer:
      'Ainda não consegui orientar sobre isso. Pergunte brevemente sobre entrada, mundos ou regras.',
    acecoreNotFound: `Não consegui confirmar isso nas informações oficiais atuais da Acecore. Veja o [site da Acecore](${ACECORE_URL}).`,
    schoolsNotFound: `Não consegui confirmar isso nas informações oficiais atuais da Acecore Schools. Veja o [site da Acecore Schools](${ACECORE_SCHOOLS_URL}/).`,
    systemsNotFound: `Não consegui confirmar isso nas informações oficiais atuais da Acecore Systems. Veja o [site da Acecore Systems](${ACECORE_SYSTEMS_URL}/).`,
    worldFoundationNotFound: `Não consegui confirmar isso nas informações oficiais atuais da World Foundation. Veja o [site de design da World Foundation](${WORLD_FOUNDATION_URL}/).`,
  },
  fr: {
    invalidRequest: 'La demande n’a pas pu être lue. Renvoyez-la.',
    requestTooLarge:
      'Le message est trop volumineux. Raccourcissez la question.',
    required: 'Saisissez une question et Alpha-kun vous guidera.',
    questionTooLong:
      'La question est trop longue. Divisez-la en questions plus courtes.',
    conversationTooLong:
      'La conversation devient longue. Résumez ce que vous voulez savoir.',
    unconfigured: `La réponse IA d’Alpha-kun n’est pas disponible pour le moment. Pour rejoindre, consultez le [Discord officiel](${DISCORD_URL}) ; pour les règles, [Aceserver WIKI](${WIKI_URL}) ; et pour les mondes, la [carte](/fr/world-map/).`,
    failed: `Alpha-kun n’a pas pu joindre le service IA. Consultez le [Discord officiel](${DISCORD_URL}) ou [Aceserver WIKI](${WIKI_URL}).`,
    emptyAnswer:
      'Je ne peux pas encore vous guider sur ce point. Posez une courte question sur l’accès, les mondes ou les règles.',
    acecoreNotFound: `Je n’ai pas pu le confirmer dans les informations officielles actuelles d’Acecore. Consultez le [site d’Acecore](${ACECORE_URL}).`,
    schoolsNotFound: `Je n’ai pas pu le confirmer dans les informations officielles actuelles d’Acecore Schools. Consultez le [site d’Acecore Schools](${ACECORE_SCHOOLS_URL}/).`,
    systemsNotFound: `Je n’ai pas pu le confirmer dans les informations officielles actuelles d’Acecore Systems. Consultez le [site d’Acecore Systems](${ACECORE_SYSTEMS_URL}/).`,
    worldFoundationNotFound: `Je n’ai pas pu le confirmer dans les informations officielles actuelles de World Foundation. Consultez le [site de conception World Foundation](${WORLD_FOUNDATION_URL}/).`,
  },
  ko: {
    invalidRequest: '요청을 읽을 수 없습니다. 다시 보내 주세요.',
    requestTooLarge: '보낸 내용이 너무 큽니다. 질문을 짧게 줄여 주세요.',
    required: '질문을 입력하면 Alpha-kun이 안내해 드려요.',
    questionTooLong: '질문이 너무 깁니다. 더 짧게 나누어 질문해 주세요.',
    conversationTooLong:
      '대화가 길어졌습니다. 알고 싶은 내용을 짧게 정리해 주세요.',
    unconfigured: `Alpha-kun의 AI 응답이 아직 준비되지 않았어요. 참여는 [공식 Discord](${DISCORD_URL}), 규칙은 [Aceserver WIKI](${WIKI_URL}), 월드는 [월드 맵](/ko/world-map/)을 확인해 주세요.`,
    failed: `Alpha-kun이 AI 응답 서비스에 연결하지 못했어요. [공식 Discord](${DISCORD_URL}) 또는 [Aceserver WIKI](${WIKI_URL})를 확인해 주세요.`,
    emptyAnswer:
      '아직 그 내용은 안내하기 어려워요. 참여 방법, 월드, 규칙 중 하나를 짧게 질문해 주세요.',
    acecoreNotFound: `현재 Acecore 공식 정보에서 확인하지 못했어요. [Acecore 공식 사이트](${ACECORE_URL})를 확인해 주세요.`,
    schoolsNotFound: `현재 Acecore Schools 공식 정보에서 확인하지 못했어요. [Acecore Schools 공식 사이트](${ACECORE_SCHOOLS_URL}/)를 확인해 주세요.`,
    systemsNotFound: `현재 Acecore Systems 공식 정보에서 확인하지 못했어요. [Acecore Systems 공식 사이트](${ACECORE_SYSTEMS_URL}/)를 확인해 주세요.`,
    worldFoundationNotFound: `현재 World Foundation 공식 설계 정보에서 확인하지 못했어요. [World Foundation 설계 사이트](${WORLD_FOUNDATION_URL}/)를 확인해 주세요.`,
  },
  de: {
    invalidRequest:
      'Die Anfrage konnte nicht gelesen werden. Bitte sende sie erneut.',
    requestTooLarge: 'Die Nachricht ist zu groß. Bitte kürze deine Frage.',
    required: 'Stelle eine Frage und Alpha-kun hilft dir weiter.',
    questionTooLong:
      'Die Frage ist zu lang. Teile sie bitte in kürzere Fragen auf.',
    conversationTooLong:
      'Das Gespräch wird lang. Fasse bitte kurz zusammen, was du wissen möchtest.',
    unconfigured: `Alpha-kuns KI-Antwort ist gerade nicht verfügbar. Zum Beitreten siehe [Offizielles Discord](${DISCORD_URL}), für Regeln [Aceserver WIKI](${WIKI_URL}) und für Welten die [Weltkarte](/de/world-map/).`,
    failed: `Alpha-kun konnte den KI-Dienst nicht erreichen. Sieh im [offiziellen Discord](${DISCORD_URL}) oder in der [Aceserver WIKI](${WIKI_URL}) nach.`,
    emptyAnswer:
      'Dazu kann ich dich noch nicht gut führen. Frage kurz nach Beitritt, Welten oder Regeln.',
    acecoreNotFound: `Das ließ sich in den aktuellen offiziellen Acecore-Informationen nicht bestätigen. Sieh auf der [Acecore-Website](${ACECORE_URL}) nach.`,
    schoolsNotFound: `Das ließ sich in den aktuellen offiziellen Informationen von Acecore Schools nicht bestätigen. Sieh auf der [Acecore-Schools-Website](${ACECORE_SCHOOLS_URL}/) nach.`,
    systemsNotFound: `Das ließ sich in den aktuellen offiziellen Informationen von Acecore Systems nicht bestätigen. Sieh auf der [Acecore-Systems-Website](${ACECORE_SYSTEMS_URL}/) nach.`,
    worldFoundationNotFound: `Das ließ sich in den aktuellen offiziellen World-Foundation-Informationen nicht bestätigen. Sieh auf der [World-Foundation-Designsite](${WORLD_FOUNDATION_URL}/) nach.`,
  },
  ru: {
    invalidRequest: 'Не удалось прочитать запрос. Отправьте его ещё раз.',
    requestTooLarge: 'Сообщение слишком большое. Сократите вопрос.',
    required: 'Задайте вопрос, и Alpha-kun поможет с навигацией.',
    questionTooLong: 'Вопрос слишком длинный. Разделите его на более короткие.',
    conversationTooLong:
      'Диалог стал длинным. Кратко сформулируйте, что хотите узнать.',
    unconfigured: `ИИ-ответ Alpha-kun сейчас недоступен. Для входа смотрите [официальный Discord](${DISCORD_URL}), для правил — [Aceserver WIKI](${WIKI_URL}), для миров — [карту](/ru/world-map/).`,
    failed: `Alpha-kun не смог подключиться к ИИ-сервису. Смотрите [официальный Discord](${DISCORD_URL}) или [Aceserver WIKI](${WIKI_URL}).`,
    emptyAnswer:
      'Пока не получается ответить на это. Кратко спросите о входе, мирах или правилах.',
    acecoreNotFound: `Это не удалось подтвердить в текущей официальной информации Acecore. Смотрите [сайт Acecore](${ACECORE_URL}).`,
    schoolsNotFound: `Это не удалось подтвердить в текущей официальной информации Acecore Schools. Смотрите [сайт Acecore Schools](${ACECORE_SCHOOLS_URL}/).`,
    systemsNotFound: `Это не удалось подтвердить в текущей официальной информации Acecore Systems. Смотрите [сайт Acecore Systems](${ACECORE_SYSTEMS_URL}/).`,
    worldFoundationNotFound: `Это не удалось подтвердить в текущей официальной информации World Foundation. Смотрите [сайт проекта World Foundation](${WORLD_FOUNDATION_URL}/).`,
  },
}

export function resolveGuideLocale(value) {
  return Object.hasOwn(TARGET_LANGUAGES, value) ? value : 'ja'
}

export function getLocalizedWorldMapUrl(locale) {
  return locale === 'ja' ? WORLD_MAP_URL : `/${locale}${WORLD_MAP_URL}`
}
