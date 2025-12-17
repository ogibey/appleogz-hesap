# Proje Güncelleme Rehberi

## GitHub'a Güncelleme Yükleme

### 1. Değişiklikleri Commit Etme

```bash
# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "Yeni özellikler: Aksesuar yönetimi, satış düzenleme, borç düzenleme, stok sıralama"

# GitHub'a push et
git push origin main
```

### 2. Eğer Remote Yoksa

```bash
# GitHub repository URL'inizi ekleyin
git remote add origin https://github.com/YOUR_USERNAME/appleogz-hesap.git

# İlk push
git push -u origin main
```

## Vercel Otomatik Deploy

Vercel GitHub repository'nize bağlıysa, `git push` yaptığınızda otomatik olarak yeni bir deploy başlatılacaktır.

Eğer otomatik deploy çalışmıyorsa:
1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. Settings > Git > Repository bağlantısını kontrol edin
4. Manuel deploy için: Deployments > Redeploy

