const TRANSLATION_BLOCK_START = 'const en: LocaleTranslation = {'
const TRANSLATION_BLOCK_END = 'export const TRANSLATIONS = {'
const CONTROL_CHARACTER_PATTERN = /[\0-\x08\x0b\x0c\x0e-\x1f\x7f]/u
const BIDI_CONTROL_PATTERN = /[\u202a-\u202e\u2066-\u2069]/u
const RAW_HTML_PATTERN = /<!--|<\s*\/?\s*[A-Za-z][^>]*>/u
const ACTIVE_URL_SCHEME_PATTERN = /\b(?:data|file|javascript|vbscript)\s*:/iu

function normalizeLf(value) {
  return value.replaceAll('\r\n', '\n').replaceAll('\r', '\n')
}

function findUniqueBoundary(source, boundary, label) {
  const first = source.indexOf(boundary)
  if (first < 0 || source.indexOf(boundary, first + boundary.length) >= 0) {
    throw new Error(`Could not identify the unique ${label} boundary.`)
  }
  return first
}

function skipTrivia(source, startIndex) {
  let index = startIndex
  while (index < source.length) {
    if (/\s/u.test(source[index])) {
      index += 1
      continue
    }
    if (source.startsWith('//', index)) {
      const lineEnd = source.indexOf('\n', index + 2)
      index = lineEnd < 0 ? source.length : lineEnd + 1
      continue
    }
    if (source.startsWith('/*', index)) {
      const commentEnd = source.indexOf('*/', index + 2)
      if (commentEnd < 0) throw new Error('Unterminated block comment.')
      index = commentEnd + 2
      continue
    }
    break
  }
  return index
}

function readQuotedToken(source, startIndex, quote) {
  let index = startIndex + 1
  while (index < source.length) {
    const character = source[index]
    if (character === '\\') {
      index += 2
      continue
    }
    if (character === quote) {
      return { end: index + 1, raw: source.slice(startIndex, index + 1) }
    }
    if ((character === '\n' || character === '\r') && quote !== '`') {
      throw new Error('Unterminated string literal.')
    }
    index += 1
  }
  throw new Error('Unterminated string or template literal.')
}

function tokenShape(source) {
  const tokens = []
  let index = 0

  while (index < source.length) {
    const next = skipTrivia(source, index)
    if (next >= source.length) break
    index = next
    const character = source[index]

    if (character === "'" || character === '"') {
      const token = readQuotedToken(source, index, character)
      const nextTokenIndex = skipTrivia(source, token.end)
      const isPropertyKey = source[nextTokenIndex] === ':'
      tokens.push(isPropertyKey ? `property:${token.raw}` : 'string-value')
      index = token.end
      continue
    }

    if (character === '`') {
      const token = readQuotedToken(source, index, character)
      tokens.push(`template:${token.raw}`)
      index = token.end
      continue
    }

    const identifier = source
      .slice(index)
      .match(/^[A-Za-z_$][A-Za-z0-9_$]*/u)?.[0]
    if (identifier) {
      tokens.push(`identifier:${identifier}`)
      index += identifier.length
      continue
    }

    const number = source
      .slice(index)
      .match(/^(?:0[xob][0-9a-f]+|\d+(?:\.\d+)?)/iu)?.[0]
    if (number) {
      tokens.push(`number:${number}`)
      index += number.length
      continue
    }

    tokens.push(`punctuation:${character}`)
    index += 1
  }

  return tokens
}

function splitTranslationModule(value) {
  const source = normalizeLf(value)
  const start = findUniqueBoundary(
    source,
    TRANSLATION_BLOCK_START,
    'translation block start',
  )
  const end = findUniqueBoundary(
    source,
    TRANSLATION_BLOCK_END,
    'translation block end',
  )
  if (end <= start)
    throw new Error('Translation block boundaries are reversed.')

  return {
    prefix: source.slice(0, start),
    translations: source.slice(start, end),
    suffix: source.slice(end),
  }
}

export function hasOnlyTranslationStringChanges(baseContent, headContent) {
  if (typeof baseContent !== 'string' || typeof headContent !== 'string') {
    return false
  }

  let base
  let head
  try {
    base = splitTranslationModule(baseContent)
    head = splitTranslationModule(headContent)
  } catch {
    return false
  }

  if (base.prefix !== head.prefix || base.suffix !== head.suffix) return false
  const baseShape = tokenShape(base.translations)
  const headShape = tokenShape(head.translations)
  return (
    baseShape.length === headShape.length &&
    baseShape.every((token, index) => token === headShape[index])
  )
}

export function isSafeTranslatedStoryContent(content) {
  if (typeof content !== 'string' || !content.trim()) return false
  return !(
    CONTROL_CHARACTER_PATTERN.test(content) ||
    BIDI_CONTROL_PATTERN.test(content) ||
    RAW_HTML_PATTERN.test(content) ||
    ACTIVE_URL_SCHEME_PATTERN.test(content)
  )
}
