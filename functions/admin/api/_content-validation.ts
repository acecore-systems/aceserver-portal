import announcements from '../../../src/content/site/announcements.json'
import navigation from '../../../src/content/site/navigation.json'
import settings from '../../../src/content/site/settings.json'
import top from '../../../src/content/pages/top.json'
import worldMap from '../../../src/content/pages/world-map.json'
import worldMapEvent from '../../../src/content/pages/world-map-event.json'
import worldMapLobby from '../../../src/content/pages/world-map-lobby.json'
import worldMapMain from '../../../src/content/pages/world-map-main.json'
import worldMapRpg from '../../../src/content/pages/world-map-rpg.json'
import worldMapRpgSub from '../../../src/content/pages/world-map-rpg-sub.json'
import worldMapSeasonA from '../../../src/content/pages/world-map-season-a.json'
import worldMapSeasonAC from '../../../src/content/pages/world-map-season-a-c.json'
import worldMapSigen from '../../../src/content/pages/world-map-sigen.json'
import youtubeSearch from '../../../src/content/pages/youtube-search-aceserver.json'
import { validatePortalContentFile } from '../../../src/data/content-schemas.ts'

export const MAX_CMS_JSON_BYTES = 448 * 1024
const MAX_MEDIA_BYTES = 10 * 1024 * 1024
const MAX_DEPTH = 32
const MAX_NODES = 50_000
const URL_KEY_PATTERN = /(?:action|href|url|src|image|logo|thumbnail)$/iu
const RESOURCE_KEY_PATTERN = /(?:src|image|logo|thumbnail)$/iu
const ENUM_VALUES = new Map<string, ReadonlySet<string>>([
  ['variant', new Set(['map', 'video'])],
  [
    'tone',
    new Set([
      'brand',
      'amber',
      'emerald',
      'slate',
      'main',
      'resource',
      'rpg',
      'lobby',
      'season',
      'creative',
      'event',
    ]),
  ],
])

const BASELINES = new Map<string, unknown>([
  ['src/content/pages/top.json', top],
  ['src/content/pages/world-map.json', worldMap],
  ['src/content/pages/world-map-main.json', worldMapMain],
  ['src/content/pages/world-map-sigen.json', worldMapSigen],
  ['src/content/pages/world-map-rpg.json', worldMapRpg],
  ['src/content/pages/world-map-lobby.json', worldMapLobby],
  ['src/content/pages/world-map-rpg-sub.json', worldMapRpgSub],
  ['src/content/pages/world-map-season-a.json', worldMapSeasonA],
  ['src/content/pages/world-map-season-a-c.json', worldMapSeasonAC],
  ['src/content/pages/world-map-event.json', worldMapEvent],
  ['src/content/pages/youtube-search-aceserver.json', youtubeSearch],
  ['src/content/site/settings.json', settings],
  ['src/content/site/navigation.json', navigation],
  ['src/content/site/announcements.json', announcements],
])

export type ValidatedCmsAddition = {
  path: string
  contents: string
  byteSize: number
}

type ValidationResult =
  { ok: true; addition: ValidatedCmsAddition } | { ok: false; message: string }

export function validateCmsAddition(
  path: string,
  contents: string,
): ValidationResult {
  const bytes = decodeBase64(contents)

  if (!bytes) {
    return { ok: false, message: 'ファイル内容が正しいbase64ではありません。' }
  }

  if (path.endsWith('.json')) {
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_CMS_JSON_BYTES) {
      return {
        ok: false,
        message: 'JSONは1 byte以上448 KiB以下にしてください。',
      }
    }

    const baseline = BASELINES.get(path)

    if (baseline === undefined) {
      return { ok: false, message: 'JSON schemaが登録されていません。' }
    }

    const error = validateJson(path, bytes, baseline)

    if (error) return { ok: false, message: error }
  } else {
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_MEDIA_BYTES) {
      return {
        ok: false,
        message: '画像は1 byte以上10 MiB以下にしてください。',
      }
    }

    const error = validateImage(path, bytes)

    if (error) return { ok: false, message: error }
  }

  return {
    ok: true,
    addition: { path, contents, byteSize: bytes.byteLength },
  }
}

function validateJson(path: string, bytes: Uint8Array, baseline: unknown) {
  let text: string

  try {
    text = new TextDecoder('utf-8', {
      fatal: true,
      ignoreBOM: false,
    }).decode(bytes)
  } catch {
    return 'JSONは正しいUTF-8で保存してください。'
  }

  if (text.charCodeAt(0) === 0xfeff || text.includes('\0')) {
    return 'JSONにUTF-8 BOMまたはNUL文字は使用できません。'
  }

  let value: unknown

  try {
    value = JSON.parse(text)
  } catch {
    return 'JSONの構文が不正です。'
  }

  const structuralError = validateValue(value, baseline, '$', 0, { nodes: 0 })

  if (structuralError) return structuralError

  const contentResult = validatePortalContentFile(path, value)

  return contentResult.ok ? null : contentResult.message
}

function validateValue(
  value: unknown,
  baseline: unknown,
  scope: string,
  depth: number,
  budget: { nodes: number },
): string | null {
  budget.nodes += 1

  if (depth > MAX_DEPTH || budget.nodes > MAX_NODES) {
    return `${scope}: JSONが複雑すぎます。`
  }

  if (Array.isArray(baseline)) {
    if (!Array.isArray(value)) return `${scope}: 配列で指定してください。`
    if (baseline.length === 0) return null

    for (let index = 0; index < value.length; index += 1) {
      const templates = baseline.filter((item) =>
        sameStructuralKind(item, value[index]),
      )
      let error = `${scope}[${index}]: schemaと一致しません。`

      for (const template of templates.length > 0 ? templates : [baseline[0]]) {
        const attemptBudget = { nodes: budget.nodes }
        const attempt = validateValue(
          value[index],
          template,
          `${scope}[${index}]`,
          depth + 1,
          attemptBudget,
        )

        if (!attempt) {
          budget.nodes = attemptBudget.nodes
          error = ''
          break
        }

        error = attempt
      }

      if (error) return error
    }

    return null
  }

  if (isRecord(baseline)) {
    if (!isRecord(value)) return `${scope}: objectで指定してください。`

    const optionalKeys = getOptionalKeys(baseline)
    const allowedKeys = new Set([...Object.keys(baseline), ...optionalKeys])

    for (const key of Object.keys(value)) {
      if (
        key === '__proto__' ||
        key === 'constructor' ||
        key === 'prototype' ||
        !allowedKeys.has(key)
      ) {
        return `${scope}.${key}: 許可されていない項目です。`
      }
    }

    for (const [key, template] of Object.entries(baseline)) {
      if (!Object.hasOwn(value, key)) {
        if (optionalKeys.has(key)) continue

        return `${scope}.${key}: 必須項目です。`
      }

      const error = validateValue(
        value[key],
        template,
        `${scope}.${key}`,
        depth + 1,
        budget,
      )

      if (error) return error
    }

    return null
  }

  if (baseline === null) {
    return value === null ? null : `${scope}: nullが必要です。`
  }

  if (typeof value !== typeof baseline) {
    return `${scope}: ${typeof baseline}で指定してください。`
  }

  if (typeof value === 'number' && !Number.isFinite(value)) {
    return `${scope}: 有限の数値で指定してください。`
  }

  if (typeof value === 'string') {
    if (containsForbiddenCharacter(value)) {
      return `${scope}: 不正な制御文字またはUnicodeが含まれています。`
    }

    const key = scope.split('.').pop() ?? ''

    if (
      (key === 'type' || key === 'kind') &&
      typeof baseline === 'string' &&
      value !== baseline
    ) {
      return `${scope}: ${baseline}で指定してください。`
    }

    const allowedValues = ENUM_VALUES.get(key)

    if (allowedValues && !allowedValues.has(value)) {
      return `${scope}: 許可されていない値です。`
    }

    if (URL_KEY_PATTERN.test(key)) {
      const error = validateUrlValue(value, key)

      if (error) return `${scope}: ${error}`
    }
  }

  return null
}

function getOptionalKeys(value: Record<string, unknown>) {
  const keys = new Set<string>()

  if ('slug' in value && 'kind' in value && 'sections' in value) {
    keys.add('hideFooter')
  }

  if (
    'title' in value &&
    'description' in value &&
    Object.keys(value).length <= 3
  ) {
    keys.add('ogImage')
  }

  if (typeof value.type === 'string') {
    if (value.type === 'hero') {
      for (const key of [
        'shoulderCopy',
        'text',
        'ctaButton',
        'backgroundImage',
      ]) {
        keys.add(key)
      }
    } else if (
      value.type === 'featureImageFull' ||
      value.type === 'featureImageRight' ||
      value.type === 'featureImageLeft'
    ) {
      keys.add('text')
    } else if (value.type === 'cta') {
      keys.add('text')
    } else if (value.type === 'iframe') {
      for (const key of [
        'externalUrl',
        'channelUrl',
        'title',
        'fallbackImage',
        'variant',
      ]) {
        keys.add(key)
      }
    }
  }

  if ('label' in value && 'href' in value) keys.add('external')

  if ('slug' in value && 'tone' in value && 'imageAlt' in value) {
    for (const key of ['href', 'statusLabel', 'description']) keys.add(key)
  }

  if ('text' in value && 'href' in value && 'icon' in value) {
    keys.add('external')
  }

  if ('id' in value && 'enabled' in value && 'tone' in value) {
    for (const key of [
      'enabled',
      'order',
      'tone',
      'icon',
      'text',
      'href',
      'linkLabel',
      'external',
      'startsAt',
      'endsAt',
    ]) {
      keys.add(key)
    }
  }

  return keys
}

function validateUrlValue(value: string, key: string) {
  if (value === '') return null
  const normalizedValue = normalizeUrlText(value)

  if (/[\u0000-\u0020\u007f\\]/u.test(normalizedValue)) {
    return 'URLに空白、制御文字、backslashは使用できません。'
  }

  const isResource = RESOURCE_KEY_PATTERN.test(key)

  if (normalizedValue.startsWith('/')) {
    return normalizedValue.startsWith('//')
      ? 'protocol-relative URLは使用できません。'
      : null
  }

  if (!isResource && normalizedValue.startsWith('#')) return null

  let url: URL

  try {
    url = new URL(normalizedValue)
  } catch {
    return '絶対path、fragment、またはHTTPS URLで指定してください。'
  }

  if (url.protocol !== 'https:' || url.username !== '' || url.password !== '') {
    return '外部URLは認証情報を含まないHTTPSで指定してください。'
  }

  return null
}

function normalizeUrlText(value: string) {
  return value
    .replace(
      /&#(?:x([0-9a-f]{1,6})|([0-9]{1,7}));?/giu,
      (match, hexadecimal: string | undefined, decimal: string | undefined) => {
        const codePoint = Number.parseInt(
          hexadecimal || decimal || '',
          hexadecimal ? 16 : 10,
        )

        return Number.isSafeInteger(codePoint) && codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : match
      },
    )
    .replace(/&(?:colon|tab|newline);/giu, (entity) => {
      if (/^&colon;/iu.test(entity)) return ':'
      if (/^&tab;/iu.test(entity)) return '\t'
      return '\n'
    })
}

function sameStructuralKind(left: unknown, right: unknown) {
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right)
  }

  if (isRecord(left) || isRecord(right)) {
    return isRecord(left) && isRecord(right)
  }

  return typeof left === typeof right
}

function validateImage(path: string, bytes: Uint8Array) {
  const extension = path.slice(path.lastIndexOf('.')).toLowerCase()

  if (extension === '.svg' || extension === '.pdf') {
    return 'SVGとPDFはactive contentを含められるためCMSから直接公開できません。'
  }

  const valid =
    (extension === '.png' &&
      hasBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) &&
      readAscii(bytes, 12, 4) === 'IHDR' &&
      readAscii(bytes, bytes.length - 8, 4) === 'IEND') ||
    ((extension === '.jpg' || extension === '.jpeg') &&
      hasBytes(bytes, 0, [0xff, 0xd8, 0xff]) &&
      hasBytes(bytes, bytes.length - 2, [0xff, 0xd9])) ||
    (extension === '.gif' &&
      (readAscii(bytes, 0, 6) === 'GIF87a' ||
        readAscii(bytes, 0, 6) === 'GIF89a')) ||
    (extension === '.webp' &&
      readAscii(bytes, 0, 4) === 'RIFF' &&
      readAscii(bytes, 8, 4) === 'WEBP' &&
      readUint32LittleEndian(bytes, 4) === bytes.length - 8) ||
    (extension === '.avif' &&
      readAscii(bytes, 4, 4) === 'ftyp' &&
      ['avif', 'avis'].includes(readAscii(bytes, 8, 4)))

  return valid
    ? null
    : '画像の拡張子と実体が一致するPNG、JPEG、GIF、WebP、AVIFだけを保存できます。'
}

function decodeBase64(value: string) {
  try {
    const binary = atob(value)
    const bytes = new Uint8Array(binary.length)

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }

    return bytes
  } catch {
    return null
  }
}

function containsForbiddenCharacter(value: string) {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0

    return (
      codePoint === 0 ||
      codePoint === 0x7f ||
      (codePoint >= 0xd800 && codePoint <= 0xdfff)
    )
  })
}

function hasBytes(bytes: Uint8Array, offset: number, expected: number[]) {
  if (offset < 0 || offset + expected.length > bytes.length) return false

  return expected.every((value, index) => bytes[offset + index] === value)
}

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  if (offset < 0 || offset + length > bytes.length) return ''

  return Array.from(bytes.slice(offset, offset + length), (byte) =>
    String.fromCharCode(byte),
  ).join('')
}

function readUint32LittleEndian(bytes: Uint8Array, offset: number) {
  if (offset < 0 || offset + 4 > bytes.length) return -1

  return (
    bytes[offset] +
    bytes[offset + 1] * 0x100 +
    bytes[offset + 2] * 0x10000 +
    bytes[offset + 3] * 0x1000000
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
