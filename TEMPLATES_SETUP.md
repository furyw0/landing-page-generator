# Templates Klasörü Kurulumu

Templates klasörü henüz oluşturulmamış. Lütfen aşağıdaki adımları takip edin:

## Manuel Kurulum

Terminal'de şu komutları çalıştırın:

```bash
cd /Users/fy-macmini/Documents/landing-page-generator

# Templates klasörünü oluştur
mkdir -p templates

# Landing.html dosyasını 5 template olarak kopyala
cp /Users/fy-macmini/Documents/landing-page/landing.html templates/template-1.html
cp /Users/fy-macmini/Documents/landing-page/landing.html templates/template-2.html
cp /Users/fy-macmini/Documents/landing-page/landing.html templates/template-3.html
cp /Users/fy-macmini/Documents/landing-page/landing.html templates/template-4.html
cp /Users/fy-macmini/Documents/landing-page/landing.html templates/template-5.html

# Kontrol et
ls -la templates/
```

Başarılı olursa 5 template dosyası göreceksiniz:
- template-1.html (Luxury Gold - Premium Casino)
- template-2.html (Modern Blue - Tech Casino)
- template-3.html (Neon Purple - Cyberpunk Casino)
- template-4.html (Classic Green - Traditional Casino)
- template-5.html (Orange Red - Energetic Casino)

## Not

Şu anda tüm template'ler aynı HTML içeriğine sahip. İleri versiyonlarda her template için farklı CSS renk şemaları eklenebilir.

HTML Builder service (`src/lib/services/html-builder.service.ts`) bu template'leri okuyup OpenAI'dan gelen içeriklerle doldurur.

