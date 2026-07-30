import type { Locale, TranslatedLocale } from './config'

export type UiCopy = {
  siteTitleSuffix: string
  homeTitleParts: [string, string]
  skipToContent: string
  homeAriaLabel: string
  mainNavigation: string
  mobileNavigation: string
  footerNavigation: string
  languageSelector: string
  menuOpen: string
  menuClose: string
  announcementLabel: string
  joinDiscord: string
  openWiki: string
  askAlpha: string
  alphaName: string
  alphaImageAlt: string
  nextSection: string
  homeFreedom: string
  homeMultiplayer: string
  homeCrossplay: string
  homeCtaLabel: string
  worldMapTitleParts: [string, string]
  worldSelection: string
  openWorld: string
  openMap: string
  active: string
  previous: string
  back: string
  next: string
  openNewTab: string
  latestVideos: string
  channel: string
  videoThumbnail: string
  loadingVideos: string
  videoLoadError: string
  advertisement: string
  storiesTitle: string
  storiesDescription: string
  storiesLead: string
  storyListLabel: string
  tagsLabel: string
  breadcrumbLabel: string
  homeLabel: string
  byAuthor: string
  backToStories: string
  joinAceserver: string
  notFoundTitle: string
  notFoundDescription: string
  notFoundMessage: string
  backHome: string
  rssTitle: string
  alpha: {
    chatSubtitle: string
    close: string
    conversation: string
    promptExamples: string
    questionLabel: string
    placeholder: string
    send: string
    majorLinks: string
    toggle: string
    toggleShort: string
    mapLabel: string
    greeting: string
    loading: string
    error: string
    prompts: Array<{ label: string; question: string }>
  }
}

type SectionTranslation = {
  titleCopy?: string
  text?: string
  imageAlt?: string
  title?: string
  ctaLabel?: string
  shoulderCopy?: string
}

export type PageTranslation = {
  pageName: string
  meta: {
    title: string
    description: string
  }
  sections: SectionTranslation[]
}

type WorldTranslation = {
  title: string
  imageAlt: string
  statusLabel: string
  description?: string
}

export type LocaleTranslation = {
  sourceHash: `sha256:${string}`
  ui: UiCopy
  settings: {
    title: string
    shortTitle: string
    description: string
    logoAlt: string
    worlds: Record<string, WorldTranslation>
  }
  navigation: Record<string, string>
  announcements: Record<
    string,
    { title: string; text: string; linkLabel: string }
  >
  pages: Record<string, PageTranslation>
}

function embedPage(title: string, description: string): PageTranslation {
  return {
    pageName: title,
    meta: { title, description },
    sections: [{ title }],
  }
}

function worldMapPage(
  title: string,
  description: string,
  text: string,
  imageAlt: string,
): PageTranslation {
  return {
    pageName: title,
    meta: { title, description },
    sections: [{ titleCopy: title, text, imageAlt }],
  }
}

function homePage(
  pageName: string,
  title: string,
  description: string,
  sections: SectionTranslation[],
): PageTranslation {
  return { pageName, meta: { title, description }, sections }
}

export const JA_UI: UiCopy = {
  siteTitleSuffix: 'Minecraft無料公開サーバーの公式ポータル',
  homeTitleParts: ['エース', 'サーバー'],
  skipToContent: '本文へ移動',
  homeAriaLabel: 'エースサーバー ホーム',
  mainNavigation: 'メインナビゲーション',
  mobileNavigation: 'モバイルナビゲーション',
  footerNavigation: 'フッターナビゲーション',
  languageSelector: '表示言語',
  menuOpen: 'メニューを開く',
  menuClose: 'メニューを閉じる',
  announcementLabel: 'お知らせ',
  joinDiscord: 'ディスコードに参加',
  openWiki: 'WIKIを開く',
  askAlpha: 'アルファくんに聞く',
  alphaName: 'アルファくん',
  alphaImageAlt: 'アルファくん',
  nextSection: '次のセクションへ',
  homeFreedom: '好きなように遊び、作り、つながることができます。',
  homeMultiplayer:
    '一人でも、友達とも、世界中のプレイヤーとも一緒に冒険や建築を楽しめます。',
  homeCrossplay: 'JAVA版・統合版どちらでも遊ぶことが可能です！',
  homeCtaLabel: '参加とWIKI',
  worldMapTitleParts: ['ワールド', 'マップ'],
  worldSelection: 'ワールドを選択',
  openWorld: '{title}を開く',
  openMap: 'マップを開く',
  active: '稼働中',
  previous: '前へ',
  back: '戻る',
  next: '次へ',
  openNewTab: '別タブで開く',
  latestVideos: '最新動画',
  channel: 'チャンネル',
  videoThumbnail: '{title}のサムネイル',
  loadingVideos: '最新動画を取得しています',
  videoLoadError: '最新動画を取得できませんでした',
  advertisement: '広告',
  storiesTitle: '読みもの',
  storiesDescription:
    'エースサーバーの出来事、コミュニティ、ポータルづくりに関する記録です。',
  storiesLead:
    'エースサーバーで起きたことと、コミュニティの入口を整えてきた記録です。',
  storyListLabel: '記事一覧',
  tagsLabel: 'タグ',
  breadcrumbLabel: 'パンくず',
  homeLabel: 'ホーム',
  byAuthor: '文：{author}',
  backToStories: '読みもの一覧へ戻る',
  joinAceserver: 'エースサーバーに参加する',
  notFoundTitle: 'ページが見つかりません',
  notFoundDescription: 'お探しのページは見つかりませんでした。',
  notFoundMessage: 'URLを確認するか、トップページから入り直してください。',
  backHome: 'トップページへ',
  rssTitle: 'エースサーバー 読みもの',
  alpha: {
    chatSubtitle: 'エースサーバー案内チャット',
    close: 'アルファくんチャットを閉じる',
    conversation: 'アルファくんとの会話',
    promptExamples: '質問例',
    questionLabel: 'アルファくんに質問',
    placeholder: '例: 参加方法を教えて',
    send: '送信',
    majorLinks: '主要リンク',
    toggle: 'アルファくんに聞く',
    toggleShort: '聞く',
    mapLabel: 'マップ',
    greeting: 'やあ、アルファくんだよ。エースサーバーの案内をするね。',
    loading: 'アルファくんが考え中...',
    error:
      'いまはAI応答につながらなかったよ。[公式Discord]({discord}) と [Aceserver WIKI]({wiki}) を見てね。',
    prompts: [
      {
        label: '参加方法',
        question: 'エースサーバーへの参加方法を教えて',
      },
      { label: 'ワールド', question: 'どのワールドから見ればいい？' },
      { label: 'ルール', question: '遊ぶ前に確認するルールを教えて' },
    ],
  },
}

const en: LocaleTranslation = {
  sourceHash:
    'sha256:7a2e5e2a72e2082ec988225977fedad69317ec92864bfb50ae3a21294552d52f',
  ui: {
    siteTitleSuffix: 'Official portal for the free public Minecraft server',
    homeTitleParts: ['Ace', 'server'],
    skipToContent: 'Skip to content',
    homeAriaLabel: 'Aceserver home',
    mainNavigation: 'Main navigation',
    mobileNavigation: 'Mobile navigation',
    footerNavigation: 'Footer navigation',
    languageSelector: 'Language',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    announcementLabel: 'Announcements',
    joinDiscord: 'Join Discord',
    openWiki: 'Open the WIKI',
    askAlpha: 'Ask Alpha-kun',
    alphaName: 'Alpha-kun',
    alphaImageAlt: 'Alpha-kun',
    nextSection: 'Go to the next section',
    homeFreedom: 'Play, build, and connect in your own way.',
    homeMultiplayer:
      'Enjoy adventures and building alone, with friends, or with players from around the world.',
    homeCrossplay: 'Play from both Java Edition and Bedrock Edition!',
    homeCtaLabel: 'Join and WIKI',
    worldMapTitleParts: ['World', 'Maps'],
    worldSelection: 'Choose a world',
    openWorld: 'Open {title}',
    openMap: 'Open map',
    active: 'Online',
    previous: 'Previous',
    back: 'Back',
    next: 'Next',
    openNewTab: 'Open in a new tab',
    latestVideos: 'Latest videos',
    channel: 'Channel',
    videoThumbnail: 'Thumbnail for {title}',
    loadingVideos: 'Loading the latest videos',
    videoLoadError: 'The latest videos could not be loaded',
    advertisement: 'Advertisement',
    storiesTitle: 'Stories',
    storiesDescription:
      'Records of Aceserver events, its community, and the portal we have built.',
    storiesLead:
      'Stories from Aceserver and the work behind a clearer entrance to the community.',
    storyListLabel: 'Story list',
    tagsLabel: 'Tags',
    breadcrumbLabel: 'Breadcrumb',
    homeLabel: 'Home',
    byAuthor: 'By {author}',
    backToStories: 'Back to Stories',
    joinAceserver: 'Join Aceserver',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'The page you requested could not be found.',
    notFoundMessage: 'Check the URL or return to the home page.',
    backHome: 'Go to the home page',
    rssTitle: 'Aceserver Stories',
    alpha: {
      chatSubtitle: 'Aceserver guide chat',
      close: 'Close the Alpha-kun chat',
      conversation: 'Conversation with Alpha-kun',
      promptExamples: 'Example questions',
      questionLabel: 'Ask Alpha-kun',
      placeholder: 'Example: How do I join?',
      send: 'Send',
      majorLinks: 'Main links',
      toggle: 'Ask Alpha-kun',
      toggleShort: 'Ask',
      mapLabel: 'Maps',
      greeting:
        "Hi, I'm Alpha-kun. I'll help you find your way around Aceserver.",
      loading: 'Alpha-kun is thinking...',
      error:
        'I cannot reach the AI response right now. Please check [official Discord]({discord}) and the [Aceserver WIKI]({wiki}).',
      prompts: [
        { label: 'Join', question: 'How can I join Aceserver?' },
        { label: 'Worlds', question: 'Which world should I look at first?' },
        {
          label: 'Rules',
          question: 'Which rules should I read before playing?',
        },
      ],
    },
  },
  settings: {
    title: 'Aceserver Portal',
    shortTitle: 'Aceserver',
    description:
      'The official portal for Aceserver, a free public Minecraft server open to everyone. Find participation guidance, world maps, the WIKI, videos, and current notices.',
    logoAlt: 'Aceserver logo featuring the blue and yellow Alpha-kun',
    worlds: {
      main: {
        title: 'Main World',
        imageAlt: 'Existing world-map screenshot of the Main World',
        statusLabel: 'Map available',
      },
      resource: {
        title: 'Resource World',
        imageAlt: 'Existing world-map screenshot of the Resource World',
        statusLabel: 'Map available',
      },
      rpg: {
        title: 'RPG',
        imageAlt: 'Actual screenshot of the RPG world map',
        statusLabel: 'Map available',
      },
      lobby: {
        title: 'Lobby',
        imageAlt: 'Image representing the Lobby World',
        statusLabel: 'Map available',
      },
      'rpg-sub': {
        title: 'RPG Subworld',
        imageAlt: 'Image representing the RPG Subworld',
        statusLabel: 'Map available',
      },
      'season-a': {
        title: 'Season A',
        imageAlt: 'Image representing the Season A world',
        statusLabel: 'Map available',
      },
      'season-a-c': {
        title: 'Season Creative',
        imageAlt: 'Image representing the Season Creative world',
        statusLabel: 'Map available',
      },
      event: {
        title: 'Event Map',
        imageAlt: 'Image representing the event map',
        statusLabel: 'Map available',
      },
    },
  },
  navigation: {
    '/youtube-search-aceserver/': 'Videos',
    '/world-map/': 'World maps',
    '/stories/': 'Stories',
    'https://acecore.net': 'Acecore',
    'https://asv-wiki.acecore.net': 'Aceserver WIKI',
  },
  announcements: {
    'portal-renewal-2026': {
      title: 'The Aceserver Portal has been renewed',
      text: 'We improved access to videos, world maps, and the WIKI, including on smartphones.',
      linkLabel: 'View world maps',
    },
  },
  pages: {
    top: homePage(
      'Aceserver Portal',
      'Aceserver',
      'Aceserver is a free public Minecraft server that supports both Java Edition and Bedrock Edition. This portal brings together Discord, the WIKI, and world maps.',
      [
        {
          titleCopy: 'What is Aceserver?',
          text: 'A free public Minecraft server open to everyone',
          imageAlt: 'A Minecraft cityscape with a large white airship overhead',
        },
        {
          titleCopy: 'Play multiplayer with anyone!',
          text: 'Play from both Java Edition and Bedrock Edition!',
          imageAlt:
            'A person looking over the sea at sunset from a rocky shore',
        },
        {
          titleCopy: 'Have fun!',
          text: 'A highly flexible server that stays close to vanilla Minecraft!',
          imageAlt:
            'A person jumping with both arms raised in a mountain valley',
        },
        {
          titleCopy: 'Want to join Aceserver?',
          text: 'Start by joining the official Discord!',
          ctaLabel: 'Join Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: 'A community WIKI that anyone can help edit',
          ctaLabel: 'Open the WIKI',
        },
      ],
    ),
    'world-map': worldMapPage(
      'World maps',
      'See maps and availability for the Main, Resource, RPG, Lobby, Season, and Event worlds currently published by Aceserver.',
      'See the published maps and worlds currently in operation.',
      'World-map image used on the previous Aceserver site',
    ),
    'world-map-main': embedPage(
      'Main World map',
      'A public browser map of the Aceserver Main World. Use it to understand bases, builds, terrain, and locations in the server.',
    ),
    'world-map-sigen': embedPage(
      'Resource World map',
      'A public map of the Aceserver Resource World for checking mining areas, terrain, and landmarks before travelling.',
    ),
    'world-map-rpg': embedPage(
      'RPG World map',
      'A public map of the Aceserver RPG World for checking exploration areas, terrain, and destinations in advance.',
    ),
    'world-map-lobby': embedPage(
      'Lobby World map',
      'A public map of the Aceserver Lobby World showing entrances to each world and key guidance points.',
    ),
    'world-map-rpg-sub': embedPage(
      'RPG Subworld map',
      'A public map of the Aceserver RPG Subworld showing terrain, destinations, and nearby RPG areas.',
    ),
    'world-map-season-a': embedPage(
      'Season A world map',
      'A public map of the limited-time Aceserver Season A world, including terrain, builds, and destinations.',
    ),
    'world-map-season-a-c': embedPage(
      'Season Creative world map',
      'A public map of the Aceserver Season Creative world, including creative areas, builds, terrain, and destinations.',
    ),
    'world-map-event': embedPage(
      'Event World map',
      'A public map of the Aceserver Event World showing venues, event areas, and destinations.',
    ),
    'youtube-search-aceserver': embedPage(
      'Aceserver videos',
      'Browse videos from the official Aceserver YouTube channel, including event streams, world tours, and public meetings.',
    ),
  },
}

const zhCn: LocaleTranslation = {
  sourceHash:
    'sha256:7a2e5e2a72e2082ec988225977fedad69317ec92864bfb50ae3a21294552d52f',
  ui: {
    siteTitleSuffix: '免费公开 Minecraft 服务器官方门户',
    homeTitleParts: ['Ace', 'server'],
    skipToContent: '跳到正文',
    homeAriaLabel: 'Aceserver 首页',
    mainNavigation: '主导航',
    mobileNavigation: '移动端导航',
    footerNavigation: '页脚导航',
    languageSelector: '显示语言',
    menuOpen: '打开菜单',
    menuClose: '关闭菜单',
    announcementLabel: '公告',
    joinDiscord: '加入 Discord',
    openWiki: '打开 WIKI',
    askAlpha: '询问 Alpha-kun',
    alphaName: 'Alpha-kun',
    alphaImageAlt: 'Alpha-kun',
    nextSection: '前往下一部分',
    homeFreedom: '你可以按自己的方式游玩、建造并与大家相遇。',
    homeMultiplayer:
      '无论独自、与朋友，还是和世界各地的玩家，都能一起冒险和建造。',
    homeCrossplay: 'Java 版与基岩版均可游玩！',
    homeCtaLabel: '参与方式与 WIKI',
    worldMapTitleParts: ['世界', '地图'],
    worldSelection: '选择世界',
    openWorld: '打开{title}',
    openMap: '打开地图',
    active: '运行中',
    previous: '上一个',
    back: '返回',
    next: '下一个',
    openNewTab: '在新标签页打开',
    latestVideos: '最新视频',
    channel: '频道',
    videoThumbnail: '{title}的缩略图',
    loadingVideos: '正在获取最新视频',
    videoLoadError: '无法获取最新视频',
    advertisement: '广告',
    storiesTitle: '故事',
    storiesDescription: '记录 Aceserver 的事件、社区以及门户建设过程。',
    storiesLead: '关于 Aceserver 的经历，以及我们如何整理社区入口的记录。',
    storyListLabel: '文章列表',
    tagsLabel: '标签',
    breadcrumbLabel: '面包屑导航',
    homeLabel: '首页',
    byAuthor: '作者：{author}',
    backToStories: '返回故事列表',
    joinAceserver: '加入 Aceserver',
    notFoundTitle: '找不到页面',
    notFoundDescription: '未能找到你要访问的页面。',
    notFoundMessage: '请检查网址，或返回首页重新开始。',
    backHome: '返回首页',
    rssTitle: 'Aceserver 故事',
    alpha: {
      chatSubtitle: 'Aceserver 导航聊天',
      close: '关闭 Alpha-kun 聊天',
      conversation: '与 Alpha-kun 的对话',
      promptExamples: '问题示例',
      questionLabel: '询问 Alpha-kun',
      placeholder: '例如：如何加入？',
      send: '发送',
      majorLinks: '主要链接',
      toggle: '询问 Alpha-kun',
      toggleShort: '询问',
      mapLabel: '地图',
      greeting: '你好，我是 Alpha-kun。我来为你介绍 Aceserver。',
      loading: 'Alpha-kun 正在思考……',
      error:
        '目前无法连接 AI 回复。请查看[官方 Discord]({discord})和 [Aceserver WIKI]({wiki})。',
      prompts: [
        { label: '加入方式', question: '如何加入 Aceserver？' },
        { label: '世界', question: '我应该先看哪个世界？' },
        { label: '规则', question: '游玩前应该确认哪些规则？' },
      ],
    },
  },
  settings: {
    title: 'Aceserver 门户',
    shortTitle: 'Aceserver',
    description:
      '面向所有人的免费公开 Minecraft 服务器 Aceserver 官方门户，汇集加入方式、世界地图、WIKI、视频和最新公告。',
    logoAlt: '绘有蓝黄配色 Alpha-kun 的 Aceserver 标志',
    worlds: {
      main: {
        title: '主世界',
        imageAlt: '主世界现有地图截图',
        statusLabel: '地图已公开',
      },
      resource: {
        title: '资源世界',
        imageAlt: '资源世界现有地图截图',
        statusLabel: '地图已公开',
      },
      rpg: {
        title: 'RPG',
        imageAlt: 'RPG 世界地图实际截图',
        statusLabel: '地图已公开',
      },
      lobby: {
        title: '大厅',
        imageAlt: '大厅世界示意图',
        statusLabel: '地图已公开',
      },
      'rpg-sub': {
        title: 'RPG 子世界',
        imageAlt: 'RPG 子世界示意图',
        statusLabel: '地图已公开',
      },
      'season-a': {
        title: 'Season A',
        imageAlt: 'Season A 世界示意图',
        statusLabel: '地图已公开',
      },
      'season-a-c': {
        title: 'Season Creative',
        imageAlt: 'Season Creative 世界示意图',
        statusLabel: '地图已公开',
      },
      event: {
        title: '活动地图',
        imageAlt: '活动地图示意图',
        statusLabel: '地图已公开',
      },
    },
  },
  navigation: {
    '/youtube-search-aceserver/': '视频',
    '/world-map/': '世界地图',
    '/stories/': '故事',
    'https://acecore.net': 'Acecore',
    'https://asv-wiki.acecore.net': 'Aceserver WIKI',
  },
  announcements: {
    'portal-renewal-2026': {
      title: 'Aceserver 门户已完成改版',
      text: '我们重新整理了视频、世界地图和 WIKI 的入口，并提升了手机端体验。',
      linkLabel: '查看世界地图',
    },
  },
  pages: {
    top: homePage(
      'Aceserver 门户',
      'Aceserver',
      'Aceserver 是一座 Java 版与基岩版均可加入的免费公开 Minecraft 服务器。本门户汇集 Discord、WIKI 与世界地图入口。',
      [
        {
          titleCopy: '什么是 Aceserver？',
          text: '任何人都可以加入的免费公开 Minecraft 服务器',
          imageAlt: 'Minecraft 城市与上空巨大的白色飞艇',
        },
        {
          titleCopy: '和任何人一起多人游玩！',
          text: 'Java 版与基岩版均可游玩！',
          imageAlt: '从岩岸眺望夕阳海面的行人',
        },
        {
          titleCopy: '尽情享受！',
          text: '接近原版、自由度极高的服务器！',
          imageAlt: '在山谷前张开双臂跳跃的人',
        },
        {
          titleCopy: '想加入 Aceserver 吗？',
          text: '请先加入官方 Discord！',
          ctaLabel: '加入 Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: '任何人都可以参与编辑的社区 WIKI',
          ctaLabel: '打开 WIKI',
        },
      ],
    ),
    'world-map': worldMapPage(
      '世界地图',
      '集中查看 Aceserver 已公开的主世界、资源、RPG、大厅、Season 与活动世界地图及运行情况。',
      '在这里查看已公开的地图和当前运行中的世界。',
      '旧版 Aceserver 网站使用的世界地图示意图',
    ),
    'world-map-main': embedPage(
      '主世界地图',
      '可在浏览器查看 Aceserver 主世界的公开地图，用于确认据点、建筑、地形和位置关系。',
    ),
    'world-map-sigen': embedPage(
      '资源世界地图',
      '可查看 Aceserver 资源世界的采掘区域、周边地形和移动前地标。',
    ),
    'world-map-rpg': embedPage(
      'RPG 世界地图',
      '可提前查看 Aceserver RPG 世界的探索区域、地形和目的地位置。',
    ),
    'world-map-lobby': embedPage(
      '大厅世界地图',
      '可查看 Aceserver 大厅世界中各世界入口和主要引导地点。',
    ),
    'world-map-rpg-sub': embedPage(
      'RPG 子世界地图',
      '可查看 Aceserver RPG 子世界的地形、目的地及周边区域。',
    ),
    'world-map-season-a': embedPage(
      'Season A 世界地图',
      '可查看 Aceserver 限时 Season A 世界的地形、建筑和目的地。',
    ),
    'world-map-season-a-c': embedPage(
      'Season Creative 世界地图',
      '可查看 Aceserver Season Creative 的创作区域、建筑、地形和目的地。',
    ),
    'world-map-event': embedPage(
      '活动世界地图',
      '可查看 Aceserver 活动世界的会场、举办区域和目的地。',
    ),
    'youtube-search-aceserver': embedPage(
      'Aceserver 视频',
      '集中浏览 Aceserver 官方 YouTube 频道的活动直播、世界介绍和公开会议等视频。',
    ),
  },
}

const es: LocaleTranslation = {
  sourceHash:
    'sha256:7a2e5e2a72e2082ec988225977fedad69317ec92864bfb50ae3a21294552d52f',
  ui: {
    siteTitleSuffix:
      'Portal oficial del servidor público gratuito de Minecraft',
    homeTitleParts: ['Ace', 'server'],
    skipToContent: 'Ir al contenido',
    homeAriaLabel: 'Inicio de Aceserver',
    mainNavigation: 'Navegación principal',
    mobileNavigation: 'Navegación móvil',
    footerNavigation: 'Navegación del pie',
    languageSelector: 'Idioma',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    announcementLabel: 'Avisos',
    joinDiscord: 'Unirse a Discord',
    openWiki: 'Abrir la WIKI',
    askAlpha: 'Preguntar a Alpha-kun',
    alphaName: 'Alpha-kun',
    alphaImageAlt: 'Alpha-kun',
    nextSection: 'Ir a la sección siguiente',
    homeFreedom: 'Juega, construye y conéctate a tu manera.',
    homeMultiplayer:
      'Disfruta de aventuras y construcciones a solas, con amigos o con jugadores de todo el mundo.',
    homeCrossplay: '¡Puedes jugar con Java Edition y Bedrock Edition!',
    homeCtaLabel: 'Participación y WIKI',
    worldMapTitleParts: ['Mapas', 'de mundos'],
    worldSelection: 'Seleccionar un mundo',
    openWorld: 'Abrir {title}',
    openMap: 'Abrir mapa',
    active: 'En línea',
    previous: 'Anterior',
    back: 'Volver',
    next: 'Siguiente',
    openNewTab: 'Abrir en otra pestaña',
    latestVideos: 'Vídeos recientes',
    channel: 'Canal',
    videoThumbnail: 'Miniatura de {title}',
    loadingVideos: 'Cargando los vídeos recientes',
    videoLoadError: 'No se pudieron cargar los vídeos recientes',
    advertisement: 'Publicidad',
    storiesTitle: 'Historias',
    storiesDescription:
      'Registros de sucesos de Aceserver, su comunidad y la creación del portal.',
    storiesLead:
      'Historias de Aceserver y del trabajo para ordenar la entrada a la comunidad.',
    storyListLabel: 'Lista de artículos',
    tagsLabel: 'Etiquetas',
    breadcrumbLabel: 'Migas de pan',
    homeLabel: 'Inicio',
    byAuthor: 'Por {author}',
    backToStories: 'Volver a Historias',
    joinAceserver: 'Unirse a Aceserver',
    notFoundTitle: 'Página no encontrada',
    notFoundDescription: 'No se encontró la página solicitada.',
    notFoundMessage: 'Comprueba la URL o vuelve a la página de inicio.',
    backHome: 'Ir al inicio',
    rssTitle: 'Historias de Aceserver',
    alpha: {
      chatSubtitle: 'Chat guía de Aceserver',
      close: 'Cerrar el chat de Alpha-kun',
      conversation: 'Conversación con Alpha-kun',
      promptExamples: 'Preguntas de ejemplo',
      questionLabel: 'Preguntar a Alpha-kun',
      placeholder: 'Ejemplo: ¿Cómo puedo entrar?',
      send: 'Enviar',
      majorLinks: 'Enlaces principales',
      toggle: 'Preguntar a Alpha-kun',
      toggleShort: 'Preguntar',
      mapLabel: 'Mapas',
      greeting: 'Hola, soy Alpha-kun. Te ayudaré a orientarte en Aceserver.',
      loading: 'Alpha-kun está pensando...',
      error:
        'Ahora no puedo conectar con la respuesta de IA. Consulta el [Discord oficial]({discord}) y la [WIKI de Aceserver]({wiki}).',
      prompts: [
        { label: 'Entrar', question: '¿Cómo puedo unirme a Aceserver?' },
        { label: 'Mundos', question: '¿Qué mundo debería mirar primero?' },
        { label: 'Reglas', question: '¿Qué reglas debo leer antes de jugar?' },
      ],
    },
  },
  settings: {
    title: 'Portal de Aceserver',
    shortTitle: 'Aceserver',
    description:
      'Portal oficial de Aceserver, un servidor público gratuito de Minecraft abierto a todos. Reúne la guía de acceso, mapas, WIKI, vídeos y avisos.',
    logoAlt: 'Logotipo de Aceserver con Alpha-kun en azul y amarillo',
    worlds: {
      main: {
        title: 'Mundo principal',
        imageAlt: 'Captura existente del mapa del mundo principal',
        statusLabel: 'Mapa disponible',
      },
      resource: {
        title: 'Mundo de recursos',
        imageAlt: 'Captura existente del mapa del mundo de recursos',
        statusLabel: 'Mapa disponible',
      },
      rpg: {
        title: 'RPG',
        imageAlt: 'Captura real del mapa del mundo RPG',
        statusLabel: 'Mapa disponible',
      },
      lobby: {
        title: 'Vestíbulo',
        imageAlt: 'Imagen representativa del mundo vestíbulo',
        statusLabel: 'Mapa disponible',
      },
      'rpg-sub': {
        title: 'Submundo RPG',
        imageAlt: 'Imagen representativa del submundo RPG',
        statusLabel: 'Mapa disponible',
      },
      'season-a': {
        title: 'Season A',
        imageAlt: 'Imagen representativa del mundo Season A',
        statusLabel: 'Mapa disponible',
      },
      'season-a-c': {
        title: 'Season Creative',
        imageAlt: 'Imagen representativa de Season Creative',
        statusLabel: 'Mapa disponible',
      },
      event: {
        title: 'Mapa de eventos',
        imageAlt: 'Imagen representativa del mapa de eventos',
        statusLabel: 'Mapa disponible',
      },
    },
  },
  navigation: {
    '/youtube-search-aceserver/': 'Vídeos',
    '/world-map/': 'Mapas',
    '/stories/': 'Historias',
    'https://acecore.net': 'Acecore',
    'https://asv-wiki.acecore.net': 'WIKI de Aceserver',
  },
  announcements: {
    'portal-renewal-2026': {
      title: 'Hemos renovado el Portal de Aceserver',
      text: 'Mejoramos el acceso a vídeos, mapas y la WIKI, también desde teléfonos.',
      linkLabel: 'Ver los mapas',
    },
  },
  pages: {
    top: homePage(
      'Portal de Aceserver',
      'Aceserver',
      'Aceserver es un servidor público gratuito de Minecraft compatible con Java Edition y Bedrock Edition. Este portal reúne Discord, la WIKI y los mapas.',
      [
        {
          titleCopy: '¿Qué es Aceserver?',
          text: 'Un servidor público gratuito de Minecraft abierto a todos',
          imageAlt:
            'Una ciudad de Minecraft con una gran aeronave blanca en el cielo',
        },
        {
          titleCopy: '¡Multijugador con cualquiera!',
          text: '¡Puedes jugar con Java Edition y Bedrock Edition!',
          imageAlt: 'Una persona contempla el mar al atardecer desde las rocas',
        },
        {
          titleCopy: '¡Diviértete!',
          text: '¡Un servidor muy libre y cercano a Minecraft vanilla!',
          imageAlt:
            'Una persona salta con los brazos abiertos ante un valle montañoso',
        },
        {
          titleCopy: '¿Quieres unirte a Aceserver?',
          text: '¡Empieza por el Discord oficial!',
          ctaLabel: 'Unirse a Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'WIKI de Aceserver',
          text: 'Una WIKI comunitaria que cualquiera puede editar',
          ctaLabel: 'Abrir la WIKI',
        },
      ],
    ),
    'world-map': worldMapPage(
      'Mapas de mundos',
      'Consulta los mapas y el estado de los mundos principal, recursos, RPG, vestíbulo, Season y eventos publicados por Aceserver.',
      'Consulta los mapas publicados y los mundos actualmente en funcionamiento.',
      'Imagen de mapas utilizada en el sitio anterior de Aceserver',
    ),
    'world-map-main': embedPage(
      'Mapa del mundo principal',
      'Mapa público del mundo principal de Aceserver para consultar bases, construcciones, terreno y ubicaciones.',
    ),
    'world-map-sigen': embedPage(
      'Mapa del mundo de recursos',
      'Mapa público para consultar zonas de minería, terreno y referencias del mundo de recursos.',
    ),
    'world-map-rpg': embedPage(
      'Mapa del mundo RPG',
      'Mapa público para consultar zonas de exploración, terreno y destinos del mundo RPG.',
    ),
    'world-map-lobby': embedPage(
      'Mapa del vestíbulo',
      'Mapa público del vestíbulo con las entradas a cada mundo y los principales puntos de información.',
    ),
    'world-map-rpg-sub': embedPage(
      'Mapa del submundo RPG',
      'Mapa público del submundo RPG con terreno, destinos y zonas cercanas.',
    ),
    'world-map-season-a': embedPage(
      'Mapa de Season A',
      'Mapa público del mundo temporal Season A con terreno, construcciones y destinos.',
    ),
    'world-map-season-a-c': embedPage(
      'Mapa de Season Creative',
      'Mapa público de Season Creative con áreas creativas, construcciones, terreno y destinos.',
    ),
    'world-map-event': embedPage(
      'Mapa del mundo de eventos',
      'Mapa público con recintos, zonas de eventos y destinos del mundo de eventos.',
    ),
    'youtube-search-aceserver': embedPage(
      'Vídeos de Aceserver',
      'Consulta vídeos del canal oficial de Aceserver, como emisiones de eventos, recorridos de mundos y reuniones públicas.',
    ),
  },
}

const pt: LocaleTranslation = {
  sourceHash:
    'sha256:7a2e5e2a72e2082ec988225977fedad69317ec92864bfb50ae3a21294552d52f',
  ui: {
    siteTitleSuffix: 'Portal oficial do servidor público gratuito de Minecraft',
    homeTitleParts: ['Ace', 'server'],
    skipToContent: 'Ir para o conteúdo',
    homeAriaLabel: 'Início do Aceserver',
    mainNavigation: 'Navegação principal',
    mobileNavigation: 'Navegação móvel',
    footerNavigation: 'Navegação do rodapé',
    languageSelector: 'Idioma',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
    announcementLabel: 'Avisos',
    joinDiscord: 'Entrar no Discord',
    openWiki: 'Abrir a WIKI',
    askAlpha: 'Perguntar ao Alpha-kun',
    alphaName: 'Alpha-kun',
    alphaImageAlt: 'Alpha-kun',
    nextSection: 'Ir para a próxima seção',
    homeFreedom: 'Jogue, construa e se conecte do seu jeito.',
    homeMultiplayer:
      'Aventure-se e construa sozinho, com amigos ou com jogadores do mundo todo.',
    homeCrossplay: 'Jogue com Java Edition e Bedrock Edition!',
    homeCtaLabel: 'Participação e WIKI',
    worldMapTitleParts: ['Mapas', 'dos mundos'],
    worldSelection: 'Escolher um mundo',
    openWorld: 'Abrir {title}',
    openMap: 'Abrir mapa',
    active: 'Online',
    previous: 'Anterior',
    back: 'Voltar',
    next: 'Próximo',
    openNewTab: 'Abrir em nova aba',
    latestVideos: 'Vídeos recentes',
    channel: 'Canal',
    videoThumbnail: 'Miniatura de {title}',
    loadingVideos: 'Carregando os vídeos recentes',
    videoLoadError: 'Não foi possível carregar os vídeos recentes',
    advertisement: 'Publicidade',
    storiesTitle: 'Histórias',
    storiesDescription:
      'Registros de acontecimentos do Aceserver, sua comunidade e a construção do portal.',
    storiesLead:
      'Histórias do Aceserver e do trabalho para organizar a entrada da comunidade.',
    storyListLabel: 'Lista de artigos',
    tagsLabel: 'Tags',
    breadcrumbLabel: 'Navegação estrutural',
    homeLabel: 'Início',
    byAuthor: 'Por {author}',
    backToStories: 'Voltar para Histórias',
    joinAceserver: 'Entrar no Aceserver',
    notFoundTitle: 'Página não encontrada',
    notFoundDescription: 'A página solicitada não foi encontrada.',
    notFoundMessage: 'Verifique o endereço ou volte à página inicial.',
    backHome: 'Ir para o início',
    rssTitle: 'Histórias do Aceserver',
    alpha: {
      chatSubtitle: 'Chat de orientação do Aceserver',
      close: 'Fechar o chat do Alpha-kun',
      conversation: 'Conversa com o Alpha-kun',
      promptExamples: 'Perguntas de exemplo',
      questionLabel: 'Perguntar ao Alpha-kun',
      placeholder: 'Exemplo: Como faço para entrar?',
      send: 'Enviar',
      majorLinks: 'Links principais',
      toggle: 'Perguntar ao Alpha-kun',
      toggleShort: 'Perguntar',
      mapLabel: 'Mapas',
      greeting:
        'Olá, eu sou o Alpha-kun. Vou ajudar você a conhecer o Aceserver.',
      loading: 'Alpha-kun está pensando...',
      error:
        'Não consigo acessar a resposta de IA agora. Veja o [Discord oficial]({discord}) e a [WIKI do Aceserver]({wiki}).',
      prompts: [
        { label: 'Entrar', question: 'Como posso entrar no Aceserver?' },
        { label: 'Mundos', question: 'Qual mundo devo ver primeiro?' },
        { label: 'Regras', question: 'Quais regras devo ler antes de jogar?' },
      ],
    },
  },
  settings: {
    title: 'Portal do Aceserver',
    shortTitle: 'Aceserver',
    description:
      'Portal oficial do Aceserver, servidor público gratuito de Minecraft aberto a todos. Reúne orientação de entrada, mapas, WIKI, vídeos e avisos.',
    logoAlt: 'Logo do Aceserver com o Alpha-kun azul e amarelo',
    worlds: {
      main: {
        title: 'Mundo principal',
        imageAlt: 'Captura existente do mapa do mundo principal',
        statusLabel: 'Mapa disponível',
      },
      resource: {
        title: 'Mundo de recursos',
        imageAlt: 'Captura existente do mapa do mundo de recursos',
        statusLabel: 'Mapa disponível',
      },
      rpg: {
        title: 'RPG',
        imageAlt: 'Captura real do mapa do mundo RPG',
        statusLabel: 'Mapa disponível',
      },
      lobby: {
        title: 'Lobby',
        imageAlt: 'Imagem representando o mundo lobby',
        statusLabel: 'Mapa disponível',
      },
      'rpg-sub': {
        title: 'Submundo RPG',
        imageAlt: 'Imagem representando o submundo RPG',
        statusLabel: 'Mapa disponível',
      },
      'season-a': {
        title: 'Season A',
        imageAlt: 'Imagem representando o mundo Season A',
        statusLabel: 'Mapa disponível',
      },
      'season-a-c': {
        title: 'Season Creative',
        imageAlt: 'Imagem representando o Season Creative',
        statusLabel: 'Mapa disponível',
      },
      event: {
        title: 'Mapa de eventos',
        imageAlt: 'Imagem representando o mapa de eventos',
        statusLabel: 'Mapa disponível',
      },
    },
  },
  navigation: {
    '/youtube-search-aceserver/': 'Vídeos',
    '/world-map/': 'Mapas',
    '/stories/': 'Histórias',
    'https://acecore.net': 'Acecore',
    'https://asv-wiki.acecore.net': 'WIKI do Aceserver',
  },
  announcements: {
    'portal-renewal-2026': {
      title: 'O Portal do Aceserver foi renovado',
      text: 'Melhoramos o acesso a vídeos, mapas e à WIKI, inclusive em celulares.',
      linkLabel: 'Ver os mapas',
    },
  },
  pages: {
    top: homePage(
      'Portal do Aceserver',
      'Aceserver',
      'O Aceserver é um servidor público gratuito de Minecraft compatível com Java Edition e Bedrock Edition. Este portal reúne Discord, WIKI e mapas.',
      [
        {
          titleCopy: 'O que é o Aceserver?',
          text: 'Um servidor público gratuito de Minecraft aberto a todos',
          imageAlt:
            'Uma cidade do Minecraft com uma grande aeronave branca no céu',
        },
        {
          titleCopy: 'Multiplayer com qualquer pessoa!',
          text: 'Jogue com Java Edition e Bedrock Edition!',
          imageAlt: 'Uma pessoa observa o mar ao pôr do sol sobre as rochas',
        },
        {
          titleCopy: 'Divirta-se!',
          text: 'Um servidor muito livre e próximo do Minecraft vanilla!',
          imageAlt:
            'Uma pessoa salta de braços abertos diante de um vale montanhoso',
        },
        {
          titleCopy: 'Quer entrar no Aceserver?',
          text: 'Comece entrando no Discord oficial!',
          ctaLabel: 'Entrar no Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'WIKI do Aceserver',
          text: 'Uma WIKI comunitária que qualquer pessoa pode editar',
          ctaLabel: 'Abrir a WIKI',
        },
      ],
    ),
    'world-map': worldMapPage(
      'Mapas dos mundos',
      'Veja mapas e status dos mundos principal, recursos, RPG, lobby, Season e eventos publicados pelo Aceserver.',
      'Confira os mapas publicados e os mundos em funcionamento.',
      'Imagem de mapas usada no site anterior do Aceserver',
    ),
    'world-map-main': embedPage(
      'Mapa do mundo principal',
      'Mapa público do mundo principal para consultar bases, construções, terreno e localizações.',
    ),
    'world-map-sigen': embedPage(
      'Mapa do mundo de recursos',
      'Mapa público para consultar áreas de mineração, terreno e referências do mundo de recursos.',
    ),
    'world-map-rpg': embedPage(
      'Mapa do mundo RPG',
      'Mapa público para consultar áreas de exploração, terreno e destinos do mundo RPG.',
    ),
    'world-map-lobby': embedPage(
      'Mapa do lobby',
      'Mapa público do lobby com entradas para cada mundo e pontos de orientação.',
    ),
    'world-map-rpg-sub': embedPage(
      'Mapa do submundo RPG',
      'Mapa público do submundo RPG com terreno, destinos e áreas próximas.',
    ),
    'world-map-season-a': embedPage(
      'Mapa do Season A',
      'Mapa público do mundo temporário Season A com terreno, construções e destinos.',
    ),
    'world-map-season-a-c': embedPage(
      'Mapa do Season Creative',
      'Mapa público do Season Creative com áreas criativas, construções, terreno e destinos.',
    ),
    'world-map-event': embedPage(
      'Mapa do mundo de eventos',
      'Mapa público com locais, áreas de eventos e destinos do mundo de eventos.',
    ),
    'youtube-search-aceserver': embedPage(
      'Vídeos do Aceserver',
      'Veja vídeos do canal oficial do Aceserver, incluindo transmissões, visitas aos mundos e reuniões públicas.',
    ),
  },
}

const fr: LocaleTranslation = {
  sourceHash:
    'sha256:7a2e5e2a72e2082ec988225977fedad69317ec92864bfb50ae3a21294552d52f',
  ui: {
    siteTitleSuffix: 'Portail officiel du serveur Minecraft public et gratuit',
    homeTitleParts: ['Ace', 'server'],
    skipToContent: 'Aller au contenu',
    homeAriaLabel: 'Accueil Aceserver',
    mainNavigation: 'Navigation principale',
    mobileNavigation: 'Navigation mobile',
    footerNavigation: 'Navigation de pied de page',
    languageSelector: 'Langue',
    menuOpen: 'Ouvrir le menu',
    menuClose: 'Fermer le menu',
    announcementLabel: 'Annonces',
    joinDiscord: 'Rejoindre Discord',
    openWiki: 'Ouvrir le WIKI',
    askAlpha: 'Demander à Alpha-kun',
    alphaName: 'Alpha-kun',
    alphaImageAlt: 'Alpha-kun',
    nextSection: 'Aller à la section suivante',
    homeFreedom: 'Jouez, construisez et créez des liens à votre manière.',
    homeMultiplayer:
      'Partez à l’aventure et construisez seul, avec vos amis ou avec des joueurs du monde entier.',
    homeCrossplay: 'Jouez avec Java Edition et Bedrock Edition !',
    homeCtaLabel: 'Participation et WIKI',
    worldMapTitleParts: ['Cartes', 'des mondes'],
    worldSelection: 'Choisir un monde',
    openWorld: 'Ouvrir {title}',
    openMap: 'Ouvrir la carte',
    active: 'En ligne',
    previous: 'Précédent',
    back: 'Retour',
    next: 'Suivant',
    openNewTab: 'Ouvrir dans un nouvel onglet',
    latestVideos: 'Dernières vidéos',
    channel: 'Chaîne',
    videoThumbnail: 'Miniature de {title}',
    loadingVideos: 'Chargement des dernières vidéos',
    videoLoadError: 'Impossible de charger les dernières vidéos',
    advertisement: 'Publicité',
    storiesTitle: 'Récits',
    storiesDescription:
      'Des récits sur Aceserver, sa communauté et la création du portail.',
    storiesLead:
      'Les histoires d’Aceserver et le travail mené pour clarifier l’entrée de la communauté.',
    storyListLabel: 'Liste des articles',
    tagsLabel: 'Étiquettes',
    breadcrumbLabel: 'Fil d’Ariane',
    homeLabel: 'Accueil',
    byAuthor: 'Par {author}',
    backToStories: 'Retour aux récits',
    joinAceserver: 'Rejoindre Aceserver',
    notFoundTitle: 'Page introuvable',
    notFoundDescription: 'La page demandée est introuvable.',
    notFoundMessage: 'Vérifiez l’adresse ou revenez à la page d’accueil.',
    backHome: 'Retour à l’accueil',
    rssTitle: 'Récits Aceserver',
    alpha: {
      chatSubtitle: 'Chat d’orientation Aceserver',
      close: 'Fermer le chat Alpha-kun',
      conversation: 'Conversation avec Alpha-kun',
      promptExamples: 'Exemples de questions',
      questionLabel: 'Demander à Alpha-kun',
      placeholder: 'Exemple : Comment nous rejoindre ?',
      send: 'Envoyer',
      majorLinks: 'Liens principaux',
      toggle: 'Demander à Alpha-kun',
      toggleShort: 'Demander',
      mapLabel: 'Cartes',
      greeting:
        'Bonjour, je suis Alpha-kun. Je vais vous guider dans Aceserver.',
      loading: 'Alpha-kun réfléchit...',
      error:
        'Je ne peux pas joindre la réponse IA pour le moment. Consultez le [Discord officiel]({discord}) et le [WIKI Aceserver]({wiki}).',
      prompts: [
        { label: 'Rejoindre', question: 'Comment rejoindre Aceserver ?' },
        { label: 'Mondes', question: 'Quel monde regarder en premier ?' },
        { label: 'Règles', question: 'Quelles règles lire avant de jouer ?' },
      ],
    },
  },
  settings: {
    title: 'Portail Aceserver',
    shortTitle: 'Aceserver',
    description:
      'Le portail officiel d’Aceserver, serveur Minecraft public et gratuit ouvert à tous. Retrouvez l’accès, les cartes, le WIKI, les vidéos et les annonces.',
    logoAlt: 'Logo Aceserver représentant Alpha-kun en bleu et jaune',
    worlds: {
      main: {
        title: 'Monde principal',
        imageAlt: 'Capture existante de la carte du monde principal',
        statusLabel: 'Carte disponible',
      },
      resource: {
        title: 'Monde ressources',
        imageAlt: 'Capture existante de la carte du monde ressources',
        statusLabel: 'Carte disponible',
      },
      rpg: {
        title: 'RPG',
        imageAlt: 'Capture réelle de la carte du monde RPG',
        statusLabel: 'Carte disponible',
      },
      lobby: {
        title: 'Lobby',
        imageAlt: 'Image représentant le monde lobby',
        statusLabel: 'Carte disponible',
      },
      'rpg-sub': {
        title: 'Sous-monde RPG',
        imageAlt: 'Image représentant le sous-monde RPG',
        statusLabel: 'Carte disponible',
      },
      'season-a': {
        title: 'Season A',
        imageAlt: 'Image représentant le monde Season A',
        statusLabel: 'Carte disponible',
      },
      'season-a-c': {
        title: 'Season Creative',
        imageAlt: 'Image représentant Season Creative',
        statusLabel: 'Carte disponible',
      },
      event: {
        title: 'Carte des événements',
        imageAlt: 'Image représentant la carte des événements',
        statusLabel: 'Carte disponible',
      },
    },
  },
  navigation: {
    '/youtube-search-aceserver/': 'Vidéos',
    '/world-map/': 'Cartes',
    '/stories/': 'Récits',
    'https://acecore.net': 'Acecore',
    'https://asv-wiki.acecore.net': 'WIKI Aceserver',
  },
  announcements: {
    'portal-renewal-2026': {
      title: 'Le portail Aceserver a été renouvelé',
      text: 'Nous avons amélioré l’accès aux vidéos, aux cartes et au WIKI, y compris sur mobile.',
      linkLabel: 'Voir les cartes',
    },
  },
  pages: {
    top: homePage(
      'Portail Aceserver',
      'Aceserver',
      'Aceserver est un serveur Minecraft public et gratuit compatible avec Java Edition et Bedrock Edition. Ce portail regroupe Discord, le WIKI et les cartes.',
      [
        {
          titleCopy: 'Qu’est-ce qu’Aceserver ?',
          text: 'Un serveur Minecraft public et gratuit ouvert à tous',
          imageAlt:
            'Une ville Minecraft survolée par un grand dirigeable blanc',
        },
        {
          titleCopy: 'Jouez en multijoueur avec tout le monde !',
          text: 'Jouez avec Java Edition et Bedrock Edition !',
          imageAlt:
            'Une personne contemple la mer au coucher du soleil depuis des rochers',
        },
        {
          titleCopy: 'Amusez-vous !',
          text: 'Un serveur très libre, proche de Minecraft vanilla !',
          imageAlt:
            'Une personne saute les bras ouverts devant une vallée montagneuse',
        },
        {
          titleCopy: 'Vous souhaitez rejoindre Aceserver ?',
          text: 'Commencez par rejoindre le Discord officiel !',
          ctaLabel: 'Rejoindre Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'WIKI Aceserver',
          text: 'Un WIKI communautaire que chacun peut modifier',
          ctaLabel: 'Ouvrir le WIKI',
        },
      ],
    ),
    'world-map': worldMapPage(
      'Cartes des mondes',
      'Consultez les cartes et l’état des mondes principal, ressources, RPG, lobby, Season et événements publiés par Aceserver.',
      'Consultez les cartes publiées et les mondes actuellement actifs.',
      'Image de carte utilisée sur l’ancien site Aceserver',
    ),
    'world-map-main': embedPage(
      'Carte du monde principal',
      'Carte publique du monde principal pour consulter bases, constructions, terrain et emplacements.',
    ),
    'world-map-sigen': embedPage(
      'Carte du monde ressources',
      'Carte publique pour consulter les zones de minage, le terrain et les repères du monde ressources.',
    ),
    'world-map-rpg': embedPage(
      'Carte du monde RPG',
      'Carte publique pour consulter les zones d’exploration, le terrain et les destinations du monde RPG.',
    ),
    'world-map-lobby': embedPage(
      'Carte du lobby',
      'Carte publique du lobby montrant les entrées vers chaque monde et les principaux points d’information.',
    ),
    'world-map-rpg-sub': embedPage(
      'Carte du sous-monde RPG',
      'Carte publique du sous-monde RPG montrant terrain, destinations et zones voisines.',
    ),
    'world-map-season-a': embedPage(
      'Carte de Season A',
      'Carte publique du monde temporaire Season A avec terrain, constructions et destinations.',
    ),
    'world-map-season-a-c': embedPage(
      'Carte de Season Creative',
      'Carte publique de Season Creative avec zones créatives, constructions, terrain et destinations.',
    ),
    'world-map-event': embedPage(
      'Carte du monde événement',
      'Carte publique montrant lieux, zones d’événements et destinations du monde événement.',
    ),
    'youtube-search-aceserver': embedPage(
      'Vidéos Aceserver',
      'Retrouvez les vidéos de la chaîne officielle Aceserver : directs, présentations des mondes et réunions publiques.',
    ),
  },
}

const ko: LocaleTranslation = {
  sourceHash:
    'sha256:7a2e5e2a72e2082ec988225977fedad69317ec92864bfb50ae3a21294552d52f',
  ui: {
    siteTitleSuffix: '무료 공개 Minecraft 서버 공식 포털',
    homeTitleParts: ['Ace', 'server'],
    skipToContent: '본문으로 이동',
    homeAriaLabel: 'Aceserver 홈',
    mainNavigation: '주요 탐색',
    mobileNavigation: '모바일 탐색',
    footerNavigation: '바닥글 탐색',
    languageSelector: '표시 언어',
    menuOpen: '메뉴 열기',
    menuClose: '메뉴 닫기',
    announcementLabel: '공지',
    joinDiscord: 'Discord 참여',
    openWiki: 'WIKI 열기',
    askAlpha: 'Alpha-kun에게 묻기',
    alphaName: 'Alpha-kun',
    alphaImageAlt: 'Alpha-kun',
    nextSection: '다음 섹션으로 이동',
    homeFreedom:
      '원하는 방식으로 플레이하고, 만들고, 사람들과 이어질 수 있습니다.',
    homeMultiplayer:
      '혼자서도, 친구와도, 전 세계 플레이어와도 모험과 건축을 즐길 수 있습니다.',
    homeCrossplay: 'Java Edition과 Bedrock Edition 모두 플레이할 수 있습니다!',
    homeCtaLabel: '참여와 WIKI',
    worldMapTitleParts: ['월드', '지도'],
    worldSelection: '월드 선택',
    openWorld: '{title} 열기',
    openMap: '지도 열기',
    active: '운영 중',
    previous: '이전',
    back: '돌아가기',
    next: '다음',
    openNewTab: '새 탭에서 열기',
    latestVideos: '최신 동영상',
    channel: '채널',
    videoThumbnail: '{title} 썸네일',
    loadingVideos: '최신 동영상을 불러오는 중',
    videoLoadError: '최신 동영상을 불러올 수 없습니다',
    advertisement: '광고',
    storiesTitle: '이야기',
    storiesDescription:
      'Aceserver의 사건, 커뮤니티, 포털 제작에 관한 기록입니다.',
    storiesLead:
      'Aceserver에서 있었던 일과 커뮤니티 입구를 정리해 온 기록입니다.',
    storyListLabel: '글 목록',
    tagsLabel: '태그',
    breadcrumbLabel: '이동 경로',
    homeLabel: '홈',
    byAuthor: '글: {author}',
    backToStories: '이야기 목록으로',
    joinAceserver: 'Aceserver 참여',
    notFoundTitle: '페이지를 찾을 수 없습니다',
    notFoundDescription: '요청한 페이지를 찾을 수 없습니다.',
    notFoundMessage: '주소를 확인하거나 홈으로 돌아가 주세요.',
    backHome: '홈으로',
    rssTitle: 'Aceserver 이야기',
    alpha: {
      chatSubtitle: 'Aceserver 안내 채팅',
      close: 'Alpha-kun 채팅 닫기',
      conversation: 'Alpha-kun과의 대화',
      promptExamples: '질문 예시',
      questionLabel: 'Alpha-kun에게 질문',
      placeholder: '예: 어떻게 참여하나요?',
      send: '보내기',
      majorLinks: '주요 링크',
      toggle: 'Alpha-kun에게 묻기',
      toggleShort: '묻기',
      mapLabel: '지도',
      greeting: '안녕, Alpha-kun이야. Aceserver를 안내해 줄게.',
      loading: 'Alpha-kun이 생각 중...',
      error:
        '지금은 AI 응답에 연결할 수 없어. [공식 Discord]({discord})와 [Aceserver WIKI]({wiki})를 확인해 줘.',
      prompts: [
        { label: '참여', question: 'Aceserver에 어떻게 참여하나요?' },
        { label: '월드', question: '어떤 월드를 먼저 보면 좋나요?' },
        { label: '규칙', question: '플레이 전에 어떤 규칙을 확인해야 하나요?' },
      ],
    },
  },
  settings: {
    title: 'Aceserver 포털',
    shortTitle: 'Aceserver',
    description:
      '누구나 참여할 수 있는 무료 공개 Minecraft 서버 Aceserver의 공식 포털입니다. 참여 안내, 월드 지도, WIKI, 동영상과 공지를 모았습니다.',
    logoAlt: '파란색과 노란색 Alpha-kun이 그려진 Aceserver 로고',
    worlds: {
      main: {
        title: '메인 월드',
        imageAlt: '메인 월드의 기존 지도 스크린샷',
        statusLabel: '지도 공개 중',
      },
      resource: {
        title: '자원 월드',
        imageAlt: '자원 월드의 기존 지도 스크린샷',
        statusLabel: '지도 공개 중',
      },
      rpg: {
        title: 'RPG',
        imageAlt: 'RPG 월드 지도 실제 스크린샷',
        statusLabel: '지도 공개 중',
      },
      lobby: {
        title: '로비',
        imageAlt: '로비 월드 이미지',
        statusLabel: '지도 공개 중',
      },
      'rpg-sub': {
        title: 'RPG 서브 월드',
        imageAlt: 'RPG 서브 월드 이미지',
        statusLabel: '지도 공개 중',
      },
      'season-a': {
        title: 'Season A',
        imageAlt: 'Season A 월드 이미지',
        statusLabel: '지도 공개 중',
      },
      'season-a-c': {
        title: 'Season Creative',
        imageAlt: 'Season Creative 월드 이미지',
        statusLabel: '지도 공개 중',
      },
      event: {
        title: '이벤트 지도',
        imageAlt: '이벤트 지도 이미지',
        statusLabel: '지도 공개 중',
      },
    },
  },
  navigation: {
    '/youtube-search-aceserver/': '동영상',
    '/world-map/': '월드 지도',
    '/stories/': '이야기',
    'https://acecore.net': 'Acecore',
    'https://asv-wiki.acecore.net': 'Aceserver WIKI',
  },
  announcements: {
    'portal-renewal-2026': {
      title: 'Aceserver 포털을 새롭게 단장했습니다',
      text: '동영상, 월드 지도, WIKI로 가는 길을 정리하고 모바일 사용성도 개선했습니다.',
      linkLabel: '월드 지도 보기',
    },
  },
  pages: {
    top: homePage(
      'Aceserver 포털',
      'Aceserver',
      'Aceserver는 Java Edition과 Bedrock Edition 모두 참여할 수 있는 무료 공개 Minecraft 서버입니다. 이 포털에서 Discord, WIKI, 월드 지도를 확인할 수 있습니다.',
      [
        {
          titleCopy: 'Aceserver란?',
          text: '누구나 참여할 수 있는 무료 공개 Minecraft 서버',
          imageAlt: 'Minecraft 도시와 하늘의 거대한 흰색 비행선',
        },
        {
          titleCopy: '누구와도 멀티플레이!',
          text: 'Java Edition과 Bedrock Edition 모두 플레이할 수 있습니다!',
          imageAlt: '바위 해안에서 노을 진 바다를 바라보는 사람',
        },
        {
          titleCopy: '즐겁게!',
          text: '바닐라에 가깝고 자유도가 높은 서버입니다!',
          imageAlt: '산골짜기 앞에서 두 팔을 벌리고 뛰는 사람',
        },
        {
          titleCopy: 'Aceserver에 참여하고 싶나요?',
          text: '먼저 공식 Discord에 참여해 주세요!',
          ctaLabel: 'Discord 참여',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: '누구나 편집에 참여할 수 있는 커뮤니티 WIKI',
          ctaLabel: 'WIKI 열기',
        },
      ],
    ),
    'world-map': worldMapPage(
      '월드 지도',
      'Aceserver가 공개한 메인, 자원, RPG, 로비, Season, 이벤트 월드의 지도와 운영 상태를 한곳에서 확인합니다.',
      '공개된 지도와 현재 운영 중인 월드를 확인할 수 있습니다.',
      '이전 Aceserver 사이트에서 사용한 월드 지도 이미지',
    ),
    'world-map-main': embedPage(
      '메인 월드 지도',
      '거점, 건축물, 지형과 위치 관계를 확인할 수 있는 Aceserver 메인 월드 공개 지도입니다.',
    ),
    'world-map-sigen': embedPage(
      '자원 월드 지도',
      '채굴 지역, 주변 지형과 이동 전 표식을 확인할 수 있는 자원 월드 공개 지도입니다.',
    ),
    'world-map-rpg': embedPage(
      'RPG 월드 지도',
      '탐험 구역, 지형과 목적지 위치를 미리 확인할 수 있는 RPG 월드 공개 지도입니다.',
    ),
    'world-map-lobby': embedPage(
      '로비 월드 지도',
      '각 월드 입구와 주요 안내 지점을 확인할 수 있는 로비 월드 공개 지도입니다.',
    ),
    'world-map-rpg-sub': embedPage(
      'RPG 서브 월드 지도',
      '지형, 목적지와 주변 RPG 구역을 확인할 수 있는 공개 지도입니다.',
    ),
    'world-map-season-a': embedPage(
      'Season A 월드 지도',
      '기간 한정 Season A 월드의 지형, 건축물과 목적지를 확인할 수 있는 공개 지도입니다.',
    ),
    'world-map-season-a-c': embedPage(
      'Season Creative 월드 지도',
      '창작 구역, 건축물, 지형과 목적지를 확인할 수 있는 공개 지도입니다.',
    ),
    'world-map-event': embedPage(
      '이벤트 월드 지도',
      '이벤트 회장, 개최 구역과 목적지를 확인할 수 있는 공개 지도입니다.',
    ),
    'youtube-search-aceserver': embedPage(
      'Aceserver 동영상',
      'Aceserver 공식 YouTube 채널의 이벤트 방송, 월드 소개, 공개 회의 동영상을 모아 봅니다.',
    ),
  },
}

const de: LocaleTranslation = {
  sourceHash:
    'sha256:7a2e5e2a72e2082ec988225977fedad69317ec92864bfb50ae3a21294552d52f',
  ui: {
    siteTitleSuffix:
      'Offizielles Portal des kostenlosen öffentlichen Minecraft-Servers',
    homeTitleParts: ['Ace', 'server'],
    skipToContent: 'Zum Inhalt springen',
    homeAriaLabel: 'Aceserver Startseite',
    mainNavigation: 'Hauptnavigation',
    mobileNavigation: 'Mobile Navigation',
    footerNavigation: 'Fußnavigation',
    languageSelector: 'Sprache',
    menuOpen: 'Menü öffnen',
    menuClose: 'Menü schließen',
    announcementLabel: 'Ankündigungen',
    joinDiscord: 'Discord beitreten',
    openWiki: 'WIKI öffnen',
    askAlpha: 'Alpha-kun fragen',
    alphaName: 'Alpha-kun',
    alphaImageAlt: 'Alpha-kun',
    nextSection: 'Zum nächsten Abschnitt',
    homeFreedom: 'Spiele, baue und knüpfe Kontakte auf deine eigene Weise.',
    homeMultiplayer:
      'Erlebe Abenteuer und Bauprojekte allein, mit Freunden oder mit Spielern aus aller Welt.',
    homeCrossplay: 'Spiele mit Java Edition und Bedrock Edition!',
    homeCtaLabel: 'Teilnahme und WIKI',
    worldMapTitleParts: ['Welt', 'karten'],
    worldSelection: 'Welt auswählen',
    openWorld: '{title} öffnen',
    openMap: 'Karte öffnen',
    active: 'Online',
    previous: 'Zurück',
    back: 'Zurück',
    next: 'Weiter',
    openNewTab: 'In neuem Tab öffnen',
    latestVideos: 'Neueste Videos',
    channel: 'Kanal',
    videoThumbnail: 'Vorschaubild für {title}',
    loadingVideos: 'Neueste Videos werden geladen',
    videoLoadError: 'Neueste Videos konnten nicht geladen werden',
    advertisement: 'Werbung',
    storiesTitle: 'Geschichten',
    storiesDescription:
      'Berichte über Ereignisse bei Aceserver, die Community und den Aufbau des Portals.',
    storiesLead:
      'Geschichten aus Aceserver und über die Arbeit an einem klaren Einstieg in die Community.',
    storyListLabel: 'Artikelliste',
    tagsLabel: 'Schlagwörter',
    breadcrumbLabel: 'Brotkrümelnavigation',
    homeLabel: 'Startseite',
    byAuthor: 'Von {author}',
    backToStories: 'Zurück zu den Geschichten',
    joinAceserver: 'Aceserver beitreten',
    notFoundTitle: 'Seite nicht gefunden',
    notFoundDescription: 'Die angeforderte Seite wurde nicht gefunden.',
    notFoundMessage: 'Prüfe die Adresse oder kehre zur Startseite zurück.',
    backHome: 'Zur Startseite',
    rssTitle: 'Aceserver Geschichten',
    alpha: {
      chatSubtitle: 'Aceserver Wegweiser-Chat',
      close: 'Alpha-kun-Chat schließen',
      conversation: 'Gespräch mit Alpha-kun',
      promptExamples: 'Beispielfragen',
      questionLabel: 'Alpha-kun fragen',
      placeholder: 'Beispiel: Wie kann ich beitreten?',
      send: 'Senden',
      majorLinks: 'Wichtige Links',
      toggle: 'Alpha-kun fragen',
      toggleShort: 'Fragen',
      mapLabel: 'Karten',
      greeting:
        'Hallo, ich bin Alpha-kun. Ich helfe dir, dich bei Aceserver zurechtzufinden.',
      loading: 'Alpha-kun denkt nach...',
      error:
        'Die KI-Antwort ist gerade nicht erreichbar. Sieh im [offiziellen Discord]({discord}) und im [Aceserver WIKI]({wiki}) nach.',
      prompts: [
        { label: 'Beitreten', question: 'Wie kann ich Aceserver beitreten?' },
        { label: 'Welten', question: 'Welche Welt sollte ich zuerst ansehen?' },
        {
          label: 'Regeln',
          question: 'Welche Regeln sollte ich vor dem Spielen lesen?',
        },
      ],
    },
  },
  settings: {
    title: 'Aceserver Portal',
    shortTitle: 'Aceserver',
    description:
      'Das offizielle Portal von Aceserver, einem kostenlosen öffentlichen Minecraft-Server für alle. Hier findest du Teilnahmehinweise, Weltkarten, WIKI, Videos und Ankündigungen.',
    logoAlt: 'Aceserver-Logo mit dem blau-gelben Alpha-kun',
    worlds: {
      main: {
        title: 'Hauptwelt',
        imageAlt: 'Vorhandener Karten-Screenshot der Hauptwelt',
        statusLabel: 'Karte verfügbar',
      },
      resource: {
        title: 'Ressourcenwelt',
        imageAlt: 'Vorhandener Karten-Screenshot der Ressourcenwelt',
        statusLabel: 'Karte verfügbar',
      },
      rpg: {
        title: 'RPG',
        imageAlt: 'Echter Screenshot der RPG-Weltkarte',
        statusLabel: 'Karte verfügbar',
      },
      lobby: {
        title: 'Lobby',
        imageAlt: 'Bild der Lobbywelt',
        statusLabel: 'Karte verfügbar',
      },
      'rpg-sub': {
        title: 'RPG-Unterwelt',
        imageAlt: 'Bild der RPG-Unterwelt',
        statusLabel: 'Karte verfügbar',
      },
      'season-a': {
        title: 'Season A',
        imageAlt: 'Bild der Season-A-Welt',
        statusLabel: 'Karte verfügbar',
      },
      'season-a-c': {
        title: 'Season Creative',
        imageAlt: 'Bild der Season-Creative-Welt',
        statusLabel: 'Karte verfügbar',
      },
      event: {
        title: 'Eventkarte',
        imageAlt: 'Bild der Eventkarte',
        statusLabel: 'Karte verfügbar',
      },
    },
  },
  navigation: {
    '/youtube-search-aceserver/': 'Videos',
    '/world-map/': 'Weltkarten',
    '/stories/': 'Geschichten',
    'https://acecore.net': 'Acecore',
    'https://asv-wiki.acecore.net': 'Aceserver WIKI',
  },
  announcements: {
    'portal-renewal-2026': {
      title: 'Das Aceserver Portal wurde erneuert',
      text: 'Wir haben den Zugang zu Videos, Weltkarten und WIKI auch auf Smartphones verbessert.',
      linkLabel: 'Weltkarten ansehen',
    },
  },
  pages: {
    top: homePage(
      'Aceserver Portal',
      'Aceserver',
      'Aceserver ist ein kostenloser öffentlicher Minecraft-Server für Java Edition und Bedrock Edition. Dieses Portal bündelt Discord, WIKI und Weltkarten.',
      [
        {
          titleCopy: 'Was ist Aceserver?',
          text: 'Ein kostenloser öffentlicher Minecraft-Server für alle',
          imageAlt:
            'Eine Minecraft-Stadt mit einem großen weißen Luftschiff darüber',
        },
        {
          titleCopy: 'Mehrspieler mit allen!',
          text: 'Spiele mit Java Edition und Bedrock Edition!',
          imageAlt:
            'Eine Person blickt von einer felsigen Küste auf das Meer bei Sonnenuntergang',
        },
        {
          titleCopy: 'Hab Spaß!',
          text: 'Ein sehr freier Server, der nah an Vanilla Minecraft bleibt!',
          imageAlt:
            'Eine Person springt mit ausgebreiteten Armen vor einem Bergtal',
        },
        {
          titleCopy: 'Möchtest du Aceserver beitreten?',
          text: 'Tritt zuerst dem offiziellen Discord bei!',
          ctaLabel: 'Discord beitreten',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: 'Ein Community-WIKI, an dem alle mitarbeiten können',
          ctaLabel: 'WIKI öffnen',
        },
      ],
    ),
    'world-map': worldMapPage(
      'Weltkarten',
      'Sieh dir Karten und Status der von Aceserver veröffentlichten Haupt-, Ressourcen-, RPG-, Lobby-, Season- und Eventwelten an.',
      'Sieh die veröffentlichten Karten und derzeit aktiven Welten.',
      'Weltkartenbild der vorherigen Aceserver-Website',
    ),
    'world-map-main': embedPage(
      'Karte der Hauptwelt',
      'Öffentliche Karte der Hauptwelt für Basen, Bauwerke, Gelände und Positionen.',
    ),
    'world-map-sigen': embedPage(
      'Karte der Ressourcenwelt',
      'Öffentliche Karte für Abbaugebiete, Gelände und Orientierungspunkte der Ressourcenwelt.',
    ),
    'world-map-rpg': embedPage(
      'Karte der RPG-Welt',
      'Öffentliche Karte für Erkundungsgebiete, Gelände und Ziele der RPG-Welt.',
    ),
    'world-map-lobby': embedPage(
      'Karte der Lobbywelt',
      'Öffentliche Lobbykarte mit Eingängen zu den Welten und wichtigen Hinweispunkten.',
    ),
    'world-map-rpg-sub': embedPage(
      'Karte der RPG-Unterwelt',
      'Öffentliche Karte der RPG-Unterwelt mit Gelände, Zielen und angrenzenden Gebieten.',
    ),
    'world-map-season-a': embedPage(
      'Karte von Season A',
      'Öffentliche Karte der zeitlich begrenzten Season-A-Welt mit Gelände, Bauwerken und Zielen.',
    ),
    'world-map-season-a-c': embedPage(
      'Karte von Season Creative',
      'Öffentliche Karte von Season Creative mit Kreativbereichen, Bauwerken, Gelände und Zielen.',
    ),
    'world-map-event': embedPage(
      'Karte der Eventwelt',
      'Öffentliche Karte mit Veranstaltungsorten, Eventbereichen und Zielen.',
    ),
    'youtube-search-aceserver': embedPage(
      'Aceserver Videos',
      'Videos des offiziellen Aceserver-YouTube-Kanals, darunter Events, Weltvorstellungen und öffentliche Treffen.',
    ),
  },
}

const ru: LocaleTranslation = {
  sourceHash:
    'sha256:7a2e5e2a72e2082ec988225977fedad69317ec92864bfb50ae3a21294552d52f',
  ui: {
    siteTitleSuffix:
      'Официальный портал бесплатного публичного сервера Minecraft',
    homeTitleParts: ['Ace', 'server'],
    skipToContent: 'Перейти к содержанию',
    homeAriaLabel: 'Главная Aceserver',
    mainNavigation: 'Основная навигация',
    mobileNavigation: 'Мобильная навигация',
    footerNavigation: 'Навигация в подвале',
    languageSelector: 'Язык',
    menuOpen: 'Открыть меню',
    menuClose: 'Закрыть меню',
    announcementLabel: 'Объявления',
    joinDiscord: 'Войти в Discord',
    openWiki: 'Открыть WIKI',
    askAlpha: 'Спросить Alpha-kun',
    alphaName: 'Alpha-kun',
    alphaImageAlt: 'Alpha-kun',
    nextSection: 'Перейти к следующему разделу',
    homeFreedom: 'Играйте, стройте и общайтесь так, как вам нравится.',
    homeMultiplayer:
      'Исследуйте мир и стройте в одиночку, с друзьями или с игроками со всего света.',
    homeCrossplay: 'Играйте с Java Edition и Bedrock Edition!',
    homeCtaLabel: 'Участие и WIKI',
    worldMapTitleParts: ['Карты', 'миров'],
    worldSelection: 'Выбрать мир',
    openWorld: 'Открыть {title}',
    openMap: 'Открыть карту',
    active: 'Работает',
    previous: 'Предыдущая',
    back: 'Назад',
    next: 'Следующая',
    openNewTab: 'Открыть в новой вкладке',
    latestVideos: 'Новые видео',
    channel: 'Канал',
    videoThumbnail: 'Миниатюра: {title}',
    loadingVideos: 'Загружаем новые видео',
    videoLoadError: 'Не удалось загрузить новые видео',
    advertisement: 'Реклама',
    storiesTitle: 'Истории',
    storiesDescription:
      'Записи о событиях Aceserver, сообществе и создании портала.',
    storiesLead: 'Истории Aceserver и работа над понятным входом в сообщество.',
    storyListLabel: 'Список статей',
    tagsLabel: 'Метки',
    breadcrumbLabel: 'Навигационная цепочка',
    homeLabel: 'Главная',
    byAuthor: 'Автор: {author}',
    backToStories: 'Вернуться к историям',
    joinAceserver: 'Присоединиться к Aceserver',
    notFoundTitle: 'Страница не найдена',
    notFoundDescription: 'Запрошенная страница не найдена.',
    notFoundMessage: 'Проверьте адрес или вернитесь на главную страницу.',
    backHome: 'На главную',
    rssTitle: 'Истории Aceserver',
    alpha: {
      chatSubtitle: 'Чат-помощник Aceserver',
      close: 'Закрыть чат Alpha-kun',
      conversation: 'Разговор с Alpha-kun',
      promptExamples: 'Примеры вопросов',
      questionLabel: 'Спросить Alpha-kun',
      placeholder: 'Например: Как присоединиться?',
      send: 'Отправить',
      majorLinks: 'Основные ссылки',
      toggle: 'Спросить Alpha-kun',
      toggleShort: 'Спросить',
      mapLabel: 'Карты',
      greeting: 'Привет, я Alpha-kun. Я помогу вам разобраться в Aceserver.',
      loading: 'Alpha-kun думает...',
      error:
        'Сейчас ответ ИИ недоступен. Загляните в [официальный Discord]({discord}) и [Aceserver WIKI]({wiki}).',
      prompts: [
        { label: 'Участие', question: 'Как присоединиться к Aceserver?' },
        { label: 'Миры', question: 'Какой мир посмотреть первым?' },
        { label: 'Правила', question: 'Какие правила прочитать перед игрой?' },
      ],
    },
  },
  settings: {
    title: 'Портал Aceserver',
    shortTitle: 'Aceserver',
    description:
      'Официальный портал Aceserver — бесплатного публичного сервера Minecraft для всех. Здесь собраны инструкции, карты, WIKI, видео и объявления.',
    logoAlt: 'Логотип Aceserver с сине-жёлтым Alpha-kun',
    worlds: {
      main: {
        title: 'Основной мир',
        imageAlt: 'Существующий снимок карты основного мира',
        statusLabel: 'Карта доступна',
      },
      resource: {
        title: 'Ресурсный мир',
        imageAlt: 'Существующий снимок карты ресурсного мира',
        statusLabel: 'Карта доступна',
      },
      rpg: {
        title: 'RPG',
        imageAlt: 'Настоящий снимок карты RPG-мира',
        statusLabel: 'Карта доступна',
      },
      lobby: {
        title: 'Лобби',
        imageAlt: 'Изображение мира-лобби',
        statusLabel: 'Карта доступна',
      },
      'rpg-sub': {
        title: 'Дополнительный RPG-мир',
        imageAlt: 'Изображение дополнительного RPG-мира',
        statusLabel: 'Карта доступна',
      },
      'season-a': {
        title: 'Season A',
        imageAlt: 'Изображение мира Season A',
        statusLabel: 'Карта доступна',
      },
      'season-a-c': {
        title: 'Season Creative',
        imageAlt: 'Изображение мира Season Creative',
        statusLabel: 'Карта доступна',
      },
      event: {
        title: 'Карта событий',
        imageAlt: 'Изображение карты событий',
        statusLabel: 'Карта доступна',
      },
    },
  },
  navigation: {
    '/youtube-search-aceserver/': 'Видео',
    '/world-map/': 'Карты миров',
    '/stories/': 'Истории',
    'https://acecore.net': 'Acecore',
    'https://asv-wiki.acecore.net': 'Aceserver WIKI',
  },
  announcements: {
    'portal-renewal-2026': {
      title: 'Портал Aceserver обновлён',
      text: 'Мы улучшили доступ к видео, картам миров и WIKI, в том числе на смартфонах.',
      linkLabel: 'Смотреть карты миров',
    },
  },
  pages: {
    top: homePage(
      'Портал Aceserver',
      'Aceserver',
      'Aceserver — бесплатный публичный сервер Minecraft для Java Edition и Bedrock Edition. Портал объединяет Discord, WIKI и карты миров.',
      [
        {
          titleCopy: 'Что такое Aceserver?',
          text: 'Бесплатный публичный сервер Minecraft, открытый для всех',
          imageAlt: 'Город Minecraft и большой белый воздушный корабль над ним',
        },
        {
          titleCopy: 'Играйте вместе со всеми!',
          text: 'Играйте с Java Edition и Bedrock Edition!',
          imageAlt: 'Человек смотрит на море на закате со скалистого берега',
        },
        {
          titleCopy: 'Развлекайтесь!',
          text: 'Свободный сервер, близкий к ванильному Minecraft!',
          imageAlt:
            'Человек прыгает с раскинутыми руками на фоне горной долины',
        },
        {
          titleCopy: 'Хотите присоединиться к Aceserver?',
          text: 'Сначала войдите в официальный Discord!',
          ctaLabel: 'Войти в Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: 'WIKI сообщества, которую может редактировать каждый',
          ctaLabel: 'Открыть WIKI',
        },
      ],
    ),
    'world-map': worldMapPage(
      'Карты миров',
      'Смотрите карты и состояние основного, ресурсного, RPG, лобби, Season и событийного миров Aceserver.',
      'Смотрите опубликованные карты и миры, работающие сейчас.',
      'Изображение карты с предыдущего сайта Aceserver',
    ),
    'world-map-main': embedPage(
      'Карта основного мира',
      'Публичная карта основного мира с базами, постройками, рельефом и расположением объектов.',
    ),
    'world-map-sigen': embedPage(
      'Карта ресурсного мира',
      'Публичная карта ресурсного мира с местами добычи, рельефом и ориентирами.',
    ),
    'world-map-rpg': embedPage(
      'Карта RPG-мира',
      'Публичная карта RPG-мира с зонами исследования, рельефом и направлениями.',
    ),
    'world-map-lobby': embedPage(
      'Карта лобби',
      'Публичная карта лобби с входами в миры и основными информационными точками.',
    ),
    'world-map-rpg-sub': embedPage(
      'Карта дополнительного RPG-мира',
      'Публичная карта дополнительного RPG-мира с рельефом, направлениями и соседними зонами.',
    ),
    'world-map-season-a': embedPage(
      'Карта Season A',
      'Публичная карта временного мира Season A с рельефом, постройками и направлениями.',
    ),
    'world-map-season-a-c': embedPage(
      'Карта Season Creative',
      'Публичная карта Season Creative с творческими зонами, постройками, рельефом и направлениями.',
    ),
    'world-map-event': embedPage(
      'Карта событийного мира',
      'Публичная карта с площадками, зонами событий и направлениями.',
    ),
    'youtube-search-aceserver': embedPage(
      'Видео Aceserver',
      'Видео официального канала Aceserver: трансляции событий, обзоры миров и открытые встречи.',
    ),
  },
}

export const TRANSLATIONS = {
  en,
  'zh-cn': zhCn,
  es,
  pt,
  fr,
  ko,
  de,
  ru,
} satisfies Record<TranslatedLocale, LocaleTranslation>

export function getUi(locale: Locale): UiCopy {
  return locale === 'ja' ? JA_UI : TRANSLATIONS[locale].ui
}

export function getTranslation(locale: TranslatedLocale): LocaleTranslation {
  return TRANSLATIONS[locale]
}
