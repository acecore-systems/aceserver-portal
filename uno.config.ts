import { defineConfig, presetWind3, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [presetWind3()],
  transformers: [transformerDirectives()],
  preflights: [
    {
      getCSS: () =>
        'html{scroll-behavior:smooth}body{min-width:320px}[id]{scroll-margin-top:5rem}',
    },
  ],
  theme: {
    colors: {
      skyforge: {
        50: '#eefcff',
        100: '#d7f7ff',
        300: '#67d9ff',
        500: '#0aa7e2',
        700: '#066b9b',
      },
      grass: {
        50: '#f0fee7',
        100: '#ddfacb',
        300: '#8ee35c',
        500: '#35aa2f',
        700: '#1f6e25',
      },
      gold: { 100: '#fff0b8', 300: '#ffd84d', 500: '#f5a900', 700: '#b86500' },
      ember: { 400: '#ff7a1a', 600: '#d94b00' },
      ink: { 900: '#15130f', 800: '#201c16', 700: '#332a1f' },
      parchment: '#fff5dc',
    },
    fontFamily: {
      sans: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'Yu Gothic', Meiryo, system-ui, sans-serif",
      display:
        "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', 'Yu Gothic', Meiryo, system-ui, sans-serif",
    },
  },
  shortcuts: {
    'asv-container': 'mx-auto max-w-7xl px-5 sm:px-6 lg:px-8',
    'asv-btn':
      'inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-900 no-underline shadow-[0_4px_0_rgba(0,0,0,.35)] transition duration-180 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 active:translate-y-0.5 active:shadow-[0_2px_0_rgba(0,0,0,.35)]',
    'asv-btn-primary':
      'asv-btn border-2 border-[#9f6b00] bg-gold-300 text-ink-900 hover:bg-[#ffe279]',
    'asv-btn-blue':
      'asv-btn border-2 border-[#074d8f] bg-[#1877f2] text-white hover:bg-[#2d8bff]',
    'asv-btn-green':
      'asv-btn border-2 border-[#246c1d] bg-grass-500 text-white hover:bg-[#42bd39]',
    'asv-panel':
      'rounded-xl border-2 border-[#5a4228] bg-[rgba(255,245,220,.94)] shadow-[0_10px_0_rgba(41,29,16,.18),0_24px_70px_rgba(24,18,12,.18)]',
  },
})
