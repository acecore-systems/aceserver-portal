import { fromMarkdown } from 'mdast-util-from-markdown'
import type { Nodes } from 'mdast'

type Parent = HTMLElement | DocumentFragment

function safeLink(value: string): string | null {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null
  } catch {
    return null
  }
}

/** Discord copy is untrusted: create only these elements, never parse HTML. */
export function renderCommunityMarkdown(
  document: Document,
  source: string,
): DocumentFragment {
  const fragment = document.createDocumentFragment()
  function append(parent: Parent, node: Nodes) {
    if (node.type === 'text' || node.type === 'html') {
      parent.append(document.createTextNode(node.value))
      return
    }
    if (node.type === 'image' || node.type === 'imageReference') {
      parent.append(document.createTextNode(node.alt ?? ''))
      return
    }
    if (node.type === 'definition') return
    let element: HTMLElement | undefined
    switch (node.type) {
      case 'paragraph':
        element = document.createElement('p')
        break
      case 'heading':
        // This feed sits below the page's h4 and the event's h5.
        element = document.createElement('h6')
        element.dataset.markdownLevel = String(node.depth)
        break
      case 'blockquote':
        element = document.createElement('blockquote')
        break
      case 'list': {
        const list = document.createElement(node.ordered ? 'ol' : 'ul')
        if (node.ordered && node.start && node.start > 1)
          list.setAttribute('start', String(node.start))
        element = list
        break
      }
      case 'listItem':
        element = document.createElement('li')
        break
      case 'strong':
        element = document.createElement('strong')
        break
      case 'emphasis':
        element = document.createElement('em')
        break
      case 'inlineCode':
        element = document.createElement('code')
        element.textContent = node.value
        break
      case 'code': {
        element = document.createElement('pre')
        const code = document.createElement('code')
        code.textContent = node.value
        element.append(code)
        break
      }
      case 'break':
        element = document.createElement('br')
        break
      case 'thematicBreak':
        element = document.createElement('hr')
        break
      case 'link': {
        const href = safeLink(node.url)
        if (href) {
          const link = document.createElement('a')
          link.href = href
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          element = link
        }
        break
      }
    }
    if (element) parent.append(element)
    if ('children' in node)
      for (const child of node.children) append(element ?? parent, child)
  }
  append(fragment, fromMarkdown(source))
  return fragment
}
