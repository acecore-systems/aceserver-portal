import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import UnoCSS from '@unocss/astro'
import { fileURLToPath } from 'node:url'

const site = process.env.PUBLIC_SITE_URL || 'https://asv.acecore.net'
const astroPrerenderEntry = fileURLToPath(
  import.meta.resolve('astro/entrypoints/prerender'),
)

export default defineConfig({
  site,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    resolve: {
      alias: {
        // Keep Astro's prerender entry resolvable when Rollup treats it as input.
        'astro/entrypoints/prerender': astroPrerenderEntry,
      },
    },
  },
  integrations: [
    UnoCSS({
      injectReset: true,
      content: {
        pipeline: {
          exclude: [/\.(css|postcss|sass|scss|less|stylus|styl)($|\?)/],
        },
      },
    }),
    sitemap({
      filter(page) {
        const pathname = new URL(page).pathname
        return pathname !== '/404' && !pathname.startsWith('/admin/')
      },
      serialize(item) {
        const pathname = new URL(item.url).pathname
        if (pathname === '/') {
          item.changefreq = 'weekly'
          item.priority = 1
        } else if (
          pathname.startsWith('/world-map') ||
          pathname.startsWith('/youtube-search')
        ) {
          item.changefreq = 'daily'
          item.priority = 0.8
        } else {
          item.changefreq = 'monthly'
          item.priority = 0.6
        }
        return item
      },
    }),
  ],
})
