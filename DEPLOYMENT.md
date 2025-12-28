# Deployment Guide

## Vercel'e Deploy Etme Adımları

### 1. GitHub Repository Oluşturma

```bash
# GitHub'da yeni bir repository oluşturun
# Örnek: landing-page-generator

# Local repository'yi GitHub'a push edin
git remote add origin https://github.com/KULLANICI_ADI/landing-page-generator.git
git branch -M main
git push -u origin main
```

### 2. Vercel'e Bağlanma

1. [vercel.com](https://vercel.com) hesabınıza giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub repository'nizi seçin (landing-page-generator)
4. Framework Preset: Next.js (otomatik algılanır)
5. "Deploy" butonuna BASMADAN önce Environment Variables ekleyin

### 3. Environment Variables (Vercel Dashboard)

Aşağıdaki environment variables'ları ekleyin:

```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-32-char-secret

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/landing-generator

ENCRYPTION_KEY=your-64-char-hex-key

BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### ENCRYPTION_KEY Oluşturma

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### NEXTAUTH_SECRET Oluşturma

```bash
openssl rand -base64 32
```

### 4. MongoDB Atlas Setup

1. [cloud.mongodb.com](https://cloud.mongodb.com) hesabı oluşturun
2. Free tier cluster oluşturun
3. Database Access'de kullanıcı oluşturun
4. Network Access'de IP whitelist ekleyin (0.0.0.0/0 - tüm IP'ler)
5. Connect butonundan connection string alın
6. MONGODB_URI'ye ekleyin

### 5. Vercel Blob Storage Setup

1. Vercel dashboard'da projenize gidin
2. Storage sekmesine tıklayın
3. "Create Database" → "Blob" seçin
4. Token'ı kopyalayıp BLOB_READ_WRITE_TOKEN'a ekleyin

### 6. Inngest Setup

1. [inngest.com](https://inngest.com) hesabı oluşturun
2. Yeni project oluşturun
3. API keys'den INNGEST_EVENT_KEY ve INNGEST_SIGNING_KEY alın
4. Vercel environment variables'a ekleyin

### 7. Deploy

"Deploy" butonuna tıklayın. İlk deploy ~3-5 dakika sürer.

### 8. İlk Kullanıcı Kaydı

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

- MongoDB Atlas'ta IP whitelist kontrol edin
- Connection string'de username/password doğru olduğundan emin olun
- Database adının connection string'de belirtildiğinden emin olun

### Inngest Functions Not Working

- Vercel dashboard'da Functions logs'u kontrol edin
- INNGEST_EVENT_KEY ve INNGEST_SIGNING_KEY doğru olduğundan emin olun
- Inngest dashboard'da webhook URL'sini kontrol edin: `https://your-domain.vercel.app/api/inngest`

### OpenAI API Errors

- API key'in geçerli olduğundan emin olun
- OpenAI hesabında kredi olduğundan emin olun
- Rate limit'e takılmadığınızdan emin olun

## Production Checklist

- [ ] MongoDB Atlas production cluster kullanılıyor
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

