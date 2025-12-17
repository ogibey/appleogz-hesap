# GitHub ve Vercel'e Deployment Rehberi

## 1. GitHub'a Yükleme

### İlk Kurulum (Eğer Git Repository Yoksa)

```bash
# Proje klasörüne git
cd /Users/oguzhanboynukalin/Downloads/appleogz-hesap-main

# Git repository başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: AppleOGZ Hesap uygulaması"

# GitHub'da yeni bir repository oluşturun (github.com'da)
# Sonra remote ekleyin (YOUR_USERNAME ve YOUR_REPO_NAME'i değiştirin)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Branch adını main yapın
git branch -M main

# GitHub'a push edin
git push -u origin main
```

### Mevcut Değişiklikleri Güncelleme

```bash
# Değişiklikleri kontrol et
git status

# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "Yeni özellikler: Aksesuar yönetimi, satış düzenleme, borç düzenleme"

# GitHub'a push et
git push origin main
```

## 2. Vercel'e Deployment

### Yöntem 1: Vercel CLI ile (Önerilen)

```bash
# Vercel CLI'yi global olarak yükleyin (eğer yoksa)
npm install -g vercel

# Proje klasöründe
cd /Users/oguzhanboynukalin/Downloads/appleogz-hesap-main

# Vercel'e deploy edin
vercel

# İlk kez kullanıyorsanız:
# 1. Vercel hesabınıza giriş yapın
# 2. Proje ayarlarını seçin
# 3. Build komutu: npm run build
# 4. Output directory: dist
```

### Yöntem 2: GitHub Entegrasyonu (Otomatik)

1. **Vercel.com'a gidin** ve GitHub hesabınızla giriş yapın
2. **"Add New Project"** butonuna tıklayın
3. GitHub repository'nizi seçin
4. **Project Settings:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Deploy** butonuna tıklayın

### Yöntem 3: Vercel Dashboard'dan Manuel

1. Vercel Dashboard'a gidin
2. "Import Project" tıklayın
3. GitHub repository'nizi seçin veya Git URL'i girin
4. Ayarları yapılandırın ve deploy edin

## 3. Önemli Notlar

### Environment Variables
Eğer environment variable kullanıyorsanız, Vercel Dashboard'dan ekleyin:
- Settings > Environment Variables

### Build Ayarları
Vercel otomatik olarak Vite projelerini algılar, ancak manuel ayar gerekirse:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Otomatik Deploy
GitHub'a her push yaptığınızda Vercel otomatik olarak yeni bir deploy başlatır.

## 4. Sorun Giderme

### Build Hatası
```bash
# Bağımlılıkları kontrol et
npm install

# Build'i lokal olarak test et
npm run build
```

### Vercel Deploy Hatası
- Vercel Dashboard > Deployments > Logs bölümünden hata mesajlarını kontrol edin
- `vercel.json` dosyası gerekirse oluşturun

