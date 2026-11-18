import { probeVoyageDocument } from './sync-portal-vectorize.mjs'

try {
  console.log(JSON.stringify(await probeVoyageDocument()))
} catch {
  console.error('Voyage document embedding verification failed.')
  process.exitCode = 1
}
