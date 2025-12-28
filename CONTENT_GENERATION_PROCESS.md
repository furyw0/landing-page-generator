# İçerik Üretim Süreci - Nasıl Çalışır?

## 📋 Genel Bakış

Template'lerdeki **TÜM sabit yazılar** (Meritking, vb.) otomatik olarak OpenAI'dan gelen içeriklerle değiştirilir. Bu işlem HTML Builder Service tarafından yapılır.

## 🔄 Adım Adım Süreç

### 1. Kullanıcı İçerik Üretimi Başlatır

Kullanıcı Generate sayfasında:
- Template seçer (template-1, template-2, vb.)
- Anahtar kelime girer (örn: "betmatik")
- Main URL girer (örn: "https://betmatik-giris.com")
- Hreflang URL girer (örn: "https://betmatik.co.uk")
- "Üret" butonuna basar

### 2. API Request → Inngest Job Başlatır

```javascript
// /api/generate endpoint'i
POST /api/generate
{
  templateId: "template-1",
  keyword: "betmatik",
  mainUrl: "https://betmatik-giris.com",
  hreflangUrl: "https://betmatik.co.uk"
}

// Response
{
  contentId: "abc123...",
  status: "generating"
}
```

### 3. Inngest Arka Planda İşleme Başlar

7 adımlı süreç (30-60 saniye):

#### Step 1: User API Key Getir
```javascript
const user = await User.findById(userId);
const apiKey = decrypt(user.openaiApiKey);
const model = user.selectedModel; // gpt-4o-mini
```

#### Step 2: OpenAI Service Başlat
```javascript
const openai = new OpenAIService(apiKey, model);
```

#### Step 3: Anahtar Kelime Türetme
```javascript
const derivedKeywords = await openai.deriveKeywords("betmatik");
// Sonuç: ["betmatik", "betmatik giriş", "betmatik casino", 
//         "betmatik güncel adres", "betmatik slot", ...]
```

#### Step 4: OpenAI ile İçerik Üretimi (8 Tip)

Paralel olarak tüm içerikler üretilir:

**a) Meta Tags**
```javascript
{
  metaTitle: "Betmatik - Betmatik Giriş - Güncel Casino ve Bahis Adresi 2025",
  metaDescription: "Betmatik casino ve bahis sitesi güncel giriş...",
  metaKeywords: "betmatik, betmatik giriş, betmatik casino, ..."
}
```

**b) Hero Section**
```javascript
{
  heroTitle: "Betmatik Casino Güncel Giriş",
  heroSubtitle: "En Güvenilir Bahis ve Casino Deneyimi...",
  heroBadges: ["Canlı Casino", "Slot Oyunları", "Spor Bahisleri"]
}
```

**c) Button Texts**
```javascript
{
  primary: "Betmatik'e Giriş Yap",
  secondary: "Oyunları İncele"
}
```

**d) Security Section**
```javascript
{
  securityTitle: "256-bit SSL Şifreleme ile Korunuyorsunuz",
  securityDescription: "Tüm işlemleriniz bankalar düzeyinde..."
}
```

**e) Features (6 adet)**
```javascript
[
  {
    title: "Canlı Casino",
    description: "Gerçek krupiyelerle canlı casino deneyimi..."
  },
  // ... 5 tane daha
]
```

**f) Article (7-8 section)**
```javascript
{
  mainTitle: "Betmatik Giriş: En Güvenilir Casino Platformu",
  sections: [
    {
      h3: "Betmatik Casino Nedir?",
      paragraphs: ["Betmatik online bahis...", "Güvenilir lisans..."]
    },
    // ... 6-7 tane daha
  ]
}
```

**g) FAQs (6 adet)**
```javascript
[
  {
    question: "Betmatik casino hangi oyunları sunuyor?",
    answer: "Betmatik giriş yaparak binlerce slot oyunu..."
  },
  // ... 5 tane daha
]
```

**h) Footer**
```javascript
{
  about: "Türkiye'nin en güvenilir casino ve bahis platformu...",
  copyright: "© 2025 Betmatik. Tüm hakları saklıdır. 18+ Sorumlu Oyun."
}
```

#### Step 5: HTML Builder - Template Manipülasyonu

```javascript
const builder = new HTMLBuilderService();
const html = await builder.build(
  "template-1", 
  "https://betmatik-giris.com",
  "https://betmatik.co.uk",
  generatedContent
);
```

**HTML Builder şunları yapar:**

1. **Meta Tags Değiştirme**
```html
<!-- Önce -->
<title>Meritking - Meritking Giriş...</title>

<!-- Sonra -->
<title>Betmatik - Betmatik Giriş - Güncel Casino ve Bahis Adresi 2025</title>
```

2. **Hero Section Değiştirme**
```html
<!-- Önce -->
<h2 class="hero-title">
  <span class="highlight">Meritking Casino</span> Güncel Giriş
</h2>

<!-- Sonra -->
<h2 class="hero-title">
  <span class="highlight">Betmatik</span> Casino Güncel Giriş
</h2>
```

3. **Hero Badges Değiştirme**
```html
<!-- Önce -->
<div class="hero-feature">
  <span>Canlı Casino</span>
</div>

<!-- Sonra (AI'dan gelen badge) -->
<div class="hero-feature">
  <span>Canlı Blackjack</span>
</div>
```

4. **Buton Metinleri**
```html
<!-- Önce -->
<a class="btn btn-primary">Meritking Casino'ya Giriş Yap</a>

<!-- Sonra -->
<a class="btn btn-primary">Betmatik'e Giriş Yap</a>
```

5. **Article Content (Tümü Yeniden Yazılır)**
```html
<!-- Önce: Meritking hakkında 2000+ kelime -->
<article class="article-content">
  <h2>Meritking Giriş: En Güvenilir Casino...</h2>
  <p><strong>Meritking casino</strong>...</p>
  ...
</article>

<!-- Sonra: Betmatik hakkında YENİ 2000+ kelime -->
<article class="article-content">
  <h2>Betmatik Giriş: En Güvenilir Casino Platformu</h2>
  <h3>Betmatik Casino Nedir?</h3>
  <p>Betmatik online bahis ve casino...</p>
  <h3>Betmatik Güvenilir Mi?</h3>
  <p>Evet, Betmatik lisanslı...</p>
  ...
</article>
```

6. **FAQ'lar (Tümü Yeni)**
```html
<!-- Önce -->
<div class="faq-item">
  <button class="faq-question">
    <span>Meritking casino hangi oyunları sunuyor?</span>
  </button>
  <div class="faq-answer">
    <p>Meritking giriş yaparak...</p>
  </div>
</div>

<!-- Sonra -->
<div class="faq-item">
  <button class="faq-question">
    <span>Betmatik casino hangi oyunları sunuyor?</span>
  </button>
  <div class="faq-answer">
    <p>Betmatik giriş yaparak binlerce slot, canlı casino...</p>
  </div>
</div>
```

7. **URL'ler Değiştirme**
```html
<!-- Önce -->
<link rel="canonical" href="https://siteurl.com/">
<link rel="alternate" hreflang="tr" href="https://domain.com/">

<!-- Sonra -->
<link rel="canonical" href="https://betmatik-giris.com/">
<link rel="alternate" hreflang="tr" href="https://betmatik.co.uk/">
```

8. **Structured Data (JSON-LD)**
```javascript
// Önce
{
  "@type": "Organization",
  "name": "Meritking Casino",
  "url": "https://siteurl.com"
}

// Sonra
{
  "@type": "Organization",
  "name": "Betmatik Casino",
  "url": "https://betmatik-giris.com"
}
```

#### Step 6: Vercel Blob'a Upload
```javascript
const filename = "betmatik_1735123456789.html";
const blobUrl = await blobService.upload(html, filename);
// Result: https://blob.vercel-storage.com/betmatik_1735123456789.html
```

#### Step 7: MongoDB'ye Kaydet
```javascript
await Content.findByIdAndUpdate(contentId, {
  status: 'completed',
  blobUrl: blobUrl,
  blobFilename: filename,
  generatedContent: generatedContent,
  derivedKeywords: derivedKeywords,
  completedAt: new Date()
});
```

### 4. Kullanıcı Sonucu Görür

Frontend her 3 saniyede polling yapar:
```javascript
GET /api/contents/abc123
Response: { status: "completed", blobUrl: "..." }
```

Tamamlandığında:
- Preview sayfasına yönlendirilir
- HTML iframe'de render edilir
- Download butonu aktif olur
- Edit butonu ile düzenleme yapılabilir

## 🎯 Sonuç

**Her üretilen HTML dosyası:**
- ✅ Tamamen unique içerik (0% kopya)
- ✅ SEO optimize (keyword density, meta tags, structured data)
- ✅ Anahtar kelimeye özel (Meritking değil, Betmatik vb.)
- ✅ Template'in renk şeması korunur
- ✅ Responsive ve functional
- ✅ User URL'leri ile hazır

## 🔍 Hangi Metinler Değişir?

**Değişen:** (AI üretir)
- Title, description, keywords
- Hero başlık ve alt başlık
- Hero badges
- Buton metinleri
- Security section yazıları
- Feature card başlık ve açıklamalar
- Article başlık ve tüm içerik (2000+ kelime)
- FAQ soru ve cevaplar
- Footer about ve copyright

**Değişmeyen:** (Template'de kalır)
- CSS stilleri
- HTML yapısı
- JavaScript kodları
- SVG ikonlar
- Layout ve responsive design
- Animasyonlar

## 📊 Örnek Karşılaştırma

| Element | Template (Önce) | Üretilen (Sonra) |
|---------|----------------|------------------|
| Title | Meritking - Meritking Giriş... | Betmatik - Betmatik Giriş... |
| Hero | Meritking Casino | Betmatik Casino |
| Article | Meritking hakkında 2000 kelime | Betmatik hakkında YENİ 2000 kelime |
| FAQs | Meritking soruları | Betmatik soruları |
| Buttons | Meritking'e Giriş | Betmatik'e Giriş |

**Sonuç:** Her üretim %100 unique, keyword-specific içerik! 🚀

