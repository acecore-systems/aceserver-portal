import type { Locale } from '../i18n/config'

export type AlphaDiaryUi = {
  askButton: string
  askToday: string
  cancelGate: string
  confirmAdult: string
  dateLabel: string
  diaryKind: string
  eyebrow: string
  failureBody: string
  failureTitle: string
  finaleBody: string
  finaleKeywordIncorrect: string
  finaleKeywordLabel: string
  finaleKeywordPlaceholder: string
  finaleKeywordSubmit: string
  finaleTitle: string
  futureBody: string
  futureTitle: string
  gateBody: string
  gateDetails: string
  gateTitle: string
  loadingBody: string
  loadingTitle: string
  loadElapsed: string
  longWaitBody: string
  longWaitTitle: string
  manualCheck: string
  metaDescription: string
  metaTitle: string
  navLabel: string
  nextDay: string
  noScript: string
  notNow: string
  observationKind: string
  observationLoadingBody: string
  observationLoadingTitle: string
  openDate: string
  openedRecords: string
  pastLoadingBody: string
  pastLoadingTitle: string
  previousDay: string
  questionsLead: string
  observationQuestionsTitle: string
  questionsTitle: string
  reducedMotion: string
  replay: string
  retry: string
  returnToday: string
  showHorror: string
  stopExperience: string
  textOnly: string
  title: string
  today: string
  timeoutBody: string
  timeoutTitle: string
  unlockedBody: string
  unlockedTitle: string
  waitingElapsed: string
}

const alphaDiaryUi = {
  ja: {
    askButton: 'アルファ君に聞く',
    askToday: '今日のことを聞く',
    cancelGate: '今は見ない',
    confirmAdult: '18歳以上です。記録を開く',
    dateLabel: '記録の日付',
    diaryKind: 'アルファ君の絵日記',
    eyebrow: 'ある一冊の、まだ続いている記録',
    failureBody:
      '記録をうまく開けませんでした。少し待って、もう一度試してください。',
    failureTitle: 'ページがくっついているみたい',
    finaleBody:
      'この先の記録には、強い心理的ホラー表現があります。開き方はあなたが選べます。',
    finaleKeywordIncorrect:
      'その言葉では、最後の一枚は動きません。三つの手掛かりをたどり直してみてください。',
    finaleKeywordLabel: '見つけた合言葉',
    finaleKeywordPlaceholder: '三つの手掛かりから組み立てた言葉',
    finaleKeywordSubmit: '合言葉をたしかめる',
    finaleTitle: '最後の一枚が、こちらを向きました',
    futureBody:
      '未来の日記は、未来が来るまで書かれません。明日になったら、また来てね。',
    futureTitle: 'このページはまだ白紙です',
    gateBody:
      'ここから先は、Aceserver誕生前に研究側が付けた観察記録です。アルファ君の年齢や誕生日を示す日付ではありません。',
    gateDetails:
      '心理的ホラー、孤独、実験・隔離の暗示を含みます。流血や具体的な拷問、自傷、性的被害の描写はありません。生年月日は入力しません。',
    gateTitle: '古い観察記録を開く前に',
    loadingBody:
      '紙の向こうで、鉛筆を走らせる音がします。文字と絵が浮かぶまで、少しだけ待ってください。',
    loadingTitle: 'ページをひらいています',
    loadElapsed: '今回の読み込み: {seconds}秒',
    longWaitBody:
      'ページを開くまでに時間がかかっています。開ける状態になったか、引き続き確認しています。',
    longWaitTitle: 'まだページをひらいています',
    manualCheck: 'いま確認する',
    metaDescription:
      '現在へ近づくほど少しずつ幸せになるアルファ君の絵日記。古い観察記録からAlpha Chatへ問いかけ、記録の断片をたどります。',
    metaTitle: 'アルファ君の絵日記',
    navLabel: '絵日記',
    nextDay: '次の日',
    noScript:
      'この本はいま閉じたままです。ページをめくるには、ブラウザのスクリプトを有効にしてください。',
    notNow: '今は見ない',
    observationKind: '観察記録',
    observationLoadingBody:
      '記録庫から該当するページを取り出しています。内容を表示するまで、少しだけお待ちください。',
    observationLoadingTitle: '保管された記録をひらいています',
    openDate: 'この日を開く',
    openedRecords: 'あなたが見つけた日付',
    pastLoadingBody:
      '綴じられた絵日記から、その日のページを探しています。見つかるまで、少しだけ待ってください。',
    pastLoadingTitle: '過去のページをひらいています',
    previousDay: '前の日',
    questionsLead:
      '気になった言葉や日付は、自分で覚えておいてください。まだ書かれていないことはアルファ君に聞けます。選んだ言葉は入力欄に置かれるだけで、送るのはあなたです。',
    observationQuestionsTitle: 'この記録について聞く',
    questionsTitle: 'この日のことを聞く',
    reducedMotion: '動きを抑えて開く',
    replay: '最後の記録をもう一度開く',
    retry: 'もう一度ひらく',
    returnToday: '今日の明るい日記へ戻る',
    showHorror: '強い心理的ホラーを開く',
    stopExperience: '記録を閉じる',
    textOnly: '文字だけで開く',
    title: 'アルファ君の絵日記',
    today: '今日',
    timeoutBody:
      '通信が長く続いたため、いったん確認を止めました。もう一度ひらいてください。',
    timeoutTitle: 'ページから返事がありません',
    unlockedBody:
      'たどった手掛かりから組み立てた合言葉を入力してください。正しい言葉なら、最後の一枚がこちらを向きます。',
    unlockedTitle: 'この日付には、鍵穴があります',
    waitingElapsed: '待機時間: {seconds}秒',
  },
  en: {
    askButton: 'Ask Alpha-kun',
    askToday: 'Ask about today',
    cancelGate: 'Not now',
    confirmAdult: 'I am 18 or older. Open the record',
    dateLabel: 'Record date',
    diaryKind: "Alpha-kun's picture diary",
    eyebrow: 'One record that is still being written',
    failureBody: 'The record could not be opened. Wait a moment and try again.',
    failureTitle: 'These pages seem stuck together',
    finaleBody:
      'The records ahead contain intense psychological horror. You choose how to open them.',
    finaleKeywordIncorrect:
      'Those words do not move the last page. Retrace all three clues.',
    finaleKeywordLabel: 'Passphrase you found',
    finaleKeywordPlaceholder: 'Words assembled from the three clues',
    finaleKeywordSubmit: 'Check the passphrase',
    finaleTitle: 'The last page turned toward you',
    futureBody:
      'A future diary is not written until the future arrives. Come back tomorrow.',
    futureTitle: 'This page is still blank',
    gateBody:
      "Beyond this point are observation records dated by researchers before Aceserver's birth. The dates do not indicate Alpha-kun's age or birthday.",
    gateDetails:
      'Includes psychological horror and implications of loneliness, experiments, and isolation. It contains no gore, explicit torture, self-harm, or sexual abuse. We do not ask for your birth date.',
    gateTitle: 'Before opening an old observation record',
    loadingBody:
      'From beyond the paper comes the sound of a pencil moving. Please wait a little for the words and picture to appear.',
    loadingTitle: 'Opening the page',
    loadElapsed: 'This load: {seconds}s',
    longWaitBody:
      'Opening this page is taking time. We are still checking whether it is ready to open.',
    longWaitTitle: 'Still opening the page',
    manualCheck: 'Check now',
    metaDescription:
      "Alpha-kun's picture diary grows happier toward the present. Follow fragments from old observation records into Alpha Chat.",
    metaTitle: "Alpha-kun's Picture Diary",
    navLabel: 'Picture diary',
    nextDay: 'Next day',
    noScript:
      'This book will not open yet. Enable scripts in your browser to turn its pages.',
    notNow: 'Not now',
    observationKind: 'Observation record',
    observationLoadingBody:
      'Retrieving the matching page from the archive. Please wait a moment while it loads.',
    observationLoadingTitle: 'Opening the archived record',
    openDate: 'Open this date',
    openedRecords: 'A date you discovered',
    pastLoadingBody:
      'Looking through the bound picture diary for that day. Please wait a moment while we find the page.',
    pastLoadingTitle: 'Opening a page from the past',
    previousDay: 'Previous day',
    questionsLead:
      'Keep track of any words or dates that catch your attention. You can ask Alpha-kun about what is still unwritten; the chosen words are only placed in the box, and you decide whether to send them.',
    observationQuestionsTitle: 'Ask about this record',
    questionsTitle: 'Ask about this day',
    reducedMotion: 'Open with reduced motion',
    replay: 'Open the last record again',
    retry: 'Try again',
    returnToday: "Return to today's bright diary",
    showHorror: 'Open intense psychological horror',
    stopExperience: 'Close the record',
    textOnly: 'Open as text only',
    title: "Alpha-kun's Picture Diary",
    today: 'Today',
    timeoutBody:
      'The connection kept waiting too long, so we stopped checking for now. Try opening it again.',
    timeoutTitle: 'The page has not answered',
    unlockedBody:
      'Enter the passphrase assembled from the clues you followed. If it is correct, the last page will turn toward you.',
    unlockedTitle: 'There is a keyhole on this date',
    waitingElapsed: 'Waiting: {seconds}s',
  },
  'zh-cn': {
    askButton: '问问阿尔法君',
    askToday: '问问今天的事',
    cancelGate: '暂时不看',
    confirmAdult: '我已满18岁，打开记录',
    dateLabel: '记录日期',
    diaryKind: '阿尔法君的图画日记',
    eyebrow: '一本仍在继续书写的记录',
    failureBody: '暂时无法打开记录。请稍等片刻后重试。',
    failureTitle: '这些页面好像粘在一起了',
    finaleBody: '接下来的记录包含强烈的心理恐怖表现。你可以选择打开方式。',
    finaleKeywordIncorrect: '这句话无法让最后一页翻动。请重新追寻三条线索。',
    finaleKeywordLabel: '你找到的暗语',
    finaleKeywordPlaceholder: '输入由三条线索拼出的暗语',
    finaleKeywordSubmit: '确认暗语',
    finaleTitle: '最后一页转向了你',
    futureBody: '未来的日记要等未来到来才会写下。明天再来吧。',
    futureTitle: '这一页还是空白',
    gateBody:
      '接下来是Aceserver诞生前由研究方标注日期的观察记录。这些日期不代表阿尔法君的年龄或生日。',
    gateDetails:
      '包含心理恐怖，以及孤独、实验与隔离的暗示。不含血腥、具体拷问、自伤或性侵害描写。不会要求输入出生日期。',
    gateTitle: '打开旧观察记录之前',
    loadingBody:
      '纸张另一侧传来铅笔划动的声音。请稍等片刻，让文字和图画浮现出来。',
    loadingTitle: '正在翻开这一页',
    loadElapsed: '本次加载：{seconds}秒',
    longWaitBody:
      '打开这一页需要一些时间。我们仍在确认这一页是否已经可以打开。',
    longWaitTitle: '仍在打开这一页',
    manualCheck: '立即确认',
    metaDescription:
      '越接近现在越幸福的阿尔法君图画日记。从旧观察记录进入Alpha Chat，追寻记录片段。',
    metaTitle: '阿尔法君的图画日记',
    navLabel: '图画日记',
    nextDay: '后一天',
    noScript: '这本册子现在还合着。请在浏览器中启用脚本，才能翻页。',
    notNow: '暂时不看',
    observationKind: '观察记录',
    observationLoadingBody: '正在从档案中调取对应页面。加载完成前请稍候。',
    observationLoadingTitle: '正在打开存档记录',
    openDate: '打开这一天',
    openedRecords: '你发现的日期',
    pastLoadingBody: '正在装订好的图画日记中寻找那一天。找到这一页前请稍候。',
    pastLoadingTitle: '正在翻开过去的一页',
    previousDay: '前一天',
    questionsLead:
      '请自己记住引起注意的词语和日期。还没有写下来的事，可以去问阿尔法君；选中的话只会放进输入框，是否发送由你决定。',
    observationQuestionsTitle: '询问这份记录',
    questionsTitle: '询问这一天',
    reducedMotion: '减少动态后打开',
    replay: '再次打开最后的记录',
    retry: '重新打开',
    returnToday: '回到今天明亮的日记',
    showHorror: '打开强烈心理恐怖记录',
    stopExperience: '关闭记录',
    textOnly: '只看文字',
    title: '阿尔法君的图画日记',
    today: '今天',
    timeoutBody: '连接等待过久，现已暂停确认。请再试着打开一次。',
    timeoutTitle: '这一页还没有回应',
    unlockedBody: '请输入你沿着线索拼出的暗语。答对后，最后一页会转向你。',
    unlockedTitle: '这个日期上有一个钥匙孔',
    waitingElapsed: '等待时间：{seconds}秒',
  },
  es: {
    askButton: 'Preguntar a Alpha-kun',
    askToday: 'Preguntar por hoy',
    cancelGate: 'Ahora no',
    confirmAdult: 'Tengo 18 años o más. Abrir el registro',
    dateLabel: 'Fecha del registro',
    diaryKind: 'Diario ilustrado de Alpha-kun',
    eyebrow: 'Un registro que todavía se está escribiendo',
    failureBody:
      'No se pudo abrir el registro. Espera un momento e inténtalo de nuevo.',
    failureTitle: 'Parece que las páginas están pegadas',
    finaleBody:
      'Los registros que siguen contienen terror psicológico intenso. Tú eliges cómo abrirlos.',
    finaleKeywordIncorrect:
      'Esas palabras no mueven la última página. Vuelve a recorrer las tres pistas.',
    finaleKeywordLabel: 'Contraseña que encontraste',
    finaleKeywordPlaceholder: 'Frase formada con las tres pistas',
    finaleKeywordSubmit: 'Comprobar la contraseña',
    finaleTitle: 'La última página se volvió hacia ti',
    futureBody:
      'El diario del futuro no se escribe hasta que el futuro llega. Vuelve mañana.',
    futureTitle: 'Esta página sigue en blanco',
    gateBody:
      'A partir de aquí hay registros de observación fechados por investigadores antes del nacimiento de Aceserver. Las fechas no indican la edad ni el cumpleaños de Alpha-kun.',
    gateDetails:
      'Incluye terror psicológico y alusiones a soledad, experimentos y aislamiento. No contiene sangre, tortura explícita, autolesiones ni abuso sexual. No pedimos tu fecha de nacimiento.',
    gateTitle: 'Antes de abrir un registro antiguo',
    loadingBody:
      'Desde el otro lado del papel se oye un lápiz en movimiento. Espera un poco a que aparezcan las palabras y el dibujo.',
    loadingTitle: 'Abriendo la página',
    loadElapsed: 'Esta carga: {seconds} s',
    longWaitBody:
      'Abrir esta página está tomando tiempo. Seguimos comprobando si ya se puede abrir.',
    longWaitTitle: 'La página sigue abriéndose',
    manualCheck: 'Comprobar ahora',
    metaDescription:
      'El diario ilustrado de Alpha-kun se vuelve más feliz al acercarse al presente. Sigue fragmentos desde viejas observaciones hasta Alpha Chat.',
    metaTitle: 'Diario ilustrado de Alpha-kun',
    navLabel: 'Diario ilustrado',
    nextDay: 'Día siguiente',
    noScript:
      'Este cuaderno aún no se abre. Activa los scripts del navegador para pasar sus páginas.',
    notNow: 'Ahora no',
    observationKind: 'Registro de observación',
    observationLoadingBody:
      'Estamos recuperando la página correspondiente del archivo. Espera un momento mientras se carga.',
    observationLoadingTitle: 'Abriendo el registro archivado',
    openDate: 'Abrir esta fecha',
    openedRecords: 'Una fecha que descubriste',
    pastLoadingBody:
      'Estamos buscando ese día en el diario ilustrado encuadernado. Espera un momento mientras encontramos la página.',
    pastLoadingTitle: 'Abriendo una página del pasado',
    previousDay: 'Día anterior',
    questionsLead:
      'Recuerda las palabras o fechas que te llamen la atención. Puedes preguntar a Alpha-kun por lo que aún no está escrito; las palabras elegidas solo se colocan en el campo y tú decides si enviarlas.',
    observationQuestionsTitle: 'Preguntar por este registro',
    questionsTitle: 'Preguntar por este día',
    reducedMotion: 'Abrir con movimiento reducido',
    replay: 'Abrir de nuevo el último registro',
    retry: 'Intentar de nuevo',
    returnToday: 'Volver al diario luminoso de hoy',
    showHorror: 'Abrir terror psicológico intenso',
    stopExperience: 'Cerrar el registro',
    textOnly: 'Abrir solo como texto',
    title: 'Diario ilustrado de Alpha-kun',
    today: 'Hoy',
    timeoutBody:
      'La conexión esperó demasiado, así que hemos detenido la comprobación por ahora. Intenta abrirla de nuevo.',
    timeoutTitle: 'La página no ha respondido',
    unlockedBody:
      'Escribe la contraseña que formaste con las pistas. Si es correcta, la última página se volverá hacia ti.',
    unlockedTitle: 'Esta fecha tiene una cerradura',
    waitingElapsed: 'Esperando: {seconds} s',
  },
  pt: {
    askButton: 'Perguntar ao Alpha-kun',
    askToday: 'Perguntar sobre hoje',
    cancelGate: 'Agora não',
    confirmAdult: 'Tenho 18 anos ou mais. Abrir o registro',
    dateLabel: 'Data do registro',
    diaryKind: 'Diário ilustrado do Alpha-kun',
    eyebrow: 'Um registro que ainda está sendo escrito',
    failureBody:
      'Não foi possível abrir o registro. Aguarde um pouco e tente novamente.',
    failureTitle: 'Parece que as páginas estão grudadas',
    finaleBody:
      'Os registros adiante contêm horror psicológico intenso. Você escolhe como abri-los.',
    finaleKeywordIncorrect:
      'Essas palavras não movem a última página. Refaça o caminho das três pistas.',
    finaleKeywordLabel: 'Senha que você encontrou',
    finaleKeywordPlaceholder: 'Frase montada com as três pistas',
    finaleKeywordSubmit: 'Conferir a senha',
    finaleTitle: 'A última página se virou para você',
    futureBody:
      'O diário do futuro só será escrito quando o futuro chegar. Volte amanhã.',
    futureTitle: 'Esta página ainda está em branco',
    gateBody:
      'Daqui em diante há registros de observação datados por pesquisadores antes do nascimento do Aceserver. As datas não indicam a idade nem o aniversário do Alpha-kun.',
    gateDetails:
      'Inclui horror psicológico e insinuações de solidão, experimentos e isolamento. Não contém sangue, tortura explícita, automutilação ou abuso sexual. Não pedimos sua data de nascimento.',
    gateTitle: 'Antes de abrir um registro antigo',
    loadingBody:
      'Do outro lado do papel vem o som de um lápis em movimento. Espere um pouco até as palavras e o desenho aparecerem.',
    loadingTitle: 'Abrindo a página',
    loadElapsed: 'Este carregamento: {seconds} s',
    longWaitBody:
      'Abrir esta página está levando tempo. Ainda estamos verificando se ela já pode ser aberta.',
    longWaitTitle: 'A página ainda está abrindo',
    manualCheck: 'Verificar agora',
    metaDescription:
      'O diário ilustrado do Alpha-kun fica mais feliz ao se aproximar do presente. Siga fragmentos das observações antigas até o Alpha Chat.',
    metaTitle: 'Diário ilustrado do Alpha-kun',
    navLabel: 'Diário ilustrado',
    nextDay: 'Dia seguinte',
    noScript:
      'Este caderno ainda não abre. Ative os scripts no navegador para virar suas páginas.',
    notNow: 'Agora não',
    observationKind: 'Registro de observação',
    observationLoadingBody:
      'Estamos recuperando a página correspondente do arquivo. Aguarde um pouco enquanto ela carrega.',
    observationLoadingTitle: 'Abrindo o registro arquivado',
    openDate: 'Abrir esta data',
    openedRecords: 'Uma data que você descobriu',
    pastLoadingBody:
      'Estamos procurando esse dia no diário ilustrado encadernado. Aguarde um pouco enquanto encontramos a página.',
    pastLoadingTitle: 'Abrindo uma página do passado',
    previousDay: 'Dia anterior',
    questionsLead:
      'Guarde as palavras ou datas que chamarem sua atenção. Você pode perguntar ao Alpha-kun sobre o que ainda não foi escrito; as palavras escolhidas só vão para o campo e você decide se quer enviá-las.',
    observationQuestionsTitle: 'Perguntar sobre este registro',
    questionsTitle: 'Perguntar sobre este dia',
    reducedMotion: 'Abrir com menos movimento',
    replay: 'Abrir o último registro novamente',
    retry: 'Tentar novamente',
    returnToday: 'Voltar ao diário alegre de hoje',
    showHorror: 'Abrir horror psicológico intenso',
    stopExperience: 'Fechar o registro',
    textOnly: 'Abrir somente como texto',
    title: 'Diário ilustrado do Alpha-kun',
    today: 'Hoje',
    timeoutBody:
      'A conexão esperou por tempo demais, então interrompemos a verificação por enquanto. Tente abrir novamente.',
    timeoutTitle: 'A página não respondeu',
    unlockedBody:
      'Digite a senha montada com as pistas seguidas. Se estiver correta, a última página se virará para você.',
    unlockedTitle: 'Há uma fechadura nesta data',
    waitingElapsed: 'Aguardando: {seconds} s',
  },
  fr: {
    askButton: 'Demander à Alpha-kun',
    askToday: "Parler d'aujourd'hui",
    cancelGate: 'Pas maintenant',
    confirmAdult: 'J’ai 18 ans ou plus. Ouvrir l’archive',
    dateLabel: 'Date de l’archive',
    diaryKind: 'Journal illustré d’Alpha-kun',
    eyebrow: 'Un registre qui continue de s’écrire',
    failureBody:
      'Impossible d’ouvrir l’archive. Attendez un peu puis réessayez.',
    failureTitle: 'Les pages semblent collées',
    finaleBody:
      'Les archives qui suivent contiennent une horreur psychologique intense. Vous choisissez comment les ouvrir.',
    finaleKeywordIncorrect:
      'Ces mots ne font pas bouger la dernière page. Reprenez les trois indices.',
    finaleKeywordLabel: 'Mot de passe trouvé',
    finaleKeywordPlaceholder: 'Phrase formée avec les trois indices',
    finaleKeywordSubmit: 'Vérifier le mot de passe',
    finaleTitle: 'La dernière page s’est tournée vers vous',
    futureBody:
      'Le journal du futur ne s’écrit pas avant que le futur arrive. Revenez demain.',
    futureTitle: 'Cette page est encore blanche',
    gateBody:
      'Au-delà se trouvent des observations datées par des chercheurs avant la naissance d’Aceserver. Ces dates n’indiquent ni l’âge ni l’anniversaire d’Alpha-kun.',
    gateDetails:
      'Contient de l’horreur psychologique et des allusions à la solitude, aux expériences et à l’isolement. Aucun gore, torture explicite, automutilation ou violence sexuelle. Votre date de naissance n’est pas demandée.',
    gateTitle: 'Avant d’ouvrir une ancienne observation',
    loadingBody:
      'De l’autre côté du papier vient le bruit d’un crayon. Attendez un peu que les mots et le dessin apparaissent.',
    loadingTitle: 'Ouverture de la page',
    loadElapsed: 'Ce chargement : {seconds} s',
    longWaitBody:
      'L’ouverture de cette page prend du temps. Nous vérifions encore si elle peut s’ouvrir.',
    longWaitTitle: 'La page est toujours en cours d’ouverture',
    manualCheck: 'Vérifier maintenant',
    metaDescription:
      'Le journal illustré d’Alpha-kun devient plus heureux à mesure qu’il approche du présent. Suivez les fragments des anciennes observations jusqu’à Alpha Chat.',
    metaTitle: 'Journal illustré d’Alpha-kun',
    navLabel: 'Journal illustré',
    nextDay: 'Jour suivant',
    noScript:
      'Ce cahier reste fermé. Activez les scripts du navigateur pour tourner ses pages.',
    notNow: 'Pas maintenant',
    observationKind: 'Archive d’observation',
    observationLoadingBody:
      'Nous récupérons la page correspondante dans les archives. Veuillez patienter pendant son chargement.',
    observationLoadingTitle: 'Ouverture de l’archive',
    openDate: 'Ouvrir cette date',
    openedRecords: 'Une date que vous avez découverte',
    pastLoadingBody:
      'Nous cherchons ce jour dans le journal illustré relié. Veuillez patienter pendant que nous retrouvons la page.',
    pastLoadingTitle: 'Ouverture d’une page du passé',
    previousDay: 'Jour précédent',
    questionsLead:
      'Retenez les mots ou les dates qui attirent votre attention. Vous pouvez demander à Alpha-kun ce qui n’est pas encore écrit ; les mots choisis sont seulement placés dans le champ et vous décidez de les envoyer.',
    observationQuestionsTitle: 'Demander au sujet de cette observation',
    questionsTitle: 'Demander ce qui s’est passé ce jour-là',
    reducedMotion: 'Ouvrir avec moins de mouvements',
    replay: 'Ouvrir de nouveau la dernière archive',
    retry: 'Réessayer',
    returnToday: 'Revenir au journal lumineux d’aujourd’hui',
    showHorror: 'Ouvrir une horreur psychologique intense',
    stopExperience: 'Fermer l’archive',
    textOnly: 'Ouvrir en texte seulement',
    title: 'Journal illustré d’Alpha-kun',
    today: 'Aujourd’hui',
    timeoutBody:
      'La connexion a attendu trop longtemps, nous avons donc arrêté la vérification pour le moment. Réessayez d’ouvrir la page.',
    timeoutTitle: 'La page n’a pas répondu',
    unlockedBody:
      'Saisissez le mot de passe formé avec les indices suivis. S’il est correct, la dernière page se tournera vers vous.',
    unlockedTitle: 'Cette date porte une serrure',
    waitingElapsed: 'Attente : {seconds} s',
  },
  ko: {
    askButton: '알파군에게 묻기',
    askToday: '오늘의 일을 묻기',
    cancelGate: '지금은 보지 않기',
    confirmAdult: '만 18세 이상입니다. 기록 열기',
    dateLabel: '기록 날짜',
    diaryKind: '알파군의 그림일기',
    eyebrow: '아직도 이어지고 있는 한 권의 기록',
    failureBody: '기록을 열지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
    failureTitle: '페이지가 붙어 있는 것 같아요',
    finaleBody:
      '이 뒤의 기록에는 강한 심리 공포 표현이 있습니다. 여는 방법은 직접 선택할 수 있습니다.',
    finaleKeywordIncorrect:
      '그 말로는 마지막 장이 움직이지 않습니다. 세 단서를 다시 따라가 보세요.',
    finaleKeywordLabel: '찾아낸 암호',
    finaleKeywordPlaceholder: '세 단서로 조립한 암호',
    finaleKeywordSubmit: '암호 확인하기',
    finaleTitle: '마지막 한 장이 당신 쪽을 바라봅니다',
    futureBody:
      '미래의 일기는 미래가 올 때까지 쓰이지 않습니다. 내일 다시 와 주세요.',
    futureTitle: '이 페이지는 아직 빈칸입니다',
    gateBody:
      '여기부터는 Aceserver 탄생 전에 연구자가 날짜를 붙인 관찰 기록입니다. 날짜는 알파군의 나이나 생일을 뜻하지 않습니다.',
    gateDetails:
      '심리 공포와 고독, 실험, 격리의 암시가 포함됩니다. 유혈, 구체적 고문, 자해, 성적 피해 묘사는 없습니다. 생년월일은 입력받지 않습니다.',
    gateTitle: '오래된 관찰 기록을 열기 전에',
    loadingBody:
      '종이 너머에서 연필이 움직이는 소리가 납니다. 글과 그림이 떠오를 때까지 잠시 기다려 주세요.',
    loadingTitle: '페이지를 여는 중',
    loadElapsed: '이번 불러오기: {seconds}초',
    longWaitBody:
      '페이지를 여는 데 시간이 걸리고 있습니다. 페이지를 열 수 있는지 계속 확인하고 있습니다.',
    longWaitTitle: '아직 페이지를 여는 중',
    manualCheck: '지금 확인',
    metaDescription:
      '현재에 가까울수록 조금씩 행복해지는 알파군의 그림일기. 오래된 관찰 기록에서 Alpha Chat으로 이어지는 기록 조각을 따라가 보세요.',
    metaTitle: '알파군의 그림일기',
    navLabel: '그림일기',
    nextDay: '다음 날',
    noScript:
      '이 책은 아직 닫혀 있습니다. 페이지를 넘기려면 브라우저 스크립트를 켜 주세요.',
    notNow: '지금은 보지 않기',
    observationKind: '관찰 기록',
    observationLoadingBody:
      '보관소에서 해당 페이지를 가져오고 있습니다. 불러오는 동안 잠시 기다려 주세요.',
    observationLoadingTitle: '보관된 기록을 여는 중',
    openDate: '이 날짜 열기',
    openedRecords: '직접 찾아낸 날짜',
    pastLoadingBody:
      '제본된 그림일기에서 그날의 페이지를 찾고 있습니다. 찾을 때까지 잠시 기다려 주세요.',
    pastLoadingTitle: '지난 페이지를 여는 중',
    previousDay: '이전 날',
    questionsLead:
      '눈에 띄는 말이나 날짜는 직접 기억해 두세요. 아직 적히지 않은 것은 알파군에게 물어볼 수 있으며, 고른 말은 입력칸에 놓일 뿐 보낼지는 당신이 정합니다.',
    observationQuestionsTitle: '이 기록에 대해 묻기',
    questionsTitle: '이날의 일을 묻기',
    reducedMotion: '움직임을 줄여서 열기',
    replay: '마지막 기록 다시 열기',
    retry: '다시 열기',
    returnToday: '오늘의 밝은 일기로 돌아가기',
    showHorror: '강한 심리 공포 기록 열기',
    stopExperience: '기록 닫기',
    textOnly: '글로만 열기',
    title: '알파군의 그림일기',
    today: '오늘',
    timeoutBody:
      '연결 대기가 너무 길어져 지금은 확인을 멈췄습니다. 다시 열어 주세요.',
    timeoutTitle: '페이지에서 답이 없습니다',
    unlockedBody:
      '따라간 단서로 조립한 암호를 입력하세요. 맞는 말이면 마지막 장이 당신 쪽을 바라봅니다.',
    unlockedTitle: '이 날짜에는 열쇠 구멍이 있습니다',
    waitingElapsed: '대기 시간: {seconds}초',
  },
  de: {
    askButton: 'Alpha-kun fragen',
    askToday: 'Nach heute fragen',
    cancelGate: 'Jetzt nicht',
    confirmAdult: 'Ich bin mindestens 18. Aufzeichnung öffnen',
    dateLabel: 'Datum der Aufzeichnung',
    diaryKind: 'Alpha-kuns Bildertagebuch',
    eyebrow: 'Eine Aufzeichnung, die noch immer weitergeschrieben wird',
    failureBody:
      'Die Aufzeichnung konnte nicht geöffnet werden. Bitte warte kurz und versuche es erneut.',
    failureTitle: 'Die Seiten scheinen zusammenzukleben',
    finaleBody:
      'Die folgenden Aufzeichnungen enthalten intensiven psychologischen Horror. Du entscheidest, wie du sie öffnest.',
    finaleKeywordIncorrect:
      'Diese Wörter bewegen die letzte Seite nicht. Verfolge alle drei Hinweise noch einmal.',
    finaleKeywordLabel: 'Gefundene Losung',
    finaleKeywordPlaceholder: 'Losung aus den drei Hinweisen',
    finaleKeywordSubmit: 'Losung prüfen',
    finaleTitle: 'Die letzte Seite hat sich dir zugewandt',
    futureBody:
      'Ein Tagebuch der Zukunft wird erst geschrieben, wenn die Zukunft da ist. Komm morgen wieder.',
    futureTitle: 'Diese Seite ist noch leer',
    gateBody:
      'Ab hier folgen von Forschenden datierte Beobachtungen aus der Zeit vor der Entstehung von Aceserver. Die Daten geben weder Alpha-kuns Alter noch seinen Geburtstag an.',
    gateDetails:
      'Enthält psychologischen Horror und Andeutungen von Einsamkeit, Experimenten und Isolation. Kein Blut, keine explizite Folter, Selbstverletzung oder sexualisierte Gewalt. Wir fragen nicht nach deinem Geburtsdatum.',
    gateTitle: 'Vor dem Öffnen einer alten Beobachtung',
    loadingBody:
      'Hinter dem Papier ist ein Bleistift zu hören. Warte kurz, bis Wörter und Bild erscheinen.',
    loadingTitle: 'Die Seite wird geöffnet',
    loadElapsed: 'Dieser Ladevorgang: {seconds} s',
    longWaitBody:
      'Das Öffnen dieser Seite dauert an. Wir prüfen weiterhin, ob sie geöffnet werden kann.',
    longWaitTitle: 'Die Seite wird noch geöffnet',
    manualCheck: 'Jetzt prüfen',
    metaDescription:
      'Alpha-kuns Bildertagebuch wird zur Gegenwart hin immer glücklicher. Folge Fragmenten von alten Beobachtungen bis in den Alpha Chat.',
    metaTitle: 'Alpha-kuns Bildertagebuch',
    navLabel: 'Bildertagebuch',
    nextDay: 'Nächster Tag',
    noScript:
      'Dieses Buch bleibt noch geschlossen. Aktiviere Skripte im Browser, um seine Seiten umzublättern.',
    notNow: 'Jetzt nicht',
    observationKind: 'Beobachtungsprotokoll',
    observationLoadingBody:
      'Die passende Seite wird aus dem Archiv abgerufen. Bitte warte kurz, während sie geladen wird.',
    observationLoadingTitle: 'Archivierte Aufzeichnung wird geöffnet',
    openDate: 'Dieses Datum öffnen',
    openedRecords: 'Ein von dir entdecktes Datum',
    pastLoadingBody:
      'Im gebundenen Bildertagebuch wird nach diesem Tag gesucht. Bitte warte kurz, bis die Seite gefunden ist.',
    pastLoadingTitle: 'Eine Seite aus der Vergangenheit wird geöffnet',
    previousDay: 'Vorheriger Tag',
    questionsLead:
      'Merke dir Wörter oder Daten, die dir auffallen. Du kannst Alpha-kun nach dem fragen, was noch nicht geschrieben ist; die gewählten Worte werden nur ins Feld gelegt und du entscheidest, ob du sie sendest.',
    observationQuestionsTitle: 'Nach dieser Aufzeichnung fragen',
    questionsTitle: 'Nach diesem Tag fragen',
    reducedMotion: 'Mit weniger Bewegung öffnen',
    replay: 'Die letzte Aufzeichnung erneut öffnen',
    retry: 'Erneut versuchen',
    returnToday: 'Zum hellen Tagebuch von heute zurückkehren',
    showHorror: 'Intensiven psychologischen Horror öffnen',
    stopExperience: 'Aufzeichnung schließen',
    textOnly: 'Nur als Text öffnen',
    title: 'Alpha-kuns Bildertagebuch',
    today: 'Heute',
    timeoutBody:
      'Die Verbindung hat zu lange gewartet, deshalb haben wir die Prüfung vorerst angehalten. Versuche, die Seite erneut zu öffnen.',
    timeoutTitle: 'Die Seite hat nicht geantwortet',
    unlockedBody:
      'Gib die Losung ein, die du aus den Hinweisen zusammengesetzt hast. Ist sie richtig, wendet sich dir die letzte Seite zu.',
    unlockedTitle: 'Dieses Datum trägt ein Schlüsselloch',
    waitingElapsed: 'Wartezeit: {seconds} s',
  },
  ru: {
    askButton: 'Спросить Альфа-куна',
    askToday: 'Спросить о сегодняшнем дне',
    cancelGate: 'Не сейчас',
    confirmAdult: 'Мне есть 18 лет. Открыть запись',
    dateLabel: 'Дата записи',
    diaryKind: 'Дневник с рисунками Альфа-куна',
    eyebrow: 'Одна запись, которая всё ещё продолжается',
    failureBody:
      'Не удалось открыть запись. Подождите немного и попробуйте снова.',
    failureTitle: 'Похоже, страницы слиплись',
    finaleBody:
      'Следующие записи содержат напряжённый психологический хоррор. Вы сами выбираете, как их открыть.',
    finaleKeywordIncorrect:
      'Эти слова не сдвигают последнюю страницу. Пройдите все три подсказки ещё раз.',
    finaleKeywordLabel: 'Найденная кодовая фраза',
    finaleKeywordPlaceholder: 'Фраза из трёх подсказок',
    finaleKeywordSubmit: 'Проверить фразу',
    finaleTitle: 'Последняя страница повернулась к вам',
    futureBody:
      'Дневник будущего не пишется, пока будущее не наступило. Возвращайтесь завтра.',
    futureTitle: 'Эта страница пока пуста',
    gateBody:
      'Далее идут наблюдения, датированные исследователями до появления Aceserver. Даты не означают возраст или день рождения Альфа-куна.',
    gateDetails:
      'Содержит психологический хоррор и намёки на одиночество, эксперименты и изоляцию. Без крови, подробных пыток, самоповреждения и сексуального насилия. Мы не спрашиваем дату рождения.',
    gateTitle: 'Перед открытием старого наблюдения',
    loadingBody:
      'Из-за бумаги слышно движение карандаша. Подождите немного, пока появятся слова и рисунок.',
    loadingTitle: 'Открываем страницу',
    loadElapsed: 'Эта загрузка: {seconds} с',
    longWaitBody:
      'Открытие этой страницы требует времени. Мы всё ещё проверяем, можно ли её открыть.',
    longWaitTitle: 'Страница всё ещё открывается',
    manualCheck: 'Проверить сейчас',
    metaDescription:
      'Дневник Альфа-куна становится счастливее по мере приближения к настоящему. Следуйте за фрагментами старых наблюдений до Alpha Chat.',
    metaTitle: 'Дневник Альфа-куна с рисунками',
    navLabel: 'Дневник',
    nextDay: 'Следующий день',
    noScript:
      'Эта книга пока не открывается. Включите сценарии в браузере, чтобы перелистывать страницы.',
    notNow: 'Не сейчас',
    observationKind: 'Запись наблюдения',
    observationLoadingBody:
      'Нужная страница извлекается из архива. Подождите немного, пока она загрузится.',
    observationLoadingTitle: 'Открываем архивную запись',
    openDate: 'Открыть эту дату',
    openedRecords: 'Дата, которую вы нашли',
    pastLoadingBody:
      'Ищем этот день в переплетённом дневнике с рисунками. Подождите немного, пока страница найдётся.',
    pastLoadingTitle: 'Открываем страницу из прошлого',
    previousDay: 'Предыдущий день',
    questionsLead:
      'Запоминайте слова и даты, которые привлекли внимание. О том, что ещё не записано, можно спросить Альфа-куна; выбранные слова лишь появятся в поле, а отправлять их или нет — решаете вы.',
    observationQuestionsTitle: 'Спросить об этой записи',
    questionsTitle: 'Спросить об этом дне',
    reducedMotion: 'Открыть с уменьшенным движением',
    replay: 'Снова открыть последнюю запись',
    retry: 'Попробовать снова',
    returnToday: 'Вернуться к светлому дневнику сегодняшнего дня',
    showHorror: 'Открыть напряжённый психологический хоррор',
    stopExperience: 'Закрыть запись',
    textOnly: 'Открыть только текст',
    title: 'Дневник Альфа-куна с рисунками',
    today: 'Сегодня',
    timeoutBody:
      'Соединение ожидало слишком долго, поэтому пока мы остановили проверку. Попробуйте открыть страницу снова.',
    timeoutTitle: 'Страница не ответила',
    unlockedBody:
      'Введите кодовую фразу, собранную из пройденных подсказок. Если она верна, последняя страница повернётся к вам.',
    unlockedTitle: 'На этой дате есть замочная скважина',
    waitingElapsed: 'Ожидание: {seconds} с',
  },
} satisfies Record<Locale, AlphaDiaryUi>

export function getAlphaDiaryUi(locale: Locale): AlphaDiaryUi {
  return alphaDiaryUi[locale]
}
