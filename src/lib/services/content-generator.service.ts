import { OpenAIService } from './openai.service';

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

interface GeneratedContent {
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
  features: Array<{
    title: string;
    description: string;
  }>;
  security: {
    securityTitle: string;
    securityDescription: string;
  };
  article: {
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
}

export class ContentGeneratorService {
  private ai: OpenAIService;
  private keyword: string;
  private keywords: string[];

  constructor(openaiService: OpenAIService, keyword: string, derivedKeywords: string[]) {
    this.ai = openaiService;
    this.keyword = keyword;
    this.keywords = derivedKeywords;
  }

  async generateAll(): Promise<GeneratedContent> {
    // Paralel olarak tüm içerikleri üret
    const [meta, hero, buttons, features, security, article, faqs, footer] = await Promise.all([
      this.generateMeta(),
      this.generateHero(),
      this.generateButtons(),
      this.generateFeatures(),
      this.generateSecurity(),
      this.generateArticle(),
      this.generateFAQs(),
      this.generateFooter(),
    ]);

    return { meta, hero, buttons, features, security, article, faqs, footer };
  }

  async generateMeta() {
    const prompt = `
"${this.keyword}" için SEO uyumlu meta bilgileri oluştur:

1. Meta Title (55-60 karakter, "${this.keyword}" içermeli)
2. Meta Description (150-160 karakter, doğal Türkçe, akıcı)
3. Meta Keywords (10-15 anahtar kelime, virgülle ayrılmış)

Türev kelimeler: ${this.keywords.join(', ')}

JSON formatında döndür:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "metaKeywords": "..."
}
    `.trim();

    const response = await this.ai.chat(
      [
        { role: 'system', content: 'Sen SEO uzmanı bir içerik yazarısın. Sadece JSON döndürürsün.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 500 }
    );

    return parseJSON(response);
  }

  async generateHero() {
    const prompt = `
"${this.keyword}" temalı casino/bahis sitesi için hero section içerikleri yaz:

1. Hero Title: Güçlü, çekici başlık (maksimum 10 kelime, "${this.keyword}" geçmeli)
2. Hero Subtitle: Açıklayıcı alt başlık (15-20 kelime)
3. 3 Feature Badge: Her biri 2-3 kelime (örn: "Canlı Casino", "Slot Oyunları", "Spor Bahisleri")

JSON formatında döndür:
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
      { maxTokens: 500 }
    );

    return parseJSON(response);
  }

  async generateButtons() {
    const prompt = `
"${this.keyword}" temalı casino/bahis sitesi için 2 CTA (Call-to-Action) buton metni yaz:

1. Primary Button: Ana aksiyon butonu (örn: "Hemen Giriş Yap", "Üye Ol", "${this.keyword} Giriş")
2. Secondary Button: İkincil buton (örn: "Oyunları İncele", "Detaylı Bilgi", "Demo Dene")

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

  async generateFeatures() {
    const prompt = `
"${this.keyword}" casino/bahis sitesi için 6 özellik kartı yaz:

Her kart:
- Başlık: 3-5 kelime
- Açıklama: 20-30 kelime, faydaları vurgula

Konular: Canlı Casino, Slot Oyunları, Spor Bahisleri, Bonuslar, Hızlı Çekim, Güvenlik

JSON array döndür:
[
  {"title": "...", "description": "..."},
  {"title": "...", "description": "..."},
  {"title": "...", "description": "..."},
  {"title": "...", "description": "..."},
  {"title": "...", "description": "..."},
  {"title": "...", "description": "..."}
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
      { maxTokens: 1500 }
    );

    return parseJSON(response);
  }

  async generateSecurity() {
    const prompt = `
"${this.keyword}" casino/bahis sitesi için güvenlik bölümü metinleri yaz:

1. Başlık: Güvenlik vurgusu yapan başlık (örn: "256-bit SSL Şifreleme ile Korunuyorsunuz")
2. Açıklama: Güvenlik özelliklerini açıklayan 1-2 cümle (40-50 kelime)

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
"${this.keyword}" hakkında SEO uyumlu, 2000+ kelimelik detaylı makale yaz:

Yapı:
- 1 Ana H2 başlığı
- 7-8 Alt H3 başlıkları
- Her section 200-300 kelime (2-3 paragraf)
- Türev kelimeleri doğal şekilde kullan: ${this.keywords.slice(0, 10).join(', ')}
- Profesyonel, bilgilendirici Türkçe
- Casino/bahis sektörüne uygun

JSON formatında döndür:
{
  "mainTitle": "...",
  "sections": [
    {
      "h3": "...",
      "paragraphs": ["paragraf 1...", "paragraf 2...", "paragraf 3..."]
    },
    ...
  ]
}

En az 7 section olsun.
    `.trim();

    const response = await this.ai.chat(
      [
        {
          role: 'system',
          content: 'Sen SEO makale yazarısın. Uzun, detaylı ve bilgilendirici içerik üretirsin. Sadece JSON döndürürsün.',
        },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 4000 }
    );

    return parseJSON(response);
  }

  async generateFAQs() {
    const prompt = `
"${this.keyword}" hakkında 6 sıkça sorulan soru ve cevap yaz:

Sorular kullanıcıların gerçekten sorabileceği şeyler olsun:
- Hangi oyunlar var?
- Güvenli mi?
- Bonuslar neler?
- Para çekme nasıl?
- Destek var mı?
- Kazanma şansım ne kadar?

Her cevap 60-80 kelime, detaylı ve bilgilendirici.

JSON array döndür:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
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
      { maxTokens: 2000 }
    );

    return parseJSON(response);
  }

  async generateFooter() {
    const prompt = `
"${this.keyword}" casino/bahis sitesi için footer metinleri yaz:

1. Hakkımızda: Site hakkında kısa tanıtım metni (30-40 kelime)
2. Copyright: Copyright metni (örn: "© 2025 ${this.keyword}. Tüm hakları saklıdır. 18+ Sorumlu Oyun.")

JSON formatında döndür:
{
  "about": "...",
  "copyright": "..."
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
}

