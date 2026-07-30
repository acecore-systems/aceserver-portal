import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import UnoCSS from '@unocss/astro'

const site = process.env.PUBLIC_SITE_URL || 'https://asv.acecore.net'
const localePrefixPattern = /^\/(?:en|zh-cn|es|pt|fr|ko|de|ru)(?=\/)/

export default defineConfig({
  site,
  compressHTML: true,
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
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: {
          ja: 'ja',
          en: 'en',
          'zh-cn': 'zh-CN',
          es: 'es',
          pt: 'pt',
          fr: 'fr',
          ko: 'ko',
          de: 'de',
          ru: 'ru',
        },
      },
      filter(page) {
        const pathname = new URL(page).pathname
        const unprefixedPathname =
          pathname.replace(localePrefixPattern, '') || '/'
        return (
          unprefixedPathname !== '/404/' &&
          unprefixedPathname !== '/404' &&
          unprefixedPathname !== '/rss.xml' &&
          !unprefixedPathname.startsWith('/admin/')
        )
      },
      serialize(item) {
        const pathname =
          new URL(item.url).pathname.replace(localePrefixPattern, '') || '/'
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
