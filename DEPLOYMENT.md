# Deployment Guide

## Vercel'e Deploy Etme Adımları

### 1. GitHub Repository (✅ Tamamlandı)

Repository zaten GitHub'da: https://github.com/furyw0/landing-page-generator

### 2. Vercel'e Bağlanma

1. [vercel.com](https://vercel.com) hesabınıza giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub repository'nizi seçin (landing-page-generator)
4. Framework Preset: Next.js (otomatik algılanır)
5. "Deploy" butonuna BASMADAN önce Environment Variables ekleyin

### 3. Vercel Postgres Oluşturma (ÖNCELİKLE BU!)

**ADIM 1:** Vercel Dashboard'da projenize gidin (veya yeni proje oluşturduktan sonra)

**ADIM 2:** Storage sekmesine tıklayın
- **Storage** → **Create Database**
- **Postgres** seçin
- Region: **Frankfurt (eu-central-1)** veya size en yakın
- Database adı: `landing-generator-db`
- **Create** tıklayın

**ADIM 3:** Environment Variables'ı kopyalayın
- Postgres oluşturulduktan sonra `.env.local` sekmesine gidin
- Tüm `POSTGRES_*` değişkenlerini kopyalayın

### 4. Environment Variables (Vercel Dashboard)

Aşağıdaki environment variables'ları ekleyin:

```env
# Vercel Postgres (önceki adımdan kopyaladınız)
POSTGRES_URL=postgres://default:xxx@xxx-pooler.aws.postgres.vercel-storage.com/verceldb
POSTGRES_PRISMA_URL=postgres://default:xxx@xxx-pooler.aws.postgres.vercel-storage.com/verceldb?pgbouncer=true
POSTGRES_URL_NO_SSL=postgres://default:xxx@xxx-pooler.aws.postgres.vercel-storage.com/verceldb
POSTGRES_URL_NON_POOLING=postgres://default:xxx@xxx.aws.postgres.vercel-storage.com/verceldb
POSTGRES_USER=default
POSTGRES_HOST=xxx-pooler.aws.postgres.vercel-storage.com
POSTGRES_PASSWORD=xxx
POSTGRES_DATABASE=verceldb

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-32-char-secret

# Encryption
ENCRYPTION_KEY=your-64-char-hex-key

# Vercel Blob (bir sonraki adımda alacağız)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
```

#### ENCRYPTION_KEY Oluşturma

```bash
openssl rand -hex 32
```

#### NEXTAUTH_SECRET Oluşturma

```bash
openssl rand -base64 32
```

### 5. Vercel Blob Storage Setup

1. Vercel dashboard'da projenize gidin
2. Storage sekmesine tıklayın
3. "Create Database" → "Blob" seçin
4. İsim: `landing-pages`
5. "Create" tıklayın
6. `.env.local` sekmesinden **BLOB_READ_WRITE_TOKEN** kopyalayın
7. Environment Variables'a ekleyin

### 6. Inngest Setup

1. [inngest.com](https://inngest.com) hesabı oluşturun
2. Yeni project oluşturun
3. API keys'den INNGEST_EVENT_KEY ve INNGEST_SIGNING_KEY alın
4. Vercel environment variables'a ekleyin

### 7. Deploy

"Deploy" butonuna tıklayın. İlk deploy ~3-5 dakika sürer.

### 8. Database Migration Çalıştırma (ÖNEMLİ!)

Deploy tamamlandıktan sonra veritabanı tablolarını oluşturmalısınız:

**Seçenek A: API Route ile (Önerilen)**

1. `src/app/api/migrate/route.ts` dosyası oluşturun:

```typescript
import { createTables, createUpdateTrigger } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  
  // Basit güvenlik (production'da daha güvenli yapın)
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await createTables();
    await createUpdateTrigger();
    return NextResponse.json({ 
      success: true,
      message: 'Database tables created successfully' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: String(error) 
    }, { status: 500 });
  }
}
```

2. Vercel'e `MIGRATION_SECRET` environment variable ekleyin (rastgele string)

3. Deploy olduktan sonra migration'ı çalıştırın:

```bash
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Authorization: Bearer YOUR_MIGRATION_SECRET"
```

**Seçenek B: Vercel CLI ile**

```bash
# Vercel CLI'yi kurun
npm i -g vercel

# Login olun
vercel login

# Environment variables'ı çekin
vercel env pull .env.production

# Migration'ı local'den çalıştırın (production DB'ye bağlanır)
npm run migrate
```

### 9. İlk Kullanıcı Kaydı

1. Deploy edilen URL'ye gidin (örn: https://landing-page-generator.vercel.app)
2. Register sayfasından kayıt olun
3. Login yapın
4. Settings'den OpenAI API key'inizi ekleyin
5. Generate sayfasından ilk içeriğinizi oluşturun

## Otomatik Deploy

Her `git push origin main` komutu sonrası Vercel otomatik olarak yeniden deploy eder.

## Troubleshooting

### Build Error: Module not found

```bash
# node_modules'ı silip yeniden kurun
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Error

**Artık kullanılmıyor** - Vercel Postgres kullanıyoruz.

### Postgres Connection Error

### Postgres Connection Error

- Vercel Dashboard → Storage → Postgres'inizin durumunu kontrol edin
- `POSTGRES_URL` environment variable'ının doğru olduğundan emin olun
- SSL bağlantısı için `POSTGRES_URL` kullanın (NON_POOLING değil)

### Migration Hatası: "relation already exists"

Normal! Tablolar zaten var demektir. Hata vermez, devam eder.

### Inngest Functions Not Working

- Vercel dashboard'da Functions logs'u kontrol edin
- INNGEST_EVENT_KEY ve INNGEST_SIGNING_KEY doğru olduğundan emin olun
- Inngest dashboard'da webhook URL'sini kontrol edin: `https://your-domain.vercel.app/api/inngest`

### OpenAI API Errors

- API key'in geçerli olduğundan emin olun
- OpenAI hesabında kredi olduğundan emin olun
- Rate limit'e takılmadığınızdan emin olun

## Production Checklist

- [ ] Vercel Postgres oluşturuldu
- [ ] Vercel Blob Storage oluşturuldu
- [ ] Tüm environment variables eklendi
- [ ] İlk deploy yapıldı
- [ ] Database migration çalıştırıldı
- [ ] İnngest webhook URL eklendi
- [ ] Test kullanıcısı oluşturuldu
- [ ] İlk landing page üretildi ve test edildi
- [ ] Güvenli NEXTAUTH_SECRET kullanılıyor
- [ ] ENCRYPTION_KEY güvenli şekilde saklanıyor
- [ ] Vercel Blob Storage limitlerini kontrol ettiniz
- [ ] Inngest free tier limitlerini kontrol ettiniz
- [ ] OpenAI API rate limits ve pricing kontrolü yapıldı
- [ ] Error monitoring kuruldu (opsiyonel: Sentry)
- [ ] Custom domain bağlandı (opsiyonel)

## Next Steps

- Analytics ekleyin (Vercel Analytics)
- Error tracking ekleyin (Sentry)
- Email notifications ekleyin (içerik hazır olduğunda)
- Credit/subscription sistemi ekleyin
- Admin dashboard ekleyin (kullanıcı yönetimi)

