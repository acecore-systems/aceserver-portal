import { z } from 'zod'

export const ALPHA_LORE_SCHEMA_VERSION = 1
export const ALPHA_LORE_GRANULARITY = 'fragment'
export const ALPHA_LORE_COVERAGE_KEY_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/u

export const ALPHA_LORE_ERAS = [
  'origin',
  'childhood',
  'adolescence',
  'early_guide',
  'recent',
  'timeless',
] as const

export const ALPHA_LORE_FACT_KINDS = ['ordinary', 'foundational'] as const

export const alphaLoreFactSchema = z
  .object({
    fact_key: z.string().min(3).max(80).regex(ALPHA_LORE_COVERAGE_KEY_PATTERN),
    kind: z.enum(ALPHA_LORE_FACT_KINDS),
    value_ja: z.string().min(1).max(120),
  })
  .strict()

export const alphaLoreFragmentSchema = z
  .object({
    coverage_key: z
      .string()
      .min(3)
      .max(80)
      .regex(ALPHA_LORE_COVERAGE_KEY_PATTERN),
    granularity: z.literal(ALPHA_LORE_GRANULARITY),
    era: z.enum(ALPHA_LORE_ERAS),
    title_ja: z.string().min(1).max(30),
    summary_ja: z.string().min(1).max(80),
    body_ja: z.string().min(160).max(320),
    next_hook_ja: z.string().min(1).max(80).nullable(),
    facts: z.array(alphaLoreFactSchema).min(1).max(2),
    related_revision_ids: z.array(z.string().uuid()).max(4),
  })
  .strict()

export const alphaLorePlanSchema = z
  .object({
    decision: z.enum(['reuse', 'create']),
    coverage_key: z
      .string()
      .min(3)
      .max(80)
      .regex(ALPHA_LORE_COVERAGE_KEY_PATTERN),
    selected_revision_id: z.string().uuid().nullable(),
    atomic_topic_ja: z.string().min(1).max(80),
  })
  .strict()

export const alphaLoreReviewSchema = z
  .object({
    decision: z.enum(['accept', 'reject']),
    reason_codes: z
      .array(
        z.enum([
          'consistent',
          'contradiction',
          'duplicate_coverage',
          'foundational_overreach',
          'real_world_claim',
          'scope_overreach',
          'invalid_reference',
          'other',
        ]),
      )
      .min(1)
      .max(4),
    note_ja: z.string().max(160),
  })
  .strict()

export type AlphaLoreFact = z.infer<typeof alphaLoreFactSchema>
export type AlphaLoreFragment = z.infer<typeof alphaLoreFragmentSchema>
export type AlphaLorePlan = z.infer<typeof alphaLorePlanSchema>
export type AlphaLoreReview = z.infer<typeof alphaLoreReviewSchema>

const factJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    fact_key: {
      type: 'string',
      minLength: 3,
      maxLength: 80,
      pattern: '^[a-z0-9]+(?:[._-][a-z0-9]+)*$',
    },
    kind: { type: 'string', enum: [...ALPHA_LORE_FACT_KINDS] },
    value_ja: { type: 'string', minLength: 1, maxLength: 120 },
  },
  required: ['fact_key', 'kind', 'value_ja'],
} as const

export const ALPHA_LORE_FRAGMENT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    coverage_key: {
      type: 'string',
      minLength: 3,
      maxLength: 80,
      pattern: '^[a-z0-9]+(?:[._-][a-z0-9]+)*$',
    },
    granularity: { type: 'string', enum: [ALPHA_LORE_GRANULARITY] },
    era: { type: 'string', enum: [...ALPHA_LORE_ERAS] },
    title_ja: { type: 'string', minLength: 1, maxLength: 30 },
    summary_ja: { type: 'string', minLength: 1, maxLength: 80 },
    body_ja: { type: 'string', minLength: 160, maxLength: 320 },
    next_hook_ja: {
      anyOf: [
        { type: 'string', minLength: 1, maxLength: 80 },
        { type: 'null' },
      ],
    },
    facts: {
      type: 'array',
      minItems: 1,
      maxItems: 2,
      items: factJsonSchema,
    },
    related_revision_ids: {
      type: 'array',
      maxItems: 4,
      items: { type: 'string', format: 'uuid' },
    },
  },
  required: [
    'coverage_key',
    'granularity',
    'era',
    'title_ja',
    'summary_ja',
    'body_ja',
    'next_hook_ja',
    'facts',
    'related_revision_ids',
  ],
} as const

export const ALPHA_LORE_PLAN_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    decision: { type: 'string', enum: ['reuse', 'create'] },
    coverage_key: {
      type: 'string',
      minLength: 3,
      maxLength: 80,
      pattern: '^[a-z0-9]+(?:[._-][a-z0-9]+)*$',
    },
    selected_revision_id: {
      anyOf: [{ type: 'string', format: 'uuid' }, { type: 'null' }],
    },
    atomic_topic_ja: { type: 'string', minLength: 1, maxLength: 80 },
  },
  required: [
    'decision',
    'coverage_key',
    'selected_revision_id',
    'atomic_topic_ja',
  ],
} as const

export const ALPHA_LORE_REVIEW_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    decision: { type: 'string', enum: ['accept', 'reject'] },
    reason_codes: {
      type: 'array',
      minItems: 1,
      maxItems: 4,
      items: {
        type: 'string',
        enum: [
          'consistent',
          'contradiction',
          'duplicate_coverage',
          'foundational_overreach',
          'real_world_claim',
          'scope_overreach',
          'invalid_reference',
          'other',
        ],
      },
    },
    note_ja: { type: 'string', maxLength: 160 },
  },
  required: ['decision', 'reason_codes', 'note_ja'],
} as const

export function parseAlphaLoreFragment(value: unknown): AlphaLoreFragment {
  return alphaLoreFragmentSchema.parse(value)
}

export function parseAlphaLorePlan(value: unknown): AlphaLorePlan {
  return alphaLorePlanSchema.parse(value)
}

export function parseAlphaLoreReview(value: unknown): AlphaLoreReview {
  return alphaLoreReviewSchema.parse(value)
}
