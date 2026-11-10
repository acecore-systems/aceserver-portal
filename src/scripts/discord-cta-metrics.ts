import { PORTAL_DISCORD_INVITE } from '../data/discord.ts'
import { parseCtaMetric } from '../data/discord-cta-contract.ts'

export function initDiscordCtaMetrics() {
  document.addEventListener('click', recordDiscordCtaClick, { capture: true })
  document.addEventListener('auxclick', recordDiscordCtaClick, {
    capture: true,
  })
}

export function recordDiscordCtaClick(event: MouseEvent) {
  if (event.type === 'auxclick' && event.button !== 1) return
  const target = event.target
  if (!(target instanceof Element)) return
  const anchor = target.closest('a')
  if (!anchor || anchor.href !== PORTAL_DISCORD_INVITE) return
  const placement =
    anchor.closest<HTMLElement>('[data-discord-cta]')?.dataset.discordCta
  const metric = parseCtaMetric({
    placement,
    locale: document.body.dataset.discordLocale,
  })
  if (!metric) return
  try {
    void fetch('/api/discord-cta-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    }).catch(() => {})
  } catch {
    // A measurement failure must never interrupt navigation.
  }
}
