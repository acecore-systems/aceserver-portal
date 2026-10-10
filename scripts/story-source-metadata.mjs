import { parseDocument } from 'yaml'

export function readStoryMetadata(source, slug) {
  const frontmatter = source
    .replaceAll('\r\n', '\n')
    .match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1]
  if (frontmatter === undefined) {
    throw new Error(`${slug}: story frontmatter is missing`)
  }
  const document = parseDocument(frontmatter, { uniqueKeys: true })
  if (document.errors.length > 0 || document.warnings.length > 0) {
    throw new Error(`${slug}: story frontmatter is invalid`)
  }
  const data = document.toJS({ maxAliasCount: 0 })
  const result = {}
  for (const field of ['title', 'description']) {
    if (typeof data?.[field] !== 'string' || !data[field].trim()) {
      throw new Error(`${slug}: story ${field} must be a nonempty string`)
    }
    result[field] = data[field]
  }
  return result
}
