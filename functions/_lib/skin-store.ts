import { z } from 'zod'
import { encodePixels, type Model } from '../../src/lib/skin-maker.ts'

export type SkinStoreEnv = Env & {
  SKIN_STORE_ENABLED?: string
  SKIN_QUOTA_SALT?: string
}
export function storeAvailable(env: SkinStoreEnv): boolean {
  return (
    env.SKIN_STORE_ENABLED === 'true' &&
    !!env.SEARCH_RATE_LIMIT_DB &&
    !!env.SKIN_QUOTA_SALT
  )
}
const tokenSchema = z
  .object({
    id: z.string().uuid(),
    model: z.enum(['classic', 'slim']),
    hash: z.string().regex(/^[a-f0-9]{64}$/),
    origin: z.string().url(),
    expires: z.number().int().positive(),
    purpose: z.enum(['publish', 'remix', 'remove']),
    source: z.string().uuid().optional(),
  })
  .strict()
  .refine((ticket) =>
    ticket.purpose === 'remix'
      ? !!ticket.source && ticket.source !== ticket.id
      : ticket.purpose === 'publish'
        ? ticket.source === undefined
        : ticket.source !== ticket.id,
  )
export type StoreTicket = z.infer<typeof tokenSchema>

async function key(salt: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(salt),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}
function base64url(bytes: Uint8Array): string {
  return encodePixels(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
function bytes(value: string): Uint8Array {
  return Uint8Array.from(
    atob(value.replace(/-/g, '+').replace(/_/g, '/')),
    (c) => c.charCodeAt(0),
  )
}
export async function pixelHash(pixels: Uint8Array): Promise<string> {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new Uint8Array(pixels)),
    ),
  )
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
}
export async function signStoreTicket(
  ticket: StoreTicket,
  salt: string,
): Promise<string> {
  const payload = base64url(new TextEncoder().encode(JSON.stringify(ticket)))
  const signature = await crypto.subtle.sign(
    'HMAC',
    await key(salt),
    new TextEncoder().encode(`skin-store-v1:${payload}`),
  )
  return `${payload}.${base64url(new Uint8Array(signature))}`
}
export async function readStoreTicket(
  token: string,
  salt: string,
  origin: string,
  purpose: StoreTicket['purpose'],
  now = Math.floor(Date.now() / 1000),
): Promise<StoreTicket> {
  if (token.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))
    throw new Error('ticket')
  const [payload, signature] = token.split('.')
  const verified = await crypto.subtle.verify(
    'HMAC',
    await key(salt),
    bytes(signature),
    new TextEncoder().encode(`skin-store-v1:${payload}`),
  )
  if (!verified) throw new Error('ticket')
  const ticket = tokenSchema.parse(
    JSON.parse(new TextDecoder().decode(bytes(payload))),
  )
  if (
    ticket.origin !== origin ||
    ticket.purpose !== purpose ||
    ticket.expires <= now
  )
    throw new Error('ticket')
  return ticket
}
export async function issueStoreTicket(
  id: string,
  model: Model,
  pixels: Uint8Array,
  origin: string,
  salt: string,
): Promise<string> {
  return signStoreTicket(
    {
      id,
      model,
      hash: await pixelHash(pixels),
      origin,
      expires: Math.floor(Date.now() / 1000) + 86400,
      purpose: 'publish',
    },
    salt,
  )
}
export async function issueRemixTicket(
  source: string,
  model: Model,
  pixels: Uint8Array,
  origin: string,
  salt: string,
): Promise<string> {
  return signStoreTicket(
    {
      id: crypto.randomUUID(),
      source,
      model,
      hash: await pixelHash(pixels),
      origin,
      expires: Math.floor(Date.now() / 1000) + 86400,
      purpose: 'remix',
    },
    salt,
  )
}
// Rotate the quota identifier each UTC day; raw IPs are never stored.
export async function remixClient(
  ip: string,
  day: string,
  salt: string,
): Promise<string> {
  return base64url(
    new Uint8Array(
      await crypto.subtle.sign(
        'HMAC',
        await key(salt),
        new TextEncoder().encode(`skin-store-remix:${day}:${ip}`),
      ),
    ),
  )
}
export async function reportClient(ip: string, salt: string): Promise<string> {
  return base64url(
    new Uint8Array(
      await crypto.subtle.sign(
        'HMAC',
        await key(salt),
        new TextEncoder().encode(`skin-store-report:${ip}`),
      ),
    ),
  )
}
