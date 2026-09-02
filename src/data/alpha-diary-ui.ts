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
  finaleTitle: string
  followLatest: string
  futureBody: string
  futureTitle: string
  gateBody: string
  gateDetails: string
  gateTitle: string
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
  textOnly: string
  title: string
  today: string
  unlockedBody: string
  unlockedTitle: string
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
    finaleTitle: '最後の一枚が、こちらを向きました',
    followLatest: '見つかった記録を綴じる',
    futureBody:
      '未来の日記は、未来が来るまで書かれません。明日になったら、また来てね。',
    futureTitle: 'このページはまだ白紙です',
    gateBody:
      'ここから先は、Aceserver誕生前に研究側が付けた観察記録です。アルファ君の年齢や誕生日を示す日付ではありません。',
    gateDetails:
      '心理的ホラー、孤独、実験・隔離の暗示を含みます。流血や具体的な拷問、自傷、性的被害の描写はありません。生年月日は入力しません。',
    gateTitle: '古い観察記録を開く前に',
    latestAvailable:
      'あとから見つかった記録があります。いま開いている束には、まだ綴じられていません。',
    loadingBody:
      '紙の向こうで、鉛筆を走らせる音がします。文字と絵が浮かぶまで、少しだけ待ってください。',
    loadingTitle: 'ページをひらいています',
    metaDescription:
      '現在へ近づくほど少しずつ幸せになるアルファ君の絵日記。古い観察記録からAlpha Chatへ問いかけ、記録の断片をたどります。',
    metaTitle: 'アルファ君の絵日記',
    navLabel: '絵日記',
    nextDay: '次の日',
    noScript:
      'この本はいま閉じたままです。ページをめくるには、ブラウザのスクリプトを有効にしてください。',
    notNow: '今は見ない',
    observationKind: '観察記録',
    openDate: 'この日を開く',
    openedRecords: 'あなたが実際に開いた記録',
    previousDay: '前の日',
    questionsLead:
      'まだ書かれていないことは、アルファ君に聞けます。選んだ言葉は入力欄に置かれるだけで、送るのはあなたです。',
    questionsTitle: 'この日のことを聞く',
    reducedMotion: '動きを抑えて開く',
    replay: '最後の記録をもう一度開く',
    resetConfirm:
      'この端末につけたしおりを外しますか？ 開いたページはそのまま残ります。',
    resetProgress: 'しおりを外す',
    retry: 'もう一度ひらく',
    returnToday: '今日の明るい日記へ戻る',
    showHorror: '強い心理的ホラーを開く',
    statusProgressUpdated:
      'アルファ君の話を聞いたあと、紙の端に新しい跡が残りました。',
    stopExperience: '記録を閉じる',
    textOnly: '文字だけで開く',
    title: 'アルファ君の絵日記',
    today: '今日',
    unlockedBody:
      'この先には強い心理的ホラー表現があります。開くかどうかと開き方はあなたが決められます。最後のページは、今のアルファ君へ続いています。',
    unlockedTitle: '記録の奥にある一枚を開けます',
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
    finaleTitle: 'The last page turned toward you',
    followLatest: 'Bind the newly found records',
    futureBody:
      'A future diary is not written until the future arrives. Come back tomorrow.',
    futureTitle: 'This page is still blank',
    gateBody:
      "Beyond this point are observation records dated by researchers before Aceserver's birth. The dates do not indicate Alpha-kun's age or birthday.",
    gateDetails:
      'Includes psychological horror and implications of loneliness, experiments, and isolation. It contains no gore, explicit torture, self-harm, or sexual abuse. We do not ask for your birth date.',
    gateTitle: 'Before opening an old observation record',
    latestAvailable:
      'More records were found later. They have not yet been bound into the pages you opened.',
    loadingBody:
      'From beyond the paper comes the sound of a pencil moving. Please wait a little for the words and picture to appear.',
    loadingTitle: 'Opening the page',
    metaDescription:
      "Alpha-kun's picture diary grows happier toward the present. Follow fragments from old observation records into Alpha Chat.",
    metaTitle: "Alpha-kun's Picture Diary",
    navLabel: 'Picture diary',
    nextDay: 'Next day',
    noScript:
      'This book will not open yet. Enable scripts in your browser to turn its pages.',
    notNow: 'Not now',
    observationKind: 'Observation record',
    openDate: 'Open this date',
    openedRecords: 'Records you actually opened',
    previousDay: 'Previous day',
    questionsLead:
      'You can ask Alpha-kun about what is still unwritten. The chosen words are only placed in the box; you decide whether to send them.',
    questionsTitle: 'Ask about this day',
    reducedMotion: 'Open with reduced motion',
    replay: 'Open the last record again',
    resetConfirm:
      'Remove the bookmark kept on this device? The pages you opened will remain.',
    resetProgress: 'Remove bookmark',
    retry: 'Try again',
    returnToday: "Return to today's bright diary",
    showHorror: 'Open intense psychological horror',
    statusProgressUpdated:
      'After listening to Alpha-kun, a new mark appeared at the edge of the paper.',
    stopExperience: 'Close the record',
    textOnly: 'Open as text only',
    title: "Alpha-kun's Picture Diary",
    today: 'Today',
    unlockedBody:
      'What follows contains intense psychological horror. You decide whether and how to open it. The last page leads to Alpha-kun as he is now.',
    unlockedTitle: 'A page behind the records can now be opened',
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
    finaleTitle: '最后一页转向了你',
    followLatest: '装订新发现的记录',
    futureBody: '未来的日记要等未来到来才会写下。明天再来吧。',
    futureTitle: '这一页还是空白',
    gateBody:
      '接下来是Aceserver诞生前由研究方标注日期的观察记录。这些日期不代表阿尔法君的年龄或生日。',
    gateDetails:
      '包含心理恐怖，以及孤独、实验与隔离的暗示。不含血腥、具体拷问、自伤或性侵害描写。不会要求输入出生日期。',
    gateTitle: '打开旧观察记录之前',
    latestAvailable: '后来又发现了一些记录。它们还没有装订进你打开的这册纸页。',
    loadingBody:
      '纸张另一侧传来铅笔划动的声音。请稍等片刻，让文字和图画浮现出来。',
    loadingTitle: '正在翻开这一页',
    metaDescription:
      '越接近现在越幸福的阿尔法君图画日记。从旧观察记录进入Alpha Chat，追寻记录片段。',
    metaTitle: '阿尔法君的图画日记',
    navLabel: '图画日记',
    nextDay: '后一天',
    noScript: '这本册子现在还合着。请在浏览器中启用脚本，才能翻页。',
    notNow: '暂时不看',
    observationKind: '观察记录',
    openDate: '打开这一天',
    openedRecords: '你实际打开过的记录',
    previousDay: '前一天',
    questionsLead:
      '还没有写下来的事，可以去问阿尔法君。选中的话只会放进输入框，是否发送由你决定。',
    questionsTitle: '询问这一天',
    reducedMotion: '减少动态后打开',
    replay: '再次打开最后的记录',
    resetConfirm: '要移除此设备上的书签吗？你打开过的页面会保留。',
    resetProgress: '移除书签',
    retry: '重新打开',
    returnToday: '回到今天明亮的日记',
    showHorror: '打开强烈心理恐怖记录',
    statusProgressUpdated: '听完阿尔法君的话后，纸张边缘留下了新的痕迹。',
    stopExperience: '关闭记录',
    textOnly: '只看文字',
    title: '阿尔法君的图画日记',
    today: '今天',
    unlockedBody:
      '前方包含强烈的心理恐怖表现。是否打开以及如何打开都由你决定。最后一页通向现在的阿尔法君。',
    unlockedTitle: '现在可以打开记录深处的一页',
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
    finaleTitle: 'La última página se volvió hacia ti',
    followLatest: 'Encuadernar los registros encontrados',
    futureBody:
      'El diario del futuro no se escribe hasta que el futuro llega. Vuelve mañana.',
    futureTitle: 'Esta página sigue en blanco',
    gateBody:
      'A partir de aquí hay registros de observación fechados por investigadores antes del nacimiento de Aceserver. Las fechas no indican la edad ni el cumpleaños de Alpha-kun.',
    gateDetails:
      'Incluye terror psicológico y alusiones a soledad, experimentos y aislamiento. No contiene sangre, tortura explícita, autolesiones ni abuso sexual. No pedimos tu fecha de nacimiento.',
    gateTitle: 'Antes de abrir un registro antiguo',
    latestAvailable:
      'Después aparecieron más registros. Todavía no están encuadernados con las páginas que abriste.',
    loadingBody:
      'Desde el otro lado del papel se oye un lápiz en movimiento. Espera un poco a que aparezcan las palabras y el dibujo.',
    loadingTitle: 'Abriendo la página',
    metaDescription:
      'El diario ilustrado de Alpha-kun se vuelve más feliz al acercarse al presente. Sigue fragmentos desde viejas observaciones hasta Alpha Chat.',
    metaTitle: 'Diario ilustrado de Alpha-kun',
    navLabel: 'Diario ilustrado',
    nextDay: 'Día siguiente',
    noScript:
      'Este cuaderno aún no se abre. Activa los scripts del navegador para pasar sus páginas.',
    notNow: 'Ahora no',
    observationKind: 'Registro de observación',
    openDate: 'Abrir esta fecha',
    openedRecords: 'Registros que abriste',
    previousDay: 'Día anterior',
    questionsLead:
      'Puedes preguntar a Alpha-kun por lo que aún no está escrito. Las palabras elegidas solo se colocan en el campo; tú decides si enviarlas.',
    questionsTitle: 'Preguntar por este día',
    reducedMotion: 'Abrir con movimiento reducido',
    replay: 'Abrir de nuevo el último registro',
    resetConfirm:
      '¿Quitar el marcador guardado en este dispositivo? Las páginas que abriste permanecerán.',
    resetProgress: 'Quitar marcador',
    retry: 'Intentar de nuevo',
    returnToday: 'Volver al diario luminoso de hoy',
    showHorror: 'Abrir terror psicológico intenso',
    statusProgressUpdated:
      'Después de escuchar a Alpha-kun apareció una marca nueva en el borde del papel.',
    stopExperience: 'Cerrar el registro',
    textOnly: 'Abrir solo como texto',
    title: 'Diario ilustrado de Alpha-kun',
    today: 'Hoy',
    unlockedBody:
      'Lo que sigue contiene terror psicológico intenso. Tú decides si abrirlo y de qué forma. La última página lleva al Alpha-kun de ahora.',
    unlockedTitle: 'Ya puedes abrir una página detrás de los registros',
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
    finaleTitle: 'A última página se virou para você',
    followLatest: 'Encadernar os registros encontrados',
    futureBody:
      'O diário do futuro só será escrito quando o futuro chegar. Volte amanhã.',
    futureTitle: 'Esta página ainda está em branco',
    gateBody:
      'Daqui em diante há registros de observação datados por pesquisadores antes do nascimento do Aceserver. As datas não indicam a idade nem o aniversário do Alpha-kun.',
    gateDetails:
      'Inclui horror psicológico e insinuações de solidão, experimentos e isolamento. Não contém sangue, tortura explícita, automutilação ou abuso sexual. Não pedimos sua data de nascimento.',
    gateTitle: 'Antes de abrir um registro antigo',
    latestAvailable:
      'Outros registros foram encontrados depois. Eles ainda não foram encadernados nas páginas abertas.',
    loadingBody:
      'Do outro lado do papel vem o som de um lápis em movimento. Espere um pouco até as palavras e o desenho aparecerem.',
    loadingTitle: 'Abrindo a página',
    metaDescription:
      'O diário ilustrado do Alpha-kun fica mais feliz ao se aproximar do presente. Siga fragmentos das observações antigas até o Alpha Chat.',
    metaTitle: 'Diário ilustrado do Alpha-kun',
    navLabel: 'Diário ilustrado',
    nextDay: 'Dia seguinte',
    noScript:
      'Este caderno ainda não abre. Ative os scripts no navegador para virar suas páginas.',
    notNow: 'Agora não',
    observationKind: 'Registro de observação',
    openDate: 'Abrir esta data',
    openedRecords: 'Registros que você abriu',
    previousDay: 'Dia anterior',
    questionsLead:
      'Você pode perguntar ao Alpha-kun sobre o que ainda não foi escrito. As palavras escolhidas só vão para o campo; você decide se quer enviá-las.',
    questionsTitle: 'Perguntar sobre este dia',
    reducedMotion: 'Abrir com menos movimento',
    replay: 'Abrir o último registro novamente',
    resetConfirm:
      'Remover o marcador salvo neste dispositivo? As páginas que você abriu continuarão lá.',
    resetProgress: 'Remover marcador',
    retry: 'Tentar novamente',
    returnToday: 'Voltar ao diário alegre de hoje',
    showHorror: 'Abrir horror psicológico intenso',
    statusProgressUpdated:
      'Depois de ouvir Alpha-kun, uma nova marca apareceu na borda do papel.',
    stopExperience: 'Fechar o registro',
    textOnly: 'Abrir somente como texto',
    title: 'Diário ilustrado do Alpha-kun',
    today: 'Hoje',
    unlockedBody:
      'O que vem a seguir contém horror psicológico intenso. Você decide se quer abrir e de que forma. A última página leva ao Alpha-kun de agora.',
    unlockedTitle: 'Uma página por trás dos registros pode ser aberta',
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
    finaleTitle: 'La dernière page s’est tournée vers vous',
    followLatest: 'Relier les archives retrouvées',
    futureBody:
      'Le journal du futur ne s’écrit pas avant que le futur arrive. Revenez demain.',
    futureTitle: 'Cette page est encore blanche',
    gateBody:
      'Au-delà se trouvent des observations datées par des chercheurs avant la naissance d’Aceserver. Ces dates n’indiquent ni l’âge ni l’anniversaire d’Alpha-kun.',
    gateDetails:
      'Contient de l’horreur psychologique et des allusions à la solitude, aux expériences et à l’isolement. Aucun gore, torture explicite, automutilation ou violence sexuelle. Votre date de naissance n’est pas demandée.',
    gateTitle: 'Avant d’ouvrir une ancienne observation',
    latestAvailable:
      'D’autres archives ont été retrouvées. Elles ne sont pas encore reliées aux pages que vous avez ouvertes.',
    loadingBody:
      'De l’autre côté du papier vient le bruit d’un crayon. Attendez un peu que les mots et le dessin apparaissent.',
    loadingTitle: 'Ouverture de la page',
    metaDescription:
      'Le journal illustré d’Alpha-kun devient plus heureux à mesure qu’il approche du présent. Suivez les fragments des anciennes observations jusqu’à Alpha Chat.',
    metaTitle: 'Journal illustré d’Alpha-kun',
    navLabel: 'Journal illustré',
    nextDay: 'Jour suivant',
    noScript:
      'Ce cahier reste fermé. Activez les scripts du navigateur pour tourner ses pages.',
    notNow: 'Pas maintenant',
    observationKind: 'Archive d’observation',
    openDate: 'Ouvrir cette date',
    openedRecords: 'Archives que vous avez ouvertes',
    previousDay: 'Jour précédent',
    questionsLead:
      'Vous pouvez demander à Alpha-kun ce qui n’est pas encore écrit. Les mots choisis sont seulement placés dans le champ ; vous décidez de les envoyer.',
    questionsTitle: 'Demander ce qui s’est passé ce jour-là',
    reducedMotion: 'Ouvrir avec moins de mouvements',
    replay: 'Ouvrir de nouveau la dernière archive',
    resetConfirm:
      'Retirer le marque-page enregistré sur cet appareil ? Les pages ouvertes resteront en place.',
    resetProgress: 'Retirer le marque-page',
    retry: 'Réessayer',
    returnToday: 'Revenir au journal lumineux d’aujourd’hui',
    showHorror: 'Ouvrir une horreur psychologique intense',
    statusProgressUpdated:
      'Après avoir écouté Alpha-kun, une nouvelle trace est apparue au bord du papier.',
    stopExperience: 'Fermer l’archive',
    textOnly: 'Ouvrir en texte seulement',
    title: 'Journal illustré d’Alpha-kun',
    today: 'Aujourd’hui',
    unlockedBody:
      'La suite contient une horreur psychologique intense. Vous décidez de l’ouvrir et de quelle manière. La dernière page mène à l’Alpha-kun d’aujourd’hui.',
    unlockedTitle:
      'Une page derrière les archives peut maintenant être ouverte',
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
    finaleTitle: '마지막 한 장이 당신 쪽을 바라봅니다',
    followLatest: '새로 발견된 기록 묶기',
    futureBody:
      '미래의 일기는 미래가 올 때까지 쓰이지 않습니다. 내일 다시 와 주세요.',
    futureTitle: '이 페이지는 아직 빈칸입니다',
    gateBody:
      '여기부터는 Aceserver 탄생 전에 연구자가 날짜를 붙인 관찰 기록입니다. 날짜는 알파군의 나이나 생일을 뜻하지 않습니다.',
    gateDetails:
      '심리 공포와 고독, 실험, 격리의 암시가 포함됩니다. 유혈, 구체적 고문, 자해, 성적 피해 묘사는 없습니다. 생년월일은 입력받지 않습니다.',
    gateTitle: '오래된 관찰 기록을 열기 전에',
    latestAvailable:
      '나중에 발견된 기록이 있습니다. 아직 지금 펼친 종이 묶음에는 묶이지 않았습니다.',
    loadingBody:
      '종이 너머에서 연필이 움직이는 소리가 납니다. 글과 그림이 떠오를 때까지 잠시 기다려 주세요.',
    loadingTitle: '페이지를 여는 중',
    metaDescription:
      '현재에 가까울수록 조금씩 행복해지는 알파군의 그림일기. 오래된 관찰 기록에서 Alpha Chat으로 이어지는 기록 조각을 따라가 보세요.',
    metaTitle: '알파군의 그림일기',
    navLabel: '그림일기',
    nextDay: '다음 날',
    noScript:
      '이 책은 아직 닫혀 있습니다. 페이지를 넘기려면 브라우저 스크립트를 켜 주세요.',
    notNow: '지금은 보지 않기',
    observationKind: '관찰 기록',
    openDate: '이 날짜 열기',
    openedRecords: '직접 열어 본 기록',
    previousDay: '이전 날',
    questionsLead:
      '아직 적히지 않은 것은 알파군에게 물어볼 수 있습니다. 고른 말은 입력칸에 놓일 뿐이며, 보낼지는 당신이 정합니다.',
    questionsTitle: '이날의 일을 묻기',
    reducedMotion: '움직임을 줄여서 열기',
    replay: '마지막 기록 다시 열기',
    resetConfirm:
      '이 기기에 남긴 책갈피를 뺄까요? 열어 본 페이지는 그대로 남습니다.',
    resetProgress: '책갈피 빼기',
    retry: '다시 열기',
    returnToday: '오늘의 밝은 일기로 돌아가기',
    showHorror: '강한 심리 공포 기록 열기',
    statusProgressUpdated:
      '알파군의 이야기를 듣고 나니 종이 가장자리에 새 흔적이 남았습니다.',
    stopExperience: '기록 닫기',
    textOnly: '글로만 열기',
    title: '알파군의 그림일기',
    today: '오늘',
    unlockedBody:
      '이 뒤에는 강한 심리 공포 표현이 있습니다. 열지와 여는 방법은 직접 정합니다. 마지막 페이지는 지금의 알파군에게 이어집니다.',
    unlockedTitle: '기록 뒤편의 한 장을 열 수 있습니다',
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
    finaleTitle: 'Die letzte Seite hat sich dir zugewandt',
    followLatest: 'Neu gefundene Aufzeichnungen einbinden',
    futureBody:
      'Ein Tagebuch der Zukunft wird erst geschrieben, wenn die Zukunft da ist. Komm morgen wieder.',
    futureTitle: 'Diese Seite ist noch leer',
    gateBody:
      'Ab hier folgen von Forschenden datierte Beobachtungen aus der Zeit vor der Entstehung von Aceserver. Die Daten geben weder Alpha-kuns Alter noch seinen Geburtstag an.',
    gateDetails:
      'Enthält psychologischen Horror und Andeutungen von Einsamkeit, Experimenten und Isolation. Kein Blut, keine explizite Folter, Selbstverletzung oder sexualisierte Gewalt. Wir fragen nicht nach deinem Geburtsdatum.',
    gateTitle: 'Vor dem Öffnen einer alten Beobachtung',
    latestAvailable:
      'Später wurden weitere Aufzeichnungen gefunden. Sie sind noch nicht in die geöffneten Seiten eingebunden.',
    loadingBody:
      'Hinter dem Papier ist ein Bleistift zu hören. Warte kurz, bis Wörter und Bild erscheinen.',
    loadingTitle: 'Die Seite wird geöffnet',
    metaDescription:
      'Alpha-kuns Bildertagebuch wird zur Gegenwart hin immer glücklicher. Folge Fragmenten von alten Beobachtungen bis in den Alpha Chat.',
    metaTitle: 'Alpha-kuns Bildertagebuch',
    navLabel: 'Bildertagebuch',
    nextDay: 'Nächster Tag',
    noScript:
      'Dieses Buch bleibt noch geschlossen. Aktiviere Skripte im Browser, um seine Seiten umzublättern.',
    notNow: 'Jetzt nicht',
    observationKind: 'Beobachtungsprotokoll',
    openDate: 'Dieses Datum öffnen',
    openedRecords: 'Von dir geöffnete Aufzeichnungen',
    previousDay: 'Vorheriger Tag',
    questionsLead:
      'Du kannst Alpha-kun nach dem fragen, was noch nicht geschrieben ist. Die gewählten Worte werden nur ins Feld gelegt; du entscheidest, ob du sie sendest.',
    questionsTitle: 'Nach diesem Tag fragen',
    reducedMotion: 'Mit weniger Bewegung öffnen',
    replay: 'Die letzte Aufzeichnung erneut öffnen',
    resetConfirm:
      'Das Lesezeichen auf diesem Gerät entfernen? Die geöffneten Seiten bleiben erhalten.',
    resetProgress: 'Lesezeichen entfernen',
    retry: 'Erneut versuchen',
    returnToday: 'Zum hellen Tagebuch von heute zurückkehren',
    showHorror: 'Intensiven psychologischen Horror öffnen',
    statusProgressUpdated:
      'Nachdem du Alpha-kun zugehört hast, erschien am Papierrand eine neue Spur.',
    stopExperience: 'Aufzeichnung schließen',
    textOnly: 'Nur als Text öffnen',
    title: 'Alpha-kuns Bildertagebuch',
    today: 'Heute',
    unlockedBody:
      'Was folgt, enthält intensiven psychologischen Horror. Du entscheidest, ob und wie du es öffnest. Die letzte Seite führt zum heutigen Alpha-kun.',
    unlockedTitle: 'Eine Seite hinter den Aufzeichnungen kann geöffnet werden',
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
    finaleTitle: 'Последняя страница повернулась к вам',
    followLatest: 'Подшить найденные записи',
    futureBody:
      'Дневник будущего не пишется, пока будущее не наступило. Возвращайтесь завтра.',
    futureTitle: 'Эта страница пока пуста',
    gateBody:
      'Далее идут наблюдения, датированные исследователями до появления Aceserver. Даты не означают возраст или день рождения Альфа-куна.',
    gateDetails:
      'Содержит психологический хоррор и намёки на одиночество, эксперименты и изоляцию. Без крови, подробных пыток, самоповреждения и сексуального насилия. Мы не спрашиваем дату рождения.',
    gateTitle: 'Перед открытием старого наблюдения',
    latestAvailable:
      'Позже нашлись другие записи. Они ещё не подшиты к страницам, которые вы открыли.',
    loadingBody:
      'Из-за бумаги слышно движение карандаша. Подождите немного, пока появятся слова и рисунок.',
    loadingTitle: 'Открываем страницу',
    metaDescription:
      'Дневник Альфа-куна становится счастливее по мере приближения к настоящему. Следуйте за фрагментами старых наблюдений до Alpha Chat.',
    metaTitle: 'Дневник Альфа-куна с рисунками',
    navLabel: 'Дневник',
    nextDay: 'Следующий день',
    noScript:
      'Эта книга пока не открывается. Включите сценарии в браузере, чтобы перелистывать страницы.',
    notNow: 'Не сейчас',
    observationKind: 'Запись наблюдения',
    openDate: 'Открыть эту дату',
    openedRecords: 'Записи, которые вы открыли',
    previousDay: 'Предыдущий день',
    questionsLead:
      'О том, что ещё не записано, можно спросить Альфа-куна. Выбранные слова лишь появятся в поле; отправлять их или нет — решаете вы.',
    questionsTitle: 'Спросить об этом дне',
    reducedMotion: 'Открыть с уменьшенным движением',
    replay: 'Снова открыть последнюю запись',
    resetConfirm:
      'Убрать закладку, сохранённую на этом устройстве? Открытые вами страницы останутся на месте.',
    resetProgress: 'Убрать закладку',
    retry: 'Попробовать снова',
    returnToday: 'Вернуться к светлому дневнику сегодняшнего дня',
    showHorror: 'Открыть напряжённый психологический хоррор',
    statusProgressUpdated:
      'После разговора с Альфа-куном на краю бумаги появился новый след.',
    stopExperience: 'Закрыть запись',
    textOnly: 'Открыть только текст',
    title: 'Дневник Альфа-куна с рисунками',
    today: 'Сегодня',
    unlockedBody:
      'Дальше следует напряжённый психологический хоррор. Открывать ли его и каким способом — решаете вы. Последняя страница ведёт к нынешнему Альфа-куну.',
    unlockedTitle: 'Теперь можно открыть страницу за пределами записей',
  },
} satisfies Record<Locale, AlphaDiaryUi>

export function getAlphaDiaryUi(locale: Locale): AlphaDiaryUi {
  return alphaDiaryUi[locale]
}
