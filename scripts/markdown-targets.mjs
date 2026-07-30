import { fromMarkdown } from 'mdast-util-from-markdown'

const FRONTMATTER_PATTERN = /^---\s*\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/

function visitMarkdownTree(node, visitor) {
  visitor(node)
  if (!Array.isArray(node.children)) return
  for (const child of node.children) visitMarkdownTree(child, visitor)
}

function referenceDefinitionCandidates(source) {
  const labels = new Set()
  const starts = new Set()

  for (const match of source.matchAll(
    /(?<!\\)((?:\\\\)*)(!?)\[(?:\\.|[^\]\\\r\n]){1,999}\]\[((?:\\.|[^\]\\\r\n]){1,999})\]/g,
  )) {
    labels.add(match[3])
    starts.add((match.index ?? 0) + match[1].length)
  }
  for (const match of source.matchAll(
    /(?<!\\)((?:\\\\)*)(!?)\[((?:\\.|[^\]\\\r\n]){1,999})\]\[\]/g,
  )) {
    labels.add(match[3])
    starts.add((match.index ?? 0) + match[1].length)
  }

  return { labels, starts }
}

function missingMarkdownReferences(source, definitions) {
  const candidates = referenceDefinitionCandidates(source)
  if (candidates.labels.size === 0) return []

  const appendedDefinitions = [...candidates.labels]
    .map((label, index) => `[${label}]: /__missing-reference-${index}/`)
    .join('\n')
  const augmentedTree = fromMarkdown(`${source}\n\n${appendedDefinitions}\n`)
  const missingReferences = []
  const seen = new Set()

  visitMarkdownTree(augmentedTree, (node) => {
    if (node.type !== 'imageReference' && node.type !== 'linkReference') {
      return
    }
    if (
      definitions.has(node.identifier) ||
      node.position?.start?.offset === undefined ||
      node.position.start.offset >= source.length ||
      !candidates.starts.has(node.position.start.offset)
    ) {
      return
    }

    const key = `${node.type}:${node.position.start.offset}`
    if (seen.has(key)) return
    seen.add(key)
    missingReferences.push({
      label: node.label,
      line: node.position.start.line,
    })
  })

  return missingReferences
}

export function extractMarkdownTargets(source) {
  const tree = fromMarkdown(source)
  const definitions = new Map()

  visitMarkdownTree(tree, (node) => {
    if (node.type === 'definition' && !definitions.has(node.identifier)) {
      definitions.set(node.identifier, node.url)
    }
  })

  const images = []
  const links = []

  visitMarkdownTree(tree, (node) => {
    const isImage = node.type === 'image' || node.type === 'imageReference'
    const isLink = node.type === 'link' || node.type === 'linkReference'
    if (!isImage && !isLink) return

    const target =
      node.type === 'image' || node.type === 'link'
        ? node.url
        : definitions.get(node.identifier)
    const reference = {
      label: node.label,
      line: node.position?.start?.line,
    }

    if (typeof target !== 'string') return

    if (isImage) {
      images.push({ ...reference, alt: node.alt ?? '', target })
    } else {
      links.push({ ...reference, target })
    }
  })

  const missingReferences = missingMarkdownReferences(source, definitions)
  return { images, links, missingReferences }
}

export function extractStoryMarkdownTargets(source) {
  const frontmatter = source.match(FRONTMATTER_PATTERN)?.[0]
  const markdownSource = frontmatter ? source.slice(frontmatter.length) : source
  const lineOffset = frontmatter
    ? (frontmatter.match(/\r?\n/g) ?? []).length
    : 0
  const targets = extractMarkdownTargets(markdownSource)
  const withOriginalLine = (target) => ({
    ...target,
    line: target.line ? target.line + lineOffset : target.line,
  })

  return {
    images: targets.images.map(withOriginalLine),
    links: targets.links.map(withOriginalLine),
    missingReferences: targets.missingReferences.map(withOriginalLine),
  }
}
