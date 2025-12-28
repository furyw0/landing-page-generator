import { OpenAIService } from './openai.service';
import { TemplateConfig } from '../config/templates.config';

// Utility: Clean JSON from markdown code blocks
function parseJSON(text: string): any {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  
  // Remove ```json and ``` tags
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/, '');
  cleaned = cleaned.replace(/\s*```$/, '');
  
  // Parse the cleaned JSON
  return JSON.parse(cleaned.trim());
}

export interface GeneratedContent {
  meta: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };
  hero: {
    heroTitle: string;
    heroSubtitle: string;
    heroBadges: string[];
  };
  buttons: {
    primary: string;
    secondary: string;
  };
  features?: Array<{
    title: string;
    description: string;
  }>;
  security: {
    securityTitle: string;
    securityDescription: string;
  };
  article?: {
    mainTitle: string;
    sections: Array<{
      h3: string;
      paragraphs: string[];
    }>;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  footer: {
    about: string;
    copyright: string;
  };
  bonus?: {
    title: string;
    description: string;
    bonuses: Array<{
      title: string;
      description: string;
      amount: string;
    }>;
  };
  testimonials?: Array<{
    name: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  games?: Array<{
    name: string;
    category: string;
    description: string;
  }>;
}

export class ContentGeneratorService {
  private ai: OpenAIService;
  private siteName: string;
  private keywords: string[]; // 4 basit keyword
  private config: TemplateConfig;

  constructor(openaiService: OpenAIService, siteName: string, templateConfig: TemplateConfig) {
    this.ai = openaiService;
    this.siteName = siteName;
    this.config = templateConfig;
    
    // Basit 4 keyword oluştur
    this.keywords = [
      siteName,
      `${siteName} giriş`,
      `${siteName} güncel giriş`,
      `${siteName} bonus`
    ];
  }

  async generateAll(): Promise<GeneratedContent> {
    // Template config'e göre sadece gerekli bölümleri üret
    const tasks: Promise<any>[] = [];
    const results: any = {};

    // Her template için ortak bölümler
    const commonPromises = [
      this.generateMeta().then(r => results.meta = r),
      this.generateHero().then(r => results.hero = r),
      this.generateButtons().then(r => results.buttons = r),
      this.generateSecurity().then(r => results.security = r),
      this.generateFooter().then(r => results.footer = r),
    ];

    tasks.push(...commonPromises);

    // Template'e özgü bölümler
    for (const section of this.config.sections) {
      switch (section.type) {
        case 'features':
          tasks.push(this.generateFeatures(section.count || 6).then(r => results.features = r));
          break;
        case 'article':
          tasks.push(this.generateArticle().then(r => results.article = r));
          break;
        case 'faq':
          tasks.push(this.generateFAQs(section.count || 6).then(r => results.faqs = r));
          break;
        case 'bonus':
          tasks.push(this.generateBonus().then(r => results.bonus = r));
          break;
        case 'testimonials':
          tasks.push(this.generateTestimonials(section.count || 3).then(r => results.testimonials = r));
          break;
        case 'games':
          tasks.push(this.generateGames(section.count || 8).then(r => results.games = r));
          break;
      }
    }

    await Promise.all(tasks);
    return results as GeneratedContent;
  }

  async generateMeta() {
    const prompt = `
"${this.siteName}" casino/bahis sitesi için SEO meta bilgileri yaz.

ZORUNLU KEYWORDler (doğal şekilde kullan):
- ${this.keywords[0]} (site adı)
- ${this.keywords[1]} (giriş)
- ${this.keywords[2]} (güncel giriş)
- ${this.keywords[3]} (bonus)

1. Meta Title (55-60 karakter): "${this.siteName}" içermeli
2. Meta Description (150-160 karakter): "${this.keywords[1]}" ve "${this.keywords[2]}" doğal cümlede kullan
3. Meta Keywords: Tüm keywordleri + ilgili casino terimlerini virgülle ayır

Örnek:
{
  "metaTitle": "Stake Casino - Güvenilir Bahis ve Casino Sitesi",
  "metaDescription": "Stake giriş yaparak en iyi casino oyunlarını oynayın. Stake güncel giriş adresi üzerinden güvenle üye olun.",
  "metaKeywords": "stake, stake giriş, stake güncel giriş, stake bonus, stake casino, stake bahis, casino, bahis"
}

JSON döndür.
    `.trim();

    const response = await this.ai.chat(
      [
        { role: 'system', content: 'Sen SEO uzmanısın. Sadece JSON döndür.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 300 }
    );

    return parseJSON(response);
  }

  async generateHero() {
    const prompt = `
"${this.siteName}" için hero bölümü yaz.

KURALLAR:
- Hero başlığı "${this.siteName}" ile başlamalı
- Alt başlıkta "${this.keywords[3]}" (bonus) kullan

1. Hero Title: "${this.siteName} ile..." şeklinde başla
2. Hero Subtitle: 15-20 kelime, "${this.keywords[3]}" kelimesini kullan
3. Hero Badges: 3 kısa özellik (örn: "Canlı Casino", "Slot Oyunları", "7/24 Destek")

JSON döndür:
{
  "heroTitle": "...",
  "heroSubtitle": "...",
  "heroBadges": ["...", "...", "..."]
}
    `.trim();

    const response = await this.ai.chat(
      [
        { role: 'system', content: 'Sen yaratıcı bir copywriter\'sın. Sadece JSON döndürürsün.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 250 }
    );

    return parseJSON(response);
  }

  async generateButtons() {
    const prompt = `
"${this.siteName}" temalı casino/bahis sitesi için 2 CTA buton metni yaz:

1. Primary Button: Ana aksiyon butonu (örn: "Hemen Giriş Yap", "${this.siteName}'e Katıl")
2. Secondary Button: İkincil buton (örn: "Oyunları İncele", "Detaylı Bilgi")

Her buton 2-4 kelime, aksiyon odaklı, Türkçe.

JSON formatında döndür:
{
  "primary": "...",
  "secondary": "..."
}
    `.trim();

    const response = await this.ai.chat(
      [
        { role: 'system', content: 'Sen CTA copywriting uzmanısın. Sadece JSON döndürürsün.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 200 }
    );

    return parseJSON(response);
  }

  async generateFeatures(count: number = 6) {
    const prompt = `
"${this.siteName}" için ${count} adet özellik kartı yaz.

İLK 3 BAŞLIĞA KEYWORDler ekle:
1. "${this.siteName} Casino" (örn: "Stake Casino Deneyimi")
2. "${this.siteName} Bahis" (örn: "Stake Bahis Seçenekleri")
3. "${this.siteName} Bonusları" (örn: "Stake Bonusları ve Promosyonlar")
Diğer başlıklar genel (örn: "Güvenli Ödeme", "Mobil Uygulama", "7/24 Destek")

JSON array döndür:
[
  { "title": "Stake Casino Deneyimi", "description": "..." },
  ...
]
    `.trim();

    const response = await this.ai.chat(
      [
        {
          role: 'system',
          content: 'Sen feature yazarlığında uzmanlaşmış bir pazarlamacısın. Sadece JSON döndürürsün.',
        },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 800 }
    );

    return parseJSON(response);
  }

  async generateSecurity() {
    const prompt = `
"${this.siteName}" casino/bahis sitesi için güvenlik bölümü metinleri yaz:

1. Başlık: Güvenlik vurgusu yapan başlık (örn: "256-bit SSL Şifreleme ile Korunuyorsunuz")
2. Açıklama: Güvenlik özelliklerini açıklayan 1-2 cümle (40-50 kelime), "${this.siteName}" kelimesini kullan

JSON formatında döndür:
{
  "securityTitle": "...",
  "securityDescription": "..."
}
    `.trim();

    const response = await this.ai.chat(
      [
        { role: 'system', content: 'Sen güvenlik mesajlaşması uzmanısın. Sadece JSON döndürürsün.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 300 }
    );

    return parseJSON(response);
  }

  async generateArticle() {
    const prompt = `
"${this.siteName}" hakkında makale yaz.

ZORUNLU H3 başlıkları (sırayla kullan):
1. "${this.keywords[0]} Nedir?" (site adı)
2. "${this.keywords[1]} Nasıl Yapılır?" (giriş)
3. "${this.keywords[2]} Adresi" (güncel giriş)
4. "${this.keywords[3]} Kampanyaları" (bonus)
5. "Güvenilir mi?" (genel)

Yapı:
- Main Title: "${this.siteName}: Casino ve Bahis Rehberi"
- 5 Section: Her biri yukarıdaki H3 + 2 paragraf

JSON döndür:
{
  "mainTitle": "...",
  "sections": [
    { "h3": "Stake Nedir?", "paragraphs": ["...", "..."] },
    ...
  ]
}
    `.trim();

    const response = await this.ai.chat(
      [
        {
          role: 'system',
          content: 'Sen SEO makale yazarısın. Uzun, detaylı ve bilgilendirici içerik üretirsin. Sadece JSON döndürürsün.',
        },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 2000 }
    );

    return parseJSON(response);
  }

  async generateFAQs(count: number = 6) {
    const prompt = `
"${this.siteName}" için ${count} adet SSS yaz.

İLK 3 SORUDA KEYWORDler kullan:
1. "${this.keywords[1]} nasıl yapılır?" (giriş)
2. "${this.keywords[3]} nelerdir?" (bonus)
3. "${this.keywords[2]} nasıl bulunur?" (güncel giriş)

Diğer sorular genel:
4. "Hangi oyunlar var?"
5. "Para çekme nasıl?"
6. "Güvenli mi?"

JSON array döndür:
[
  { "question": "...", "answer": "..." },
  ...
]
    `.trim();

    const response = await this.ai.chat(
      [
        {
          role: 'system',
          content: 'Sen müşteri destek uzmanısın, net ve yardımcı cevaplar verirsin. Sadece JSON döndürürsün.',
        },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 1500 }
    );

    return parseJSON(response);
  }

  async generateFooter() {
    const prompt = `
"${this.siteName}" için footer "Hakkımızda" metni yaz.

KEYWORDleri doğal kullan: "${this.siteName}", "${this.keywords[3]}"

2-3 cümle, şirket tanıtımı.

JSON döndür:
{
  "about": "...",
  "copyright": "© 2025 ${this.siteName}. Tüm hakları saklıdır. 18+ Sorumlu Oyun."
}
    `.trim();

    const response = await this.ai.chat(
      [
        { role: 'system', content: 'Sen footer copywriting uzmanısın. Sadece JSON döndürürsün.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 300 }
    );

    return parseJSON(response);
  }

  async generateBonus() {
    const prompt = `
"${this.siteName}" için bonus bölümü yaz.

1. Bonus Başlığı: "${this.keywords[3]}" kelimesini kullan
2. Bonus Açıklama: 2-3 cümle
3. 4 farklı bonus tipi:
   - Hoş geldin bonusu
   - Yatırım bonusu
   - Kayıp bonusu
   - Sadakat bonusu

JSON döndür:
{
  "title": "...",
  "description": "...",
  "bonuses": [
    { "title": "...", "description": "...", "amount": "200%" },
    ...
  ]
}
    `.trim();

    const response = await this.ai.chat(
      [
        { role: 'system', content: 'Sen casino bonus copywriting uzmanısın. Sadece JSON döndürürsün.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 600 }
    );

    return parseJSON(response);
  }

  async generateTestimonials(count: number = 3) {
    const prompt = `
"${this.siteName}" için ${count} adet kullanıcı yorumu yaz.

Her yorum:
- İsim: Gerçekçi Türk ismi
- Rating: 4-5 arası
- Yorum: 40-60 kelime, olumlu deneyim
- Tarih: Son 3 ay içinde (örn: "2 hafta önce", "1 ay önce")

JSON array döndür:
[
  { "name": "...", "rating": 5, "comment": "...", "date": "..." },
  ...
]
    `.trim();

    const response = await this.ai.chat(
      [
        { role: 'system', content: 'Sen testimonial yazarlığında uzmanlaşmışsın. Sadece JSON döndürürsün.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 800 }
    );

    return parseJSON(response);
  }

  async generateGames(count: number = 8) {
    const prompt = `
"${this.siteName}" için ${count} adet popüler oyun tanımı yaz.

Her oyun:
- İsim: Popüler casino/slot oyunu
- Kategori: "Slot", "Canlı Casino", "Masa Oyunu", "Jackpot"
- Açıklama: 20-30 kelime

JSON array döndür:
[
  { "name": "...", "category": "...", "description": "..." },
  ...
]
    `.trim();

    const response = await this.ai.chat(
      [
        { role: 'system', content: 'Sen casino oyunları uzmanısın. Sadece JSON döndürürsün.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 1000 }
    );

    return parseJSON(response);
  }
}

