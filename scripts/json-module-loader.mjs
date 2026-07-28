import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'

registerHooks({
  load(url, context, nextLoad) {
    if (!url.startsWith('file:') || !url.endsWith('.json')) {
      return nextLoad(url, context)
    }

    const json = readFileSync(new URL(url), 'utf8')

    return {
      format: 'module',
      shortCircuit: true,
      source: `export default JSON.parse(${JSON.stringify(json)})\n`,
    }
  },
})
