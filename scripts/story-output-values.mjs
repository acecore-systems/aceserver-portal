import { parseFragment } from 'parse5'

import { buildSeoDescription } from '../src/utils/seo-meta.ts'

export function attributeValue(tag, name) {
  if (!tag) return null
  const fragment = parseFragment(
    tag.trimStart().startsWith('<') ? tag : `<span ${tag}></span>`,
  )
  const element = fragment.childNodes.find((node) => node.tagName)
  return (
    element?.attrs?.find((attribute) => attribute.name === name)?.value ?? null
  )
}

export function visibleText(html) {
  function text(node) {
    if (node.nodeName === '#text') return node.value
    if (node.tagName === 'script' || node.tagName === 'style') return ''
    return (node.childNodes ?? []).map(text).join('')
  }
  return text(parseFragment(html))
}

export function storyMetaDescription(story, settings) {
  return buildSeoDescription({
    description: story.description,
    shortDescriptionContext: settings.description,
  })
}
