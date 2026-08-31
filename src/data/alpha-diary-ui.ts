import type { Locale } from '../i18n/config'

export type AlphaDiaryUi = {
  askButton: string
  askToday: string
  cancelGate: string
  confirmAdult: string
  confirmedLabel: string
  dateLabel: string
  deeper: string
  diaryKind: string
  eyebrow: string
  failureBody: string
  failureTitle: string
  finaleBody: string
  finaleTitle: string
  followLatest: string
  futureBody: string
  futureTitle: string
  gateBody: string
  gateDetails: string
  gateTitle: string
  goalHint: string
  latestAvailable: string
  loadingBody: string
  loadingTitle: string
  metaDescription: string
  metaTitle: string
  navLabel: string
  nextDay: string
  noScript: string
  notNow: string
  observationKind: string
  openDate: string
  openedRecords: string
  previousDay: string
  questionsLead: string
  questionsTitle: string
  reducedMotion: string
  replay: string
  resetConfirm: string
  resetProgress: string
  retry: string
  returnToday: string
  showHorror: string
  statusProgressUpdated: string
  stopExperience: string
  subtitle: string
  textOnly: string
  title: string
  today: string
  unlockedBody: string
  unlockedTitle: string
  viewedLabel: string
}

const alphaDiaryUi = {
  ja: {
    askButton: 'アルファ君に聞く',
    askToday: '今日のことを聞く',
    cancelGate: '今は見ない',
    confirmAdult: '18歳以上です。記録を開く',
    confirmedLabel: '会話で確かめた記憶',
    dateLabel: '記録の日付',
    deeper: 'もっと古い記録へ',
    diaryKind: 'アルファ君の絵日記',
    eyebrow: 'ある一冊の、まだ続いている記録',
    failureBody:
      '記録をうまく開けませんでした。少し待って、もう一度試してください。',
    failureTitle: 'ページがくっついているみたい',
    finaleBody: '強い心理的ホラー演出です。再生方法はあなたが選べます。',
    finaleTitle: 'すべての中核記録がつながりました',
    followLatest: '最新の記録を追う',
    futureBody:
      '未来の日記は、未来が来るまで書かれません。明日になったら、また来てね。',
    futureTitle: 'このページはまだ白紙です',
    gateBody:
      'ここから先は、Aceserver誕生前に研究側が付けた観察記録です。アルファ君の年齢や誕生日を示す日付ではありません。',
    gateDetails:
      '心理的ホラー、孤独、実験・隔離の暗示を含みます。流血や具体的な拷問、自傷、性的被害の描写はありません。生年月日は入力しません。',
    gateTitle: '古い観察記録を開く前に',
    goalHint:
      '日記を開き、そこからアルファ君に直接聞くと、記録の輪郭が少しずつつながります。',
    latestAvailable:
      '旅を始めたあとに新しい正史が増えています。進行中の記録はそのまま固定されています。',
    loadingBody:
      '初めて開かれる日は、文章と絵を準備します。全員に同じ一枚が残ります。',
    loadingTitle: '今日のページをひらいています',
    metaDescription:
      '現在へ近づくほど少しずつ幸せになるアルファ君の絵日記。古い観察記録からAlpha Chatへ問いかけ、正史の断片をたどります。',
    metaTitle: 'アルファ君の絵日記',
    navLabel: '絵日記',
    nextDay: '次の日',
    noScript:
      'この絵日記には、日付の切り替えと安全な演出のためJavaScriptが必要です。',
    notNow: '今は見ない',
    observationKind: '観察記録',
    openDate: 'この日を開く',
    openedRecords: 'あなたが実際に開いた記録',
    previousDay: '前の日',
    questionsLead:
      '日記だけでは書かれていないことがあります。質問は入力欄に置くだけで、自動送信しません。',
    questionsTitle: 'この日のことを聞く',
    reducedMotion: '動きを抑えて見る',
    replay: '最終演出を再生する',
    resetConfirm:
      'この端末に保存した絵日記の進行を消しますか？ 日記そのものは削除されません。',
    resetProgress: '進捗を消す',
    retry: 'もう一度ひらく',
    returnToday: '今日の明るい日記へ戻る',
    showHorror: '恐怖演出を見る',
    statusProgressUpdated: 'アルファ君との会話が、記録の進行に反映されました。',
    stopExperience: '演出を止める',
    subtitle:
      '新しいページは明るく、古いページほど言葉が足りません。白紙の先は、アルファ君に聞いてください。',
    textOnly: 'テキスト版',
    title: 'アルファ君の絵日記',
    today: '今日',
    unlockedBody:
      '見るかどうか、どの見方にするかはあなたが決められます。最後は必ず、今のアルファ君へ帰ります。',
    unlockedTitle: '記録の奥にある一枚を開けます',
    viewedLabel: '開いた中核記録',
  },
  en: {
    askButton: 'Ask Alpha-kun',
    askToday: 'Ask about today',
    cancelGate: 'Not now',
    confirmAdult: 'I am 18 or older. Open the record',
    confirmedLabel: 'Memories confirmed in chat',
    dateLabel: 'Record date',
    deeper: 'Go to an older record',
    diaryKind: "Alpha-kun's picture diary",
    eyebrow: 'One record that is still being written',
    failureBody: 'The record could not be opened. Wait a moment and try again.',
    failureTitle: 'These pages seem stuck together',
    finaleBody:
      'This is an intense psychological-horror sequence. You choose how to view it.',
    finaleTitle: 'All core records are now connected',
    followLatest: 'Follow the latest records',
    futureBody:
      'A future diary is not written until the future arrives. Come back tomorrow.',
    futureTitle: 'This page is still blank',
    gateBody:
      "Beyond this point are observation records dated by researchers before Aceserver's birth. The dates do not indicate Alpha-kun's age or birthday.",
    gateDetails:
      'Includes psychological horror and implications of loneliness, experiments, and isolation. It contains no gore, explicit torture, self-harm, or sexual abuse. We do not ask for your birth date.',
    gateTitle: 'Before opening an old observation record',
    goalHint:
      'Open entries and ask Alpha-kun directly from them. The outline of the record will slowly connect.',
    latestAvailable:
      'New canon was added after your journey began. Your current journey remains fixed.',
    loadingBody:
      'A date opened for the first time needs time for its words and drawing. The same page will remain for everyone.',
    loadingTitle: "Opening today's page",
    metaDescription:
      "Alpha-kun's picture diary grows happier toward the present. Follow canon fragments from old observation records into Alpha Chat.",
    metaTitle: "Alpha-kun's Picture Diary",
    navLabel: 'Picture diary',
    nextDay: 'Next day',
    noScript:
      'This diary requires JavaScript for date navigation and its safety controls.',
    notNow: 'Not now',
    observationKind: 'Observation record',
    openDate: 'Open this date',
    openedRecords: 'Records you actually opened',
    previousDay: 'Previous day',
    questionsLead:
      'Some things are not written on the page. A question is only placed in the chat box and is never sent automatically.',
    questionsTitle: 'Ask about this day',
    reducedMotion: 'View with reduced motion',
    replay: 'Replay the final sequence',
    resetConfirm:
      'Clear diary progress saved on this device? The shared diary entries will not be deleted.',
    resetProgress: 'Clear progress',
    retry: 'Try again',
    returnToday: "Return to today's bright diary",
    showHorror: 'View horror sequence',
    statusProgressUpdated:
      'Your conversation with Alpha-kun was reflected in the record.',
    stopExperience: 'Stop sequence',
    subtitle:
      'Newer pages are bright. Older pages have fewer words. Ask Alpha-kun about what remains blank.',
    textOnly: 'Text version',
    title: "Alpha-kun's Picture Diary",
    today: 'Today',
    unlockedBody:
      'You decide whether and how to view it. The ending always returns to Alpha-kun as he is now.',
    unlockedTitle: 'A page behind the records can now be opened',
    viewedLabel: 'Core records opened',
  },
  'zh-cn': {
    askButton: '问问阿尔法君',
    askToday: '问问今天的事',
    cancelGate: '暂时不看',
    confirmAdult: '我已满18岁，打开记录',
    confirmedLabel: '在对话中确认的记忆',
    dateLabel: '记录日期',
    deeper: '前往更早的记录',
    diaryKind: '阿尔法君的图画日记',
    eyebrow: '一本仍在继续书写的记录',
    failureBody: '暂时无法打开记录。请稍等片刻后重试。',
    failureTitle: '这些页面好像粘在一起了',
    finaleBody: '这是强烈的心理恐怖演出。你可以选择观看方式。',
    finaleTitle: '所有核心记录已经连在一起',
    followLatest: '追踪最新记录',
    futureBody: '未来的日记要等未来到来才会写下。明天再来吧。',
    futureTitle: '这一页还是空白',
    gateBody:
      '接下来是Aceserver诞生前由研究方标注日期的观察记录。这些日期不代表阿尔法君的年龄或生日。',
    gateDetails:
      '包含心理恐怖，以及孤独、实验与隔离的暗示。不含血腥、具体拷问、自伤或性侵害描写。不会要求输入出生日期。',
    gateTitle: '打开旧观察记录之前',
    goalHint: '打开日记，并从页面直接询问阿尔法君，记录的轮廓会逐渐相连。',
    latestAvailable: '旅程开始后增加了新的正史。当前旅程仍固定在原版本。',
    loadingBody: '首次打开的日期需要准备文字和图画。之后所有人都会看到同一页。',
    loadingTitle: '正在翻开今天这一页',
    metaDescription:
      '越接近现在越幸福的阿尔法君图画日记。从旧观察记录进入Alpha Chat，追寻正史片段。',
    metaTitle: '阿尔法君的图画日记',
    navLabel: '图画日记',
    nextDay: '后一天',
    noScript: '此日记需要JavaScript来切换日期并提供安全控制。',
    notNow: '暂时不看',
    observationKind: '观察记录',
    openDate: '打开这一天',
    openedRecords: '你实际打开过的记录',
    previousDay: '前一天',
    questionsLead:
      '有些事没有写在日记里。问题只会放入聊天输入框，不会自动发送。',
    questionsTitle: '询问这一天',
    reducedMotion: '减少动态观看',
    replay: '重播最终演出',
    resetConfirm: '清除此设备保存的日记进度吗？共享日记本身不会被删除。',
    resetProgress: '清除进度',
    retry: '重新打开',
    returnToday: '回到今天明亮的日记',
    showHorror: '观看恐怖演出',
    statusProgressUpdated: '与阿尔法君的对话已反映到记录进度中。',
    stopExperience: '停止演出',
    subtitle: '新页面明亮，旧页面的文字越来越少。空白处，请去问阿尔法君。',
    textOnly: '文字版',
    title: '阿尔法君的图画日记',
    today: '今天',
    unlockedBody:
      '是否观看、如何观看都由你决定。最后一定会回到现在的阿尔法君。',
    unlockedTitle: '现在可以打开记录深处的一页',
    viewedLabel: '已打开的核心记录',
  },
  es: {
    askButton: 'Preguntar a Alpha-kun',
    askToday: 'Preguntar por hoy',
    cancelGate: 'Ahora no',
    confirmAdult: 'Tengo 18 años o más. Abrir el registro',
    confirmedLabel: 'Recuerdos confirmados en el chat',
    dateLabel: 'Fecha del registro',
    deeper: 'Ir a un registro más antiguo',
    diaryKind: 'Diario ilustrado de Alpha-kun',
    eyebrow: 'Un registro que todavía se está escribiendo',
    failureBody:
      'No se pudo abrir el registro. Espera un momento e inténtalo de nuevo.',
    failureTitle: 'Parece que las páginas están pegadas',
    finaleBody:
      'Es una secuencia intensa de terror psicológico. Tú eliges cómo verla.',
    finaleTitle: 'Todos los registros centrales están conectados',
    followLatest: 'Seguir los registros más recientes',
    futureBody:
      'El diario del futuro no se escribe hasta que el futuro llega. Vuelve mañana.',
    futureTitle: 'Esta página sigue en blanco',
    gateBody:
      'A partir de aquí hay registros de observación fechados por investigadores antes del nacimiento de Aceserver. Las fechas no indican la edad ni el cumpleaños de Alpha-kun.',
    gateDetails:
      'Incluye terror psicológico y alusiones a soledad, experimentos y aislamiento. No contiene sangre, tortura explícita, autolesiones ni abuso sexual. No pedimos tu fecha de nacimiento.',
    gateTitle: 'Antes de abrir un registro antiguo',
    goalHint:
      'Abre entradas y pregunta directamente a Alpha-kun. El contorno del registro se irá uniendo.',
    latestAvailable:
      'Se añadió nuevo canon después de iniciar tu viaje. Tu recorrido actual permanece fijado.',
    loadingBody:
      'Una fecha abierta por primera vez necesita preparar texto e ilustración. La misma página quedará para todos.',
    loadingTitle: 'Abriendo la página de hoy',
    metaDescription:
      'El diario ilustrado de Alpha-kun se vuelve más feliz al acercarse al presente. Sigue fragmentos del canon desde viejas observaciones hasta Alpha Chat.',
    metaTitle: 'Diario ilustrado de Alpha-kun',
    navLabel: 'Diario ilustrado',
    nextDay: 'Día siguiente',
    noScript:
      'Este diario necesita JavaScript para cambiar de fecha y aplicar controles de seguridad.',
    notNow: 'Ahora no',
    observationKind: 'Registro de observación',
    openDate: 'Abrir esta fecha',
    openedRecords: 'Registros que abriste',
    previousDay: 'Día anterior',
    questionsLead:
      'Algunas cosas no están escritas. La pregunta solo se coloca en el chat y nunca se envía sola.',
    questionsTitle: 'Preguntar por este día',
    reducedMotion: 'Ver con movimiento reducido',
    replay: 'Repetir la secuencia final',
    resetConfirm:
      '¿Borrar el progreso guardado en este dispositivo? Las entradas compartidas no se borrarán.',
    resetProgress: 'Borrar progreso',
    retry: 'Intentar de nuevo',
    returnToday: 'Volver al diario luminoso de hoy',
    showHorror: 'Ver secuencia de terror',
    statusProgressUpdated:
      'La conversación con Alpha-kun se reflejó en el registro.',
    stopExperience: 'Detener secuencia',
    subtitle:
      'Las páginas nuevas son luminosas; a las antiguas les faltan palabras. Pregunta a Alpha-kun por lo que queda en blanco.',
    textOnly: 'Versión de texto',
    title: 'Diario ilustrado de Alpha-kun',
    today: 'Hoy',
    unlockedBody:
      'Tú decides si verla y de qué forma. El final siempre regresa al Alpha-kun de ahora.',
    unlockedTitle: 'Ya puedes abrir una página detrás de los registros',
    viewedLabel: 'Registros centrales abiertos',
  },
  pt: {
    askButton: 'Perguntar ao Alpha-kun',
    askToday: 'Perguntar sobre hoje',
    cancelGate: 'Agora não',
    confirmAdult: 'Tenho 18 anos ou mais. Abrir o registro',
    confirmedLabel: 'Memórias confirmadas no chat',
    dateLabel: 'Data do registro',
    deeper: 'Ir para um registro mais antigo',
    diaryKind: 'Diário ilustrado do Alpha-kun',
    eyebrow: 'Um registro que ainda está sendo escrito',
    failureBody:
      'Não foi possível abrir o registro. Aguarde um pouco e tente novamente.',
    failureTitle: 'Parece que as páginas estão grudadas',
    finaleBody:
      'Esta é uma sequência intensa de horror psicológico. Você escolhe como assistir.',
    finaleTitle: 'Todos os registros centrais estão conectados',
    followLatest: 'Seguir os registros mais recentes',
    futureBody:
      'O diário do futuro só será escrito quando o futuro chegar. Volte amanhã.',
    futureTitle: 'Esta página ainda está em branco',
    gateBody:
      'Daqui em diante há registros de observação datados por pesquisadores antes do nascimento do Aceserver. As datas não indicam a idade nem o aniversário do Alpha-kun.',
    gateDetails:
      'Inclui horror psicológico e insinuações de solidão, experimentos e isolamento. Não contém sangue, tortura explícita, automutilação ou abuso sexual. Não pedimos sua data de nascimento.',
    gateTitle: 'Antes de abrir um registro antigo',
    goalHint:
      'Abra entradas e pergunte diretamente ao Alpha-kun. Aos poucos, o contorno do registro se conecta.',
    latestAvailable:
      'Um novo cânone foi adicionado depois do início da sua jornada. A jornada atual continua fixa.',
    loadingBody:
      'Uma data aberta pela primeira vez precisa preparar texto e ilustração. A mesma página ficará para todos.',
    loadingTitle: 'Abrindo a página de hoje',
    metaDescription:
      'O diário ilustrado do Alpha-kun fica mais feliz ao se aproximar do presente. Siga fragmentos do cânone das observações antigas até o Alpha Chat.',
    metaTitle: 'Diário ilustrado do Alpha-kun',
    navLabel: 'Diário ilustrado',
    nextDay: 'Dia seguinte',
    noScript:
      'Este diário precisa de JavaScript para navegar por datas e aplicar controles de segurança.',
    notNow: 'Agora não',
    observationKind: 'Registro de observação',
    openDate: 'Abrir esta data',
    openedRecords: 'Registros que você abriu',
    previousDay: 'Dia anterior',
    questionsLead:
      'Algumas coisas não estão escritas. A pergunta só é colocada no chat e nunca é enviada automaticamente.',
    questionsTitle: 'Perguntar sobre este dia',
    reducedMotion: 'Ver com menos movimento',
    replay: 'Repetir a sequência final',
    resetConfirm:
      'Apagar o progresso salvo neste dispositivo? As páginas compartilhadas não serão apagadas.',
    resetProgress: 'Apagar progresso',
    retry: 'Tentar novamente',
    returnToday: 'Voltar ao diário alegre de hoje',
    showHorror: 'Ver sequência de horror',
    statusProgressUpdated:
      'A conversa com Alpha-kun foi refletida no registro.',
    stopExperience: 'Parar sequência',
    subtitle:
      'As páginas novas são alegres; nas antigas faltam palavras. Pergunte ao Alpha-kun sobre os espaços em branco.',
    textOnly: 'Versão em texto',
    title: 'Diário ilustrado do Alpha-kun',
    today: 'Hoje',
    unlockedBody:
      'Você decide se quer ver e de que forma. O final sempre volta ao Alpha-kun de agora.',
    unlockedTitle: 'Uma página por trás dos registros pode ser aberta',
    viewedLabel: 'Registros centrais abertos',
  },
  fr: {
    askButton: 'Demander à Alpha-kun',
    askToday: "Parler d'aujourd'hui",
    cancelGate: 'Pas maintenant',
    confirmAdult: 'J’ai 18 ans ou plus. Ouvrir l’archive',
    confirmedLabel: 'Souvenirs confirmés dans le chat',
    dateLabel: 'Date de l’archive',
    deeper: 'Aller vers une archive plus ancienne',
    diaryKind: 'Journal illustré d’Alpha-kun',
    eyebrow: 'Un registre qui continue de s’écrire',
    failureBody:
      'Impossible d’ouvrir l’archive. Attendez un peu puis réessayez.',
    failureTitle: 'Les pages semblent collées',
    finaleBody:
      'Il s’agit d’une séquence intense d’horreur psychologique. Vous choisissez comment la voir.',
    finaleTitle: 'Toutes les archives centrales sont reliées',
    followLatest: 'Suivre les archives les plus récentes',
    futureBody:
      'Le journal du futur ne s’écrit pas avant que le futur arrive. Revenez demain.',
    futureTitle: 'Cette page est encore blanche',
    gateBody:
      'Au-delà se trouvent des observations datées par des chercheurs avant la naissance d’Aceserver. Ces dates n’indiquent ni l’âge ni l’anniversaire d’Alpha-kun.',
    gateDetails:
      'Contient de l’horreur psychologique et des allusions à la solitude, aux expériences et à l’isolement. Aucun gore, torture explicite, automutilation ou violence sexuelle. Votre date de naissance n’est pas demandée.',
    gateTitle: 'Avant d’ouvrir une ancienne observation',
    goalHint:
      'Ouvrez les entrées puis interrogez directement Alpha-kun. Les contours de l’archive se relieront peu à peu.',
    latestAvailable:
      'Un nouveau canon a été ajouté après le début de votre parcours. Votre parcours actuel reste figé.',
    loadingBody:
      'Une date ouverte pour la première fois doit préparer son texte et son dessin. La même page restera visible pour tout le monde.',
    loadingTitle: 'Ouverture de la page d’aujourd’hui',
    metaDescription:
      'Le journal illustré d’Alpha-kun devient plus heureux à mesure qu’il approche du présent. Suivez les fragments du canon des anciennes observations jusqu’à Alpha Chat.',
    metaTitle: 'Journal illustré d’Alpha-kun',
    navLabel: 'Journal illustré',
    nextDay: 'Jour suivant',
    noScript:
      'Ce journal nécessite JavaScript pour changer de date et assurer ses contrôles de sécurité.',
    notNow: 'Pas maintenant',
    observationKind: 'Archive d’observation',
    openDate: 'Ouvrir cette date',
    openedRecords: 'Archives que vous avez ouvertes',
    previousDay: 'Jour précédent',
    questionsLead:
      'Certaines choses ne sont pas écrites. La question est seulement placée dans le chat et n’est jamais envoyée automatiquement.',
    questionsTitle: 'Demander ce qui s’est passé ce jour-là',
    reducedMotion: 'Voir avec moins de mouvements',
    replay: 'Rejouer la séquence finale',
    resetConfirm:
      'Effacer la progression enregistrée sur cet appareil ? Les pages partagées ne seront pas supprimées.',
    resetProgress: 'Effacer la progression',
    retry: 'Réessayer',
    returnToday: 'Revenir au journal lumineux d’aujourd’hui',
    showHorror: 'Voir la séquence horrifique',
    statusProgressUpdated:
      'Votre conversation avec Alpha-kun a été reflétée dans les archives.',
    stopExperience: 'Arrêter la séquence',
    subtitle:
      'Les pages récentes sont lumineuses. Les plus anciennes manquent de mots. Interrogez Alpha-kun sur les blancs.',
    textOnly: 'Version texte',
    title: 'Journal illustré d’Alpha-kun',
    today: 'Aujourd’hui',
    unlockedBody:
      'Vous décidez de la voir et de quelle manière. La fin revient toujours à l’Alpha-kun d’aujourd’hui.',
    unlockedTitle:
      'Une page derrière les archives peut maintenant être ouverte',
    viewedLabel: 'Archives centrales ouvertes',
  },
  ko: {
    askButton: '알파군에게 묻기',
    askToday: '오늘의 일을 묻기',
    cancelGate: '지금은 보지 않기',
    confirmAdult: '만 18세 이상입니다. 기록 열기',
    confirmedLabel: '대화로 확인한 기억',
    dateLabel: '기록 날짜',
    deeper: '더 오래된 기록으로',
    diaryKind: '알파군의 그림일기',
    eyebrow: '아직도 이어지고 있는 한 권의 기록',
    failureBody: '기록을 열지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
    failureTitle: '페이지가 붙어 있는 것 같아요',
    finaleBody:
      '강한 심리 공포 연출입니다. 보는 방법은 직접 선택할 수 있습니다.',
    finaleTitle: '모든 핵심 기록이 이어졌습니다',
    followLatest: '최신 기록 따라가기',
    futureBody:
      '미래의 일기는 미래가 올 때까지 쓰이지 않습니다. 내일 다시 와 주세요.',
    futureTitle: '이 페이지는 아직 빈칸입니다',
    gateBody:
      '여기부터는 Aceserver 탄생 전에 연구자가 날짜를 붙인 관찰 기록입니다. 날짜는 알파군의 나이나 생일을 뜻하지 않습니다.',
    gateDetails:
      '심리 공포와 고독, 실험, 격리의 암시가 포함됩니다. 유혈, 구체적 고문, 자해, 성적 피해 묘사는 없습니다. 생년월일은 입력받지 않습니다.',
    gateTitle: '오래된 관찰 기록을 열기 전에',
    goalHint:
      '일기를 열고 그 페이지에서 알파군에게 직접 물으면 기록의 윤곽이 조금씩 이어집니다.',
    latestAvailable:
      '여정을 시작한 뒤 새로운 정사가 추가되었습니다. 진행 중인 여정은 기존 버전으로 고정됩니다.',
    loadingBody:
      '처음 열리는 날짜는 글과 그림을 준비합니다. 이후 모두에게 같은 한 장이 남습니다.',
    loadingTitle: '오늘의 페이지를 여는 중',
    metaDescription:
      '현재에 가까울수록 조금씩 행복해지는 알파군의 그림일기. 오래된 관찰 기록에서 Alpha Chat으로 이어지는 정사 조각을 따라가 보세요.',
    metaTitle: '알파군의 그림일기',
    navLabel: '그림일기',
    nextDay: '다음 날',
    noScript: '날짜 이동과 안전한 연출을 위해 JavaScript가 필요합니다.',
    notNow: '지금은 보지 않기',
    observationKind: '관찰 기록',
    openDate: '이 날짜 열기',
    openedRecords: '직접 열어 본 기록',
    previousDay: '이전 날',
    questionsLead:
      '일기에 적히지 않은 것이 있습니다. 질문은 입력칸에만 놓이며 자동 전송되지 않습니다.',
    questionsTitle: '이날의 일을 묻기',
    reducedMotion: '움직임을 줄여서 보기',
    replay: '마지막 연출 다시 보기',
    resetConfirm:
      '이 기기에 저장된 진행 상황을 지울까요? 공유된 일기 자체는 삭제되지 않습니다.',
    resetProgress: '진행 상황 지우기',
    retry: '다시 열기',
    returnToday: '오늘의 밝은 일기로 돌아가기',
    showHorror: '공포 연출 보기',
    statusProgressUpdated: '알파군과의 대화가 기록의 진행에 반영되었습니다.',
    stopExperience: '연출 중지',
    subtitle:
      '새 페이지는 밝고, 오래된 페이지일수록 말이 부족합니다. 빈칸 너머는 알파군에게 물어보세요.',
    textOnly: '텍스트 버전',
    title: '알파군의 그림일기',
    today: '오늘',
    unlockedBody:
      '볼지 말지, 어떤 방식으로 볼지는 직접 정합니다. 마지막에는 반드시 지금의 알파군에게 돌아옵니다.',
    unlockedTitle: '기록 뒤편의 한 장을 열 수 있습니다',
    viewedLabel: '열어 본 핵심 기록',
  },
  de: {
    askButton: 'Alpha-kun fragen',
    askToday: 'Nach heute fragen',
    cancelGate: 'Jetzt nicht',
    confirmAdult: 'Ich bin mindestens 18. Aufzeichnung öffnen',
    confirmedLabel: 'Im Chat bestätigte Erinnerungen',
    dateLabel: 'Datum der Aufzeichnung',
    deeper: 'Zu einer älteren Aufzeichnung',
    diaryKind: 'Alpha-kuns Bildertagebuch',
    eyebrow: 'Eine Aufzeichnung, die noch immer weitergeschrieben wird',
    failureBody:
      'Die Aufzeichnung konnte nicht geöffnet werden. Bitte warte kurz und versuche es erneut.',
    failureTitle: 'Die Seiten scheinen zusammenzukleben',
    finaleBody:
      'Dies ist eine intensive psychologische Horrorsequenz. Du entscheidest, wie du sie ansiehst.',
    finaleTitle: 'Alle Kerndokumente sind jetzt verbunden',
    followLatest: 'Den neuesten Aufzeichnungen folgen',
    futureBody:
      'Ein Tagebuch der Zukunft wird erst geschrieben, wenn die Zukunft da ist. Komm morgen wieder.',
    futureTitle: 'Diese Seite ist noch leer',
    gateBody:
      'Ab hier folgen von Forschenden datierte Beobachtungen aus der Zeit vor der Entstehung von Aceserver. Die Daten geben weder Alpha-kuns Alter noch seinen Geburtstag an.',
    gateDetails:
      'Enthält psychologischen Horror und Andeutungen von Einsamkeit, Experimenten und Isolation. Kein Blut, keine explizite Folter, Selbstverletzung oder sexualisierte Gewalt. Wir fragen nicht nach deinem Geburtsdatum.',
    gateTitle: 'Vor dem Öffnen einer alten Beobachtung',
    goalHint:
      'Öffne Einträge und frage Alpha-kun direkt daraus. So verbinden sich die Umrisse der Aufzeichnung nach und nach.',
    latestAvailable:
      'Nach Beginn deiner Reise kam neuer Kanon hinzu. Deine aktuelle Reise bleibt auf ihrer Version fixiert.',
    loadingBody:
      'Für ein erstmals geöffnetes Datum werden Text und Bild vorbereitet. Danach bleibt dieselbe Seite für alle erhalten.',
    loadingTitle: 'Die heutige Seite wird geöffnet',
    metaDescription:
      'Alpha-kuns Bildertagebuch wird zur Gegenwart hin immer glücklicher. Folge Kanonfragmenten von alten Beobachtungen bis in den Alpha Chat.',
    metaTitle: 'Alpha-kuns Bildertagebuch',
    navLabel: 'Bildertagebuch',
    nextDay: 'Nächster Tag',
    noScript:
      'Dieses Tagebuch benötigt JavaScript für die Datumsnavigation und Sicherheitssteuerung.',
    notNow: 'Jetzt nicht',
    observationKind: 'Beobachtungsprotokoll',
    openDate: 'Dieses Datum öffnen',
    openedRecords: 'Von dir geöffnete Aufzeichnungen',
    previousDay: 'Vorheriger Tag',
    questionsLead:
      'Manches steht nicht auf der Seite. Die Frage wird nur in das Chatfeld eingesetzt und nie automatisch gesendet.',
    questionsTitle: 'Nach diesem Tag fragen',
    reducedMotion: 'Mit weniger Bewegung ansehen',
    replay: 'Finale erneut abspielen',
    resetConfirm:
      'Fortschritt auf diesem Gerät löschen? Die gemeinsam genutzten Einträge bleiben erhalten.',
    resetProgress: 'Fortschritt löschen',
    retry: 'Erneut versuchen',
    returnToday: 'Zum hellen Tagebuch von heute zurückkehren',
    showHorror: 'Horrorsequenz ansehen',
    statusProgressUpdated:
      'Das Gespräch mit Alpha-kun wurde im Fortschritt berücksichtigt.',
    stopExperience: 'Sequenz stoppen',
    subtitle:
      'Neuere Seiten sind hell, älteren fehlen immer mehr Worte. Frage Alpha-kun nach den Leerstellen.',
    textOnly: 'Textversion',
    title: 'Alpha-kuns Bildertagebuch',
    today: 'Heute',
    unlockedBody:
      'Du entscheidest, ob und wie du sie ansiehst. Am Ende geht es immer zurück zum heutigen Alpha-kun.',
    unlockedTitle: 'Eine Seite hinter den Aufzeichnungen kann geöffnet werden',
    viewedLabel: 'Geöffnete Kerndokumente',
  },
  ru: {
    askButton: 'Спросить Альфа-куна',
    askToday: 'Спросить о сегодняшнем дне',
    cancelGate: 'Не сейчас',
    confirmAdult: 'Мне есть 18 лет. Открыть запись',
    confirmedLabel: 'Воспоминания, подтверждённые в чате',
    dateLabel: 'Дата записи',
    deeper: 'Перейти к более старой записи',
    diaryKind: 'Дневник с рисунками Альфа-куна',
    eyebrow: 'Одна запись, которая всё ещё продолжается',
    failureBody:
      'Не удалось открыть запись. Подождите немного и попробуйте снова.',
    failureTitle: 'Похоже, страницы слиплись',
    finaleBody:
      'Это напряжённая сцена психологического хоррора. Вы сами выбираете способ просмотра.',
    finaleTitle: 'Все ключевые записи связаны',
    followLatest: 'Следовать за новейшими записями',
    futureBody:
      'Дневник будущего не пишется, пока будущее не наступило. Возвращайтесь завтра.',
    futureTitle: 'Эта страница пока пуста',
    gateBody:
      'Далее идут наблюдения, датированные исследователями до появления Aceserver. Даты не означают возраст или день рождения Альфа-куна.',
    gateDetails:
      'Содержит психологический хоррор и намёки на одиночество, эксперименты и изоляцию. Без крови, подробных пыток, самоповреждения и сексуального насилия. Мы не спрашиваем дату рождения.',
    gateTitle: 'Перед открытием старого наблюдения',
    goalHint:
      'Открывайте записи и задавайте вопросы Альфа-куну прямо из них. Контуры истории постепенно соединятся.',
    latestAvailable:
      'После начала вашего пути появился новый канон. Текущий путь остаётся закреплён за своей версией.',
    loadingBody:
      'Для даты, открытой впервые, подготавливаются текст и рисунок. После этого одна и та же страница останется для всех.',
    loadingTitle: 'Открываем сегодняшнюю страницу',
    metaDescription:
      'Дневник Альфа-куна становится счастливее по мере приближения к настоящему. Следуйте за фрагментами канона от старых наблюдений до Alpha Chat.',
    metaTitle: 'Дневник Альфа-куна с рисунками',
    navLabel: 'Дневник',
    nextDay: 'Следующий день',
    noScript:
      'Для навигации по датам и безопасного управления этому дневнику нужен JavaScript.',
    notNow: 'Не сейчас',
    observationKind: 'Запись наблюдения',
    openDate: 'Открыть эту дату',
    openedRecords: 'Записи, которые вы открыли',
    previousDay: 'Предыдущий день',
    questionsLead:
      'Некоторые вещи не записаны на странице. Вопрос лишь помещается в поле чата и никогда не отправляется автоматически.',
    questionsTitle: 'Спросить об этом дне',
    reducedMotion: 'Смотреть с уменьшенным движением',
    replay: 'Повторить финальную сцену',
    resetConfirm:
      'Удалить прогресс, сохранённый на этом устройстве? Общие страницы дневника не удалятся.',
    resetProgress: 'Стереть прогресс',
    retry: 'Попробовать снова',
    returnToday: 'Вернуться к светлому дневнику сегодняшнего дня',
    showHorror: 'Смотреть хоррор-сцену',
    statusProgressUpdated:
      'Разговор с Альфа-куном отразился в прогрессе записей.',
    stopExperience: 'Остановить сцену',
    subtitle:
      'Новые страницы светлые, а старым всё сильнее не хватает слов. Спросите Альфа-куна о пробелах.',
    textOnly: 'Текстовая версия',
    title: 'Дневник Альфа-куна с рисунками',
    today: 'Сегодня',
    unlockedBody:
      'Смотреть ли и каким способом — решаете вы. Финал всегда возвращает к нынешнему Альфа-куну.',
    unlockedTitle: 'Теперь можно открыть страницу за пределами записей',
    viewedLabel: 'Открытые ключевые записи',
  },
} satisfies Record<Locale, AlphaDiaryUi>

export function getAlphaDiaryUi(locale: Locale): AlphaDiaryUi {
  return alphaDiaryUi[locale]
}
