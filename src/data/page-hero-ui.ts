import type { Locale } from '../i18n/config'

type HeroCopy = {
  story: string
  map: string
  video: string
  diary: string
  search: string
}

// Short introductions for compact heroes; detailed summaries stay in the body.
const copy = {
  ja: {
    story: '遊び方や活動を、もう少し詳しく。',
    map: '建築や地形を、マップで見てみよう。',
    video: 'ワールドやイベントの様子を動画で。',
    diary: '日付を選んで、記録をたどろう。',
    search: '知りたいことを、言葉で探そう。',
  },
  en: {
    story: 'A closer look at life and play.',
    map: 'Explore builds and terrain on the map.',
    video: 'Watch our worlds and events in action.',
    diary: 'Choose a date and explore the records.',
    search: 'Find what you want to know.',
  },
  'zh-cn': {
    story: '进一步了解玩法与活动。',
    map: '在地图上探索建筑与地形。',
    video: '通过视频了解世界与活动。',
    diary: '选择日期，翻阅记录。',
    search: '用关键词寻找想了解的内容。',
  },
  es: {
    story: 'Más sobre cómo jugar y participar.',
    map: 'Explora edificios y terrenos en el mapa.',
    video: 'Descubre nuestros mundos y eventos en vídeo.',
    diary: 'Elige una fecha y explora los registros.',
    search: 'Encuentra lo que quieres saber.',
  },
  pt: {
    story: 'Mais sobre como jogar e participar.',
    map: 'Explore construções e terrenos no mapa.',
    video: 'Veja nossos mundos e eventos em vídeo.',
    diary: 'Escolha uma data e explore os registros.',
    search: 'Encontre o que você quer saber.',
  },
  fr: {
    story: 'Pour mieux découvrir la vie et le jeu.',
    map: 'Explorez les constructions et le terrain.',
    video: 'Découvrez nos mondes et événements en vidéo.',
    diary: 'Choisissez une date et explorez les récits.',
    search: 'Trouvez ce que vous souhaitez savoir.',
  },
  ko: {
    story: '플레이 방법과 활동을 더 자세히.',
    map: '지도에서 건축물과 지형을 살펴보세요.',
    video: '월드와 이벤트의 모습을 영상으로.',
    diary: '날짜를 골라 기록을 읽어 보세요.',
    search: '궁금한 내용을 검색해 보세요.',
  },
  de: {
    story: 'Mehr über das Spielen und Mitmachen.',
    map: 'Erkunde Bauwerke und Gelände auf der Karte.',
    video: 'Entdecke unsere Welten und Events im Video.',
    diary: 'Wähle ein Datum und entdecke die Einträge.',
    search: 'Finde, was du wissen möchtest.',
  },
  ru: {
    story: 'Больше об игре и жизни сообщества.',
    map: 'Изучайте постройки и ландшафт на карте.',
    video: 'Смотрите видео о мирах и событиях.',
    diary: 'Выберите дату и прочитайте записи.',
    search: 'Найдите то, что хотите узнать.',
  },
} satisfies Record<Locale, HeroCopy>

export const getPageHeroUi = (locale: Locale): HeroCopy => copy[locale]
