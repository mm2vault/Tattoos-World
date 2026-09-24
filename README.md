# TATTOO'S WORLD 🖤
> **"Your skin. Your story. Discover tattoos that feel like you."**

**Tatto's World**, dövme sanatçıları, koleksiyonerler ve dövme tutkunları için geliştirilmiş modern, estetik ve premium bir dövme topluluğu ve portfolyo platformudur.

---

## ✨ Özellikler (Features)

### 1. Karşılama Ekranı (Welcome Screen)
- **Koyu Stüdyo Estetiği:** Grafiti/brush tarzı `TATTOO'S WORLD` tipografisi ve yüksek kontrastlı sanatsal yüz dövmesi arka planı.
- **Hızlı Giriş Seçenekleri:** Google ile Giriş Yap veya Misafir / Hesap Oluştur ile platformu anında keşfetme.
- **Öne Çıkan Özellikler:** Dövme Galerisi, Profil ve Topluluk, Dövme Paylaşımı, Yorum & Beğeni, Sosyal Bağlantılar ve Çoklu Dil Desteği.
- **İmza:** *"Tattoos Connect People"* el yazısı motifi.

### 2. Ana Dashboard & Kenar Çubuğu (Sidebar Layout)
- **Masaüstü Sol Sidebar:**
  - `Ana Sayfa`, `Galeri`, `Profilim`, `Dövme Ekle`, `Favorilerim`, `Mesajlar`, `Ayarlar` ve `Çıkış Yap`.
- **Üst Header:**
  - Canlı arama çubuğu (`Dövmelerde ara...`), bildirim zili, mesaj ikonu ve kullanıcı avatarı.
- **Hero Banner:**
  - *"Your Next Tattoo Starts Here"* ana başlığı, dövmeli kadın portresi ve doğrudan keşfe yönlendiren aksiyon butonları.
- **Popüler Dövmeler:**
  - 5 adet öne çıkan dövme kartı: *Butterfly* (12.4K), *Snake* (9.9K), *Rose* (8.7K), *Cross* (7.3K), *Wolf* (6.1K).
- **Kategoriler:**
  - Dairesel ikonlarla stiller: *Realizm, Minimal, Siyah & Gri, Renkli, Geometrik, Diğer, Fine Line*.

### 3. Tam Ekran Dövme Detay Ekranı (Tattoo Detail Modal)
- **Görsel Alanı:** Yüksek çözünürlüklü dövme fotoğrafı (Lion & Clock sleeve), altta çoklu fotoğraf önizleme şeridi ve `< 1/5 >` sayfalama.
- **Sanatçı Bilgisi:** Doğrulanmış sanatçı profili (`@inkedlife`), Takip Et / Takipten Çık butonu.
- **İçerik:** Dövme başlığı, stil etiketleri, dövmenin hikayesi.
- **Etkileşim:** Canlı beğeni sayacı (tıklandığında güncellenir), favoriye kaydetme, bağlantı kopyalama.
- **Yorum Sistemi:** Gerçek zamanlı yorum yazma, saatlik zaman damgaları, beğeni sayıları ve kendi yorumunu silme.

### 4. Sanatçı Profili (Artist Profile)
- Dövme temalı kapak banner'ı ve mavi onay rozetli profil fotoğrafı.
- İstatistikler (*Takipçi sayısı, Paylaşım sayısı, Beğeniler*).
- Sosyal medya butonları (*Instagram, TikTok, Discord, Website*).
- Sekmeler: *Paylaşımlar*, *Hakkında*, *Favorilerim*.
- Profil Düzenleme modalı (İsim, Bio, Sosyal medya linkleri).

### 5. Dövme Paylaş (Create & Share Tattoo)
- Kesikli (dashed) çerçeveli fotoğraf yükleme alanı.
- Cihaz galerisinden veya masaüstünden doğrudan görsel seçimi (`<input type="file" accept="image/*" />`).
- Anında fotoğraf önizleme.
- Başlık, kategori seçimi, açıklama ve opsiyonel sosyal medya bağlantıları.

### 6. Çoklu Dil Desteği (i18n)
- 9 Dil Desteği: **TR** (Türkçe), **EN** (English), **AZ** (Azərbaycan), **RU** (Русский), **DE** (Deutsch), **ES** (Español), **FR** (Français), **PT** (Português), **IT** (Italiano).
- Dil tercihi `localStorage` üzerinden otomatik olarak hatırlanır.

### 7. Mobil Uyumlu Arayüz (Responsive & Mobile Navigation)
- Mobilde kusursuz kullanım için tasarlanmış alt menü çubuğu: *Ana Sayfa, Galeri, Ekle, Profil*.

### 8. Firebase Entegrasyonu & Master Admin Yetkileri
- **Firebase Auth & Firestore:** Google ile Giriş ve bulut veritabanı desteği (`tattoo-s-world.firebaseapp.com`).
- **Master Admin (`mm2ultimatehub@gmail.com`):**
  - Tüm dövmeleri düzenleme, öne çıkarma (*Featured*) veya kalıcı silme yetkisi.
  - Tüm sanatçı ve kullanıcı profillerini, rollerini ve onaylı sanatçı rozetlerini yönetme yetkisi.
  - Uygunsuz yorumları tek tıkla silme moderasyonu.
  - Özel **Admin Kontrol Paneli** erişimi ve altın taç (`👑`) rozeti.

---

## 🛠️ Teknolojiler (Tech Stack)

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend & Auth:** [Firebase 11](https://firebase.google.com/) (Auth, Firestore, Analytics)
- **Build Aracı:** [Vite](https://vitejs.dev/)
- **Stil & Tasarım:** [Tailwind CSS v4](https://tailwindcss.com/)
- **İkonlar:** [Lucide React](https://lucide.dev/)
- **Tipografi:** Google Fonts (*Permanent Marker* brush graffiti, *Caveat* el yazısı, *Plus Jakarta Sans*, *Syne*)
- **Veri Kalıcılığı:** LocalStorage Senkronizasyonu & Modüler Store Mimarisi

---

## 🚀 Yerel Kurulum (Local Development)

Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

```bash
# 1. Depoyu klonlayın
git clone https://github.com/KULLANICI_ADINIZ/tattos-world.git

# 2. Proje dizinine girin
cd tattos-world

# 3. Bağımlılıkları yükleyin
npm install

# 4. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresine giderek uygulamayı görüntüleyebilirsiniz.

---

## 📦 Üretim Derlemesi (Build for Production)

Projeyi derlemek için:

```bash
npm run build
```

Derleme çıktısı `dist/` klasöründe oluşturulacaktır. `vite.config.ts` içinde `base: './'` ayarlandığı için oluşturulan statik dosyalar tüm sunucularda ve GitHub Pages'te sorunsuz çalışır.

---

## 🌐 GitHub'a Yükleme & GitHub Pages Yayını

### GitHub'a Gönderme (Push to GitHub):

```bash
git init
git add .
git commit -m "feat: initial release of Tatto's World platform"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/tattos-world.git
git push -u origin main
```

### GitHub Pages ile Yayınlama (Opsiyonel):
1. GitHub reponuzda **Settings > Pages** sekmesine gidin.
2. **Build and deployment > Source** seçeneğini `GitHub Actions` olarak ayarlayın.
3. Proje içerisindeki Vite derlemesi otomatik olarak yayınlanacaktır.

---

## 📁 Dosya Yapısı (Project Structure)

```text
├── public/
│   ├── images/
│   │   ├── tattoos/       # Dövme fotoğrafları (lion_clock, butterfly, snake vb.)
│   │   ├── users/         # Sanatçı ve kullanıcı avatarları
│   │   └── ui/            # Karşılama ve hero arka plan görselleri
├── src/
│   ├── components/
│   │   ├── WelcomeScreen.tsx       # Karşılama ekranı
│   │   ├── Sidebar.tsx             # Masaüstü sol kenar çubuğu
│   │   ├── TopHeader.tsx           # Arama ve üst başlık çubuğu
│   │   ├── BottomNav.tsx           # Mobil alt menü çubuğu
│   │   ├── Hero.tsx                # Hero banner
│   │   ├── Gallery.tsx             # Popüler dövmeler ve keşif galerisi
│   │   ├── TattooDetailModal.tsx   # Tam ekran dövme detayı ve yorumlar
│   │   ├── ProfileView.tsx         # Sanatçı/kullanıcı profili
│   │   ├── CreateTattooModal.tsx   # Dövme paylaşma modalı
│   │   ├── FooterBar.tsx           # Alt footer çubuğu ve dil seçici
│   │   └── Toast.tsx               # Bildirim bildirimleri
│   ├── i18n/
│   │   └── translations.ts         # 9 dilde çeviri sözlüğü
│   ├── services/
│   │   └── tattooStore.ts          # Veri yönetimi (beğeni, yorum, paylaşım, profil)
│   ├── types/
│   │   └── index.ts                # TypeScript arayüzleri ve modeller
│   ├── App.tsx                     # Ana uygulama birleştirici
│   ├── index.css                   # Global stiller ve Tailwind katmanları
│   └── main.tsx                    # React giriş noktası
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 Lisans
Bu proje [Apache-2.0](./LICENSE) lisansı altında geliştirilmiştir.
Tüm hakları saklıdır © 2025 **Tatto's World**.
