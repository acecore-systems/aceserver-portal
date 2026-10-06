import type { Locale } from '../i18n/config.ts'

type Copy = {
  title: string
  intro: string
  make: string
  store: string
  all: string
  search: string
  placeholder: string
  newest: string
  free: string
  loading: string
  empty: string
  noMatches: string
  unavailable: string
  retry: string
  more: string
  preview: string
  download: string
  close: string
  publish: string
  name: string
  consent: string
  hint: string
  publishing: string
  published: string
  publishError: string
  remove: string
  removed: string
  report: string
  reason: string
  inappropriate: string
  rights: string
  other: string
  reported: string
  reportError: string
}

const copy = {
  ja: {
    title: 'スキンストア',
    intro: 'みんなが作ったスキンから、お気に入りを。すべて無料で使えます。',
    make: 'スキンを作る',
    store: 'ストアを見る',
    all: 'すべて',
    search: 'スキンを検索',
    placeholder: '名前で探す',
    newest: '新着順',
    free: '無料',
    loading: 'スキンを読み込んでいます。',
    empty: 'まだ公開されたスキンはありません。最初のスキンを作ってみませんか？',
    noMatches:
      '条件に合うスキンはありません。検索や腕のタイプを変えてみてください。',
    unavailable:
      'ストアを読み込めませんでした。時間をおいて再度お試しください。',
    retry: '再読み込み',
    more: 'もっと見る',
    preview: 'スキンを見る',
    download: 'PNGをダウンロード',
    close: '閉じる',
    publish: 'ストアに公開する',
    name: 'スキンの名前',
    consent:
      'このスキンを公開し、誰でも無料でダウンロードして使えることに同意します。',
    hint: '保存・公開するのはスキンと名前だけです。入力文や参考画像は公開しません。生成後24時間以内、この画面を開いている間に公開を取り消せます。',
    publishing: '公開しています。',
    published: 'ストアに公開しました。',
    publishError:
      '公開を完了できませんでした。スキンはこの画面に保持しています。公開できるのは生成後24時間以内です。',
    remove: '公開を取り消す',
    removed: '公開を取り消しました。',
    report: '通報する',
    reason: '通報の理由',
    inappropriate: '不適切な内容',
    rights: '権利に関する問題',
    other: 'その他',
    reported: '通報を受け付けました。運営が確認します。',
    reportError:
      '通報できませんでした。同じスキンへの通報は1日1回、合計1日5回までです。',
  },
  en: {
    title: 'Skin Store',
    intro:
      'Find your next look among skins made by the community. Every skin is free to download.',
    make: 'Create a skin',
    store: 'Browse skins',
    all: 'All',
    search: 'Search skins',
    placeholder: 'Search by name',
    newest: 'Newest first',
    free: 'Free',
    loading: 'Loading skins.',
    empty: 'No skins have been published yet. Create the first one!',
    noMatches: 'No matching skins. Try another name or arm type.',
    unavailable: 'The store could not be loaded. Please try again later.',
    retry: 'Reload',
    more: 'Load more',
    preview: 'View skin',
    download: 'Download PNG',
    close: 'Close',
    publish: 'Publish to the store',
    name: 'Skin name',
    consent:
      'I agree to publish this skin so anyone can download and use it for free.',
    hint: 'Only the skin and its name are saved and published. Your prompt and reference image stay private. You can withdraw the skin on this screen within 24 hours of generation.',
    publishing: 'Publishing.',
    published: 'Published to the store.',
    publishError:
      'Could not finish publishing. Your skin remains on this screen. Publication is available for 24 hours after generation.',
    remove: 'Withdraw skin',
    removed: 'Skin withdrawn.',
    report: 'Report',
    reason: 'Report reason',
    inappropriate: 'Inappropriate content',
    rights: 'Rights concern',
    other: 'Other',
    reported: 'Report received. The team will review it.',
    reportError:
      'Could not report. Limit: one report per skin per day, five reports per day in total.',
  },
  'zh-cn': {
    title: '皮肤商店',
    intro: '从大家制作的皮肤中找到喜欢的造型。所有皮肤都可免费下载。',
    make: '制作皮肤',
    store: '浏览商店',
    all: '全部',
    search: '搜索皮肤',
    placeholder: '按名称搜索',
    newest: '最新发布',
    free: '免费',
    loading: '正在加载皮肤。',
    empty: '还没有公开的皮肤。来制作第一个吧！',
    noMatches: '没有符合条件的皮肤。请尝试其他名称或手臂类型。',
    unavailable: '无法加载商店。请稍后再试。',
    retry: '重新加载',
    more: '加载更多',
    preview: '查看皮肤',
    download: '下载PNG',
    close: '关闭',
    publish: '发布到商店',
    name: '皮肤名称',
    consent: '我同意公开此皮肤，让任何人免费下载和使用。',
    hint: '仅保存和公开皮肤及名称。描述和参考图片不会公开。可在生成后24小时内于此页面撤回。',
    publishing: '正在发布。',
    published: '已发布到商店。',
    publishError: '无法完成发布。皮肤仍保留在此页面。可在生成后24小时内发布。',
    remove: '撤回发布',
    removed: '已撤回发布。',
    report: '举报',
    reason: '举报原因',
    inappropriate: '不当内容',
    rights: '权利问题',
    other: '其他',
    reported: '已收到举报，运营团队将进行检查。',
    reportError: '无法举报。每个皮肤每天限1次，每天共限5次。',
  },
  es: {
    title: 'Tienda de skins',
    intro:
      'Encuentra tu próximo estilo entre las skins de la comunidad. Todas se descargan gratis.',
    make: 'Crear una skin',
    store: 'Ver la tienda',
    all: 'Todas',
    search: 'Buscar skins',
    placeholder: 'Buscar por nombre',
    newest: 'Más recientes',
    free: 'Gratis',
    loading: 'Cargando skins.',
    empty: 'Todavía no hay skins publicadas. ¡Crea la primera!',
    noMatches: 'No hay coincidencias. Prueba otro nombre o tipo de brazos.',
    unavailable: 'No se pudo cargar la tienda. Inténtalo más tarde.',
    retry: 'Recargar',
    more: 'Ver más',
    preview: 'Ver skin',
    download: 'Descargar PNG',
    close: 'Cerrar',
    publish: 'Publicar en la tienda',
    name: 'Nombre de la skin',
    consent:
      'Acepto publicar esta skin para que cualquiera la descargue y use gratis.',
    hint: 'Solo se guardan y publican la skin y su nombre. El texto y la referencia no se publican. Puedes retirarla en esta pantalla dentro de las 24 horas posteriores a su generación.',
    publishing: 'Publicando.',
    published: 'Publicada en la tienda.',
    publishError:
      'No se pudo publicar. La skin sigue en esta pantalla. Puedes publicarla durante 24 horas tras generarla.',
    remove: 'Retirar skin',
    removed: 'Skin retirada.',
    report: 'Reportar',
    reason: 'Motivo',
    inappropriate: 'Contenido inapropiado',
    rights: 'Problema de derechos',
    other: 'Otro',
    reported: 'Reporte recibido. El equipo lo revisará.',
    reportError:
      'No se pudo reportar. Límite: uno por skin al día, cinco al día en total.',
  },
  pt: {
    title: 'Loja de skins',
    intro:
      'Encontre seu próximo visual nas skins da comunidade. Todas são gratuitas para baixar.',
    make: 'Criar uma skin',
    store: 'Ver a loja',
    all: 'Todas',
    search: 'Buscar skins',
    placeholder: 'Buscar por nome',
    newest: 'Mais recentes',
    free: 'Grátis',
    loading: 'Carregando skins.',
    empty: 'Ainda não há skins publicadas. Crie a primeira!',
    noMatches: 'Nenhuma skin encontrada. Tente outro nome ou tipo de braço.',
    unavailable: 'Não foi possível carregar a loja. Tente mais tarde.',
    retry: 'Recarregar',
    more: 'Ver mais',
    preview: 'Ver skin',
    download: 'Baixar PNG',
    close: 'Fechar',
    publish: 'Publicar na loja',
    name: 'Nome da skin',
    consent:
      'Concordo em publicar esta skin para que qualquer pessoa possa baixá-la e usá-la gratuitamente.',
    hint: 'Somente a skin e seu nome são salvos e publicados. O texto e a referência não são publicados. Você pode retirar a skin nesta tela em até 24 horas após a geração.',
    publishing: 'Publicando.',
    published: 'Publicada na loja.',
    publishError:
      'Não foi possível publicar. A skin continua nesta tela. A publicação está disponível por 24 horas após a geração.',
    remove: 'Retirar skin',
    removed: 'Skin retirada.',
    report: 'Denunciar',
    reason: 'Motivo',
    inappropriate: 'Conteúdo inadequado',
    rights: 'Problema de direitos',
    other: 'Outro',
    reported: 'Denúncia recebida. A equipe irá analisá-la.',
    reportError:
      'Não foi possível denunciar. Limite: uma denúncia por skin por dia, cinco por dia no total.',
  },
  fr: {
    title: 'Boutique de skins',
    intro:
      'Trouvez votre prochain style parmi les skins de la communauté. Tous sont gratuits à télécharger.',
    make: 'Créer un skin',
    store: 'Voir la boutique',
    all: 'Tous',
    search: 'Rechercher des skins',
    placeholder: 'Rechercher par nom',
    newest: 'Les plus récents',
    free: 'Gratuit',
    loading: 'Chargement des skins.',
    empty: 'Aucun skin publié pour le moment. Créez le premier !',
    noMatches: 'Aucun résultat. Essayez un autre nom ou type de bras.',
    unavailable: 'Impossible de charger la boutique. Réessayez plus tard.',
    retry: 'Recharger',
    more: 'Voir plus',
    preview: 'Voir le skin',
    download: 'Télécharger le PNG',
    close: 'Fermer',
    publish: 'Publier dans la boutique',
    name: 'Nom du skin',
    consent:
      'Je consens à publier ce skin pour que tout le monde puisse le télécharger et l’utiliser gratuitement.',
    hint: 'Seuls le skin et son nom sont enregistrés et publiés. Le texte et l’image de référence restent privés. Vous pouvez retirer le skin sur cet écran dans les 24 heures suivant sa création.',
    publishing: 'Publication en cours.',
    published: 'Publié dans la boutique.',
    publishError:
      'Publication impossible. Le skin reste sur cet écran. Vous pouvez le publier pendant 24 heures après sa création.',
    remove: 'Retirer le skin',
    removed: 'Skin retiré.',
    report: 'Signaler',
    reason: 'Motif',
    inappropriate: 'Contenu inapproprié',
    rights: 'Problème de droits',
    other: 'Autre',
    reported: 'Signalement reçu. L’équipe le vérifiera.',
    reportError:
      'Signalement impossible. Limite : un par skin et par jour, cinq par jour au total.',
  },
  ko: {
    title: '스킨 스토어',
    intro:
      '커뮤니티가 만든 스킨에서 마음에 드는 스타일을 찾아보세요. 모두 무료로 다운로드할 수 있습니다.',
    make: '스킨 만들기',
    store: '스토어 보기',
    all: '전체',
    search: '스킨 검색',
    placeholder: '이름으로 검색',
    newest: '최신순',
    free: '무료',
    loading: '스킨을 불러오는 중입니다.',
    empty: '아직 공개된 스킨이 없습니다. 첫 스킨을 만들어 보세요!',
    noMatches: '일치하는 스킨이 없습니다. 이름이나 팔 유형을 바꿔보세요.',
    unavailable: '스토어를 불러오지 못했습니다. 나중에 다시 시도하세요.',
    retry: '다시 불러오기',
    more: '더 보기',
    preview: '스킨 보기',
    download: 'PNG 다운로드',
    close: '닫기',
    publish: '스토어에 공개',
    name: '스킨 이름',
    consent:
      '이 스킨을 공개하여 누구나 무료로 다운로드하고 사용할 수 있음에 동의합니다.',
    hint: '스킨과 이름만 저장하고 공개합니다. 설명과 참고 이미지는 공개하지 않습니다. 생성 후 24시간 이내에 이 화면에서 공개를 취소할 수 있습니다.',
    publishing: '공개 중입니다.',
    published: '스토어에 공개했습니다.',
    publishError:
      '공개를 완료하지 못했습니다. 스킨은 이 화면에 보관됩니다. 생성 후 24시간 이내에 공개할 수 있습니다.',
    remove: '공개 취소',
    removed: '공개를 취소했습니다.',
    report: '신고',
    reason: '신고 사유',
    inappropriate: '부적절한 콘텐츠',
    rights: '권리 문제',
    other: '기타',
    reported: '신고를 접수했습니다. 운영팀이 확인합니다.',
    reportError:
      '신고하지 못했습니다. 스킨당 하루 1회, 하루 총 5회까지 가능합니다.',
  },
  de: {
    title: 'Skin-Store',
    intro:
      'Finde deinen nächsten Look unter den Skins der Community. Alle Downloads sind kostenlos.',
    make: 'Skin erstellen',
    store: 'Store ansehen',
    all: 'Alle',
    search: 'Skins suchen',
    placeholder: 'Nach Namen suchen',
    newest: 'Neueste zuerst',
    free: 'Kostenlos',
    loading: 'Skins werden geladen.',
    empty: 'Noch keine veröffentlichten Skins. Erstelle den ersten!',
    noMatches:
      'Keine passenden Skins. Versuche einen anderen Namen oder Armtyp.',
    unavailable:
      'Der Store konnte nicht geladen werden. Versuche es später erneut.',
    retry: 'Neu laden',
    more: 'Mehr laden',
    preview: 'Skin ansehen',
    download: 'PNG herunterladen',
    close: 'Schließen',
    publish: 'Im Store veröffentlichen',
    name: 'Skin-Name',
    consent:
      'Ich stimme zu, diesen Skin zu veröffentlichen, damit ihn jeder kostenlos herunterladen und verwenden kann.',
    hint: 'Nur Skin und Name werden gespeichert und veröffentlicht. Text und Referenzbild bleiben privat. Du kannst den Skin hier innerhalb von 24 Stunden nach der Erstellung zurückziehen.',
    publishing: 'Wird veröffentlicht.',
    published: 'Im Store veröffentlicht.',
    publishError:
      'Veröffentlichung fehlgeschlagen. Der Skin bleibt auf diesem Bildschirm. Er kann 24 Stunden nach Erstellung veröffentlicht werden.',
    remove: 'Skin zurückziehen',
    removed: 'Skin zurückgezogen.',
    report: 'Melden',
    reason: 'Grund',
    inappropriate: 'Unangemessener Inhalt',
    rights: 'Rechteproblem',
    other: 'Sonstiges',
    reported: 'Meldung erhalten. Das Team prüft sie.',
    reportError:
      'Meldung fehlgeschlagen. Limit: eine pro Skin und Tag, insgesamt fünf pro Tag.',
  },
  ru: {
    title: 'Магазин скинов',
    intro:
      'Найдите новый образ среди скинов сообщества. Все скины можно скачать бесплатно.',
    make: 'Создать скин',
    store: 'Открыть магазин',
    all: 'Все',
    search: 'Поиск скинов',
    placeholder: 'Поиск по имени',
    newest: 'Сначала новые',
    free: 'Бесплатно',
    loading: 'Загрузка скинов.',
    empty: 'Пока нет опубликованных скинов. Создайте первый!',
    noMatches: 'Нет подходящих скинов. Попробуйте другое имя или тип рук.',
    unavailable: 'Не удалось загрузить магазин. Попробуйте позже.',
    retry: 'Обновить',
    more: 'Показать ещё',
    preview: 'Посмотреть скин',
    download: 'Скачать PNG',
    close: 'Закрыть',
    publish: 'Опубликовать в магазине',
    name: 'Название скина',
    consent:
      'Я согласен опубликовать этот скин, чтобы любой мог бесплатно скачать и использовать его.',
    hint: 'Сохраняются и публикуются только скин и его название. Текст и образец не публикуются. Отозвать скин можно на этом экране в течение 24 часов после создания.',
    publishing: 'Публикация.',
    published: 'Опубликовано в магазине.',
    publishError:
      'Не удалось опубликовать. Скин остаётся на этом экране. Публикация доступна 24 часа после создания.',
    remove: 'Отозвать скин',
    removed: 'Скин отозван.',
    report: 'Пожаловаться',
    reason: 'Причина',
    inappropriate: 'Неприемлемое содержимое',
    rights: 'Нарушение прав',
    other: 'Другое',
    reported: 'Жалоба получена. Команда проверит её.',
    reportError:
      'Не удалось отправить жалобу. Лимит: одна на скин в день, всего пять в день.',
  },
} satisfies Record<Locale, Copy>

export function getSkinStoreUi(locale: Locale) {
  return copy[locale]
}
