# 🔄 MongoDB'den Vercel Postgres'e Geçiş Rehberi

## 📋 Değişiklikler

Proje artık MongoDB yerine **Vercel Postgres** kullanıyor. Bu değişiklik daha hızlı, daha kolay yönetim ve Vercel ekosistemiyle tam entegrasyon sağlıyor.

---

## 🗄️ Database Kurulumu

### 1. Vercel Postgres Oluşturma

**Adım 1:** Vercel Dashboard'a gidin
- https://vercel.com/dashboard

**Adım 2:** Storage sekmesine tıklayın
- Projenizi seçin
- **Storage** → **Create Database**

**Adım 3:** Postgres'i seçin
- **Postgres** kartına tıklayın
- Region: **Frankfurt (eu-central-1)** veya size en yakın
- Database adı: `landing-generator-db`
- **Create** tıklayın (kurulum ~1 dakika)

**Adım 4:** Environment Variables'ı kopyalayın
- `.env.local` sekmesine gidin
- Otomatik oluşturulan değişkenleri kopyalayın:
  ```bash
  POSTGRES_URL="..."
  POSTGRES_PRISMA_URL="..."
  POSTGRES_URL_NO_SSL="..."
  POSTGRES_URL_NON_POOLING="..."
  POSTGRES_USER="..."
  POSTGRES_HOST="..."
  POSTGRES_PASSWORD="..."
  POSTGRES_DATABASE="..."
  ```

---

## 🔑 Environment Variables

### Yeni `.env.local` Dosyası

MongoDB değişkenleri kaldırıldı, Postgres değişkenleri eklendi:

```bash
# ============================================
# VERCEL POSTGRES (YENİ)
# ============================================
POSTGRES_URL="postgres://default:xxxxx@xxx-pooler.aws.postgres.vercel-storage.com/verceldb"
POSTGRES_PRISMA_URL="postgres://default:xxxxx@xxx-pooler.aws.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgres://default:xxxxx@xxx-pooler.aws.postgres.vercel-storage.com/verceldb"
POSTGRES_URL_NON_POOLING="postgres://default:xxxxx@xxx.aws.postgres.vercel-storage.com/verceldb"
POSTGRES_USER="default"
POSTGRES_HOST="xxx-pooler.aws.postgres.vercel-storage.com"
POSTGRES_PASSWORD="xxxxx"
POSTGRES_DATABASE="verceldb"

# ============================================
# NEXTAUTH (AYNI)
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-32-chars-min

# ============================================
# ENCRYPTION (AYNI)
# ============================================
ENCRYPTION_KEY=your-64-character-hex-encryption-key

# ============================================
# VERCEL BLOB (AYNI)
# ============================================
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx

# ============================================
# INNGEST (AYNI)
# ============================================
INNGEST_EVENT_KEY=xxxxxxxxxx
INNGEST_SIGNING_KEY=signkey-prod-xxxxx
```

### ❌ Kaldırılan Değişkenler

```bash
# Artık gerekli değil:
MONGODB_URI=...
```

---

## 🚀 Migration (Tablo Oluşturma)

### Local'de Migration Çalıştırma

**Adım 1:** Environment variables'ı ayarlayın
- `.env.local` dosyasına Vercel Postgres değişkenlerini ekleyin

**Adım 2:** Migration script'ini çalıştırın
```bash
npm run migrate
```

Bu komut:
- ✅ Veritabanı bağlantısını test eder
- ✅ `users` tablosunu oluşturur
- ✅ `contents` tablosunu oluşturur
- ✅ Gerekli index'leri ekler
- ✅ Auto-update trigger'larını kurar

**Başarılı çıktı:**
```
🚀 Starting database migration...

1️⃣ Testing database connection...
✅ Database connection successful: { current_time: 2024-01-15T10:30:00.000Z }

2️⃣ Creating tables...
✅ Database tables created successfully

3️⃣ Creating update triggers...
✅ Update triggers created successfully

✅ Migration completed successfully!

📊 Created tables:
   - users
   - contents

🔧 Created triggers:
   - update_users_updated_at
   - update_contents_updated_at

🎉 Your database is ready to use!
```

---

## 📊 Database Schema

### `users` Tablosu

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  openai_api_key TEXT,
  selected_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### `contents` Tablosu

```sql
CREATE TABLE contents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keyword VARCHAR(500) NOT NULL,
  derived_keywords TEXT[],
  main_url TEXT NOT NULL,
  hreflang_url TEXT NOT NULL,
  template_id VARCHAR(50) NOT NULL,
  generated_content JSONB,
  blob_url TEXT,
  blob_filename VARCHAR(500),
  status VARCHAR(50) DEFAULT 'generating',
  error TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_created_at ON contents(created_at DESC);
```

---

## 🔄 Kod Değişiklikleri

### 1. Database Connection

**Eski (MongoDB):**
```typescript
import { connectDB } from '@/lib/mongodb';
await connectDB();
```

**Yeni (Postgres):**
```typescript
import { sql } from '@/lib/db';
// Bağlantı otomatik - connectDB() gerekmez
```

### 2. Model Kullanımı

**Eski (Mongoose):**
```typescript
const user = await User.findOne({ email });
const user = await User.findById(userId);
await User.findByIdAndUpdate(userId, { ... });
```

**Yeni (Postgres DAO):**
```typescript
const user = await User.findByEmail(email);
const user = await User.findById(userId);
await User.updateById(userId, { ... });
```

### 3. Content İşlemleri

**Eski:**
```typescript
const content = await Content.create({
  userId,
  keyword,
  mainUrl,
  hreflangUrl,
  templateId,
});
```

**Yeni:**
```typescript
const content = await Content.create({
  user_id: userId,
  keyword,
  main_url: mainUrl,
  hreflang_url: hreflangUrl,
  template_id: templateId,
});
```

**Not:** PostgreSQL snake_case convention kullanır (`user_id` yerine `userId`)

---

## 🧪 Test Etme

### Local Test

```bash
# 1. Environment variables ayarlayın
# 2. Migration çalıştırın
npm run migrate

# 3. Development server başlatın
npm run dev

# 4. Tarayıcıda test edin
# - Register: http://localhost:3000/register
# - Login: http://localhost:3000/login
# - Settings: http://localhost:3000/settings
# - Generate: http://localhost:3000/generate
```

### Production (Vercel)

**Adım 1:** Environment Variables ekleyin
- Vercel Dashboard → Project → Settings → Environment Variables
- Tüm `POSTGRES_*` değişkenlerini ekleyin
- ✅ Production, ✅ Preview, ✅ Development işaretleyin

**Adım 2:** Deploy edin
```bash
git add .
git commit -m "feat: migrate to Vercel Postgres"
git push origin main
```

**Adım 3:** Migration çalıştırın
- İlk deploy sonrası migration otomatik çalışmaz
- Vercel Functions'da bir kez çalıştırmanız gerekir:

**Seçenek A: API Route ile**
`/app/api/migrate/route.ts` oluşturun:
```typescript
import { createTables, createUpdateTrigger } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await createTables();
    await createUpdateTrigger();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

Sonra Postman/curl ile POST isteği gönderin:
```bash
curl -X POST https://your-app.vercel.app/api/migrate
```

**Seçenek B: Vercel CLI ile**
```bash
vercel env pull .env.production
tsx scripts/migrate.ts
```

---

## 🔍 Sık Sorulanlar (FAQ)

### MongoDB verilerim ne olacak?

Migration otomatik veri taşıma yapmaz. Manuel olarak taşımanız gerekirse:
1. MongoDB'den export edin
2. PostgreSQL'e import edin
3. Veya sıfırdan başlayın (test aşamasındaysanız önerilir)

### Neden Postgres?

✅ **Daha hızlı:** Connection pooling ile optimize edilmiş
✅ **Daha ucuz:** Vercel Pro'da dahil
✅ **Daha kolay:** Tek platform (Vercel)
✅ **SQL gücü:** Complex query'ler daha kolay
✅ **ACID garantisi:** Data consistency

### Performans farkı var mı?

Postgres genellikle daha hızlıdır:
- ✅ Connection pooling (PgBouncer)
- ✅ Index optimization
- ✅ JSONB support (MongoDB benzeri)
- ✅ Vercel edge network ile entegre

### Rollback yapabilir miyim?

Evet, Git history'de MongoDB versiyonu duruyor:
```bash
git log --oneline
git checkout <commit-before-postgres>
```

---

## 📝 Checklist

Deploy öncesi kontrol listesi:

- [ ] Vercel Postgres oluşturuldu
- [ ] Environment variables kopyalandı
- [ ] Local'de `.env.local` güncellendi
- [ ] `npm run migrate` çalıştırıldı
- [ ] Local'de test edildi
- [ ] Vercel'e environment variables eklendi
- [ ] Production'a deploy edildi
- [ ] Production'da migration çalıştırıldı
- [ ] Production'da test edildi

---

## 🆘 Sorun Giderme

### Bağlantı hatası

```
Error: connect ECONNREFUSED
```

**Çözüm:** `POSTGRES_URL` environment variable'ı kontrol edin.

### Migration hatası

```
Error: relation "users" already exists
```

**Çözüm:** Normal, tablolar zaten var. Devam edebilirsiniz.

### SSL hatası (production)

```
Error: The server does not support SSL connections
```

**Çözüm:** `POSTGRES_URL` kullanın (SSL destekli), `POSTGRES_URL_NO_SSL` değil.

### Field ismi hatası

```
Error: column "userId" does not exist
```

**Çözüm:** PostgreSQL snake_case kullanır: `user_id`, `main_url`, etc.

---

## 🎉 Hazırsınız!

Artık Vercel Postgres ile çalışıyorsunuz. Herhangi bir sorun için:
- Vercel Logs: Dashboard → Deployments → Function Logs
- PostgreSQL Query: Vercel Dashboard → Storage → Query tab

**Happy Coding! 🚀**

