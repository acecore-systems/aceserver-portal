import type { Locale } from '../i18n/config'

type Copy = {
  source: string
  ai: string
  custom: string
  title: string
  hint: string
  file: string
  loading: string
  ready: string
  error: string
  privacy: string
  downloadHint: string
}
const copy = {
  ja: {
    source: '始め方',
    ai: 'AIで作る',
    custom: '自作スキンを編集',
    title: '自作スキンをアップロードして編集',
    hint: 'スキンと同じ腕のタイプを選び、PNGを読み込むと編集できます。新しいファイルを読み込むと、現在のスキンと編集履歴が入れ替わります。必要な作品は先にPNGで保存してください。',
    file: 'スキンのPNG（64×64・1 MBまで）',
    loading: 'スキンを読み込んでいます。',
    ready:
      'スキンを読み込みました。下のエディターで編集し、PNGで保存できます。',
    error:
      '読み込めませんでした。基本レイヤーが不透明な64×64 PNG（1 MB以下）と腕のタイプを確認してください。現在のスキンは保持しています。',
    privacy:
      '読み込みと手での編集はブラウザ内で行います。AIへ送信するのは、別途同意してAI修正を実行したときだけです。ページを閉じる前にPNGで保存してください。',
    downloadHint: 'アップロードしたスキンは、編集後もPNGで保存できます。',
  },
  en: {
    source: 'Start with',
    ai: 'Create with AI',
    custom: 'Edit your own skin',
    title: 'Upload and edit your own skin',
    hint: 'Choose the matching arm type, then open your PNG to edit it. A new file replaces your current skin and undo history. Save any work you want to keep as a PNG first.',
    file: 'Skin PNG (64×64 · up to 1 MB)',
    loading: 'Loading your skin.',
    ready: 'Skin loaded. Edit it below and save a PNG.',
    error:
      'Could not load the skin. Check the arm type and use a 64×64 PNG up to 1 MB with an opaque base layer. Your current skin is safe.',
    privacy:
      'Loading and drawing happen in your browser. Your skin is sent to AI only when you separately consent and run an AI edit. Save a PNG before closing this page.',
    downloadHint: 'You can save your uploaded skin as a PNG after editing.',
  },
  'zh-cn': {
    source: '开始方式',
    ai: '用AI创建',
    custom: '编辑自己的皮肤',
    title: '上传并编辑自己的皮肤',
    hint: '选择与皮肤相同的手臂类型，再打开PNG进行编辑。新文件会替换当前皮肤和撤销记录。请先将需要保留的作品保存为PNG。',
    file: '皮肤PNG（64×64 · 最大1 MB）',
    loading: '正在读取皮肤。',
    ready: '皮肤已读取。可在下方编辑并保存PNG。',
    error:
      '无法读取。请确认手臂类型，并使用基础层不透明的64×64 PNG（不超过1 MB）。当前皮肤已保留。',
    privacy:
      '读取和手动编辑在浏览器内进行。只有另行同意并执行AI修改时才会将皮肤发送给AI。关闭页面前请保存PNG。',
    downloadHint: '上传的皮肤在编辑后也可保存为PNG。',
  },
  es: {
    source: 'Cómo empezar',
    ai: 'Crear con IA',
    custom: 'Editar mi skin',
    title: 'Sube y edita tu propia skin',
    hint: 'Elige el tipo de brazos de tu skin y abre el PNG para editarlo. Un nuevo archivo sustituye la skin y el historial actuales. Guarda antes como PNG el trabajo que quieras conservar.',
    file: 'PNG de skin (64×64 · hasta 1 MB)',
    loading: 'Cargando tu skin.',
    ready: 'Skin cargada. Edítala abajo y guarda un PNG.',
    error:
      'No se pudo cargar. Comprueba los brazos y usa un PNG de 64×64 de hasta 1 MB con la capa base opaca. Se conserva la skin actual.',
    privacy:
      'La carga y el dibujo se realizan en tu navegador. La skin solo se envía a la IA al dar tu consentimiento aparte y ejecutar una edición IA. Guarda un PNG antes de cerrar.',
    downloadHint: 'Puedes guardar la skin subida como PNG después de editarla.',
  },
  pt: {
    source: 'Como começar',
    ai: 'Criar com IA',
    custom: 'Editar minha skin',
    title: 'Envie e edite sua própria skin',
    hint: 'Escolha o tipo de braços da skin e abra o PNG para editar. Um novo arquivo substitui a skin e o histórico atuais. Salve antes em PNG o que deseja manter.',
    file: 'PNG da skin (64×64 · até 1 MB)',
    loading: 'Carregando sua skin.',
    ready: 'Skin carregada. Edite abaixo e salve um PNG.',
    error:
      'Não foi possível carregar. Confira os braços e use um PNG 64×64 de até 1 MB com a camada base opaca. A skin atual foi mantida.',
    privacy:
      'A leitura e o desenho ocorrem no navegador. A skin só é enviada à IA ao consentir separadamente e executar uma edição IA. Salve o PNG antes de fechar.',
    downloadHint: 'Você pode salvar a skin enviada como PNG após editar.',
  },
  fr: {
    source: 'Pour commencer',
    ai: 'Créer avec l’IA',
    custom: 'Modifier mon skin',
    title: 'Importez et modifiez votre skin',
    hint: 'Choisissez le type de bras correspondant puis ouvrez le PNG. Un nouveau fichier remplace le skin et son historique. Enregistrez d’abord en PNG le travail à conserver.',
    file: 'PNG du skin (64×64 · 1 Mo maximum)',
    loading: 'Chargement du skin.',
    ready: 'Skin chargé. Modifiez-le ci-dessous et enregistrez un PNG.',
    error:
      'Chargement impossible. Vérifiez les bras et utilisez un PNG 64×64 de 1 Mo maximum avec une couche de base opaque. Le skin actuel est conservé.',
    privacy:
      'La lecture et le dessin se font dans le navigateur. Le skin est envoyé à l’IA uniquement après un consentement distinct et une modification IA. Enregistrez le PNG avant de fermer.',
    downloadHint:
      'Vous pouvez enregistrer le skin importé en PNG après modification.',
  },
  ko: {
    source: '시작 방법',
    ai: 'AI로 만들기',
    custom: '내 스킨 편집',
    title: '내 스킨을 업로드하고 편집',
    hint: '스킨과 같은 팔 유형을 선택한 후 PNG를 열어 편집하세요. 새 파일은 현재 스킨과 편집 기록을 대체합니다. 보관할 작업은 먼저 PNG로 저장하세요.',
    file: '스킨 PNG (64×64 · 최대 1 MB)',
    loading: '스킨을 불러오는 중입니다.',
    ready: '스킨을 불러왔습니다. 아래에서 편집하고 PNG로 저장하세요.',
    error:
      '불러오지 못했습니다. 팔 유형과 기본 레이어가 불투명한 64×64 PNG(1 MB 이하)인지 확인하세요. 현재 스킨은 유지됩니다.',
    privacy:
      '불러오기와 수동 편집은 브라우저 안에서 진행됩니다. 별도로 동의하고 AI 수정을 실행할 때만 스킨이 AI로 전송됩니다. 페이지를 닫기 전에 PNG로 저장하세요.',
    downloadHint: '업로드한 스킨은 편집 후에도 PNG로 저장할 수 있습니다.',
  },
  de: {
    source: 'So startest du',
    ai: 'Mit KI erstellen',
    custom: 'Eigenen Skin bearbeiten',
    title: 'Eigenen Skin hochladen und bearbeiten',
    hint: 'Wähle den passenden Armtyp und öffne das PNG. Eine neue Datei ersetzt den aktuellen Skin und den Verlauf. Speichere gewünschte Änderungen vorher als PNG.',
    file: 'Skin-PNG (64×64 · bis zu 1 MB)',
    loading: 'Skin wird geladen.',
    ready: 'Skin geladen. Bearbeite ihn unten und speichere ein PNG.',
    error:
      'Laden fehlgeschlagen. Prüfe den Armtyp und verwende ein 64×64-PNG bis 1 MB mit undurchsichtiger Basisebene. Der aktuelle Skin bleibt erhalten.',
    privacy:
      'Laden und Zeichnen erfolgen im Browser. Der Skin wird erst nach gesonderter Zustimmung bei einer KI-Bearbeitung an die KI gesendet. Speichere vor dem Schließen ein PNG.',
    downloadHint:
      'Den hochgeladenen Skin kannst du nach der Bearbeitung als PNG speichern.',
  },
  ru: {
    source: 'С чего начать',
    ai: 'Создать с ИИ',
    custom: 'Изменить свой скин',
    title: 'Загрузите и отредактируйте свой скин',
    hint: 'Выберите подходящий тип рук и откройте PNG. Новый файл заменяет текущий скин и историю изменений. Сначала сохраните нужную работу в PNG.',
    file: 'PNG скина (64×64 · до 1 МБ)',
    loading: 'Загрузка скина.',
    ready: 'Скин загружен. Отредактируйте его ниже и сохраните PNG.',
    error:
      'Не удалось загрузить. Проверьте тип рук и используйте PNG 64×64 до 1 МБ с непрозрачным базовым слоем. Текущий скин сохранён.',
    privacy:
      'Загрузка и рисование выполняются в браузере. Скин отправляется ИИ только после отдельного согласия и запуска ИИ-правки. Сохраните PNG перед закрытием страницы.',
    downloadHint:
      'Загруженный скин можно сохранить в PNG после редактирования.',
  },
} satisfies Record<Locale, Copy>

export const getSkinUploadUi = (locale: Locale): Copy => copy[locale]
