import type { Locale } from '../i18n/config'
const seo = {
  ja: {
    title: 'Minecraftスキンメーカー｜画像・文章からAI生成',
    description:
      '画像や文章からMinecraftスキンをAI生成。Classic・Slimに対応し、完成したスキンを3Dで確認して64×64 PNGで保存できます。外部サービスの登録やAPIキーは不要です。',
  },
  en: {
    title: 'Minecraft Skin Maker – AI from images or text',
    description:
      'Generate Minecraft skins from images or text with AI. Preview Classic or Slim in 3D and save a 64×64 PNG. No external account or API key needed.',
  },
  'zh-cn': {
    title: 'Minecraft皮肤制作器｜图片与文字AI生成',
    description:
      '用AI从图片或文字生成Minecraft皮肤。支持Classic和Slim，查看3D效果并保存64×64 PNG。无需注册外部服务或输入API密钥。',
  },
  es: {
    title: 'Creador de skins de Minecraft con IA',
    description:
      'Genera skins de Minecraft con imágenes o texto. Vista 3D Classic o Slim y descarga PNG de 64×64. Sin cuenta externa ni clave API.',
  },
  pt: {
    title: 'Criador de skins de Minecraft com IA',
    description:
      'Gere skins de Minecraft com imagens ou texto. Veja Classic ou Slim em 3D e salve um PNG de 64×64. Sem conta externa nem chave API.',
  },
  fr: {
    title: 'Créateur de skins Minecraft avec IA',
    description:
      'Créez des skins Minecraft depuis une image ou un texte. Aperçu 3D Classic ou Slim et PNG 64×64. Sans compte externe ni clé API.',
  },
  ko: {
    title: 'Minecraft 스킨 메이커｜이미지·텍스트 AI 생성',
    description:
      '이미지나 글로 Minecraft 스킨을 AI 생성하세요. Classic·Slim을 3D로 확인하고 64×64 PNG로 저장할 수 있습니다. 외부 계정이나 API 키가 필요 없습니다.',
  },
  de: {
    title: 'Minecraft Skin-Ersteller mit KI',
    description:
      'Erstelle Minecraft-Skins aus Bildern oder Text. Classic oder Slim in 3D ansehen und als 64×64-PNG speichern. Ohne externes Konto oder API-Schlüssel.',
  },
  ru: {
    title: 'Генератор скинов Minecraft с ИИ',
    description:
      'Создавайте скины Minecraft по картинке или тексту. Просмотр Classic и Slim в 3D, сохранение PNG 64×64. Без внешнего аккаунта и ключа API.',
  },
} satisfies Record<Locale, { title: string; description: string }>
export const getSkinMakerSeo = (locale: Locale) => seo[locale]
