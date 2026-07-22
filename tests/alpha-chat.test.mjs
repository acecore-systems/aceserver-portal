import assert from 'node:assert/strict'
import test from 'node:test'

import {
  addGuideResourceLinks,
  buildConversationInput,
  isAllowedRequestOrigin,
  onRequestPost,
  trimIncompleteMarkdown,
} from '../functions/api/alpha-chat.js'

const ENDPOINT = 'https://asv.acecore.net/api/alpha-chat'

function createRequest(payload, headers = {}) {
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://asv.acecore.net',
      'Sec-Fetch-Site': 'same-origin',
      ...headers,
    },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  })
}

test('uses the dialogue model and only stable navigation context', async () => {
  let invocation
  const env = {
    AI: {
      async run(model, input) {
        invocation = { model, input }
        return {
          choices: [
            {
              message: {
                content:
                  '参加方法は公式Discordで確認して、詳しい内容はAceserver WIKIを見てね。',
              },
            },
          ],
        }
      },
    },
  }

  const response = await onRequestPost({
    request: createRequest({ question: '参加方法を教えて' }),
    env,
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.ok, true)
  assert.match(body.answer, /\[公式Discord\]\(https:\/\/discord\.gg\/acsv\)/)
  assert.match(
    body.answer,
    /\[Aceserver WIKI\]\(https:\/\/asv-wiki\.acecore\.net\)/,
  )
  assert.equal(invocation.model, '@cf/zai-org/glm-4.7-flash')
  assert.equal(invocation.input.max_completion_tokens, 320)
  assert.deepEqual(invocation.input.chat_template_kwargs, {
    enable_thinking: false,
  })

  const systemPrompt = invocation.input.messages[0].content
  assert.match(systemPrompt, /https:\/\/discord\.gg\/acsv/)
  assert.match(systemPrompt, /Rules, commands, plugins/)
  assert.doesNotMatch(systemPrompt, /vKTdU4k8ur|\/article\/Reset|32チャンク/)
})

test('rejects cross-origin browser requests before invoking AI', async () => {
  let invoked = false
  const response = await onRequestPost({
    request: createRequest(
      { question: '参加方法を教えて' },
      {
        Origin: 'https://example.com',
        'Sec-Fetch-Site': 'cross-site',
      },
    ),
    env: {
      AI: {
        async run() {
          invoked = true
          return { response: 'unexpected' }
        },
      },
    },
  })

  assert.equal(response.status, 403)
  assert.equal(invoked, false)
})

test('requires JSON and bounds the streamed request body', async () => {
  const nonJsonResponse = await onRequestPost({
    request: createRequest('question=hello', {
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    env: {},
  })
  assert.equal(nonJsonResponse.status, 400)

  const oversizedResponse = await onRequestPost({
    request: createRequest(JSON.stringify({ question: 'a'.repeat(12_100) })),
    env: {},
  })
  assert.equal(oversizedResponse.status, 413)
})

test('validates question and conversation limits', async () => {
  const longQuestionResponse = await onRequestPost({
    request: createRequest({ question: 'a'.repeat(501) }),
    env: {},
  })
  assert.equal(longQuestionResponse.status, 400)

  const longConversationResponse = await onRequestPost({
    request: createRequest({
      question: '続き',
      messages: Array.from({ length: 8 }, (_, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: 'あ'.repeat(400),
      })),
    }),
    env: {},
  })
  assert.equal(longConversationResponse.status, 400)
})

test('returns controlled fallbacks when binding or inference is unavailable', async () => {
  const unconfiguredResponse = await onRequestPost({
    request: createRequest({ question: '参加方法を教えて' }),
    env: {},
  })
  assert.equal(unconfiguredResponse.status, 503)
  assert.match((await unconfiguredResponse.json()).answer, /discord\.gg\/acsv/)

  const failedResponse = await onRequestPost({
    request: createRequest({ question: '参加方法を教えて' }),
    env: {
      AI: {
        async run() {
          throw new Error('inference failed')
        },
      },
    },
  })
  assert.equal(failedResponse.status, 502)
  assert.match((await failedResponse.json()).answer, /discord\.gg\/acsv/)
})

test('normalizes conversation roles and keeps only recent messages', () => {
  const messages = Array.from({ length: 10 }, (_, index) => ({
    role: index % 2 === 0 ? 'assistant' : 'user',
    content: `message-${index}`,
  }))
  const conversation = buildConversationInput({ messages })

  assert.doesNotMatch(conversation, /message-0|message-1/)
  assert.match(conversation, /Alpha-kun: message-2/)
  assert.match(conversation, /Visitor: message-9/)
})

test('post-processes only canonical guide links and trims dangling Markdown', () => {
  assert.equal(
    addGuideResourceLinks('公式DiscordとAceserver WIKIを確認してね。'),
    '[公式Discord](https://discord.gg/acsv)と[Aceserver WIKI](https://asv-wiki.acecore.net)を確認してね。',
  )
  assert.equal(
    trimIncompleteMarkdown(
      '案内はこちら。\n[公式Discord](https://discord.gg/ac',
    ),
    '案内はこちら。',
  )
})

test('origin comparison includes the scheme and honors Fetch Metadata', () => {
  assert.equal(
    isAllowedRequestOrigin(
      new Request(ENDPOINT, {
        headers: { Origin: 'http://asv.acecore.net' },
      }),
    ),
    false,
  )
  assert.equal(
    isAllowedRequestOrigin(
      new Request(ENDPOINT, {
        headers: { 'Sec-Fetch-Site': 'cross-site' },
      }),
    ),
    false,
  )
})
