import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import UnoCSS from '@unocss/astro'

const site = process.env.PUBLIC_SITE_URL || 'https://asv.acecore.net'

export default defineConfig({
  site,
  build: {
    inlineStylesheets: 'auto',
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
    sitemap(),
  ],
})
