import type { AlphaLoreFact, AlphaLoreFragment } from './alpha-lore-schema.ts'

export type AlphaLoreIntentKind = 'broad' | 'continuation' | 'specific'

export type AlphaLoreIntent = {
  allowFoundationalFacts: boolean
  atomicTopicJa: string
  kind: AlphaLoreIntentKind
  requestedCoverageKey: string | null
}

type LoreTopic = {
  allowFoundationalFacts: boolean
  atomicTopicJa: string
  coverageKey: string | null
  pattern: RegExp
}

type LocaleLorePatterns = {
  broad: RegExp
  continuation: RegExp
  explicitSubject: RegExp
  implicitLore: RegExp
}

const BROAD_PAST_PATTERN =
  /^(?:アルファ(?:くん|君)?|あなた|君|きみ)(?:の)?(?:過去|昔|これまで|生い立ち|物語|歴史)(?:は|について|を教えて|って何|ってどんな感じ)?[?？。!！]*$/iu
const CONTINUATION_PATTERN =
  /^(?:ほか(?:に|には|は)?|他(?:に|には|は)?|続き|もっと|それから|その次|別の(?:話|思い出)|もう(?:一つ|ひとつ))(?:は|を|も|教えて|聞かせて)?[?？。!！]*$/iu
const EXPLICIT_PERSONAL_SUBJECT_PATTERN =
  /アルファ(?:くん|君)?|あなた|君|きみ|お前|自分の/iu
const IMPLICIT_PERSONAL_LORE_PATTERN =
  /何歳|年齢|いくつ|誕生日|生年月日|生まれ|出身地|子どもの頃|子供の頃|幼い頃|幼少期|昔(?:は|の)|思い出|覚えて|だった|してた|していた|家族(?:は|が|いる)|(?:お?父(?:親|さん)?|お?母(?:親|さん)?|両親|兄弟|姉妹)(?:は|が|いる)|友(?:だち|達)(?:は|が|いた)|怖かった|嬉しかった|悲しかった|初めて.{0,8}案内/iu
const REAL_WORLD_ENTITY_PATTERN =
  /Aceserver|エースサーバー|Acecore|エースコア|サーバー|server|servidor|serveur|서버|服务器|сервер|WIKI|ポータル/iu
const REAL_WORLD_LOCATOR_PATTERN =
  /https?:\/\/|\b(?:\d{1,3}\.){3}\d{1,3}\b|\b(?:[a-f0-9]{1,4}:){2,7}[a-f0-9]{1,4}\b|\b[^\s@]+@[^\s@]+\.[^\s@]+\b/iu
const OPERATIONAL_ACTION_PATTERN =
  /参加|加入|入れます|遊べます|join|participat|play together|unirse|entrar al|participar|rejoindre|beitreten|присоединиться|함께 플레이/iu

const LOCALE_LORE_PATTERNS: Record<string, LocaleLorePatterns> = {
  ja: {
    broad: BROAD_PAST_PATTERN,
    continuation: CONTINUATION_PATTERN,
    explicitSubject: EXPLICIT_PERSONAL_SUBJECT_PATTERN,
    implicitLore: IMPLICIT_PERSONAL_LORE_PATTERN,
  },
  en: {
    broad:
      /^(?:(?:tell me (?:about )?)?(?:alpha(?:-kun)?'?s|your) (?:past|backstory|history|life story)|what (?:is|was) your (?:past|backstory)(?: like)?)[?!.]*$/iu,
    continuation:
      /^(?:what else|anything else|tell me more|another (?:story|memory)|and then|what happened next)[?!.]*$/iu,
    explicitSubject: /\b(?:alpha(?:-kun)?|you|your)\b/iu,
    implicitLore:
      /\b(?:how old|were you|did you|used to|do you remember|born|your childhood|your past|your backstory)\b/iu,
  },
  'zh-cn': {
    broad:
      /^(?:(?:阿尔法|Alpha(?:-kun)?|你)(?:的)?(?:过去|经历|身世|故事))[？?。!！]*$/iu,
    continuation:
      /^(?:还有吗|还有呢|更多|继续|然后呢|另一个(?:故事|回忆))[？?。!！]*$/iu,
    explicitSubject: /阿尔法|Alpha(?:-kun)?|你|你的/iu,
    implicitLore: /几岁|多大|出生|小时候|记得|最早的记忆/iu,
  },
  es: {
    broad:
      /^(?:cu[eé]ntame (?:sobre )?tu pasado|cu[aá]l (?:es|fue) tu pasado|tu (?:pasado|historia personal))[?¿!.]*$/iu,
    continuation:
      /^(?:qu[eé] m[aá]s|algo m[aá]s|cu[eé]ntame m[aá]s|otro (?:recuerdo|relato)|y luego)[?¿!.]*$/iu,
    explicitSubject: /\b(?:alpha(?:-kun)?|t[uú]|tu|usted)\b/iu,
    implicitLore:
      /\b(?:naciste|eras|ten[ií]as|recuerdas|tu infancia|tu pasado)\b/iu,
  },
  pt: {
    broad:
      /^(?:conte(?:-me)? (?:sobre )?seu passado|qual (?:é|foi) o seu passado|seu (?:passado|hist[oó]rico pessoal))[?!.]*$/iu,
    continuation:
      /^(?:o que mais|algo mais|conte(?:-me)? mais|outra (?:hist[oó]ria|mem[oó]ria)|e depois)[?!.]*$/iu,
    explicitSubject: /\b(?:alpha(?:-kun)?|voc[eê]|seu|sua)\b/iu,
    implicitLore:
      /\b(?:nasceu|era|tinha|lembra|sua inf[aâ]ncia|seu passado)\b/iu,
  },
  fr: {
    broad:
      /^(?:parle-moi de ton pass[eé]|quel (?:est|[eé]tait) ton pass[eé]|ton (?:pass[eé]|histoire personnelle))[?!.]*$/iu,
    continuation:
      /^(?:quoi d'autre|autre chose|raconte-m'en plus|un autre souvenir|et ensuite)[?!.]*$/iu,
    explicitSubject: /\b(?:alpha(?:-kun)?|tu|ton|ta|vous|votre)\b/iu,
    implicitLore:
      /\b(?:es-tu|[eé]tais|avais|te souviens|ton enfance|ton pass[eé])\b/iu,
  },
  ko: {
    broad:
      /^(?:(?:알파|Alpha(?:-kun)?|너)(?:의)?\s*(?:과거|이야기|내력))[?？.!！]*$/iu,
    continuation:
      /^(?:또 있어|더 있어|더 말해|계속|그다음은|다른 (?:이야기|기억))[?？.!！]*$/iu,
    explicitSubject: /알파|Alpha(?:-kun)?|너|당신/iu,
    implicitLore: /몇 살|태어|어릴 때|기억해|기억나|너의 과거/iu,
  },
  de: {
    broad:
      /^(?:erz[aä]hl mir von deiner vergangenheit|was (?:ist|war) deine vergangenheit|deine (?:vergangenheit|vorgeschichte))[?!.]*$/iu,
    continuation:
      /^(?:was noch|noch etwas|erz[aä]hl mehr|eine andere erinnerung|und dann)[?!.]*$/iu,
    explicitSubject: /\b(?:alpha(?:-kun)?|du|dein|deine|dir)\b/iu,
    implicitLore:
      /\b(?:bist du|warst du|hattest du|erinnerst du|geboren|deine kindheit|deine vergangenheit)\b/iu,
  },
  ru: {
    broad:
      /^(?:расскажи о сво[её]м прошлом|какое у тебя прошлое|тво[её] (?:прошлое|предыстория))[?!.]*$/iu,
    continuation:
      /^(?:что ещё|что еще|расскажи больше|другое воспоминание|а потом)[?!.]*$/iu,
    explicitSubject: /\b(?:alpha(?:-kun)?|ты|тебя|тво[её])\b/iu,
    implicitLore:
      /\b(?:сколько тебе|родил|помнишь|в детстве|тво[её] прошлое)\b/iu,
  },
}

const LORE_TOPICS: LoreTopic[] = [
  {
    allowFoundationalFacts: true,
    atomicTopicJa: '年齢',
    coverageKey: 'identity.age',
    pattern:
      /何歳|年齢|いくつ(?:なの|だった|ですか)?|how old|what age|qu[eé] edad|cu[aá]ntos a[nñ]os|quantos anos|quel [aâ]ge|몇 살|나이|wie alt|welches alter|сколько лет|возраст|几岁|多大/iu,
  },
  {
    allowFoundationalFacts: true,
    atomicTopicJa: '生まれた日',
    coverageKey: 'identity.birth_date',
    pattern:
      /誕生日|生年月日|いつ生まれ|birthday|when were you born|cumplea[nñ]os|cu[aá]ndo naciste|anivers[aá]rio|quando nasceu|anniversaire|quand es-tu n[eé]|생일|언제 태어|geburtstag|wann geboren|день рождения|когда родил|生日|什么时候出生/iu,
  },
  {
    allowFoundationalFacts: true,
    atomicTopicJa: '生まれた場所',
    coverageKey: 'identity.birthplace',
    pattern:
      /どこ(?:で|の).{0,8}生まれ|出身(?:地)?|生まれた場所|where were you born|birthplace|d[oó]nde naciste|lugar de nacimiento|onde nasceu|local de nascimento|o[uù] es-tu n[eé]|lieu de naissance|어디서 태어|출생지|wo (?:bist du )?geboren|geburtsort|где (?:ты )?родил|место рождения|哪里出生|出生地/iu,
  },
  {
    allowFoundationalFacts: true,
    atomicTopicJa: '両親',
    coverageKey: 'relationships.family.parents',
    pattern: /両親|parents?|padres|pais|parents|부모|eltern|родители|父母/iu,
  },
  {
    allowFoundationalFacts: true,
    atomicTopicJa: '父親',
    coverageKey: 'relationships.family.father',
    pattern:
      /お父(?:さん)?|父親|父|father|dad|padre|pai|p[eè]re|아버지|아빠|vater|папа|отец|父亲|爸爸/iu,
  },
  {
    allowFoundationalFacts: true,
    atomicTopicJa: '母親',
    coverageKey: 'relationships.family.mother',
    pattern:
      /お母(?:さん)?|母親|母|mother|mom|madre|m[aã]e|m[eè]re|어머니|엄마|mutter|мама|мать|母亲|妈妈/iu,
  },
  {
    allowFoundationalFacts: true,
    atomicTopicJa: 'きょうだい',
    coverageKey: 'relationships.family.siblings',
    pattern:
      /兄弟|姉妹|siblings?|hermanos|irm[aã]os|fr[eè]res|sœurs|형제|자매|geschwister|братья|сёстры|兄弟姐妹/iu,
  },
  {
    allowFoundationalFacts: true,
    atomicTopicJa: '家族の概要',
    coverageKey: 'relationships.family.overview',
    pattern: /家族|family|familia|fam[ií]lia|famille|가족|familie|семья|家人/iu,
  },
  {
    allowFoundationalFacts: true,
    atomicTopicJa: '正体や由来',
    coverageKey: 'identity.origin',
    pattern:
      /何者|正体|由来|どこから来た|どうやって生まれ|who are you really|where did you come from|your origin|de d[oó]nde vienes|tu origen|de onde voc[eê] veio|sua origem|d'o[uù] viens-tu|ton origine|어디에서 왔|정체|woher kommst du|dein ursprung|откуда ты|происхождение|你从哪里来|来历/iu,
  },
  {
    allowFoundationalFacts: false,
    atomicTopicJa: 'いちばん古い記憶',
    coverageKey: 'past.early_memory',
    pattern:
      /最初の記憶|いちばん古い記憶|一番古い記憶|初めての思い出|earliest memory|first memory|primer recuerdo|memoria m[aá]s antigua|premi[eè]re souvenir|plus ancien souvenir|가장 오래된 기억|첫 기억|fr[uü]heste erinnerung|erste erinnerung|первое воспоминание|самое раннее воспоминание|最早的记忆|第一个回忆/iu,
  },
  {
    allowFoundationalFacts: false,
    atomicTopicJa: '子どもの頃の出来事',
    coverageKey: null,
    pattern:
      /子どもの頃|子供の頃|幼い頃|幼少期|childhood|as a child|infancia|quando crian[cç]a|enfance|어릴 때|어린 시절|kindheit|als kind|детство|в детстве|童年|小时候/iu,
  },
  {
    allowFoundationalFacts: false,
    atomicTopicJa: '学校での出来事',
    coverageKey: null,
    pattern:
      /学校|学生(?:の頃)?|勉強していた|学んでいた|school|as a student|escuela|colegio|escola|[eé]cole|학교|schule|школа|学校生活/iu,
  },
  {
    allowFoundationalFacts: false,
    atomicTopicJa: '友だちとの出来事',
    coverageKey: null,
    pattern:
      /友だち|友達|親友|仲間|friends?|best friend|amigos?|mejor amigo|melhor amigo|amis?|meilleur ami|친구|freunde?|bester freund|друзья|лучший друг|朋友|好友/iu,
  },
  {
    allowFoundationalFacts: false,
    atomicTopicJa: '過去の失敗',
    coverageKey: null,
    pattern:
      /失敗|後悔|間違え|しくじ|failure|failed|regret|fracaso|fallaste|arrepend|falhou|[eé]chec|regret|실패|후회|versagt|fehler|ошибка|неудача|失败|后悔/iu,
  },
  {
    allowFoundationalFacts: false,
    atomicTopicJa: '怖かった出来事',
    coverageKey: null,
    pattern:
      /怖かった|恐かった|苦手だった|恐れていた|afraid|scared|fear|miedo|asust|medo|peur|effray|무서|두려|angst|страх|боял|害怕|恐惧/iu,
  },
  {
    allowFoundationalFacts: false,
    atomicTopicJa: '初めて案内した出来事',
    coverageKey: 'guide.first_guidance',
    pattern: /初めて.{0,8}案内|案内役になった|ガイドになった/iu,
  },
]

const FOUNDATIONAL_FACT_PREFIXES = ['identity', 'relationships.family']
const FOUNDATIONAL_FACT_KEY_PATTERN =
  /(?:^|[._-])(?:age|birth(?:date|place)?|birthday|family|parent|sibling|name|origin)(?:$|[._-])/u

export function resolveAlphaLoreIntent(
  question: string,
  locale = 'ja',
): AlphaLoreIntent | null {
  const normalized = normalizeQuestion(question)
  if (!normalized) return null
  const localePatterns = LOCALE_LORE_PATTERNS[locale] || LOCALE_LORE_PATTERNS.ja
  const hasExplicitPersonalSubject =
    localePatterns.explicitSubject.test(normalized)
  const hasImplicitPersonalLore = localePatterns.implicitLore.test(normalized)
  if (REAL_WORLD_ENTITY_PATTERN.test(normalized)) return null
  if (OPERATIONAL_ACTION_PATTERN.test(normalized) && !hasImplicitPersonalLore) {
    return null
  }

  if (localePatterns.broad.test(normalized)) {
    return {
      allowFoundationalFacts: false,
      atomicTopicJa: 'いちばん古い、ささやかな記憶',
      kind: 'broad',
      requestedCoverageKey: 'past.early_memory',
    }
  }

  if (localePatterns.continuation.test(normalized)) {
    return {
      allowFoundationalFacts: false,
      atomicTopicJa: '直前の正史から自然につながる次の一場面',
      kind: 'continuation',
      requestedCoverageKey: null,
    }
  }

  const matchingTopics = LORE_TOPICS.map((topic) => ({
    index: normalized.search(topic.pattern),
    topic,
  }))
    .filter(({ index }) => index >= 0)
    .sort((left, right) => left.index - right.index)

  if (
    matchingTopics.length > 0 &&
    (hasExplicitPersonalSubject || hasImplicitPersonalLore)
  ) {
    const firstTopic = matchingTopics[0].topic
    return {
      allowFoundationalFacts: firstTopic.allowFoundationalFacts,
      atomicTopicJa: firstTopic.atomicTopicJa,
      kind: 'specific',
      requestedCoverageKey: firstTopic.coverageKey,
    }
  }

  if (!hasImplicitPersonalLore) return null

  return {
    allowFoundationalFacts: false,
    atomicTopicJa: '質問の最初にある、まだ正史化されていない一つの話題',
    kind: 'specific',
    requestedCoverageKey: null,
  }
}

export function validateAlphaLoreCandidate({
  allowFoundationalFacts,
  allowedRelatedRevisionIds,
  candidate,
  existingFacts,
  expectedCoverageKey,
}: {
  allowFoundationalFacts: boolean
  allowedRelatedRevisionIds: Set<string>
  candidate: AlphaLoreFragment
  existingFacts: AlphaLoreFact[]
  expectedCoverageKey: string
}): string[] {
  const errors: string[] = []
  if (candidate.coverage_key !== expectedCoverageKey) {
    errors.push('coverage_key_mismatch')
  }

  if (!isLengthBetween(candidate.title_ja, 1, 30)) {
    errors.push('title_length')
  }
  if (!isLengthBetween(candidate.summary_ja, 1, 80)) {
    errors.push('summary_length')
  }
  if (!isLengthBetween(candidate.body_ja, 160, 320)) {
    errors.push('body_length')
  }
  if (
    candidate.next_hook_ja !== null &&
    !isLengthBetween(candidate.next_hook_ja, 1, 80)
  ) {
    errors.push('next_hook_length')
  }

  const canonicalText = [
    candidate.title_ja,
    candidate.summary_ja,
    candidate.body_ja,
    candidate.next_hook_ja || '',
    ...candidate.facts.map((fact) => fact.value_ja),
  ].join('\n')
  if (REAL_WORLD_LOCATOR_PATTERN.test(canonicalText)) {
    errors.push('real_world_locator')
  }
  if (REAL_WORLD_ENTITY_PATTERN.test(canonicalText)) {
    errors.push('real_world_entity')
  }

  const candidateFactKeys = new Set<string>()
  const existingFactMap = new Map(
    existingFacts.map((fact) => [fact.fact_key, fact.value_ja]),
  )
  for (const fact of candidate.facts) {
    if (candidateFactKeys.has(fact.fact_key)) {
      errors.push('duplicate_fact_key')
    }
    candidateFactKeys.add(fact.fact_key)

    if (
      !allowFoundationalFacts &&
      (fact.kind === 'foundational' || isFoundationalFactKey(fact.fact_key))
    ) {
      errors.push('foundational_overreach')
    }

    if (existingFactMap.has(fact.fact_key)) {
      errors.push(
        existingFactMap.get(fact.fact_key) === fact.value_ja
          ? 'duplicate_fact'
          : 'contradicting_fact',
      )
    }
  }

  for (const revisionId of candidate.related_revision_ids) {
    if (!allowedRelatedRevisionIds.has(revisionId)) {
      errors.push('invalid_revision_reference')
    }
  }

  return [...new Set(errors)]
}

export function isFoundationalFactKey(factKey: string): boolean {
  return (
    FOUNDATIONAL_FACT_PREFIXES.some(
      (prefix) => factKey === prefix || factKey.startsWith(`${prefix}.`),
    ) || FOUNDATIONAL_FACT_KEY_PATTERN.test(factKey)
  )
}

function normalizeQuestion(value: string): string {
  return String(value || '')
    .normalize('NFKC')
    .trim()
}

function isLengthBetween(value: string, minimum: number, maximum: number) {
  const length = [...value].length
  return length >= minimum && length <= maximum
}
