import type { Locale } from '../i18n/config'

interface ContributorProfile {
  id: string
  name: string
  month: string
  source: string
  playerName: string
  image: string
}

const boatRaceAnnouncement =
  'https://discord.com/channels/737538781024092170/774152638450237460/970291030152847390'

export const contributorProfiles = [
  {
    id: 'chatBridge',
    name: 'あすたん',
    month: '2025-11',
    source:
      'https://discord.com/channels/737538781024092170/774152638450237460/1437973211961622670',
    // https://asv-wiki.acecore.net/article/asutan-kingdom/
    // Java profile base and outer face, 2026-11-21.
    playerName: 'asutarisucu',
    image: '/uploads/contributors/asutarisucu.png',
  },
  {
    id: 'raceAnnounce',
    name: 'キツネコ',
    month: '2022-05',
    source: boatRaceAnnouncement,
    // https://mc-map-main.acecore.net/tiles/faces/8x8/KITUNEKO0605.png
    playerName: 'KITUNEKO0605',
    image: '/uploads/contributors/kituneko0605.png',
  },
  {
    id: 'discordRoles',
    name: 'Merutak',
    month: '2026-02',
    source:
      'https://discord.com/channels/737538781024092170/774152638450237460/1477293143773810822',
    // https://mc-map-main.acecore.net/tiles/faces/8x8/Merutak.png
    playerName: 'Merutak',
    image: '/uploads/contributors/merutak.png',
  },
  {
    id: 'technicalLecture',
    name: 'sekisei',
    month: '2026-07',
    source:
      'https://discord.com/channels/737538781024092170/774152638450237460/1532641413500633108',
    // https://mc-map-main.acecore.net/tiles/faces/8x8/sekisei0077.png
    playerName: 'sekisei0077',
    image: '/uploads/contributors/sekisei0077.png',
  },
  {
    id: 'summerStall',
    name: '枝豆',
    month: '2022-08',
    source:
      'https://discord.com/channels/737538781024092170/779569416438415421/1010359403259641856',
    // Java profile base and outer face, 2026-11-22.
    playerName: 'edamameRex_java',
    image: '/uploads/contributors/edamamerex_java.png',
  },
] as const satisfies readonly ContributorProfile[]

type ProfileId = (typeof contributorProfiles)[number]['id']

export const boatCourseCredit = {
  name: 'Hako_Otoko',
  month: '2022-05',
  source: boatRaceAnnouncement,
}

export const festivalCredits = {
  year: '2025',
  source:
    'https://discord.com/channels/737538781024092170/779569416438415421/1411394624026710166',
}

interface RoadmapEntry {
  id: string
  state: 'held' | 'announced' | 'proposals'
  date: string | null
  source: string
}

export const roadmapEntries = [
  {
    id: 'trickOrRun',
    state: 'held',
    date: '2026-11-08',
    source:
      'https://discord.com/channels/737538781024092170/774152638450237460/1569004504991531160',
  },
  {
    id: 'winterEvent',
    state: 'announced',
    date: null,
    source:
      'https://discord.com/channels/737538781024092170/774152638450237460/1569004504991531160',
  },
  {
    id: 'conceptServer',
    state: 'proposals',
    date: null,
    source: 'https://asv-wiki.acecore.net/article/concept-server-guide/',
  },
] as const satisfies readonly RoadmapEntry[]

type RoadmapId = (typeof roadmapEntries)[number]['id']
export const roadmapCheckedDate = '2026-11-21'

export interface ContributorStoryCopy {
  navigation: string
  contributors: string
  roadmap: string
  history: string
  playerName: string
  skinAlt: string
  announceLink: string
  discordNote: string
  profileDetails: Record<ProfileId, string>
  boatCourse: string
  festival: { title: string; description: string; link: string }
  checkedDate: string
  unscheduled: string
  status: Record<RoadmapEntry['state'], string>
  roadmapDetails: Record<
    RoadmapId,
    { title: string; description: string; link: string }
  >
}

export const contributorStoryCopy: Record<Locale, ContributorStoryCopy> = {
  ja: {
    navigation: 'この記事の目次',
    contributors: '協力者紹介',
    roadmap: 'ロードマップ',
    history: '活動の記録',
    playerName: 'Minecraft ID',
    skinAlt: '{name}のMinecraftスキンの顔',
    announceLink: 'Discordの告知',
    discordNote: 'Discordの投稿を見るには公式サーバーへの参加が必要です。',
    profileDetails: {
      chatBridge: 'MinecraftとDiscordのチャットをつなぐ仕組みを作りました。',
      raceAnnounce: '代替のボートレースを告知し、使用する会場を案内しました。',
      discordRoles: 'トラブルやサーバー停止の連絡用Discordロールを作りました。',
      technicalLecture:
        'サーバーとインターネットをテーマにした第1回技術講座を案内しました。',
      summerStall: '2022年の夏祭りに出店することを案内しました。',
    },
    boatCourse: '代替ボートレースの会場として案内されたレース場を作りました。',
    festival: {
      title: '夏まつりをつくった人たち',
      description:
        '花火、サーキット、ゴルフ、PvP。参加者が企画や準備を分担しました。',
      link: '開催後の謝辞',
    },
    checkedDate: '{date}時点',
    unscheduled: '日程未発表',
    status: { held: '開催済み', announced: '予告済み', proposals: '提案受付' },
    roadmapDetails: {
      trickOrRun: {
        title: 'Trick-or-run',
        description:
          '指定されたアイテムを集めて納品する秋のイベントを開催しました。',
        link: '開催結果',
      },
      winterEvent: {
        title: '冬のイベント企画',
        description:
          '11月の開催結果の報告で、次の冬の大型企画について案内がありました。',
        link: '冬の企画に触れた報告',
      },
      conceptServer: {
        title: 'コンセプト鯖の提案',
        description:
          'プレイヤーが新しい遊び方を提案し、運営が内容を確認します。',
        link: '提案方法を読む',
      },
    },
  },
  en: {
    navigation: 'On this page',
    contributors: 'Contributors',
    roadmap: 'Roadmap',
    history: 'Activity record',
    playerName: 'Minecraft ID',
    skinAlt: 'Face of {name}’s Minecraft skin',
    announceLink: 'Discord announcement',
    discordNote: 'Join the official Discord server to read its posts.',
    profileDetails: {
      chatBridge: 'Built the system that links in-game chat to Discord.',
      raceAnnounce:
        'Announced the alternate boat race and introduced its venue.',
      discordRoles:
        'Created Discord roles for reporting problems and server outages.',
      technicalLecture:
        'Announced the first technical talk on servers and the internet.',
      summerStall: 'Announced a stall at the 2022 Summer Festival.',
    },
    boatCourse:
      'Built the course announced as the venue for the alternate boat race.',
    festival: {
      title: 'The people behind the Summer Festival',
      description:
        'Players shared planning and preparation for fireworks, circuit racing, golf, and PvP.',
      link: 'Post-event acknowledgments',
    },
    checkedDate: 'As of {date}',
    unscheduled: 'Date not announced',
    status: {
      held: 'Held',
      announced: 'Announced',
      proposals: 'Open to proposals',
    },
    roadmapDetails: {
      trickOrRun: {
        title: 'Trick-or-run',
        description:
          'Players collected and delivered specified items at this autumn event.',
        link: 'Event results',
      },
      winterEvent: {
        title: 'Winter event',
        description:
          'The November results post mentioned a major winter event in the works.',
        link: 'Report mentioning the winter event',
      },
      conceptServer: {
        title: 'Propose a concept server',
        description:
          'Players can pitch a new way to play for the server team to review.',
        link: 'How to submit a proposal',
      },
    },
  },
  'zh-cn': {
    navigation: '本页目录',
    contributors: '贡献者',
    roadmap: '路线图',
    history: '活动记录',
    playerName: 'Minecraft ID',
    skinAlt: '{name} 的 Minecraft 皮肤头像',
    announceLink: 'Discord 公告',
    discordNote: '加入官方 Discord 服务器即可查看帖子。',
    profileDetails: {
      chatBridge: '制作了连接游戏内聊天与 Discord 的系统。',
      raceAnnounce: '发布了替代赛艇比赛的公告，并介绍了比赛场地。',
      discordRoles: '创建了用于通报故障和服务器停机的 Discord 身份组。',
      technicalLecture: '发布了首场技术讲座的通知，主题是服务器和互联网。',
      summerStall: '发布了将在 2022 年夏日祭摆摊的消息。',
    },
    boatCourse: '建造了公告中介绍的替代赛艇比赛场地。',
    festival: {
      title: '夏日祭的幕后贡献者',
      description: '玩家分工筹备烟花、赛道竞速、高尔夫和 PvP。',
      link: '活动结束后的致谢',
    },
    checkedDate: '截至 {date}',
    unscheduled: '日期尚未公布',
    status: { held: '已举办', announced: '已预告', proposals: '征集提案' },
    roadmapDetails: {
      trickOrRun: {
        title: 'Trick-or-run',
        description: '在这场秋季活动中，玩家收集并提交了指定物品。',
        link: '活动结果',
      },
      winterEvent: {
        title: '冬季活动',
        description: '11 月发布的活动结果提到了正在筹划的冬季大型活动。',
        link: '提及冬季活动的公告',
      },
      conceptServer: {
        title: '玩法概念服提案',
        description: '玩家可以提出新的玩法，由服务器运营团队审核。',
        link: '查看提交流程',
      },
    },
  },
  es: {
    navigation: 'En esta página',
    contributors: 'Colaboradores',
    roadmap: 'Hoja de ruta',
    history: 'Historial de actividades',
    playerName: 'ID de Minecraft',
    skinAlt: 'Cara de la skin de Minecraft de {name}',
    announceLink: 'Anuncio en Discord',
    discordNote:
      'Para leer las publicaciones, únete al servidor oficial de Discord.',
    profileDetails: {
      chatBridge: 'Creó el sistema que conecta el chat del juego con Discord.',
      raceAnnounce:
        'Anunció la carrera de botes alternativa y presentó su recinto.',
      discordRoles:
        'Creó roles de Discord para avisar sobre problemas y caídas del servidor.',
      technicalLecture:
        'Anunció la primera charla técnica sobre servidores e Internet.',
      summerStall:
        'Anunció que tendría un puesto en el Festival de Verano de 2022.',
    },
    boatCourse:
      'Construyó el circuito anunciado como sede de la carrera de botes alternativa.',
    festival: {
      title: 'Quienes hicieron posible el festival de verano',
      description:
        'Los jugadores se repartieron la preparación de los fuegos artificiales, las carreras, el golf y el PvP.',
      link: 'Agradecimientos tras el festival',
    },
    checkedDate: 'Al {date}',
    unscheduled: 'Fecha sin anunciar',
    status: {
      held: 'Celebrado',
      announced: 'Anunciado',
      proposals: 'Se aceptan propuestas',
    },
    roadmapDetails: {
      trickOrRun: {
        title: 'Trick-or-run',
        description:
          'En este evento de otoño, los jugadores reunieron y entregaron objetos específicos.',
        link: 'Resultados del evento',
      },
      winterEvent: {
        title: 'Evento de invierno',
        description:
          'El informe de resultados de noviembre mencionó que se estaba preparando un gran evento de invierno.',
        link: 'Informe que menciona el evento de invierno',
      },
      conceptServer: {
        title: 'Propuestas de servidores temáticos',
        description:
          'Los jugadores pueden proponer nuevas formas de jugar para que las evalúe el equipo del servidor.',
        link: 'Cómo enviar una propuesta',
      },
    },
  },
  pt: {
    navigation: 'Nesta página',
    contributors: 'Colaboradores',
    roadmap: 'Roteiro',
    history: 'Histórico de atividades',
    playerName: 'ID do Minecraft',
    skinAlt: 'Rosto da skin de Minecraft de {name}',
    announceLink: 'Anúncio no Discord',
    discordNote:
      'Entre no servidor oficial do Discord para ler as publicações.',
    profileDetails: {
      chatBridge: 'Criou o sistema que conecta o chat do jogo ao Discord.',
      raceAnnounce:
        'Anunciou a corrida alternativa de barcos e apresentou a pista.',
      discordRoles:
        'Criou cargos no Discord para avisar sobre problemas e quedas do servidor.',
      technicalLecture:
        'Anunciou a primeira palestra técnica sobre servidores e internet.',
      summerStall:
        'Anunciou que teria uma barraca no Festival de Verão de 2022.',
    },
    boatCourse:
      'Construiu a pista anunciada como local da corrida alternativa de barcos.',
    festival: {
      title: 'Quem fez o festival de verão acontecer',
      description:
        'Jogadores dividiram a preparação dos fogos de artifício, das corridas, do golfe e do PvP.',
      link: 'Agradecimentos após o festival',
    },
    checkedDate: 'Em {date}',
    unscheduled: 'Data ainda não anunciada',
    status: {
      held: 'Realizado',
      announced: 'Anunciado',
      proposals: 'Aberto a propostas',
    },
    roadmapDetails: {
      trickOrRun: {
        title: 'Trick-or-run',
        description:
          'Neste evento de outono, os jogadores coletaram e entregaram itens específicos.',
        link: 'Resultados do evento',
      },
      winterEvent: {
        title: 'Evento de inverno',
        description:
          'A publicação de resultados de novembro mencionou um grande evento de inverno em preparação.',
        link: 'Publicação que menciona o evento de inverno',
      },
      conceptServer: {
        title: 'Propostas de servidores temáticos',
        description:
          'Jogadores podem sugerir novas formas de jogar para a equipe do servidor avaliar.',
        link: 'Como enviar uma proposta',
      },
    },
  },
  fr: {
    navigation: 'Sur cette page',
    contributors: 'Contributeurs',
    roadmap: 'Feuille de route',
    history: 'Historique des activités',
    playerName: 'ID Minecraft',
    skinAlt: 'Visage du skin Minecraft de {name}',
    announceLink: 'Annonce sur Discord',
    discordNote:
      'Rejoignez le serveur Discord officiel pour lire les publications.',
    profileDetails: {
      chatBridge: 'A créé le système qui relie le chat du jeu à Discord.',
      raceAnnounce:
        'A annoncé la course de bateaux de remplacement et présenté son parcours.',
      discordRoles:
        'A créé des rôles Discord pour signaler les problèmes et les arrêts du serveur.',
      technicalLecture:
        'A annoncé la première présentation technique sur les serveurs et Internet.',
      summerStall: 'A annoncé la tenue d’un stand au festival d’été de 2022.',
    },
    boatCourse:
      'A construit le parcours annoncé pour la course de bateaux de remplacement.',
    festival: {
      title: 'Les personnes derrière le festival d’été',
      description:
        'Les joueurs se sont partagé la préparation des feux d’artifice, des courses, du golf et du PvP.',
      link: 'Remerciements après le festival',
    },
    checkedDate: 'Au {date}',
    unscheduled: 'Date non annoncée',
    status: {
      held: 'Terminé',
      announced: 'Annoncé',
      proposals: 'Propositions ouvertes',
    },
    roadmapDetails: {
      trickOrRun: {
        title: 'Trick-or-run',
        description:
          'Lors de cet événement d’automne, les joueurs ont récolté et livré des objets précis.',
        link: 'Résultats de l’événement',
      },
      winterEvent: {
        title: 'Événement d’hiver',
        description:
          'La publication des résultats de novembre a évoqué un grand événement d’hiver en préparation.',
        link: 'Compte rendu évoquant l’événement d’hiver',
      },
      conceptServer: {
        title: 'Proposer un serveur thématique',
        description:
          'Les joueurs peuvent proposer de nouvelles façons de jouer à l’équipe du serveur.',
        link: 'Comment soumettre une proposition',
      },
    },
  },
  ko: {
    navigation: '이 페이지의 목차',
    contributors: '기여자',
    roadmap: '로드맵',
    history: '활동 기록',
    playerName: 'Minecraft ID',
    skinAlt: '{name}의 Minecraft 스킨 얼굴',
    announceLink: 'Discord 공지',
    discordNote: '공식 Discord 서버에 가입하면 게시물을 읽을 수 있습니다.',
    profileDetails: {
      chatBridge: '게임 안의 채팅과 Discord를 연동하는 시스템을 만들었습니다.',
      raceAnnounce: '대체 보트 경주를 공지하고 경기장을 안내했습니다.',
      discordRoles: '문제나 서버 중단을 알리는 Discord 역할을 만들었습니다.',
      technicalLecture:
        '서버와 인터넷을 주제로 한 첫 기술 강연을 안내했습니다.',
      summerStall: '2022년 여름 축제에 부스를 연다고 안내했습니다.',
    },
    boatCourse: '대체 보트 경주의 경기장으로 안내된 코스를 지었습니다.',
    festival: {
      title: '여름 축제를 만든 사람들',
      description:
        '플레이어들이 불꽃놀이, 서킷 경주, 골프, PvP 준비를 나누어 맡았습니다.',
      link: '축제 후기와 감사 인사',
    },
    checkedDate: '{date} 기준',
    unscheduled: '일정 미발표',
    status: {
      held: '개최 완료',
      announced: '개최 예고',
      proposals: '제안 접수',
    },
    roadmapDetails: {
      trickOrRun: {
        title: 'Trick-or-run',
        description: '지정된 아이템을 모아 제출하는 가을 이벤트를 열었습니다.',
        link: '이벤트 결과',
      },
      winterEvent: {
        title: '겨울 이벤트',
        description:
          '11월 결과 보고에서 다음 대규모 겨울 이벤트의 기획을 언급했습니다.',
        link: '겨울 이벤트가 언급된 보고',
      },
      conceptServer: {
        title: '콘셉트 서버 제안',
        description:
          '플레이어가 새로운 플레이 방식을 제안하면 운영팀이 내용을 검토합니다.',
        link: '제안 방법 안내',
      },
    },
  },
  de: {
    navigation: 'Auf dieser Seite',
    contributors: 'Mitwirkende',
    roadmap: 'Roadmap',
    history: 'Chronik',
    playerName: 'Minecraft-ID',
    skinAlt: 'Gesicht des Minecraft-Skins von {name}',
    announceLink: 'Ankündigung auf Discord',
    discordNote:
      'Tritt dem offiziellen Discord-Server bei, um die Beiträge zu lesen.',
    profileDetails: {
      chatBridge:
        'Entwickelte das System, das den Spielchat mit Discord verbindet.',
      raceAnnounce:
        'Kündigte das alternative Bootsrennen an und stellte die Strecke vor.',
      discordRoles:
        'Erstellte Discord-Rollen für Meldungen über Probleme und Serverausfälle.',
      technicalLecture:
        'Kündigte den ersten technischen Vortrag über Server und das Internet an.',
      summerStall: 'Kündigte einen Stand auf dem Sommerfest 2022 an.',
    },
    boatCourse:
      'Baute die Strecke, die für das alternative Bootsrennen angekündigt wurde.',
    festival: {
      title: 'Die Menschen hinter dem Sommerfest',
      description:
        'Spieler teilten sich die Vorbereitung von Feuerwerk, Rundstreckenrennen, Golf und PvP.',
      link: 'Danksagung nach dem Fest',
    },
    checkedDate: 'Stand {date}',
    unscheduled: 'Termin noch offen',
    status: {
      held: 'Fand statt',
      announced: 'Angekündigt',
      proposals: 'Vorschläge willkommen',
    },
    roadmapDetails: {
      trickOrRun: {
        title: 'Trick-or-run',
        description:
          'Bei diesem Herbstevent sammelten Spieler vorgegebene Gegenstände und lieferten sie ab.',
        link: 'Ergebnisse des Events',
      },
      winterEvent: {
        title: 'Winterevent',
        description:
          'Im Ergebnisbericht vom November wurde ein großes Winterevent in Aussicht gestellt.',
        link: 'Bericht mit dem Hinweis auf das Winterevent',
      },
      conceptServer: {
        title: 'Vorschläge für Konzeptserver',
        description:
          'Spieler können dem Serverteam neue Spielkonzepte zur Prüfung vorschlagen.',
        link: 'So reichst du einen Vorschlag ein',
      },
    },
  },
  ru: {
    navigation: 'На этой странице',
    contributors: 'Участники',
    roadmap: 'Дорожная карта',
    history: 'Хроника',
    playerName: 'ID в Minecraft',
    skinAlt: 'Лицо скина {name} в Minecraft',
    announceLink: 'Объявление в Discord',
    discordNote:
      'Чтобы прочитать публикации, присоединяйтесь к официальному серверу Discord.',
    profileDetails: {
      chatBridge: 'Создал систему, которая связывает игровой чат с Discord.',
      raceAnnounce:
        'Объявил об альтернативной гонке на лодках и представил трассу.',
      discordRoles:
        'Создал роли Discord для сообщений о неполадках и остановках сервера.',
      technicalLecture:
        'Анонсировал первую техническую лекцию о серверах и Интернете.',
      summerStall:
        'Объявил об участии со своим прилавком на летнем фестивале 2022 года.',
    },
    boatCourse:
      'Построил трассу, которую объявили местом проведения альтернативной гонки на лодках.',
    festival: {
      title: 'Кто помог провести летний фестиваль',
      description:
        'Игроки разделили подготовку фейерверков, гонок, гольфа и PvP.',
      link: 'Благодарности после фестиваля',
    },
    checkedDate: 'По состоянию на {date}',
    unscheduled: 'Дата пока не объявлена',
    status: {
      held: 'Состоялось',
      announced: 'Анонсировано',
      proposals: 'Приём предложений',
    },
    roadmapDetails: {
      trickOrRun: {
        title: 'Trick-or-run',
        description:
          'На этом осеннем событии игроки собирали и сдавали указанные предметы.',
        link: 'Итоги события',
      },
      winterEvent: {
        title: 'Зимнее событие',
        description:
          'В ноябрьской публикации об итогах упоминалось крупное зимнее событие, которое готовят организаторы.',
        link: 'Публикация с упоминанием зимнего события',
      },
      conceptServer: {
        title: 'Предложения для тематических серверов',
        description:
          'Игроки могут предлагать новые способы игры, а команда сервера рассмотрит идеи.',
        link: 'Как отправить предложение',
      },
    },
  },
}
