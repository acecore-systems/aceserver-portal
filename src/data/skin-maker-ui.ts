import type { Locale } from '../i18n/config'
const copy = {
  ja: {
    title: 'スキンメーカー',
    intro:
      'イメージを、あなたのスキンに。画像や言葉から作って、ぐるっと確かめよう。',
    model: '腕のタイプ',
    reference: '参考画像（任意・PNG / JPEG / WebP、5 MBまで）',
    prompt: 'どんなスキンにしますか？',
    generate: '生成する',
    download: '64×64 PNGを保存',
    clear: '最初から',
    preview: '仕上がりを確認',
    empty: '生成すると、ここに実際の出力が表示されます。',
    busy: '制作中です。1〜4分ほどかかることがあります。',
    ready: '準備できました。',
    disabled: 'AI生成は現在準備中です。',
    error:
      '生成できませんでした。前のスキンは保持しています。内容を短くして、時間をおいてお試しください。',
    invalid: 'PNG・JPEG・WebP形式で5 MB以下の参考画像を選んでください。',
    consent:
      '画像を使う権利があり、文章・画像をCloudflareのAI処理へ送ることに同意します。',
    privacy:
      '送信前に参考画像を最大256×256へ縮小し、メタデータを除去します。文章・画像・スキンはこのサイトに保存しません。処理にはCloudflare Workers AIを利用します。ページを閉じると作業内容は消えます。個人情報や秘密を含む画像は使わないでください。',
    note: 'Classicは4px、Slimは3pxの腕です。ドラッグで回転できます。ゲーム側でも同じ型を選び、カスタムスキンの読み込み機能を使ってください。',
    remove: '参考画像を外す',
    webgl:
      '3Dを表示できません。WebGL対応ブラウザをご利用ください。下のPNGは保存できます。',
    rotate: '自動回転',
    limit:
      '利用上限に達しました（1分に1回・1日5回、全体で1日100回）。時間をおいてお試しください。',
    verify: '確認チェックを完了してください。',
    faceNames: ['上', '下', '右側', '正面', '左側', '背面'],
    layerNames: ['基本', '外側'],
  },
  en: {
    title: 'Skin Maker',
    intro:
      'Turn an idea into your skin. Create from a picture or words, then see every side.',
    model: 'Arm type',
    reference: 'Reference (optional · PNG / JPEG / WebP, up to 5 MB)',
    prompt: 'Describe your skin',
    generate: 'Generate',
    download: 'Save 64×64 PNG',
    clear: 'Start over',
    preview: 'Inspect your skin',
    empty: 'Generate a skin to see the actual output here.',
    busy: 'Creating. This may take 1–4 minutes.',
    ready: 'Ready.',
    disabled: 'AI generation is currently unavailable.',
    error:
      'Generation failed. Your previous skin is safe. Try a shorter description later.',
    invalid: 'Choose a PNG, JPEG or WebP reference up to 5 MB.',
    consent:
      'I have rights to use these images and agree to send the text and images to Cloudflare for AI processing.',
    privacy:
      'References are resized to 256×256 maximum and stripped of metadata before sending. This site does not store text, images or skins. Processing uses Cloudflare Workers AI. Closing the page clears your work. Do not upload private or sensitive information.',
    note: 'Classic has 4px arms; Slim has 3px arms. Drag to rotate. Select the same type when importing the skin in your game.',
    remove: 'Remove reference',
    webgl:
      '3D unavailable. Use a WebGL browser. You can still save the PNG below.',
    rotate: 'Auto rotate',
    limit:
      'Limit reached (1/minute, 5/day per visitor; 100/day total). Please try later.',
    verify: 'Complete the verification check.',
    faceNames: ['Top', 'Bottom', 'Right', 'Front', 'Left', 'Back'],
    layerNames: ['Base', 'Outer'],
  },
  'zh-cn': {
    title: '皮肤制作器',
    intro: '把创意变成你的皮肤。从图片或文字开始，查看每个角度。',
    model: '手臂类型',
    reference: '参考图片（可选 · PNG / JPEG / WebP，最大5 MB）',
    prompt: '描述想要的皮肤',
    generate: '生成',
    download: '保存64×64 PNG',
    clear: '重新开始',
    preview: '查看成品',
    empty: '生成后，这里会显示实际输出。',
    busy: '正在制作，可能需要1–4分钟。',
    ready: '已就绪。',
    disabled: 'AI生成功能暂不可用。',
    error: '生成失败。之前的皮肤已保留。请稍后尝试更简短的描述。',
    invalid: '请选择不超过5 MB的PNG、JPEG或WebP参考图片。',
    consent:
      '我有权使用这些图片，并同意将文字和图片发送至Cloudflare进行AI处理。',
    privacy:
      '发送前，参考图片会缩小至最大256×256并移除元数据。本站不保存文字、图片或皮肤，处理使用Cloudflare Workers AI。关闭页面后工作内容会消失。请勿上传隐私或敏感信息。',
    note: 'Classic手臂宽4像素，Slim宽3像素。拖动可旋转。在游戏中导入皮肤时请选择相同类型。',
    remove: '移除参考图片',
    webgl: '无法显示3D。请使用支持WebGL的浏览器。仍可保存下方PNG。',
    rotate: '自动旋转',
    limit: '已达上限（每分钟1次、每人每天5次、全站每天100次）。请稍后再试。',
    verify: '请完成验证。',
    faceNames: ['顶部', '底部', '右侧', '正面', '左侧', '背面'],
    layerNames: ['基础', '外层'],
  },
  es: {
    title: 'Creador de skins',
    intro:
      'Convierte una idea en tu skin. Crea desde una imagen o palabras y mira todos los lados.',
    model: 'Tipo de brazos',
    reference: 'Referencia (opcional · PNG / JPEG / WebP, hasta 5 MB)',
    prompt: 'Describe tu skin',
    generate: 'Generar',
    download: 'Guardar PNG de 64×64',
    clear: 'Empezar de nuevo',
    preview: 'Revisar tu skin',
    empty: 'Genera una skin para ver el resultado aquí.',
    busy: 'Creando. Puede tardar 1–4 minutos.',
    ready: 'Todo listo.',
    disabled: 'La generación con IA no está disponible.',
    error:
      'No se pudo generar. Tu skin anterior se conserva. Prueba una descripción más corta más tarde.',
    invalid: 'Elige una referencia PNG, JPEG o WebP de hasta 5 MB.',
    consent:
      'Tengo derecho a usar estas imágenes y acepto enviar el texto y las imágenes a Cloudflare para su procesamiento con IA.',
    privacy:
      'Las referencias se reducen a un máximo de 256×256 y se eliminan sus metadatos antes del envío. Este sitio no guarda textos, imágenes ni skins. Se procesan con Cloudflare Workers AI. Al cerrar la página se pierde el trabajo. No subas información privada o sensible.',
    note: 'Classic tiene brazos de 4px; Slim, de 3px. Arrastra para girar. Selecciona el mismo tipo al importar la skin en el juego.',
    remove: 'Quitar referencia',
    webgl:
      '3D no disponible. Usa un navegador con WebGL. Puedes guardar el PNG de abajo.',
    rotate: 'Giro automático',
    limit:
      'Límite alcanzado (1/minuto, 5/día por visitante; 100/día en total). Inténtalo más tarde.',
    verify: 'Completa la verificación.',
    faceNames: ['Arriba', 'Abajo', 'Derecha', 'Frente', 'Izquierda', 'Espalda'],
    layerNames: ['Base', 'Exterior'],
  },
  pt: {
    title: 'Criador de skins',
    intro:
      'Transforme uma ideia na sua skin. Crie com imagens ou palavras e confira todos os lados.',
    model: 'Tipo de braços',
    reference: 'Referência (opcional · PNG / JPEG / WebP, até 5 MB)',
    prompt: 'Descreva sua skin',
    generate: 'Gerar',
    download: 'Salvar PNG de 64×64',
    clear: 'Recomeçar',
    preview: 'Confira sua skin',
    empty: 'Gere uma skin para ver o resultado aqui.',
    busy: 'Criando. Pode levar 1–4 minutos.',
    ready: 'Tudo pronto.',
    disabled: 'A geração por IA está indisponível.',
    error:
      'Não foi possível gerar. Sua skin anterior foi mantida. Tente uma descrição mais curta depois.',
    invalid: 'Escolha uma referência PNG, JPEG ou WebP de até 5 MB.',
    consent:
      'Tenho direito de usar estas imagens e concordo em enviar o texto e as imagens à Cloudflare para processamento por IA.',
    privacy:
      'Referências são reduzidas a no máximo 256×256 e têm os metadados removidos antes do envio. Este site não armazena textos, imagens ou skins. O processamento usa Cloudflare Workers AI. Fechar a página apaga seu trabalho. Não envie informações privadas ou sensíveis.',
    note: 'Classic tem braços de 4px; Slim, de 3px. Arraste para girar. Selecione o mesmo tipo ao importar a skin no jogo.',
    remove: 'Remover referência',
    webgl:
      '3D indisponível. Use um navegador com WebGL. Você ainda pode salvar o PNG abaixo.',
    rotate: 'Giro automático',
    limit:
      'Limite atingido (1/minuto, 5/dia por visitante; 100/dia no total). Tente mais tarde.',
    verify: 'Conclua a verificação.',
    faceNames: ['Topo', 'Baixo', 'Direita', 'Frente', 'Esquerda', 'Costas'],
    layerNames: ['Base', 'Externa'],
  },
  fr: {
    title: 'Créateur de skins',
    intro:
      'Transformez une idée en skin. Partez d’une image ou de mots et découvrez chaque côté.',
    model: 'Type de bras',
    reference: 'Référence (facultative · PNG / JPEG / WebP, 5 Mo maximum)',
    prompt: 'Décrivez votre skin',
    generate: 'Générer',
    download: 'Enregistrer le PNG 64×64',
    clear: 'Recommencer',
    preview: 'Inspecter votre skin',
    empty: 'Générez un skin pour voir le résultat ici.',
    busy: 'Création en cours. Cela peut prendre 1 à 4 minutes.',
    ready: 'Prêt.',
    disabled: 'La génération IA est indisponible.',
    error:
      'La génération a échoué. Votre skin précédent est conservé. Essayez plus tard avec une description plus courte.',
    invalid: 'Choisissez une référence PNG, JPEG ou WebP de 5 Mo maximum.',
    consent:
      'Je dispose des droits sur ces images et j’accepte d’envoyer le texte et les images à Cloudflare pour traitement par IA.',
    privacy:
      'Les références sont réduites à 256×256 maximum et leurs métadonnées supprimées avant envoi. Ce site ne conserve ni textes, ni images, ni skins. Le traitement utilise Cloudflare Workers AI. Fermer la page efface votre travail. N’envoyez pas d’informations privées ou sensibles.',
    note: 'Classic a des bras de 4px ; Slim de 3px. Faites glisser pour tourner. Choisissez le même type lors de l’importation dans le jeu.',
    remove: 'Retirer la référence',
    webgl:
      '3D indisponible. Utilisez un navigateur WebGL. Le PNG ci-dessous reste enregistrable.',
    rotate: 'Rotation automatique',
    limit:
      'Limite atteinte (1/minute, 5/jour par visiteur ; 100/jour au total). Réessayez plus tard.',
    verify: 'Terminez la vérification.',
    faceNames: ['Dessus', 'Dessous', 'Droite', 'Avant', 'Gauche', 'Dos'],
    layerNames: ['Base', 'Extérieure'],
  },
  ko: {
    title: '스킨 메이커',
    intro:
      '아이디어를 나만의 스킨으로. 이미지나 글로 만들고 모든 각도에서 확인하세요.',
    model: '팔 유형',
    reference: '참고 이미지 (선택 · PNG / JPEG / WebP, 최대 5 MB)',
    prompt: '원하는 스킨을 설명하세요',
    generate: '생성',
    download: '64×64 PNG 저장',
    clear: '처음부터',
    preview: '완성된 스킨 확인',
    empty: '생성하면 실제 결과가 여기에 표시됩니다.',
    busy: '제작 중입니다. 1~4분 정도 걸릴 수 있습니다.',
    ready: '준비되었습니다.',
    disabled: '현재 AI 생성을 사용할 수 없습니다.',
    error:
      '생성하지 못했습니다. 이전 스킨은 유지됩니다. 잠시 후 더 짧은 설명으로 시도하세요.',
    invalid: '5 MB 이하의 PNG, JPEG 또는 WebP 참고 이미지를 선택하세요.',
    consent:
      '이 이미지를 사용할 권리가 있으며 글과 이미지를 Cloudflare의 AI 처리로 보내는 데 동의합니다.',
    privacy:
      '참고 이미지는 전송 전에 최대 256×256으로 축소하고 메타데이터를 제거합니다. 이 사이트는 글, 이미지, 스킨을 저장하지 않습니다. Cloudflare Workers AI로 처리합니다. 페이지를 닫으면 작업 내용이 사라집니다. 개인정보나 민감한 정보는 올리지 마세요.',
    note: 'Classic은 4px, Slim은 3px 팔입니다. 드래그하여 회전하세요. 게임에서 스킨을 불러올 때 같은 유형을 선택하세요.',
    remove: '참고 이미지 제거',
    webgl:
      '3D를 표시할 수 없습니다. WebGL 브라우저를 사용하세요. 아래 PNG는 저장할 수 있습니다.',
    rotate: '자동 회전',
    limit:
      '한도에 도달했습니다 (분당 1회, 개인별 하루 5회, 전체 하루 100회). 나중에 시도하세요.',
    verify: '인증을 완료하세요.',
    faceNames: ['위', '아래', '오른쪽', '정면', '왼쪽', '뒷면'],
    layerNames: ['기본', '외부'],
  },
  de: {
    title: 'Skin-Maker',
    intro:
      'Mach aus einer Idee deinen Skin. Erstelle ihn aus Bildern oder Worten und prüfe jede Seite.',
    model: 'Armtyp',
    reference: 'Vorlage (optional · PNG / JPEG / WebP, bis 5 MB)',
    prompt: 'Beschreibe deinen Skin',
    generate: 'Generieren',
    download: '64×64 PNG speichern',
    clear: 'Neu beginnen',
    preview: 'Skin prüfen',
    empty: 'Erstelle einen Skin, um das Ergebnis hier zu sehen.',
    busy: 'Wird erstellt. Das kann 1–4 Minuten dauern.',
    ready: 'Bereit.',
    disabled: 'KI-Generierung ist derzeit nicht verfügbar.',
    error:
      'Generierung fehlgeschlagen. Dein vorheriger Skin bleibt erhalten. Versuche später eine kürzere Beschreibung.',
    invalid: 'Wähle ein PNG-, JPEG- oder WebP-Referenzbild bis 5 MB.',
    consent:
      'Ich darf diese Bilder verwenden und stimme zu, Text und Bilder zur KI-Verarbeitung an Cloudflare zu senden.',
    privacy:
      'Vorlagen werden vor dem Senden auf höchstens 256×256 verkleinert und Metadaten entfernt. Diese Website speichert keine Texte, Bilder oder Skins. Die Verarbeitung erfolgt mit Cloudflare Workers AI. Beim Schließen der Seite geht die Arbeit verloren. Lade keine privaten oder sensiblen Daten hoch.',
    note: 'Classic hat 4px breite Arme, Slim 3px. Ziehe zum Drehen. Wähle beim Import im Spiel denselben Typ.',
    remove: 'Vorlage entfernen',
    webgl:
      '3D nicht verfügbar. Nutze einen WebGL-Browser. Du kannst das PNG unten speichern.',
    rotate: 'Automatisch drehen',
    limit:
      'Limit erreicht (1/Minute, 5/Tag pro Besucher; 100/Tag insgesamt). Versuche es später.',
    verify: 'Schließe die Überprüfung ab.',
    faceNames: ['Oben', 'Unten', 'Rechts', 'Vorne', 'Links', 'Hinten'],
    layerNames: ['Basis', 'Außen'],
  },
  ru: {
    title: 'Мастер скинов',
    intro:
      'Превратите идею в свой скин. Создайте его по картинке или описанию и осмотрите со всех сторон.',
    model: 'Тип рук',
    reference: 'Образец (необязательно · PNG / JPEG / WebP, до 5 МБ)',
    prompt: 'Опишите желаемый скин',
    generate: 'Создать',
    download: 'Сохранить PNG 64×64',
    clear: 'Начать заново',
    preview: 'Осмотреть скин',
    empty: 'Создайте скин, чтобы увидеть результат здесь.',
    busy: 'Создаём. Это может занять 1–4 минуты.',
    ready: 'Готово.',
    disabled: 'Генерация ИИ сейчас недоступна.',
    error:
      'Не удалось создать скин. Предыдущий скин сохранён. Позже попробуйте более короткое описание.',
    invalid: 'Выберите образец PNG, JPEG или WebP размером до 5 МБ.',
    consent:
      'У меня есть право использовать эти изображения, и я согласен отправить текст и изображения в Cloudflare для обработки ИИ.',
    privacy:
      'Перед отправкой образцы уменьшаются до 256×256, метаданные удаляются. Сайт не хранит тексты, изображения и скины. Обработка выполняется в Cloudflare Workers AI. При закрытии страницы работа удаляется. Не загружайте личные или конфиденциальные данные.',
    note: 'У Classic руки шириной 4px, у Slim — 3px. Перетаскивайте для вращения. При импорте в игру выберите тот же тип.',
    remove: 'Убрать образец',
    webgl:
      '3D недоступно. Используйте браузер с WebGL. PNG ниже можно сохранить.',
    rotate: 'Автовращение',
    limit:
      'Достигнут лимит (1/минуту, 5/день на посетителя; всего 100/день). Попробуйте позже.',
    verify: 'Завершите проверку.',
    faceNames: ['Верх', 'Низ', 'Справа', 'Спереди', 'Слева', 'Сзади'],
    layerNames: ['Базовый', 'Внешний'],
  },
} satisfies Record<Locale, { title: string; [key: string]: string | string[] }>
export function getSkinMakerUi(locale: Locale) {
  return copy[locale]
}
