import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { satteri } from '@astrojs/markdown-satteri'
import UnoCSS from '@unocss/astro'

const site = process.env.PUBLIC_SITE_URL || 'https://asv.acecore.net'
const localePrefixPattern = /^\/(?:en|zh-cn|es|pt|fr|ko|de|ru)(?=\/)/

const getElementChildren = (node, tagName) =>
  (node.children ?? []).filter(
    (child) => child.type === 'element' && child.tagName === tagName,
  )

const getNodeText = (node) => {
  if (node.type === 'text') {
    return node.value ?? ''
  }

  return (node.children ?? []).map(getNodeText).join('')
}

const responsiveTableLabelsPlugin = {
  name: 'responsive-table-labels',
  element: {
    filter: ['table'],
    visit(table, context) {
      const [tableHead] = getElementChildren(table, 'thead')
      const [tableBody] = getElementChildren(table, 'tbody')
      const [headerRow] = tableHead ? getElementChildren(tableHead, 'tr') : []
      const headers = headerRow
        ? getElementChildren(headerRow, 'th').map((cell) =>
            getNodeText(cell).trim(),
          )
        : []
      const rows = tableBody ? getElementChildren(tableBody, 'tr') : []
      const canStackOnSmallScreens =
        headers.length > 0 &&
        headers.every(Boolean) &&
        rows.length > 0 &&
        rows.every(
          (row) => getElementChildren(row, 'td').length === headers.length,
        )

      if (!canStackOnSmallScreens) {
        return
      }

      context.setProperty(table, 'data-responsive-table', 'true')

      for (const row of rows) {
        for (const [index, cell] of getElementChildren(row, 'td').entries()) {
          context.setProperty(cell, 'data-label', headers[index])
        }
      }
    },
  },
}

export default defineConfig({
  site,
  compressHTML: true,
  markdown: {
    processor: satteri({
      hastPlugins: [responsiveTableLabelsPlugin],
    }),
  },
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
          unprefixedPathname !== '/search/' &&
          unprefixedPathname !== '/search' &&
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
