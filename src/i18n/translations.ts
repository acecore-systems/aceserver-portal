import type { Locale, TranslatedLocale } from './config'

export type CommunityTranslation = {
  title: string
  intro: string
  gallery: Record<string, { title: string; text: string; imageAlt: string }>
  events: Record<string, { title: string; text: string }>
  xPosts: Record<string, { label: string }>
}

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
  homeShopTitle: string
  homeShopText: string
  openShop: string
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
  relatedContentTitle: string
  relatedPageLabel: string
  homeMultiplayerGuide: string
  notFoundTitle: string
  notFoundDescription: string
  notFoundMessage: string
  backHome: string
  rssTitle: string
  search: {
    link: string
    title: string
    placeholder: string
    localResults: string
    relatedSites: string
    loading: string
    noResults: string
    privacy: string
  }
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
  community: CommunityTranslation
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
  homeCtaLabel: '参加・WIKI・絵日記・公式グッズ',
  homeShopTitle: 'Aceserverを、日常にも。',
  homeShopText:
    'アルファくんやAceserverの世界観を、公式グッズとしてお届けしています。',
  openShop: '公式グッズを見る',
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
  relatedContentTitle: '関連するページ',
  relatedPageLabel: 'ポータルページ',
  homeMultiplayerGuide: '友達と遊ぶ方法を見る',
  notFoundTitle: 'ページが見つかりません',
  notFoundDescription: 'お探しのページは見つかりませんでした。',
  notFoundMessage: 'URLを確認するか、トップページから入り直してください。',
  backHome: 'トップページへ',
  rssTitle: 'エースサーバー 読みもの',
  search: {
    link: '検索',
    title: 'サイト内検索',
    placeholder: '例: ワールドマップ',
    localResults: 'このサイトの検索結果',
    relatedSites: 'Acecore関連サイト',
    loading: '意味が近いページを検索しています…',
    noResults: '一致する公開ページは見つかりませんでした。',
    privacy:
      '検索語は公開情報との照合のためCloudflare Workers AIに送信されます。',
  },
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
    greeting: 'やあ、ぼくはアルファくんだよ。エースサーバーを案内するね。',
    loading: 'ちょっと考えているよ...',
    error:
      'いまはうまく答えを届けられなかったよ。[公式Discord]({discord}) と [Aceserver WIKI]({wiki}) を見てね。',
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
    'sha256:3dd6323e7d3088de144f17d0a6fb3654fec251c1394a8c0a07c82ec10e8b09f1',
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
    homeCtaLabel: 'Join, WIKI, picture diary, and official goods',
    homeShopTitle: 'Bring Aceserver into everyday life.',
    homeShopText:
      'Explore official goods inspired by Alpha-kun and the world of Aceserver.',
    openShop: 'View official goods',
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
    relatedContentTitle: 'Related pages',
    relatedPageLabel: 'Aceserver page',
    homeMultiplayerGuide: 'See how to play with friends',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'The page you requested could not be found.',
    notFoundMessage: 'Check the URL or return to the home page.',
    backHome: 'Go to the home page',
    rssTitle: 'Aceserver Stories',
    search: {
      link: 'Search',
      title: 'Search this site',
      placeholder: 'Example: world map',
      localResults: 'Results from this site',
      relatedSites: 'Related Acecore sites',
      loading: 'Looking for semantically related pages…',
      noResults: 'No matching public pages were found.',
      privacy:
        'Your query is sent to Cloudflare Workers AI to compare it with public information.',
    },
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
      loading: "I'm thinking...",
      error:
        "I couldn't deliver an answer this time. Check [official Discord]({discord}) and the [Aceserver WIKI]({wiki}).",
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
    '/world-map/': 'Map',
    '/stories/': 'Articles',
    '/alpha-diary/': 'Picture diary',
    '/skin-maker/': 'Skin Maker',
    'https://acecore.net': 'Acecore',
    'https://store.acecore.net': 'Store',
    'https://asv-wiki.acecore.net': 'WIKI',
  },
  announcements: {},
  community: {
    title: 'Right now, in Aceserver.',
    intro:
      'Building the next street or taking a railway trip: explore the worlds and the community today.',
    gallery: {
      airship: {
        title: 'A giant airship above the city.',
        text: 'A real build from our world. Open the map and find somewhere to visit next.',
        imageAlt: 'A Minecraft city with a giant white airship',
      },
      city: {
        title: 'Another town beyond the tracks.',
        text: 'Cities, railways and towers spread across the main world. Seen from above, their connections come into view.',
        imageAlt:
          'An actual overhead map of the main world, showing buildings, railways and towers',
      },
    },
    events: {},
    xPosts: {
      railway: {
        label: 'Touring Aceserver by rail',
      },
      station: {
        label: 'The view from Satsukari Station',
      },
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
          imageAlt: 'A giant white airship above the city',
        },
        {
          titleCopy: 'Have fun!',
          text: 'A highly flexible server that stays close to vanilla Minecraft!',
          imageAlt: 'Main-world buildings, railways and towers',
        },
        {
          titleCopy: 'Want to join Aceserver?',
          text: 'Start by joining the official Discord!',
          ctaLabel: 'Join Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: 'The official Aceserver WIKI for joining guides and rules',
          ctaLabel: 'How to join',
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
    'sha256:3dd6323e7d3088de144f17d0a6fb3654fec251c1394a8c0a07c82ec10e8b09f1',
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
    homeCtaLabel: '参与方式、WIKI、图画日记与官方周边',
    homeShopTitle: '把 Aceserver 带入日常生活。',
    homeShopText: '探索以 Alpha-kun 和 Aceserver 世界观为灵感的官方周边。',
    openShop: '查看官方周边',
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
    relatedContentTitle: '相关页面',
    relatedPageLabel: 'Aceserver 页面',
    homeMultiplayerGuide: '查看如何与朋友一起玩',
    notFoundTitle: '找不到页面',
    notFoundDescription: '未能找到你要访问的页面。',
    notFoundMessage: '请检查网址，或返回首页重新开始。',
    backHome: '返回首页',
    rssTitle: 'Aceserver 故事',
    search: {
      link: '搜索',
      title: '站内搜索',
      placeholder: '例如：世界地图',
      localResults: '本网站的搜索结果',
      relatedSites: 'Acecore 相关网站',
      loading: '正在查找语义相近的页面…',
      noResults: '未找到匹配的公开页面。',
      privacy: '搜索词会发送到 Cloudflare Workers AI，用于与公开信息进行比对。',
    },
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
      greeting: '你好，我是 Alpha-kun。我来带你了解 Aceserver。',
      loading: '我正在想……',
      error:
        '这次我没能把答案送过来。去看[官方 Discord]({discord})和 [Aceserver WIKI]({wiki})吧。',
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
    '/world-map/': '地图',
    '/stories/': '文章',
    '/alpha-diary/': '图画日记',
    '/skin-maker/': '皮肤制作器',
    'https://acecore.net': 'Acecore',
    'https://store.acecore.net': '商店',
    'https://asv-wiki.acecore.net': 'WIKI',
  },
  announcements: {},
  community: {
    title: '此刻，在 Aceserver。',
    intro: '有人继续建造街道，有人乘铁路旅行。一起来看看今天的世界与社区。',
    gallery: {
      airship: {
        title: '城市上空的巨大飞艇。',
        text: '这是世界中实际建造的街景。打开地图，寻找下一个想去的地方。',
        imageAlt: 'Minecraft 城市与巨大的白色飞艇',
      },
      city: {
        title: '铁轨的另一端，也有一座城。',
        text: '主世界中分布着城市、铁路与高楼。俯瞰地图，也能看见建筑之间的联系。',
        imageAlt: '主世界的真实俯瞰地图，展示城市、铁路与高楼',
      },
    },
    events: {},
    xPosts: {
      railway: {
        label: '乘铁路游览 Aceserver',
      },
      station: {
        label: '札苅站的风景',
      },
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
          imageAlt: '城市上空的巨大白色飞艇',
        },
        {
          titleCopy: '尽情享受！',
          text: '接近原版、自由度极高的服务器！',
          imageAlt: '主世界的城市、铁路与高楼',
        },
        {
          titleCopy: '想加入 Aceserver 吗？',
          text: '请先加入官方 Discord！',
          ctaLabel: '加入 Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: '查看加入方式和规则的 Aceserver 官方 WIKI',
          ctaLabel: '查看加入方式',
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
    'sha256:3dd6323e7d3088de144f17d0a6fb3654fec251c1394a8c0a07c82ec10e8b09f1',
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
    homeCtaLabel: 'Participación, WIKI, diario ilustrado y artículos oficiales',
    homeShopTitle: 'Lleva Aceserver a tu día a día.',
    homeShopText:
      'Descubre artículos oficiales inspirados en Alpha-kun y el mundo de Aceserver.',
    openShop: 'Ver artículos oficiales',
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
    relatedContentTitle: 'Páginas relacionadas',
    relatedPageLabel: 'Página de Aceserver',
    homeMultiplayerGuide: 'Ver cómo jugar con amistades',
    notFoundTitle: 'Página no encontrada',
    notFoundDescription: 'No se encontró la página solicitada.',
    notFoundMessage: 'Comprueba la URL o vuelve a la página de inicio.',
    backHome: 'Ir al inicio',
    rssTitle: 'Historias de Aceserver',
    search: {
      link: 'Buscar',
      title: 'Buscar en este sitio',
      placeholder: 'Ejemplo: mapa del mundo',
      localResults: 'Resultados de este sitio',
      relatedSites: 'Sitios relacionados de Acecore',
      loading: 'Buscando páginas relacionadas por significado…',
      noResults: 'No se encontraron páginas públicas coincidentes.',
      privacy:
        'La consulta se envía a Cloudflare Workers AI para compararla con información pública.',
    },
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
      greeting: 'Hola, soy Alpha-kun. Te ayudo a orientarte en Aceserver.',
      loading: 'Estoy pensando...',
      error:
        'Esta vez no pude enviarte una respuesta. Mira el [Discord oficial]({discord}) y la [WIKI de Aceserver]({wiki}).',
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
    '/world-map/': 'Mapa',
    '/stories/': 'Artículos',
    '/alpha-diary/': 'Diario ilustrado',
    '/skin-maker/': 'Creador de skins',
    'https://acecore.net': 'Acecore',
    'https://store.acecore.net': 'Tienda',
    'https://asv-wiki.acecore.net': 'WIKI',
  },
  announcements: {},
  community: {
    title: 'Ahora mismo, en Aceserver.',
    intro:
      'Hay quienes construyen una nueva calle y quienes viajan en tren. Descubre los mundos y la comunidad de hoy.',
    gallery: {
      airship: {
        title: 'Un dirigible gigante sobre la ciudad.',
        text: 'Una construcción real de nuestro mundo. Abre el mapa y busca tu próxima visita.',
        imageAlt: 'Ciudad de Minecraft con un enorme dirigible blanco',
      },
      city: {
        title: 'Otra ciudad al final de las vías.',
        text: 'El mundo principal está lleno de ciudades, ferrocarriles y torres. Desde arriba se ven sus conexiones.',
        imageAlt:
          'Mapa aéreo real del mundo principal con edificios, ferrocarriles y torres',
      },
    },
    events: {},
    xPosts: {
      railway: {
        label: 'Recorriendo Aceserver en tren',
      },
      station: {
        label: 'La vista desde la estación Satsukari',
      },
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
          imageAlt: 'Un enorme dirigible blanco sobre la ciudad',
        },
        {
          titleCopy: '¡Diviértete!',
          text: '¡Un servidor muy libre y cercano a Minecraft vanilla!',
          imageAlt: 'Edificios, ferrocarriles y torres del mundo principal',
        },
        {
          titleCopy: '¿Quieres unirte a Aceserver?',
          text: '¡Empieza por el Discord oficial!',
          ctaLabel: 'Unirse a Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'WIKI de Aceserver',
          text: 'La WIKI oficial de Aceserver para consultar cómo unirse y las reglas',
          ctaLabel: 'Cómo unirse',
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
    'sha256:3dd6323e7d3088de144f17d0a6fb3654fec251c1394a8c0a07c82ec10e8b09f1',
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
    homeCtaLabel: 'Participação, WIKI, diário ilustrado e produtos oficiais',
    homeShopTitle: 'Leve o Aceserver para o seu dia a dia.',
    homeShopText:
      'Conheça produtos oficiais inspirados no Alpha-kun e no mundo do Aceserver.',
    openShop: 'Ver produtos oficiais',
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
    relatedContentTitle: 'Páginas relacionadas',
    relatedPageLabel: 'Página do Aceserver',
    homeMultiplayerGuide: 'Ver como jogar com amigos',
    notFoundTitle: 'Página não encontrada',
    notFoundDescription: 'A página solicitada não foi encontrada.',
    notFoundMessage: 'Verifique o endereço ou volte à página inicial.',
    backHome: 'Ir para o início',
    rssTitle: 'Histórias do Aceserver',
    search: {
      link: 'Pesquisar',
      title: 'Pesquisar neste site',
      placeholder: 'Exemplo: mapa do mundo',
      localResults: 'Resultados deste site',
      relatedSites: 'Sites Acecore relacionados',
      loading: 'Procurando páginas semanticamente relacionadas…',
      noResults: 'Nenhuma página pública correspondente foi encontrada.',
      privacy:
        'A consulta é enviada ao Cloudflare Workers AI para comparação com informações públicas.',
    },
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
      loading: 'Tô pensando...',
      error:
        'Dessa vez eu não consegui entregar uma resposta. Olha o [Discord oficial]({discord}) e a [WIKI do Aceserver]({wiki}).',
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
    '/world-map/': 'Mapa',
    '/stories/': 'Artigos',
    '/alpha-diary/': 'Diário ilustrado',
    '/skin-maker/': 'Criador de skins',
    'https://acecore.net': 'Acecore',
    'https://store.acecore.net': 'Loja',
    'https://asv-wiki.acecore.net': 'WIKI',
  },
  announcements: {},
  community: {
    title: 'Agora, no Aceserver.',
    intro:
      'Alguns constroem a próxima rua; outros viajam de trem. Explore os mundos e a comunidade de hoje.',
    gallery: {
      airship: {
        title: 'Um dirigível gigante sobre a cidade.',
        text: 'Uma construção real do nosso mundo. Abra o mapa e encontre o próximo lugar para visitar.',
        imageAlt: 'Cidade de Minecraft com um enorme dirigível branco',
      },
      city: {
        title: 'Outra cidade além dos trilhos.',
        text: 'O mundo principal tem cidades, ferrovias e torres. Vistas de cima, suas conexões aparecem.',
        imageAlt:
          'Mapa aéreo real do mundo principal com prédios, ferrovias e torres',
      },
    },
    events: {},
    xPosts: {
      railway: {
        label: 'Passeando de trem pelo Aceserver',
      },
      station: {
        label: 'A vista da estação Satsukari',
      },
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
          imageAlt: 'Um enorme dirigível branco sobre a cidade',
        },
        {
          titleCopy: 'Divirta-se!',
          text: 'Um servidor muito livre e próximo do Minecraft vanilla!',
          imageAlt: 'Prédios, ferrovias e torres do mundo principal',
        },
        {
          titleCopy: 'Quer entrar no Aceserver?',
          text: 'Comece entrando no Discord oficial!',
          ctaLabel: 'Entrar no Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'WIKI do Aceserver',
          text: 'A WIKI oficial do Aceserver para consultar como participar e as regras',
          ctaLabel: 'Como participar',
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
    'sha256:3dd6323e7d3088de144f17d0a6fb3654fec251c1394a8c0a07c82ec10e8b09f1',
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
    homeCtaLabel: 'Participation, WIKI, journal illustré et produits officiels',
    homeShopTitle: 'Emportez Aceserver dans votre quotidien.',
    homeShopText:
      'Découvrez des produits officiels inspirés d’Alpha-kun et de l’univers d’Aceserver.',
    openShop: 'Voir les produits officiels',
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
    relatedContentTitle: 'Pages associées',
    relatedPageLabel: 'Page Aceserver',
    homeMultiplayerGuide: 'Voir comment jouer avec des amis',
    notFoundTitle: 'Page introuvable',
    notFoundDescription: 'La page demandée est introuvable.',
    notFoundMessage: 'Vérifiez l’adresse ou revenez à la page d’accueil.',
    backHome: 'Retour à l’accueil',
    rssTitle: 'Récits Aceserver',
    search: {
      link: 'Rechercher',
      title: 'Rechercher sur ce site',
      placeholder: 'Exemple : carte du monde',
      localResults: 'Résultats de ce site',
      relatedSites: 'Sites Acecore associés',
      loading: 'Recherche de pages proches par le sens…',
      noResults: 'Aucune page publique correspondante n’a été trouvée.',
      privacy:
        'La recherche est envoyée à Cloudflare Workers AI pour comparaison avec des informations publiques.',
    },
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
      greeting: 'Salut, je suis Alpha-kun. Je vais te guider dans Aceserver.',
      loading: 'Je réfléchis...',
      error:
        'Je n’ai pas réussi à t’envoyer une réponse cette fois. Regarde le [Discord officiel]({discord}) et le [WIKI Aceserver]({wiki}).',
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
    '/world-map/': 'Carte',
    '/stories/': 'Articles',
    '/alpha-diary/': 'Journal illustré',
    '/skin-maker/': 'Créateur de skins',
    'https://acecore.net': 'Acecore',
    'https://store.acecore.net': 'Boutique',
    'https://asv-wiki.acecore.net': 'WIKI',
  },
  announcements: {},
  community: {
    title: 'En ce moment, sur Aceserver.',
    intro:
      'Certains prolongent une rue, d’autres voyagent en train. Découvrez les mondes et la communauté du jour.',
    gallery: {
      airship: {
        title: 'Un dirigeable géant au-dessus de la ville.',
        text: 'Une vraie construction de notre monde. Ouvrez la carte pour trouver votre prochaine visite.',
        imageAlt: 'Une ville Minecraft avec un immense dirigeable blanc',
      },
      city: {
        title: 'Une autre ville au bout des rails.',
        text: 'Villes, voies ferrées et tours parcourent le monde principal. Vues du ciel, leurs connexions apparaissent.',
        imageAlt:
          'Une vraie carte aérienne du monde principal avec bâtiments, voies ferrées et tours',
      },
    },
    events: {},
    xPosts: {
      railway: {
        label: 'Explorer Aceserver en train',
      },
      station: {
        label: 'La vue depuis la gare de Satsukari',
      },
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
          imageAlt: 'Un immense dirigeable blanc au-dessus de la ville',
        },
        {
          titleCopy: 'Amusez-vous !',
          text: 'Un serveur très libre, proche de Minecraft vanilla !',
          imageAlt: 'Bâtiments, voies ferrées et tours du monde principal',
        },
        {
          titleCopy: 'Vous souhaitez rejoindre Aceserver ?',
          text: 'Commencez par rejoindre le Discord officiel !',
          ctaLabel: 'Rejoindre Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'WIKI Aceserver',
          text: 'Le WIKI officiel d’Aceserver pour consulter les étapes et les règles',
          ctaLabel: 'Comment rejoindre',
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
    'sha256:3dd6323e7d3088de144f17d0a6fb3654fec251c1394a8c0a07c82ec10e8b09f1',
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
    homeCtaLabel: '참여, WIKI, 그림일기 및 공식 굿즈',
    homeShopTitle: 'Aceserver를 일상으로.',
    homeShopText:
      'Alpha-kun과 Aceserver의 세계관에서 영감을 받은 공식 굿즈를 만나보세요.',
    openShop: '공식 굿즈 보기',
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
    relatedContentTitle: '관련 페이지',
    relatedPageLabel: 'Aceserver 페이지',
    homeMultiplayerGuide: '친구와 함께 플레이하는 방법 보기',
    notFoundTitle: '페이지를 찾을 수 없습니다',
    notFoundDescription: '요청한 페이지를 찾을 수 없습니다.',
    notFoundMessage: '주소를 확인하거나 홈으로 돌아가 주세요.',
    backHome: '홈으로',
    rssTitle: 'Aceserver 이야기',
    search: {
      link: '검색',
      title: '사이트 내 검색',
      placeholder: '예: 월드 맵',
      localResults: '이 사이트의 검색 결과',
      relatedSites: '관련 Acecore 사이트',
      loading: '의미가 가까운 페이지를 찾고 있어요…',
      noResults: '일치하는 공개 페이지를 찾지 못했어요.',
      privacy:
        '검색어는 공개 정보와 비교하기 위해 Cloudflare Workers AI로 전송됩니다.',
    },
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
      greeting: '안녕, 나는 Alpha-kun이야. Aceserver를 안내해 줄게.',
      loading: '지금 생각하고 있어...',
      error:
        '이번에는 답을 전해 주지 못했어. [공식 Discord]({discord})와 [Aceserver WIKI]({wiki})를 확인해 봐.',
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
    '/world-map/': '지도',
    '/stories/': '기사',
    '/alpha-diary/': '그림일기',
    '/skin-maker/': '스킨 메이커',
    'https://acecore.net': 'Acecore',
    'https://store.acecore.net': '스토어',
    'https://asv-wiki.acecore.net': 'WIKI',
  },
  announcements: {},
  community: {
    title: '지금, Aceserver에서.',
    intro:
      '다음 거리를 만드는 사람, 철도로 여행하는 사람. 오늘의 월드와 커뮤니티를 둘러보세요.',
    gallery: {
      airship: {
        title: '도시 위에 떠 있는 거대한 비행선.',
        text: '실제 월드에서 지어진 거리입니다. 지도를 열고 다음에 방문할 곳을 찾아보세요.',
        imageAlt: 'Minecraft 도시와 거대한 흰색 비행선',
      },
      city: {
        title: '철길 너머에도 누군가의 도시.',
        text: '메인 월드에는 도시와 철도, 고층 건물이 펼쳐집니다. 하늘에서 보면 건축물 사이의 연결도 보입니다.',
        imageAlt: '도시와 철도, 고층 건물을 내려다본 메인 월드의 실제 지도',
      },
    },
    events: {},
    xPosts: {
      railway: {
        label: '철도로 둘러보는 Aceserver',
      },
      station: {
        label: '사쓰카리역에서 바라본 풍경',
      },
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
          imageAlt: '도시 위의 거대한 흰색 비행선',
        },
        {
          titleCopy: '즐겁게!',
          text: '바닐라에 가깝고 자유도가 높은 서버입니다!',
          imageAlt: '메인 월드의 도시와 철도, 고층 건물',
        },
        {
          titleCopy: 'Aceserver에 참여하고 싶나요?',
          text: '먼저 공식 Discord에 참여해 주세요!',
          ctaLabel: 'Discord 참여',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: '참가 방법과 규칙을 확인하는 Aceserver 공식 WIKI',
          ctaLabel: '참여 방법 확인',
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
    'sha256:3dd6323e7d3088de144f17d0a6fb3654fec251c1394a8c0a07c82ec10e8b09f1',
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
    homeCtaLabel: 'Teilnahme, WIKI, Bildertagebuch und offizielle Artikel',
    homeShopTitle: 'Hol dir Aceserver in den Alltag.',
    homeShopText:
      'Entdecke offizielle Artikel, inspiriert von Alpha-kun und der Welt von Aceserver.',
    openShop: 'Offizielle Artikel ansehen',
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
    relatedContentTitle: 'Verwandte Seiten',
    relatedPageLabel: 'Aceserver-Seite',
    homeMultiplayerGuide: 'So spielst du mit Freunden',
    notFoundTitle: 'Seite nicht gefunden',
    notFoundDescription: 'Die angeforderte Seite wurde nicht gefunden.',
    notFoundMessage: 'Prüfe die Adresse oder kehre zur Startseite zurück.',
    backHome: 'Zur Startseite',
    rssTitle: 'Aceserver Geschichten',
    search: {
      link: 'Suche',
      title: 'Diese Website durchsuchen',
      placeholder: 'Beispiel: Weltkarte',
      localResults: 'Ergebnisse dieser Website',
      relatedSites: 'Verwandte Acecore-Websites',
      loading: 'Suche nach semantisch verwandten Seiten…',
      noResults: 'Keine passenden öffentlichen Seiten gefunden.',
      privacy:
        'Die Suchanfrage wird zur Prüfung mit öffentlichen Informationen an Cloudflare Workers AI gesendet.',
    },
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
      loading: 'Ich denke nach...',
      error:
        'Diesmal konnte ich dir keine Antwort schicken. Sieh im [offiziellen Discord]({discord}) und im [Aceserver WIKI]({wiki}) nach.',
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
    '/world-map/': 'Karte',
    '/stories/': 'Artikel',
    '/alpha-diary/': 'Bildertagebuch',
    '/skin-maker/': 'Skin-Ersteller',
    'https://acecore.net': 'Acecore',
    'https://store.acecore.net': 'Shop',
    'https://asv-wiki.acecore.net': 'WIKI',
  },
  announcements: {},
  community: {
    title: 'Gerade jetzt, auf Aceserver.',
    intro:
      'Eine neue Straße bauen oder mit der Bahn reisen: Entdecke die Welten und die Community von heute.',
    gallery: {
      airship: {
        title: 'Ein riesiges Luftschiff über der Stadt.',
        text: 'Ein echtes Bauwerk aus unserer Welt. Öffne die Karte und finde dein nächstes Ausflugsziel.',
        imageAlt: 'Eine Minecraft-Stadt mit einem riesigen weißen Luftschiff',
      },
      city: {
        title: 'Eine weitere Stadt hinter den Gleisen.',
        text: 'Städte, Bahnstrecken und Türme prägen die Hauptwelt. Von oben werden ihre Verbindungen sichtbar.',
        imageAlt:
          'Eine echte Übersichtskarte der Hauptwelt mit Gebäuden, Bahnstrecken und Türmen',
      },
    },
    events: {},
    xPosts: {
      railway: {
        label: 'Mit der Bahn durch Aceserver',
      },
      station: {
        label: 'Der Blick vom Bahnhof Satsukari',
      },
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
          imageAlt: 'Ein riesiges weißes Luftschiff über der Stadt',
        },
        {
          titleCopy: 'Hab Spaß!',
          text: 'Ein sehr freier Server, der nah an Vanilla Minecraft bleibt!',
          imageAlt: 'Gebäude, Bahnstrecken und Türme der Hauptwelt',
        },
        {
          titleCopy: 'Möchtest du Aceserver beitreten?',
          text: 'Tritt zuerst dem offiziellen Discord bei!',
          ctaLabel: 'Discord beitreten',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: 'Das offizielle Aceserver-WIKI für Teilnahme und Regeln',
          ctaLabel: 'So machst du mit',
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
    'sha256:3dd6323e7d3088de144f17d0a6fb3654fec251c1394a8c0a07c82ec10e8b09f1',
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
    homeCtaLabel: 'Участие, WIKI, дневник и официальные товары',
    homeShopTitle: 'Добавьте Aceserver в повседневную жизнь.',
    homeShopText:
      'Откройте официальные товары, вдохновлённые Alpha-kun и миром Aceserver.',
    openShop: 'Посмотреть официальные товары',
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
    relatedContentTitle: 'Связанные страницы',
    relatedPageLabel: 'Страница Aceserver',
    homeMultiplayerGuide: 'Как играть с друзьями',
    notFoundTitle: 'Страница не найдена',
    notFoundDescription: 'Запрошенная страница не найдена.',
    notFoundMessage: 'Проверьте адрес или вернитесь на главную страницу.',
    backHome: 'На главную',
    rssTitle: 'Истории Aceserver',
    search: {
      link: 'Поиск',
      title: 'Поиск по сайту',
      placeholder: 'Например: карта мира',
      localResults: 'Результаты этого сайта',
      relatedSites: 'Связанные сайты Acecore',
      loading: 'Ищем страницы, близкие по смыслу…',
      noResults: 'Подходящие публичные страницы не найдены.',
      privacy:
        'Поисковый запрос отправляется в Cloudflare Workers AI для сравнения с публичной информацией.',
    },
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
      greeting: 'Привет, я Alpha-kun. Я помогу тебе разобраться в Aceserver.',
      loading: 'Я думаю...',
      error:
        'В этот раз я не смог передать ответ. Загляни в [официальный Discord]({discord}) и [Aceserver WIKI]({wiki}).',
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
    '/world-map/': 'Карта',
    '/stories/': 'Статьи',
    '/alpha-diary/': 'Дневник',
    '/skin-maker/': 'Редактор скинов',
    'https://acecore.net': 'Acecore',
    'https://store.acecore.net': 'Магазин',
    'https://asv-wiki.acecore.net': 'WIKI',
  },
  announcements: {},
  community: {
    title: 'Прямо сейчас в Aceserver.',
    intro:
      'Кто-то строит новую улицу, кто-то путешествует на поезде. Посмотрите на сегодняшние миры и сообщество.',
    gallery: {
      airship: {
        title: 'Огромный дирижабль над городом.',
        text: 'Настоящая постройка в нашем мире. Откройте карту и выберите следующее место для прогулки.',
        imageAlt: 'Город Minecraft с огромным белым дирижаблем',
      },
      city: {
        title: 'За рельсами — ещё один город.',
        text: 'Главный мир наполнен городами, железными дорогами и башнями. Сверху видны связи между постройками.',
        imageAlt:
          'Настоящая карта главного мира сверху: здания, железные дороги и башни',
      },
    },
    events: {},
    xPosts: {
      railway: {
        label: 'Путешествие по Aceserver на поезде',
      },
      station: {
        label: 'Вид со станции Сацукари',
      },
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
          imageAlt: 'Огромный белый дирижабль над городом',
        },
        {
          titleCopy: 'Развлекайтесь!',
          text: 'Свободный сервер, близкий к ванильному Minecraft!',
          imageAlt: 'Здания, железные дороги и башни главного мира',
        },
        {
          titleCopy: 'Хотите присоединиться к Aceserver?',
          text: 'Сначала войдите в официальный Discord!',
          ctaLabel: 'Войти в Discord',
        },
        {
          shoulderCopy: 'aceserver wiki',
          titleCopy: 'Aceserver WIKI',
          text: 'Официальная WIKI Aceserver с правилами и инструкцией по входу',
          ctaLabel: 'Как присоединиться',
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
