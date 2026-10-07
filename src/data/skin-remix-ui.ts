import type { Locale } from '../i18n/config'

type Copy = {
  edit: string
  title: string
  source: string
  loading: string
  hint: string
  error: string
  suffix: string
  publish: string
  publishHint: string
  publishError: string
  rateLimit: string
  published: string
}
const copy = {
  ja: {
    edit: '複製して編集',
    title: 'ストアのスキンを複製して編集',
    source: '複製元',
    loading: '編集用のコピーを読み込んでいます。',
    hint: '元の作品はそのまま残ります。3Dで自由に編集し、PNGで保存したり、別の作品としてストアに公開できます。',
    error:
      'コピーを読み込めませんでした。元の作品が非公開になった可能性があります。ストアで確認するか、再読み込みしてください。',
    suffix: 'のコピー',
    publish: '別の作品として公開する',
    publishHint:
      '元の作品を上書きせず、新しい作品として公開します。公開と取り消しは複製後24時間以内、この画面を開いている間に行えます。',
    publishError:
      '公開を完了できませんでした。複製後24時間以内で、元の作品が公開中か確認してください。編集したスキンはPNGで保存できます。',
    rateLimit:
      '複製したスキンの公開は1日5作品、1分に1作品までです。サイト全体の上限に達した場合も、時間をおいてお試しください。PNG保存は引き続き使えます。',
    published: '別の作品としてストアに公開しました。',
  },
  en: {
    edit: 'Copy and edit',
    title: 'Edit a copy from the store',
    source: 'Original skin',
    loading: 'Loading your editable copy.',
    hint: 'The original stays unchanged. Edit the copy in 3D, save a PNG or publish it as a separate skin.',
    error:
      'Could not load the copy. The original may no longer be public. Check the store or reload.',
    suffix: ' (copy)',
    publish: 'Publish as a new skin',
    publishHint:
      'This creates a separate skin and keeps the original unchanged. Publish or withdraw within 24 hours of copying while this page remains open.',
    publishError:
      'Could not publish. Check that the copy is less than 24 hours old and the original is still public. You can save your edited skin as a PNG.',
    rateLimit:
      'Copied skins are limited to five publications per day and one per minute. Try later if the site limit is reached. PNG downloads remain available.',
    published: 'Published to the store as a separate skin.',
  },
  'zh-cn': {
    edit: '复制并编辑',
    title: '编辑商店皮肤的副本',
    source: '原皮肤',
    loading: '正在加载可编辑的副本。',
    hint: '原作品保持不变。可以在3D中编辑副本、保存PNG，或作为新作品发布到商店。',
    error: '无法加载副本。原作品可能已不再公开。请查看商店或重新加载。',
    suffix: '（副本）',
    publish: '作为新作品发布',
    publishHint:
      '将创建独立作品，不覆盖原作品。复制后24小时内且此页面保持打开时，可以发布或撤回。',
    publishError:
      '无法发布。请确认复制后未超过24小时，且原作品仍公开。编辑的皮肤仍可保存为PNG。',
    rateLimit:
      '副本每天最多发布5个，每分钟1个。网站总额度用完时请稍后重试。仍可下载PNG。',
    published: '已作为独立作品发布到商店。',
  },
  es: {
    edit: 'Copiar y editar',
    title: 'Editar una copia de la tienda',
    source: 'Skin original',
    loading: 'Cargando tu copia editable.',
    hint: 'El original se conserva. Edita la copia en 3D, guarda un PNG o publícala como otra skin.',
    error:
      'No se pudo cargar la copia. Puede que el original ya no sea público. Consulta la tienda o recarga.',
    suffix: ' (copia)',
    publish: 'Publicar como nueva skin',
    publishHint:
      'Se crea otra skin sin sobrescribir el original. Puedes publicar o retirar durante 24 horas tras copiar, con esta página abierta.',
    publishError:
      'No se pudo publicar. Comprueba que copiaste hace menos de 24 horas y que el original sigue público. Puedes guardar el PNG editado.',
    rateLimit:
      'Límite de copias: cinco publicaciones al día y una por minuto. Si se alcanza el límite del sitio, prueba más tarde. Puedes descargar el PNG.',
    published: 'Publicada en la tienda como otra skin.',
  },
  pt: {
    edit: 'Copiar e editar',
    title: 'Editar uma cópia da loja',
    source: 'Skin original',
    loading: 'Carregando sua cópia editável.',
    hint: 'O original fica intacto. Edite a cópia em 3D, salve um PNG ou publique como outra skin.',
    error:
      'Não foi possível carregar a cópia. O original pode não estar mais público. Confira a loja ou recarregue.',
    suffix: ' (cópia)',
    publish: 'Publicar como nova skin',
    publishHint:
      'Cria outra skin sem sobrescrever o original. Publique ou retire em até 24 horas após copiar, enquanto esta página estiver aberta.',
    publishError:
      'Não foi possível publicar. Verifique se copiou há menos de 24 horas e se o original continua público. Você pode salvar o PNG editado.',
    rateLimit:
      'Cópias: cinco publicações por dia e uma por minuto. Tente mais tarde se o limite do site for atingido. O download do PNG continua disponível.',
    published: 'Publicada na loja como outra skin.',
  },
  fr: {
    edit: 'Copier et modifier',
    title: 'Modifier une copie de la boutique',
    source: 'Skin original',
    loading: 'Chargement de votre copie modifiable.',
    hint: 'L’original reste intact. Modifiez la copie en 3D, enregistrez un PNG ou publiez un nouveau skin.',
    error:
      'Impossible de charger la copie. L’original n’est peut-être plus public. Consultez la boutique ou rechargez.',
    suffix: ' (copie)',
    publish: 'Publier un nouveau skin',
    publishHint:
      'Crée un skin distinct sans écraser l’original. Publiez ou retirez-le dans les 24 heures suivant la copie, en gardant cette page ouverte.',
    publishError:
      'Publication impossible. Vérifiez que la copie a moins de 24 heures et que l’original est toujours public. Vous pouvez enregistrer le PNG modifié.',
    rateLimit:
      'Copies : cinq publications par jour et une par minute. Réessayez plus tard si le quota du site est atteint. Le PNG reste téléchargeable.',
    published: 'Publié dans la boutique comme un skin distinct.',
  },
  ko: {
    edit: '복사하여 편집',
    title: '스토어 스킨의 복사본 편집',
    source: '원본 스킨',
    loading: '편집할 복사본을 불러오는 중입니다.',
    hint: '원본은 그대로 유지됩니다. 3D에서 복사본을 편집하고 PNG로 저장하거나 별도의 스킨으로 공개하세요.',
    error:
      '복사본을 불러오지 못했습니다. 원본이 비공개로 바뀌었을 수 있습니다. 스토어를 확인하거나 다시 불러오세요.',
    suffix: ' (복사본)',
    publish: '새 스킨으로 공개',
    publishHint:
      '원본을 덮어쓰지 않고 별도의 스킨을 만듭니다. 복사 후 24시간 이내에 이 페이지가 열려 있으면 공개하거나 취소할 수 있습니다.',
    publishError:
      '공개하지 못했습니다. 복사 후 24시간 이내이고 원본이 공개 상태인지 확인하세요. 편집한 스킨은 PNG로 저장할 수 있습니다.',
    rateLimit:
      '복사한 스킨은 하루 5개, 1분에 1개까지 공개할 수 있습니다. 사이트 한도에 도달하면 나중에 다시 시도하세요. PNG 저장은 계속 가능합니다.',
    published: '별도의 스킨으로 스토어에 공개했습니다.',
  },
  de: {
    edit: 'Kopieren und bearbeiten',
    title: 'Eine Kopie aus dem Store bearbeiten',
    source: 'Original-Skin',
    loading: 'Deine bearbeitbare Kopie wird geladen.',
    hint: 'Das Original bleibt erhalten. Bearbeite die Kopie in 3D, speichere ein PNG oder veröffentliche einen neuen Skin.',
    error:
      'Kopie konnte nicht geladen werden. Das Original ist vielleicht nicht mehr öffentlich. Prüfe den Store oder lade erneut.',
    suffix: ' (Kopie)',
    publish: 'Als neuen Skin veröffentlichen',
    publishHint:
      'Erstellt einen separaten Skin, ohne das Original zu überschreiben. Veröffentlichung und Rücknahme sind 24 Stunden nach dem Kopieren möglich, solange diese Seite offen bleibt.',
    publishError:
      'Veröffentlichung fehlgeschlagen. Prüfe, ob die Kopie jünger als 24 Stunden und das Original noch öffentlich ist. Du kannst den bearbeiteten Skin als PNG speichern.',
    rateLimit:
      'Kopien: fünf Veröffentlichungen pro Tag und eine pro Minute. Versuche es später, wenn das Seitenlimit erreicht ist. PNG-Downloads bleiben verfügbar.',
    published: 'Als separaten Skin im Store veröffentlicht.',
  },
  ru: {
    edit: 'Копировать и редактировать',
    title: 'Редактирование копии из магазина',
    source: 'Исходный скин',
    loading: 'Загрузка редактируемой копии.',
    hint: 'Оригинал останется без изменений. Редактируйте копию в 3D, сохраняйте PNG или публикуйте её как отдельный скин.',
    error:
      'Не удалось загрузить копию. Возможно, оригинал больше не опубликован. Проверьте магазин или обновите страницу.',
    suffix: ' (копия)',
    publish: 'Опубликовать как новый скин',
    publishHint:
      'Создаётся отдельный скин без перезаписи оригинала. Публикация и отзыв доступны 24 часа после копирования, пока эта страница открыта.',
    publishError:
      'Не удалось опубликовать. Проверьте, что прошло менее 24 часов после копирования и оригинал ещё опубликован. Можно сохранить изменённый PNG.',
    rateLimit:
      'Копии: до пяти публикаций в день и одной в минуту. Если достигнут лимит сайта, попробуйте позже. Скачивание PNG остаётся доступным.',
    published: 'Опубликовано в магазине как отдельный скин.',
  },
} satisfies Record<Locale, Copy>

export function getSkinRemixUi(locale: Locale) {
  return copy[locale]
}
