import type { Locale } from '../i18n/config'

type EditorCopy = {
  title: string
  intro: string
  part: string
  face: string
  layer: string
  partNames: string[]
  tool: string
  toolNames: string[]
  color: string
  undo: string
  redo: string
  clearSelection: string
  selected: string
  editorHint: string
  baseHint: string
  canvas: string
  aiTitle: string
  aiHint: string
  scope: string
  scopeNames: string[]
  prompt: string
  placeholder: string
  edit: string
  editing: string
  busy: string
  consent: string
  privacy: string
  manualPublish: string
  noChanges: string
  edited: string
}
const copy = {
  ja: {
    title: 'スキンを編集',
    intro: '部位と面を選び、ピクセルを直接描き直せます。',
    part: '部位',
    face: '面',
    layer: 'レイヤー',
    partNames: ['頭', '胴体', '右腕', '左腕', '右脚', '左脚'],
    tool: '道具',
    toolNames: ['ペン', '塗りつぶし', '消しゴム', 'スポイト', '範囲選択'],
    color: '色',
    undo: '元に戻す',
    redo: 'やり直す',
    clearSelection: '選択を解除',
    selected: '選択範囲',
    editorHint:
      'ドラッグで描画・範囲選択。キーボードは矢印で移動し、Enterまたはスペースで操作できます。範囲選択中はShift＋矢印で広げられます。',
    baseHint:
      '基本レイヤーは透明にできません。消しゴムは外側レイヤーで使えます。',
    canvas: '選択した面のピクセルエディター',
    aiTitle: 'AIで部分修正',
    aiHint:
      '修正範囲を選んで、変えたい点を指示してください。範囲外はそのまま残ります。AI修正も生成と共通の利用上限に数えます。',
    scope: 'AIの修正範囲',
    scopeNames: [
      '選択した四角い範囲',
      '選択した面',
      'この部位の全ての面（選択レイヤー）',
    ],
    prompt: 'どこをどう変えますか？',
    placeholder: '例：目だけ青くする、袖の模様を星にする',
    edit: 'この範囲をAIで修正',
    editing: 'スキンを修正中',
    busy: '部分修正中です。1〜4分ほどかかることがあります。',
    consent:
      '現在のスキンと修正指示を、設定中のOpenAIまたはCloudflare Workers AIへ送ることに同意します。',
    privacy:
      '手で編集している間はAIへ送信しません。AI修正を実行したときだけ、現在のスキンと修正指示を送信します。編集履歴はこのページ内だけに保持し、閉じると消えます。',
    manualPublish:
      '手編集を含むスキンはPNGで保存できます。現在のストアはAI生成のみの作品に対応しています。元に戻すと、公開できる生成結果に戻せます。',
    noChanges: '変更はありませんでした。',
    edited: '修正できました。変更ピクセル数',
  },
  en: {
    title: 'Edit your skin',
    intro: 'Choose a body part and face, then draw directly on the pixels.',
    part: 'Body part',
    face: 'Face',
    layer: 'Layer',
    partNames: [
      'Head',
      'Torso',
      'Right arm',
      'Left arm',
      'Right leg',
      'Left leg',
    ],
    tool: 'Tool',
    toolNames: ['Pencil', 'Fill', 'Eraser', 'Eyedropper', 'Select area'],
    color: 'Color',
    undo: 'Undo',
    redo: 'Redo',
    clearSelection: 'Clear selection',
    selected: 'Selected area',
    editorHint:
      'Drag to draw or select. Use arrow keys to move, Enter or Space to apply. Shift + arrows extends a selection.',
    baseHint:
      'The base layer must stay opaque. The eraser works on the outer layer.',
    canvas: 'Pixel editor for the selected face',
    aiTitle: 'Edit a part with AI',
    aiHint:
      'Choose an area and describe your change. Pixels outside the area stay unchanged. AI edits share the generation usage limits.',
    scope: 'AI edit area',
    scopeNames: [
      'Selected rectangle',
      'Selected face',
      'All faces of this part (selected layer)',
    ],
    prompt: 'What would you like to change?',
    placeholder: 'For example: blue eyes, or a star pattern on the sleeves',
    edit: 'Edit this area with AI',
    editing: 'Editing your skin',
    busy: 'Editing. This may take 1–4 minutes.',
    consent:
      'I agree to send the current skin and edit instructions to the configured OpenAI or Cloudflare Workers AI provider.',
    privacy:
      'Drawing does not send anything to AI. The current skin and instructions are sent only when you request an AI edit. Edit history stays in this page and is lost when you close it.',
    manualPublish:
      'Skins with manual edits can be saved as PNG. The store currently accepts AI-only results. Undo can restore a publishable generated result.',
    noChanges: 'No pixels changed.',
    edited: 'Edit complete. Changed pixels',
  },
  'zh-cn': {
    title: '编辑皮肤',
    intro: '选择部位和面，直接修改像素。',
    part: '部位',
    face: '面',
    layer: '图层',
    partNames: ['头部', '躯干', '右臂', '左臂', '右腿', '左腿'],
    tool: '工具',
    toolNames: ['画笔', '填充', '橡皮擦', '取色器', '选择区域'],
    color: '颜色',
    undo: '撤销',
    redo: '重做',
    clearSelection: '取消选择',
    selected: '选择区域',
    editorHint:
      '拖动可绘制或选择。方向键移动，Enter或空格操作。Shift＋方向键扩大选择。',
    baseHint: '基础图层必须不透明。橡皮擦仅用于外层。',
    canvas: '所选面的像素编辑器',
    aiTitle: '用AI局部修改',
    aiHint:
      '选择范围并描述修改。范围外的像素保持不变。AI修改与生成共用次数限制。',
    scope: 'AI修改范围',
    scopeNames: ['所选矩形', '所选面', '此部位的所有面（所选图层）'],
    prompt: '想如何修改？',
    placeholder: '例如：仅将眼睛改成蓝色，袖子添加星星图案',
    edit: '用AI修改此范围',
    editing: '正在修改皮肤',
    busy: '正在局部修改，可能需要1–4分钟。',
    consent:
      '我同意将当前皮肤和修改指示发送给配置的OpenAI或Cloudflare Workers AI。',
    privacy:
      '手动编辑不会发送给AI。仅在执行AI修改时发送当前皮肤和指示。编辑历史仅保留在此页面，关闭后消失。',
    manualPublish:
      '手动修改的皮肤可保存为PNG。商店目前仅接受纯AI结果。撤销可恢复可发布的生成结果。',
    noChanges: '没有像素发生变化。',
    edited: '修改完成。修改像素数',
  },
  es: {
    title: 'Editar tu skin',
    intro:
      'Elige una parte y una cara para dibujar directamente sobre los píxeles.',
    part: 'Parte',
    face: 'Cara',
    layer: 'Capa',
    partNames: [
      'Cabeza',
      'Torso',
      'Brazo derecho',
      'Brazo izquierdo',
      'Pierna derecha',
      'Pierna izquierda',
    ],
    tool: 'Herramienta',
    toolNames: [
      'Lápiz',
      'Relleno',
      'Borrador',
      'Cuentagotas',
      'Seleccionar área',
    ],
    color: 'Color',
    undo: 'Deshacer',
    redo: 'Rehacer',
    clearSelection: 'Quitar selección',
    selected: 'Área seleccionada',
    editorHint:
      'Arrastra para dibujar o seleccionar. Flechas para moverte; Intro o espacio para aplicar. Mayús + flechas amplía la selección.',
    baseHint:
      'La capa base debe ser opaca. El borrador funciona en la capa exterior.',
    canvas: 'Editor de píxeles de la cara seleccionada',
    aiTitle: 'Editar una parte con IA',
    aiHint:
      'Elige un área y describe el cambio. Los píxeles externos se conservan. Las ediciones comparten el límite de generación.',
    scope: 'Área de edición IA',
    scopeNames: [
      'Rectángulo seleccionado',
      'Cara seleccionada',
      'Todas las caras de esta parte (capa seleccionada)',
    ],
    prompt: '¿Qué quieres cambiar?',
    placeholder: 'Ejemplo: ojos azules o estrellas en las mangas',
    edit: 'Editar esta área con IA',
    editing: 'Editando tu skin',
    busy: 'Editando. Puede tardar 1–4 minutos.',
    consent:
      'Acepto enviar la skin actual y las instrucciones al proveedor configurado de OpenAI o Cloudflare Workers AI.',
    privacy:
      'Dibujar no envía nada a la IA. La skin y las instrucciones se envían solo al solicitar una edición IA. El historial se pierde al cerrar la página.',
    manualPublish:
      'Las skins editadas a mano se pueden guardar como PNG. La tienda acepta resultados solo de IA. Deshacer puede restaurar un resultado publicable.',
    noChanges: 'No cambió ningún píxel.',
    edited: 'Edición completada. Píxeles cambiados',
  },
  pt: {
    title: 'Editar sua skin',
    intro: 'Escolha uma parte e uma face para desenhar diretamente nos pixels.',
    part: 'Parte',
    face: 'Face',
    layer: 'Camada',
    partNames: [
      'Cabeça',
      'Tronco',
      'Braço direito',
      'Braço esquerdo',
      'Perna direita',
      'Perna esquerda',
    ],
    tool: 'Ferramenta',
    toolNames: [
      'Lápis',
      'Preencher',
      'Borracha',
      'Conta-gotas',
      'Selecionar área',
    ],
    color: 'Cor',
    undo: 'Desfazer',
    redo: 'Refazer',
    clearSelection: 'Limpar seleção',
    selected: 'Área selecionada',
    editorHint:
      'Arraste para desenhar ou selecionar. Setas movem; Enter ou espaço aplica. Shift + setas amplia a seleção.',
    baseHint:
      'A camada base deve ser opaca. A borracha funciona na camada externa.',
    canvas: 'Editor de pixels da face selecionada',
    aiTitle: 'Editar uma parte com IA',
    aiHint:
      'Escolha uma área e descreva a alteração. Os pixels externos são preservados. Edições compartilham o limite de geração.',
    scope: 'Área de edição IA',
    scopeNames: [
      'Retângulo selecionado',
      'Face selecionada',
      'Todas as faces desta parte (camada selecionada)',
    ],
    prompt: 'O que deseja alterar?',
    placeholder: 'Exemplo: olhos azuis ou estrelas nas mangas',
    edit: 'Editar esta área com IA',
    editing: 'Editando sua skin',
    busy: 'Editando. Pode levar 1–4 minutos.',
    consent:
      'Concordo em enviar a skin atual e as instruções ao provedor configurado OpenAI ou Cloudflare Workers AI.',
    privacy:
      'Desenhar não envia dados à IA. A skin e as instruções são enviadas apenas ao solicitar uma edição IA. O histórico se perde ao fechar a página.',
    manualPublish:
      'Skins editadas à mão podem ser salvas como PNG. A loja aceita resultados apenas de IA. Desfazer pode restaurar um resultado publicável.',
    noChanges: 'Nenhum pixel mudou.',
    edited: 'Edição concluída. Pixels alterados',
  },
  fr: {
    title: 'Modifier votre skin',
    intro: 'Choisissez une partie et une face, puis dessinez sur les pixels.',
    part: 'Partie',
    face: 'Face',
    layer: 'Couche',
    partNames: [
      'Tête',
      'Torse',
      'Bras droit',
      'Bras gauche',
      'Jambe droite',
      'Jambe gauche',
    ],
    tool: 'Outil',
    toolNames: ['Crayon', 'Remplir', 'Gomme', 'Pipette', 'Sélectionner'],
    color: 'Couleur',
    undo: 'Annuler',
    redo: 'Rétablir',
    clearSelection: 'Effacer la sélection',
    selected: 'Zone sélectionnée',
    editorHint:
      'Glissez pour dessiner ou sélectionner. Les flèches déplacent, Entrée ou espace applique. Maj + flèches agrandit la sélection.',
    baseHint:
      'La couche de base doit rester opaque. La gomme agit sur la couche extérieure.',
    canvas: 'Éditeur de pixels de la face sélectionnée',
    aiTitle: 'Modifier une partie avec l’IA',
    aiHint:
      'Choisissez une zone et décrivez le changement. Les pixels extérieurs sont conservés. Les modifications partagent les limites de génération.',
    scope: 'Zone de modification IA',
    scopeNames: [
      'Rectangle sélectionné',
      'Face sélectionnée',
      'Toutes les faces de cette partie (couche choisie)',
    ],
    prompt: 'Que souhaitez-vous changer ?',
    placeholder: 'Exemple : des yeux bleus ou des étoiles sur les manches',
    edit: 'Modifier cette zone avec l’IA',
    editing: 'Modification du skin',
    busy: 'Modification en cours. Cela peut prendre 1–4 minutes.',
    consent:
      'J’accepte d’envoyer le skin actuel et les instructions au fournisseur configuré OpenAI ou Cloudflare Workers AI.',
    privacy:
      'Dessiner n’envoie rien à l’IA. Le skin et les instructions sont envoyés uniquement lors d’une modification IA. L’historique disparaît à la fermeture de la page.',
    manualPublish:
      'Les skins modifiés à la main peuvent être enregistrés en PNG. La boutique accepte uniquement les résultats IA. Annuler peut restaurer un résultat publiable.',
    noChanges: 'Aucun pixel modifié.',
    edited: 'Modification terminée. Pixels modifiés',
  },
  ko: {
    title: '스킨 편집',
    intro: '부위와 면을 선택하고 픽셀을 직접 그려 보세요.',
    part: '부위',
    face: '면',
    layer: '레이어',
    partNames: ['머리', '몸통', '오른팔', '왼팔', '오른다리', '왼다리'],
    tool: '도구',
    toolNames: ['펜', '채우기', '지우개', '스포이트', '영역 선택'],
    color: '색상',
    undo: '실행 취소',
    redo: '다시 실행',
    clearSelection: '선택 해제',
    selected: '선택 영역',
    editorHint:
      '드래그로 그리거나 선택합니다. 방향키로 이동하고 Enter 또는 스페이스로 적용합니다. Shift＋방향키로 선택을 넓힙니다.',
    baseHint:
      '기본 레이어는 불투명해야 합니다. 지우개는 외부 레이어에서 사용합니다.',
    canvas: '선택한 면의 픽셀 편집기',
    aiTitle: 'AI로 부분 수정',
    aiHint:
      '영역을 선택하고 변경 사항을 설명하세요. 영역 밖 픽셀은 유지됩니다. AI 수정은 생성과 이용 한도를 공유합니다.',
    scope: 'AI 수정 영역',
    scopeNames: [
      '선택한 사각형',
      '선택한 면',
      '이 부위의 모든 면（선택 레이어）',
    ],
    prompt: '어떻게 바꿀까요?',
    placeholder: '예: 눈만 파랗게, 소매에 별무늬 추가',
    edit: 'AI로 이 영역 수정',
    editing: '스킨 수정 중',
    busy: '부분 수정 중입니다. 1–4분 걸릴 수 있습니다.',
    consent:
      '현재 스킨과 수정 지시를 설정된 OpenAI 또는 Cloudflare Workers AI로 보내는 데 동의합니다.',
    privacy:
      '수동 편집 중에는 AI로 전송하지 않습니다. AI 수정을 실행할 때만 스킨과 지시를 보냅니다. 편집 기록은 페이지를 닫으면 사라집니다.',
    manualPublish:
      '수동 편집한 스킨은 PNG로 저장할 수 있습니다. 스토어는 현재 AI 결과만 지원합니다. 실행 취소로 게시 가능한 생성 결과를 복원할 수 있습니다.',
    noChanges: '변경된 픽셀이 없습니다.',
    edited: '수정 완료. 변경 픽셀 수',
  },
  de: {
    title: 'Skin bearbeiten',
    intro:
      'Wähle einen Körperteil und eine Fläche und zeichne direkt auf den Pixeln.',
    part: 'Körperteil',
    face: 'Fläche',
    layer: 'Ebene',
    partNames: [
      'Kopf',
      'Rumpf',
      'Rechter Arm',
      'Linker Arm',
      'Rechtes Bein',
      'Linkes Bein',
    ],
    tool: 'Werkzeug',
    toolNames: ['Stift', 'Füllen', 'Radierer', 'Pipette', 'Bereich wählen'],
    color: 'Farbe',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    clearSelection: 'Auswahl aufheben',
    selected: 'Ausgewählter Bereich',
    editorHint:
      'Zum Zeichnen oder Auswählen ziehen. Pfeiltasten bewegen, Enter oder Leertaste wendet an. Umschalt + Pfeile erweitert die Auswahl.',
    baseHint:
      'Die Basisebene bleibt undurchsichtig. Der Radierer wirkt auf der äußeren Ebene.',
    canvas: 'Pixel-Editor für die ausgewählte Fläche',
    aiTitle: 'Teil mit KI bearbeiten',
    aiHint:
      'Wähle einen Bereich und beschreibe die Änderung. Pixel außerhalb bleiben erhalten. KI-Bearbeitung teilt die Generierungslimits.',
    scope: 'KI-Bereich',
    scopeNames: [
      'Ausgewähltes Rechteck',
      'Ausgewählte Fläche',
      'Alle Flächen dieses Teils (gewählte Ebene)',
    ],
    prompt: 'Was möchtest du ändern?',
    placeholder: 'Zum Beispiel: blaue Augen oder Sterne auf den Ärmeln',
    edit: 'Diesen Bereich mit KI bearbeiten',
    editing: 'Skin wird bearbeitet',
    busy: 'Bearbeitung läuft. Dies kann 1–4 Minuten dauern.',
    consent:
      'Ich stimme zu, den aktuellen Skin und die Anweisungen an den konfigurierten Anbieter OpenAI oder Cloudflare Workers AI zu senden.',
    privacy:
      'Beim Zeichnen wird nichts an die KI gesendet. Skin und Anweisungen werden erst bei einer KI-Bearbeitung gesendet. Der Verlauf geht beim Schließen der Seite verloren.',
    manualPublish:
      'Manuell bearbeitete Skins lassen sich als PNG speichern. Der Store akzeptiert reine KI-Ergebnisse. Rückgängig kann ein veröffentlichbares Ergebnis wiederherstellen.',
    noChanges: 'Keine Pixel geändert.',
    edited: 'Bearbeitung abgeschlossen. Geänderte Pixel',
  },
  ru: {
    title: 'Редактировать скин',
    intro: 'Выберите часть тела и грань, затем рисуйте прямо по пикселям.',
    part: 'Часть тела',
    face: 'Грань',
    layer: 'Слой',
    partNames: [
      'Голова',
      'Туловище',
      'Правая рука',
      'Левая рука',
      'Правая нога',
      'Левая нога',
    ],
    tool: 'Инструмент',
    toolNames: ['Карандаш', 'Заливка', 'Ластик', 'Пипетка', 'Выделение'],
    color: 'Цвет',
    undo: 'Отменить',
    redo: 'Повторить',
    clearSelection: 'Снять выделение',
    selected: 'Выбранная область',
    editorHint:
      'Перетаскивайте для рисования или выделения. Стрелки перемещают, Enter или пробел применяет. Shift + стрелки расширяет выделение.',
    baseHint:
      'Базовый слой должен быть непрозрачным. Ластик работает на внешнем слое.',
    canvas: 'Редактор пикселей выбранной грани',
    aiTitle: 'Изменить часть с помощью ИИ',
    aiHint:
      'Выберите область и опишите изменение. Пиксели вне области сохраняются. Правки ИИ используют общий лимит генерации.',
    scope: 'Область правки ИИ',
    scopeNames: [
      'Выбранный прямоугольник',
      'Выбранная грань',
      'Все грани этой части (выбранный слой)',
    ],
    prompt: 'Что нужно изменить?',
    placeholder: 'Например: синие глаза или звёзды на рукавах',
    edit: 'Изменить область с помощью ИИ',
    editing: 'Скин редактируется',
    busy: 'Редактирование. Это может занять 1–4 минуты.',
    consent:
      'Я согласен отправить текущий скин и инструкции настроенному поставщику OpenAI или Cloudflare Workers AI.',
    privacy:
      'Рисование не отправляет данные ИИ. Скин и инструкции отправляются только при запросе правки ИИ. История исчезает при закрытии страницы.',
    manualPublish:
      'Скины с ручными правками можно сохранить в PNG. Магазин принимает только результаты ИИ. Отмена может восстановить результат для публикации.',
    noChanges: 'Пиксели не изменились.',
    edited: 'Готово. Изменено пикселей',
  },
} satisfies Record<Locale, EditorCopy>
type ViewCopy = {
  intro: string
  open: string
  rotate: string
  stage: string
  stageHint: string
  fineEdit: string
  isolate: string
  resetView: string
  webgl: string
}
const viewCopy = {
  ja: {
    intro: '3Dモデルを回転・拡大しながら、直接ピクセルを描き直せます。',
    open: '3Dで編集する',
    rotate: '回転・拡大',
    stage: '3Dスキンエディター',
    stageHint:
      'ペンでモデルを直接塗れます。右ドラッグや余白のドラッグで回転、ホイールで拡大。スマホでは「回転・拡大」に切り替えて操作します。基本レイヤーの編集中は外側を隠します。',
    fineEdit: '選択した面を2Dで細かく編集',
    isolate: '選択した部位だけを表示',
    resetView: '視点を戻す',
    webgl: '3Dを表示できません。下の2Dエディターで編集できます。',
  },
  en: {
    intro: 'Rotate and zoom the 3D model, then paint directly on its pixels.',
    open: 'Edit in 3D',
    rotate: 'Rotate / zoom',
    stage: '3D skin editor',
    stageHint:
      'Paint directly with the pencil. Drag the background or right-drag to rotate; scroll to zoom. On touch screens, choose Rotate / zoom. Outer layers are hidden while editing the base.',
    fineEdit: 'Fine edits on the selected 2D face',
    isolate: 'Show only the selected body part',
    resetView: 'Reset view',
    webgl: '3D is unavailable. You can use the 2D editor below.',
  },
  'zh-cn': {
    intro: '旋转和缩放3D模型，直接绘制像素。',
    open: '在3D中编辑',
    rotate: '旋转 / 缩放',
    stage: '3D皮肤编辑器',
    stageHint:
      '用画笔直接涂画模型。拖动空白处或右键拖动可旋转，滚轮可缩放。触屏请选择“旋转 / 缩放”。编辑基础图层时会隐藏外层。',
    fineEdit: '在选中的2D面上精细编辑',
    isolate: '只显示选中的部位',
    resetView: '重置视角',
    webgl: '无法显示3D。可以使用下方的2D编辑器。',
  },
  es: {
    intro: 'Gira y amplía el modelo 3D y pinta directamente sus píxeles.',
    open: 'Editar en 3D',
    rotate: 'Girar / ampliar',
    stage: 'Editor de skins 3D',
    stageHint:
      'Pinta con el lápiz. Arrastra el fondo o con el botón derecho para girar; usa la rueda para ampliar. En pantallas táctiles, elige Girar / ampliar. La capa exterior se oculta al editar la base.',
    fineEdit: 'Edición precisa de la cara 2D seleccionada',
    isolate: 'Mostrar solo la parte seleccionada',
    resetView: 'Restablecer vista',
    webgl: 'No se puede mostrar el modelo 3D. Usa el editor 2D de abajo.',
  },
  pt: {
    intro: 'Gire e amplie o modelo 3D e pinte diretamente seus pixels.',
    open: 'Editar em 3D',
    rotate: 'Girar / ampliar',
    stage: 'Editor de skins 3D',
    stageHint:
      'Pinte com o lápis. Arraste o fundo ou com o botão direito para girar; use a roda para ampliar. Em telas de toque, escolha Girar / ampliar. A camada externa fica oculta ao editar a base.',
    fineEdit: 'Edição precisa da face 2D selecionada',
    isolate: 'Mostrar apenas a parte selecionada',
    resetView: 'Redefinir visão',
    webgl: 'Não é possível mostrar o modelo 3D. Use o editor 2D abaixo.',
  },
  fr: {
    intro:
      'Tournez et zoomez le modèle 3D, puis peignez directement ses pixels.',
    open: 'Modifier en 3D',
    rotate: 'Tourner / zoomer',
    stage: 'Éditeur de skins 3D',
    stageHint:
      'Peignez avec le crayon. Faites glisser le fond ou utilisez le bouton droit pour tourner, la molette pour zoomer. Sur écran tactile, choisissez Tourner / zoomer. La couche externe est masquée pendant la modification de la base.',
    fineEdit: 'Retouche précise de la face 2D sélectionnée',
    isolate: 'Afficher uniquement la partie sélectionnée',
    resetView: 'Réinitialiser la vue',
    webgl: 'La 3D est indisponible. Utilisez l’éditeur 2D ci-dessous.',
  },
  ko: {
    intro: '3D 모델을 회전하고 확대하면서 픽셀을 직접 칠할 수 있습니다.',
    open: '3D에서 편집',
    rotate: '회전 / 확대',
    stage: '3D 스킨 에디터',
    stageHint:
      '펜으로 모델을 직접 칠하세요. 빈 공간이나 마우스 오른쪽 버튼으로 드래그하면 회전하고, 휠로 확대합니다. 터치 화면에서는 회전 / 확대를 선택하세요. 기본 레이어 편집 시 외부 레이어를 숨깁니다.',
    fineEdit: '선택한 2D 면을 세밀하게 편집',
    isolate: '선택한 부위만 표시',
    resetView: '시점 초기화',
    webgl: '3D를 표시할 수 없습니다. 아래 2D 에디터를 사용할 수 있습니다.',
  },
  de: {
    intro: 'Drehe und zoome das 3D-Modell und bemale seine Pixel direkt.',
    open: 'In 3D bearbeiten',
    rotate: 'Drehen / zoomen',
    stage: '3D-Skin-Editor',
    stageHint:
      'Male direkt mit dem Stift. Ziehe den Hintergrund oder mit der rechten Maustaste zum Drehen, nutze das Mausrad zum Zoomen. Auf Touchscreens wähle Drehen / zoomen. Beim Bearbeiten der Basis wird die äußere Ebene ausgeblendet.',
    fineEdit: 'Feinbearbeitung der ausgewählten 2D-Seite',
    isolate: 'Nur das ausgewählte Körperteil anzeigen',
    resetView: 'Ansicht zurücksetzen',
    webgl: '3D ist nicht verfügbar. Nutze den 2D-Editor unten.',
  },
  ru: {
    intro: 'Вращайте и приближайте 3D-модель и рисуйте прямо на её пикселях.',
    open: 'Редактировать в 3D',
    rotate: 'Вращать / масштаб',
    stage: '3D-редактор скина',
    stageHint:
      'Рисуйте карандашом прямо на модели. Перетаскивайте фон или правой кнопкой для вращения, используйте колесо для масштаба. На сенсорном экране выберите Вращать / масштаб. При правке базового слоя внешний скрывается.',
    fineEdit: 'Точная правка выбранной 2D-грани',
    isolate: 'Показать только выбранную часть',
    resetView: 'Сбросить вид',
    webgl: '3D недоступно. Используйте 2D-редактор ниже.',
  },
} satisfies Record<Locale, ViewCopy>
export function getSkinEditorUi(locale: Locale) {
  return { ...copy[locale], ...viewCopy[locale] }
}
