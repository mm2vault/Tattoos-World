import { SupportedLanguage } from '../types';

export interface Translations {
  welcomeTagline: string;
  welcomeSubtitle: string;
  welcomeDescription: string;
  continueWithGoogle: string;
  continueAsGuest: string;
  or: string;
  alreadyHaveAccount: string;
  signIn: string;
  whatWeOffer: string;
  whatWeOfferSubtitle: string;
  featureGalleryTitle: string;
  featureGalleryDesc: string;
  featureProfileTitle: string;
  featureProfileDesc: string;
  featureShareTitle: string;
  featureShareDesc: string;
  featureCommentsTitle: string;
  featureCommentsDesc: string;
  featureSocialTitle: string;
  featureSocialDesc: string;
  featureLangTitle: string;
  featureLangDesc: string;
  motto: string;
  
  // Navigation & General
  navHome: string;
  navGallery: string;
  navProfile: string;
  navCreate: string;
  navFavorites: string;
  navCommunity: string;
  navAbout: string;
  navSettings: string;
  navLogout: string;
  searchPlaceholder: string;
  
  // Hero
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroBtnExplore: string;
  heroBtnShare: string;
  
  // Gallery
  popularTattoos: string;
  viewAll: string;
  categories: string;
  allCategories: string;
  discoverTattoos: string;
  noTattoosFound: string;
  beFirstToShare: string;
  shareTattooNow: string;
  
  // Categories
  catAll: string;
  catRealism: string;
  catMinimal: string;
  catMystic: string;
  catBlackAndGrey: string;
  catColor: string;
  catGeometric: string;
  catAnimals: string;
  catDark: string;
  catFantasy: string;
  catLettering: string;
  catTraditional: string;
  catFineLine: string;

  // Detail
  details: string;
  follow: string;
  following: string;
  artist: string;
  like: string;
  liked: string;
  share: string;
  save: string;
  saved: string;
  comments: string;
  writeComment: string;
  sendComment: string;
  deleteComment: string;
  linkCopied: string;

  // Create
  shareYourTattoo: string;
  uploadPhoto: string;
  uploadPhotoDesc: string;
  chooseFromGallery: string;
  changePhoto: string;
  titleLabel: string;
  titlePlaceholder: string;
  categoryLabel: string;
  selectCategory: string;
  descLabel: string;
  descPlaceholder: string;
  socialLinksOptional: string;
  publishTattoo: string;
  publishing: string;
  publishedSuccess: string;
  
  // Profile
  myTattoos: string;
  aboutMe: string;
  favorites: string;
  followers: string;
  shares: string;
  editProfile: string;
  saveChanges: string;
  displayName: string;
  bio: string;
  instagramHandle: string;
  tiktokHandle: string;
  discordHandle: string;
  websiteUrl: string;
  profileUpdated: string;
  
  // Community
  communityHub: string;
  communitySubtitle: string;
  featuredArtists: string;
  latestArtwork: string;
  trendingTags: string;

  // About
  aboutTitle: string;
  aboutSubtitle: string;
  discoverTitle: string;
  discoverDesc: string;
  createTitle: string;
  createDesc: string;
  connectTitle: string;
  connectDesc: string;

  // Footer
  allRightsReserved: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  tr: {
    welcomeTagline: "More Than Just Tattoos",
    welcomeSubtitle: "Your skin. Your story.",
    welcomeDescription: "Dövmeleri keşfet, sanatını paylaş ve kendi dövme kimliğini oluştur.",
    continueWithGoogle: "Google ile Giriş Yap",
    continueAsGuest: "Misafir Olarak Keşfet",
    or: "veya",
    alreadyHaveAccount: "Zaten hesabın var mı?",
    signIn: "Giriş Yap",
    whatWeOffer: "Neler Sunuyoruz?",
    whatWeOfferSubtitle: "Dövme dünyasının en güzel yönlerini tek bir yerde topladık.",
    featureGalleryTitle: "Dövme Galerisi",
    featureGalleryDesc: "Binlerce dövme fikri ve ilham verici tasarım. Kategorilere göre keşfet.",
    featureProfileTitle: "Profil ve Topluluk",
    featureProfileDesc: "Kendi profilini oluştur, dövmelerini paylaş, diğer sanatçılarla etkileşime geç.",
    featureShareTitle: "Dövme Paylaş",
    featureShareDesc: "Kendi dövmelerini yükle, hikayeni anlat, topluluğa katıl.",
    featureCommentsTitle: "Yorum ve Beğeni",
    featureCommentsDesc: "Beğen, yorum yap, fikirlerini paylaş ve toplulukla etkileşim kur.",
    featureSocialTitle: "Sosyal Bağlantılar",
    featureSocialDesc: "Instagram, TikTok, Discord ve daha fazlası. Sanatçılarla doğrudan bağlantı kur.",
    featureLangTitle: "Çoklu Dil Desteği",
    featureLangDesc: "Dilediğin dili seç, dünyanın her yerinden insanlarla iletişim kur.",
    motto: "Tattoos Connect People",

    navHome: "Ana Sayfa",
    navGallery: "Galeri",
    navProfile: "Profilim",
    navCreate: "Dövme Ekle",
    navFavorites: "Favorilerim",
    navCommunity: "Topluluk",
    navAbout: "Hakkımızda",
    navSettings: "Ayarlar",
    navLogout: "Çıkış Yap",
    searchPlaceholder: "Dövmelerde, stillerde, sanatçılarda ara...",

    heroTitle1: "Your Next Tattoo",
    heroTitle2: "Starts Here",
    heroSubtitle: "Benzersiz dövme tasarımlarını keşfet, sanatçılarla bağlantı kur, kendininkini paylaş ve topluluğumuzun bir parçası ol.",
    heroBtnExplore: "Keşfet",
    heroBtnShare: "Dövme Ekle",

    popularTattoos: "Popüler Dövmeler",
    viewAll: "Tümünü Gör",
    categories: "Kategoriler",
    allCategories: "Tüm Kategoriler",
    discoverTattoos: "Dövmeleri Keşfet",
    noTattoosFound: "Henüz bu kategoride dövme bulunamadı.",
    beFirstToShare: "İlk dövmeyi sen paylaş ve topluluğa ilham ver.",
    shareTattooNow: "Dövme Paylaş",

    catAll: "Tümü",
    catRealism: "Realizm",
    catMinimal: "Minimal",
    catMystic: "Mistik",
    catBlackAndGrey: "Siyah & Gri",
    catColor: "Renkli",
    catGeometric: "Geometrik",
    catAnimals: "Hayvanlar",
    catDark: "Karanlık",
    catFantasy: "Fantastik",
    catLettering: "Yazı / Lettering",
    catTraditional: "Geleneksel",
    catFineLine: "İnce Çizgi",

    details: "Detaylar",
    follow: "Takip Et",
    following: "Takip Ediliyor",
    artist: "Sanatçı",
    like: "Beğen",
    liked: "Beğenildi",
    share: "Paylaş",
    save: "Kaydet",
    saved: "Kaydedildi",
    comments: "Yorumlar",
    writeComment: "Yorum yaz...",
    sendComment: "Gönder",
    deleteComment: "Sil",
    linkCopied: "Bağlantı panoya kopyalandı!",

    shareYourTattoo: "Dövme Paylaş",
    uploadPhoto: "Dövme fotoğrafını yükle",
    uploadPhotoDesc: "JPG, PNG (Telefon galerinden veya dosyalarından seç)",
    chooseFromGallery: "Galeriden Seç",
    changePhoto: "Fotoğrafı Değiştir",
    titleLabel: "Başlık",
    titlePlaceholder: "Örn: Aslan & Zaman Saati, Minimal Yılan...",
    categoryLabel: "Kategori",
    selectCategory: "Kategori seçiniz...",
    descLabel: "Açıklama",
    descPlaceholder: "Dövmenin hikayesini, tekniğini veya anlamını anlat...",
    socialLinksOptional: "Sosyal Bağlantılar (İsteğe bağlı)",
    publishTattoo: "Dövmeyi Paylaş",
    publishing: "Paylaşılıyor...",
    publishedSuccess: "Dövmeniz başarıyla paylaşıldı!",

    myTattoos: "Paylaşımlar",
    aboutMe: "Hakkında",
    favorites: "Favorilerim",
    followers: "Takipçi",
    shares: "Paylaşım",
    editProfile: "Profili Düzenle",
    saveChanges: "Kaydet",
    displayName: "Görünen Ad",
    bio: "Biyografi",
    instagramHandle: "Instagram (Kullanıcı adı veya link)",
    tiktokHandle: "TikTok (Kullanıcı adı veya link)",
    discordHandle: "Discord Kullanıcı Adı",
    websiteUrl: "Web Sitesi",
    profileUpdated: "Profil başarıyla güncellendi!",

    communityHub: "Dövme Topluluğu",
    communitySubtitle: "Dünyanın dört bir yanından yetenekli dövme tutkunları ve sanatçıları.",
    featuredArtists: "Öne Çıkan Sanatçılar",
    latestArtwork: "Son Paylaşılan Eserler",
    trendingTags: "Popüler Trendler",

    aboutTitle: "Tatto's World Nedir?",
    aboutSubtitle: "Dövme sanatını ve hikayelerini bir araya getiren bağımsız premium platform.",
    discoverTitle: "Keşfet",
    discoverDesc: "En iyi dövme ustalarından binlerce el yapımı tasarımı yüksek çözünürlükte incele.",
    createTitle: "Yarat & Paylaş",
    createDesc: "Kendi dövmelerini, eskizlerini veya dövme anılarını güvenle yükle.",
    connectTitle: "Bağlan",
    connectDesc: "Sanatçılarla Instagram, TikTok ve Discord üzerinden doğrudan iletişime geç.",

    allRightsReserved: "Tüm hakları saklıdır."
  },

  en: {
    welcomeTagline: "More Than Just Tattoos",
    welcomeSubtitle: "Your skin. Your story.",
    welcomeDescription: "Discover tattoos, share your art and build your own tattoo identity.",
    continueWithGoogle: "Continue with Google",
    continueAsGuest: "Continue as Guest",
    or: "or",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In",
    whatWeOffer: "What We Offer",
    whatWeOfferSubtitle: "We brought together the finest aspects of the tattoo realm in one place.",
    featureGalleryTitle: "Tattoo Gallery",
    featureGalleryDesc: "Thousands of tattoo inspirations and artwork. Explore by categories.",
    featureProfileTitle: "Profile & Community",
    featureProfileDesc: "Build your profile, publish your tattoos, and connect with fellow artists.",
    featureShareTitle: "Share Tattoos",
    featureShareDesc: "Upload your tattoos, tell your story, and inspire the community.",
    featureCommentsTitle: "Comments & Likes",
    featureCommentsDesc: "Like, comment, discuss tattoo ideas, and engage with the community.",
    featureSocialTitle: "Social Connections",
    featureSocialDesc: "Instagram, TikTok, Discord and more. Connect directly with creators.",
    featureLangTitle: "Multi-Language Support",
    featureLangDesc: "Select your native language and connect with tattoo lovers worldwide.",
    motto: "Tattoos Connect People",

    navHome: "Home",
    navGallery: "Gallery",
    navProfile: "My Profile",
    navCreate: "Share Tattoo",
    navFavorites: "Favorites",
    navCommunity: "Community",
    navAbout: "About",
    navSettings: "Settings",
    navLogout: "Log Out",
    searchPlaceholder: "Search tattoos, styles, creators...",

    heroTitle1: "Your Next Tattoo",
    heroTitle2: "Starts Here",
    heroSubtitle: "Discover unique tattoo designs, connect with artists, share your own, and be part of our global community.",
    heroBtnExplore: "Explore Tattoos",
    heroBtnShare: "Share Your Tattoo",

    popularTattoos: "Popular Tattoos",
    viewAll: "View All",
    categories: "Categories",
    allCategories: "All Categories",
    discoverTattoos: "Discover Tattoos",
    noTattoosFound: "No tattoos found in this category yet.",
    beFirstToShare: "Be the first to share your tattoo and inspire others.",
    shareTattooNow: "Share Tattoo",

    catAll: "All",
    catRealism: "Realism",
    catMinimal: "Minimal",
    catMystic: "Mystic",
    catBlackAndGrey: "Black & Grey",
    catColor: "Color",
    catGeometric: "Geometric",
    catAnimals: "Animals",
    catDark: "Dark",
    catFantasy: "Fantasy",
    catLettering: "Lettering",
    catTraditional: "Traditional",
    catFineLine: "Fine Line",

    details: "Details",
    follow: "Follow",
    following: "Following",
    artist: "Artist",
    like: "Like",
    liked: "Liked",
    share: "Share",
    save: "Save",
    saved: "Saved",
    comments: "Comments",
    writeComment: "Write a comment...",
    sendComment: "Send",
    deleteComment: "Delete",
    linkCopied: "Link copied to clipboard!",

    shareYourTattoo: "Share Tattoo",
    uploadPhoto: "Upload tattoo photograph",
    uploadPhotoDesc: "JPG, PNG (Choose from phone gallery or files)",
    chooseFromGallery: "Choose from Gallery",
    changePhoto: "Change Photo",
    titleLabel: "Title",
    titlePlaceholder: "e.g. Lion & Vintage Clock, Minimal Snake...",
    categoryLabel: "Category",
    selectCategory: "Select a category...",
    descLabel: "Description",
    descPlaceholder: "Tell the story, the ink technique, or the meaning behind this tattoo...",
    socialLinksOptional: "Social Links (Optional)",
    publishTattoo: "Publish Tattoo",
    publishing: "Publishing...",
    publishedSuccess: "Your tattoo has been successfully published!",

    myTattoos: "Creations",
    aboutMe: "About",
    favorites: "Favorites",
    followers: "Followers",
    shares: "Creations",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    displayName: "Display Name",
    bio: "Bio",
    instagramHandle: "Instagram username or link",
    tiktokHandle: "TikTok username or link",
    discordHandle: "Discord username",
    websiteUrl: "Website link",
    profileUpdated: "Profile updated successfully!",

    communityHub: "Tattoo Community",
    communitySubtitle: "Talented tattoo enthusiasts, collectors, and artists from around the world.",
    featuredArtists: "Featured Artists",
    latestArtwork: "Latest Artworks",
    trendingTags: "Trending Aesthetics",

    aboutTitle: "About Tatto's World",
    aboutSubtitle: "An independent premium platform uniting tattoo art, personal stories, and creators.",
    discoverTitle: "Discover",
    discoverDesc: "Browse thousands of handcrafted designs in stunning resolution.",
    createTitle: "Create & Share",
    createDesc: "Upload your custom tattoos, flash art, or personal ink stories effortlessly.",
    connectTitle: "Connect",
    connectDesc: "Reach out to artists directly via Instagram, TikTok, and Discord.",

    allRightsReserved: "All rights reserved."
  },

  az: {
    welcomeTagline: "Döymələrdən Daha Artığı",
    welcomeSubtitle: "Sənin dərin. Sənin hekayən.",
    welcomeDescription: "Döymələri kəşf et, öz sənətini paylaş və öz döymə kimliyini yarat.",
    continueWithGoogle: "Google ilə Daxil Ol",
    continueAsGuest: "Qonaq Kimi Kəşf Et",
    or: "və ya",
    alreadyHaveAccount: "Artıq hesabınız var?",
    signIn: "Daxil Ol",
    whatWeOffer: "Biz Nə Təklif Edirik?",
    whatWeOfferSubtitle: "Döymə sənətinin ən gözəl tərəflərini bir məkanda topladıq.",
    featureGalleryTitle: "Döymə Qalereyası",
    featureGalleryDesc: "Minlərlə ilhamverici döymə dizaynı. Kateqoriyalara görə axtar.",
    featureProfileTitle: "Profil və İcma",
    featureProfileDesc: "Profil yarat, döymələrini paylaş və sənətkarlarla əlaqə qur.",
    featureShareTitle: "Döymə Paylaş",
    featureShareDesc: "Öz döymələrini yüklə, hekayəni danış və icmaya qoşul.",
    featureCommentsTitle: "Rəy və Bəyənmə",
    featureCommentsDesc: "Bəyən, fikirlərini bölüş və icma ilə ünsiyyətdə ol.",
    featureSocialTitle: "Sosial Əlaqələr",
    featureSocialDesc: "Instagram, TikTok, Discord və daha çoxu ilə sənətkarlarla birbaşa əlaqə.",
    featureLangTitle: "Çoxdilli Dəstək",
    featureLangDesc: "İstədiyin dili seç, dünyanın hər yerindən insanlarla əlaqə qur.",
    motto: "Tattoos Connect People",

    navHome: "Ana Səhifə",
    navGallery: "Qalereya",
    navProfile: "Profilim",
    navCreate: "Döymə Paylaş",
    navFavorites: "Seçilmişlər",
    navCommunity: "İcma",
    navAbout: "Haqqımızda",
    navSettings: "Tənzimləmələr",
    navLogout: "Çıxış",
    searchPlaceholder: "Döymələrdə, stillərdə, sənətkarlarda axtar...",

    heroTitle1: "Növbəti Döymən",
    heroTitle2: "Burada Başlayır",
    heroSubtitle: "Unikal döymə dizaynlarını kəşf et, sənətkarlarla tanış ol və hekayəni bizimlə paylaş.",
    heroBtnExplore: "Kəşf Et",
    heroBtnShare: "Döymə Paylaş",

    popularTattoos: "Populyar Döymələr",
    viewAll: "Hamısına Bax",
    categories: "Kateqoriyalar",
    allCategories: "Bütün Kateqoriyalar",
    discoverTattoos: "Döymələri Kəşf Et",
    noTattoosFound: "Bu kateqoriyada hələ döymə yoxdur.",
    beFirstToShare: "İlk döyməni sən paylaş və başqalarına ilham ver.",
    shareTattooNow: "Döymə Paylaş",

    catAll: "Hamısı",
    catRealism: "Realizm",
    catMinimal: "Minimal",
    catMystic: "Mistik",
    catBlackAndGrey: "Qara & Boz",
    catColor: "Rəngli",
    catGeometric: "Həndəsi",
    catAnimals: "Heyvanlar",
    catDark: "Qaranlıq",
    catFantasy: "Fantaziya",
    catLettering: "Yazı / Xəttatlıq",
    catTraditional: "Ənənəvi",
    catFineLine: "İncə Xətt",

    details: "Təfərrüatlar",
    follow: "İzlə",
    following: "İzlənilir",
    artist: "Sənətkar",
    like: "Bəyən",
    liked: "Bəyənildi",
    share: "Paylaş",
    save: "Yadda Saxla",
    saved: "Saxlanıldı",
    comments: "Rəylər",
    writeComment: "Rəy yaz...",
    sendComment: "Göndər",
    deleteComment: "Sil",
    linkCopied: "Link kopyalandı!",

    shareYourTattoo: "Döymə Paylaş",
    uploadPhoto: "Döymə şəklini yüklə",
    uploadPhotoDesc: "JPG, PNG (Telefon qalereyasından və ya fayllardan seçin)",
    chooseFromGallery: "Qalereyadan Seç",
    changePhoto: "Şəkli Dəyiş",
    titleLabel: "Başlıq",
    titlePlaceholder: "Məs: Şir və Qədim Saat, Zərif İlan...",
    categoryLabel: "Kateqoriya",
    selectCategory: "Kateqoriya seçin...",
    descLabel: "Təsvir",
    descPlaceholder: "Döymənin mənasını, texnikasını və ya hekayəsini izah edin...",
    socialLinksOptional: "Sosial Keçidlər (İstəyə görə)",
    publishTattoo: "Döyməni Paylaş",
    publishing: "Paylaşılır...",
    publishedSuccess: "Döyməniz uğurla paylaşıldı!",

    myTattoos: "Paylaşımlar",
    aboutMe: "Haqqında",
    favorites: "Seçilmişlər",
    followers: "İzləyici",
    shares: "Paylaşım",
    editProfile: "Profili Redaktə Et",
    saveChanges: "Yadda Saxla",
    displayName: "Görünən Ad",
    bio: "Bioqrafiya",
    instagramHandle: "Instagram",
    tiktokHandle: "TikTok",
    discordHandle: "Discord",
    websiteUrl: "Veb Sayt",
    profileUpdated: "Profil uğurla yeniləndi!",

    communityHub: "Döymə İcması",
    communitySubtitle: "Dünyanın hər yerindən istedadlı döymə sevərlər və ustalar.",
    featuredArtists: "Seçilmiş Sənətkarlar",
    latestArtwork: "Son Əsərlər",
    trendingTags: "Trend Stillər",

    aboutTitle: "Tatto's World Nədir?",
    aboutSubtitle: "Döymə sənətini və hekayələrini birləşdirən müasir platforma.",
    discoverTitle: "Kəşf Et",
    discoverDesc: "Yüksək keyfiyyətli minlərlə dizaynı araşdır.",
    createTitle: "Yarat və Paylaş",
    createDesc: "Öz döymələrini və eskizlərini rahatlıqla yüklə.",
    connectTitle: "Əlaqə Qur",
    connectDesc: "Instagram, TikTok və Discord vasitəsilə sənətkarlarla birbaşa danış.",

    allRightsReserved: "Bütün hüquqlar qorunur."
  },

  ru: {
    welcomeTagline: "Больше чем просто тату",
    welcomeSubtitle: "Your skin. Your story.",
    welcomeDescription: "Открывайте татуировки, делитесь своим искусством и создавайте свой стиль.",
    continueWithGoogle: "Войти через Google",
    continueAsGuest: "Продолжить как гость",
    or: "или",
    alreadyHaveAccount: "Уже есть аккаунт?",
    signIn: "Войти",
    whatWeOffer: "Что мы предлагаем?",
    whatWeOfferSubtitle: "Мы собрали лучшее из мира тату-культуры в одном пространстве.",
    featureGalleryTitle: "Галерея татуировок",
    featureGalleryDesc: "Тысячи идей и шедевров. Удобный поиск по категориям и стилям.",
    featureProfileTitle: "Профиль и сообщество",
    featureProfileDesc: "Создайте профиль, делитесь своими татуировками и находите мастеров.",
    featureShareTitle: "Публикация работ",
    featureShareDesc: "Загружайте свои тату, рассказывайте истории и вдохновляйте других.",
    featureCommentsTitle: "Лайки и комментарии",
    featureCommentsDesc: "Оценивайте работы, оставляйте отзывы и общайтесь с единомышленниками.",
    featureSocialTitle: "Социальные сети",
    featureSocialDesc: "Instagram, TikTok, Discord и другие контакты для прямой связи с мастером.",
    featureLangTitle: "Мультиязычность",
    featureLangDesc: "Выберите родной язык и общайтесь с людьми со всего мира.",
    motto: "Tattoos Connect People",

    navHome: "Главная",
    navGallery: "Галерея",
    navProfile: "Мой профиль",
    navCreate: "Добавить тату",
    navFavorites: "Избранное",
    navCommunity: "Сообщество",
    navAbout: "О проекте",
    navSettings: "Настройки",
    navLogout: "Выйти",
    searchPlaceholder: "Поиск татуировок, стилей, мастеров...",

    heroTitle1: "Ваша новая татуировка",
    heroTitle2: "начинается здесь",
    heroSubtitle: "Открывайте авторские эскизы, связывайтесь с мастерами и становитесь частью нашего сообщества.",
    heroBtnExplore: "Смотреть галерею",
    heroBtnShare: "Опубликовать тату",

    popularTattoos: "Популярные тату",
    viewAll: "Смотреть все",
    categories: "Категории",
    allCategories: "Все категории",
    discoverTattoos: "Каталог татуировок",
    noTattoosFound: "В этой категории пока нет работ.",
    beFirstToShare: "Станьте первым, кто поделится своей татуировкой!",
    shareTattooNow: "Опубликовать",

    catAll: "Все",
    catRealism: "Реализм",
    catMinimal: "Минимализм",
    catMystic: "Мистика",
    catBlackAndGrey: "Черно-белые",
    catColor: "Цветные",
    catGeometric: "Геометрия",
    catAnimals: "Животные",
    catDark: "Dark / Дарк",
    catFantasy: "Фэнтези",
    catLettering: "Надписи / Леттеринг",
    catTraditional: "Традиционные",
    catFineLine: "Тонкие линии",

    details: "Детали",
    follow: "Подписаться",
    following: "Вы подписаны",
    artist: "Мастер",
    like: "Нравится",
    liked: "Понравилось",
    share: "Поделиться",
    save: "Сохранить",
    saved: "Сохранено",
    comments: "Комментарии",
    writeComment: "Написать комментарий...",
    sendComment: "Отправить",
    deleteComment: "Удалить",
    linkCopied: "Ссылка скопирована в буфер обмена!",

    shareYourTattoo: "Опубликовать татуировку",
    uploadPhoto: "Загрузить фото тату",
    uploadPhotoDesc: "JPG, PNG (Выберите из галереи телефона или файлов)",
    chooseFromGallery: "Выбрать из галереи",
    changePhoto: "Изменить фото",
    titleLabel: "Название",
    titlePlaceholder: "Например: Лев и винтажные часы, змея...",
    categoryLabel: "Категория",
    selectCategory: "Выберите категорию...",
    descLabel: "Описание",
    descPlaceholder: "Расскажите историю, значение или технику нанесения...",
    socialLinksOptional: "Социальные сети (необязательно)",
    publishTattoo: "Опубликовать",
    publishing: "Публикация...",
    publishedSuccess: "Татуировка успешно опубликована!",

    myTattoos: "Мои работы",
    aboutMe: "О себе",
    favorites: "Избранное",
    followers: "Подписчики",
    shares: "Работы",
    editProfile: "Редактировать профиль",
    saveChanges: "Сохранить",
    displayName: "Имя профиля",
    bio: "О себе",
    instagramHandle: "Instagram",
    tiktokHandle: "TikTok",
    discordHandle: "Discord",
    websiteUrl: "Веб-сайт",
    profileUpdated: "Профиль успешно обновлен!",

    communityHub: "Тату Сообщество",
    communitySubtitle: "Талантливые мастера, ценители и коллекционеры со всего мира.",
    featuredArtists: "Популярные мастера",
    latestArtwork: "Свежие работы",
    trendingTags: "Тренды",

    aboutTitle: "Что такое Tatto's World?",
    aboutSubtitle: "Премиальная платформа, объединяющая искусство татуировки и уникальные истории людей.",
    discoverTitle: "Вдохновение",
    discoverDesc: "Тысячи авторских работ в превосходном качестве.",
    createTitle: "Творчество",
    createDesc: "Удобная загрузка собственных работ прямо с телефона.",
    connectTitle: "Общение",
    connectDesc: "Быстрая связь с мастерами через популярные мессенджеры и соцсети.",

    allRightsReserved: "Все права защищены."
  },

  de: {
    welcomeTagline: "More Than Just Tattoos",
    welcomeSubtitle: "Your skin. Your story.",
    welcomeDescription: "Entdecke Tattoos, teile deine Kunst und baue deine Tattoo-Identität auf.",
    continueWithGoogle: "Mit Google fortfahren",
    continueAsGuest: "Als Gast fortfahren",
    or: "oder",
    alreadyHaveAccount: "Bereits ein Konto?",
    signIn: "Anmelden",
    whatWeOffer: "Was wir bieten",
    whatWeOfferSubtitle: "Die besten Facetten der Tattoo-Kultur an einem Ort vereint.",
    featureGalleryTitle: "Tattoo Galerie",
    featureGalleryDesc: "Tausende Tattoo-Inspirationen und Kunstwerke nach Kategorien geordnet.",
    featureProfileTitle: "Profil & Community",
    featureProfileDesc: "Erstelle dein Profil, teile Tattoos und vernetze dich mit Künstlern.",
    featureShareTitle: "Tattoos teilen",
    featureShareDesc: "Lade deine Tattoos hoch, erzähle deine Geschichte und inspiriere andere.",
    featureCommentsTitle: "Likes & Kommentare",
    featureCommentsDesc: "Bewerte Arbeiten, diskutiere Ideen und tausche dich mit Tattoo-Fans aus.",
    featureSocialTitle: "Social Media",
    featureSocialDesc: "Instagram, TikTok, Discord und mehr für direkten Kontakt mit Künstlern.",
    featureLangTitle: "Mehrsprachigkeit",
    featureLangDesc: "Wähle deine Sprache und vernetze dich weltweit.",
    motto: "Tattoos Connect People",

    navHome: "Startseite",
    navGallery: "Galerie",
    navProfile: "Mein Profil",
    navCreate: "Tattoo teilen",
    navFavorites: "Favoriten",
    navCommunity: "Community",
    navAbout: "Über uns",
    navSettings: "Einstellungen",
    navLogout: "Abmelden",
    searchPlaceholder: "Tattoos, Stile, Künstler suchen...",

    heroTitle1: "Dein nächstes Tattoo",
    heroTitle2: "beginnt hier",
    heroSubtitle: "Entdecke einzigartige Designs, vernetze dich mit Künstlern und teile deine Kunst.",
    heroBtnExplore: "Entdecken",
    heroBtnShare: "Tattoo teilen",

    popularTattoos: "Beliebte Tattoos",
    viewAll: "Alle ansehen",
    categories: "Kategorien",
    allCategories: "Alle Kategorien",
    discoverTattoos: "Tattoos entdecken",
    noTattoosFound: "Noch keine Tattoos in dieser Kategorie.",
    beFirstToShare: "Sei der Erste, der ein Tattoo teilt!",
    shareTattooNow: "Jetzt teilen",

    catAll: "Alle",
    catRealism: "Realismus",
    catMinimal: "Minimalistisch",
    catMystic: "Mystisch",
    catBlackAndGrey: "Black & Grey",
    catColor: "Farbe",
    catGeometric: "Geometrisch",
    catAnimals: "Tiere",
    catDark: "Dark Art",
    catFantasy: "Fantasy",
    catLettering: "Lettering",
    catTraditional: "Traditionell",
    catFineLine: "Fine Line",

    details: "Details",
    follow: "Folgen",
    following: "Gefolgt",
    artist: "Künstler",
    like: "Gefällt mir",
    liked: "Geliked",
    share: "Teilen",
    save: "Speichern",
    saved: "Gespeichert",
    comments: "Kommentare",
    writeComment: "Schreibe einen Kommentar...",
    sendComment: "Senden",
    deleteComment: "Löschen",
    linkCopied: "Link in die Zwischenablage kopiert!",

    shareYourTattoo: "Tattoo teilen",
    uploadPhoto: "Tattoo-Foto hochladen",
    uploadPhotoDesc: "JPG, PNG (Aus Handy-Galerie oder Dateien auswählen)",
    chooseFromGallery: "Aus Galerie wählen",
    changePhoto: "Foto ändern",
    titleLabel: "Titel",
    titlePlaceholder: "z.B. Löwe & Taschenuhr...",
    categoryLabel: "Kategorie",
    selectCategory: "Kategorie wählen...",
    descLabel: "Beschreibung",
    descPlaceholder: "Erzähle die Bedeutung oder Technik hinter dem Tattoo...",
    socialLinksOptional: "Social Links (Optional)",
    publishTattoo: "Tattoo veröffentlichen",
    publishing: "Wird veröffentlicht...",
    publishedSuccess: "Dein Tattoo wurde erfolgreich geteilt!",

    myTattoos: "Werke",
    aboutMe: "Über mich",
    favorites: "Favoriten",
    followers: "Follower",
    shares: "Werke",
    editProfile: "Profil bearbeiten",
    saveChanges: "Speichern",
    displayName: "Anzeigename",
    bio: "Biografie",
    instagramHandle: "Instagram",
    tiktokHandle: "TikTok",
    discordHandle: "Discord",
    websiteUrl: "Website",
    profileUpdated: "Profil erfolgreich aktualisiert!",

    communityHub: "Tattoo Community",
    communitySubtitle: "Kreative Köpfe und Tattoo-Künstler weltweit.",
    featuredArtists: "Top Künstler",
    latestArtwork: "Neueste Werke",
    trendingTags: "Trends",

    aboutTitle: "Über Tatto's World",
    aboutSubtitle: "Die Plattform für inspirierende Tattoo-Kunst.",
    discoverTitle: "Entdecken",
    discoverDesc: "Stöbere durch handverlesene Tattoo-Designs.",
    createTitle: "Kreieren & Teilen",
    createDesc: "Lade deine Tattoos und Flash-Motive hoch.",
    connectTitle: "Verbinden",
    connectDesc: "Tritt direkt mit Tätowierern in Kontakt.",

    allRightsReserved: "Alle Rechte vorbehalten."
  },

  es: {
    welcomeTagline: "More Than Just Tattoos",
    welcomeSubtitle: "Your skin. Your story.",
    welcomeDescription: "Descubre tatuajes, comparte tu arte y construye tu identidad de tatuaje.",
    continueWithGoogle: "Continuar con Google",
    continueAsGuest: "Continuar como invitado",
    or: "o",
    alreadyHaveAccount: "¿Ya tienes cuenta?",
    signIn: "Iniciar sesión",
    whatWeOffer: "¿Qué ofrecemos?",
    whatWeOfferSubtitle: "Unimos lo mejor del mundo del tatuaje en una sola plataforma.",
    featureGalleryTitle: "Galería de Tatuajes",
    featureGalleryDesc: "Miles de diseños e inspiración. Explora por categorías.",
    featureProfileTitle: "Perfil y Comunidad",
    featureProfileDesc: "Crea tu perfil, comparte tus tatuajes y conecta con artistas.",
    featureShareTitle: "Comparte tu Arte",
    featureShareDesc: "Sube tus tatuajes, cuenta tu historia e inspira a la comunidad.",
    featureCommentsTitle: "Likes y Comentarios",
    featureCommentsDesc: "Comenta, interactúa y debate ideas de tatuajes con la comunidad.",
    featureSocialTitle: "Redes Sociales",
    featureSocialDesc: "Instagram, TikTok, Discord y más para contacto directo.",
    featureLangTitle: "Multi-Idioma",
    featureLangDesc: "Elige tu idioma nativo y conecta globalmente.",
    motto: "Tattoos Connect People",

    navHome: "Inicio",
    navGallery: "Galería",
    navProfile: "Mi Perfil",
    navCreate: "Publicar Tatuaje",
    navFavorites: "Favoritos",
    navCommunity: "Comunidad",
    navAbout: "Acerca de",
    navSettings: "Ajustes",
    navLogout: "Cerrar sesión",
    searchPlaceholder: "Buscar tatuajes, estilos, artistas...",

    heroTitle1: "Tu próximo tatuaje",
    heroTitle2: "empieza aquí",
    heroSubtitle: "Descubre diseños únicos, conecta con tatuadores y comparte tu propia historia.",
    heroBtnExplore: "Explorar",
    heroBtnShare: "Publicar Tatuaje",

    popularTattoos: "Tatuajes Populares",
    viewAll: "Ver todo",
    categories: "Categorías",
    allCategories: "Todas las categorías",
    discoverTattoos: "Descubrir Tatuajes",
    noTattoosFound: "Aún no hay tatuajes en esta categoría.",
    beFirstToShare: "¡Sé el primero en compartir tu tatuaje!",
    shareTattooNow: "Compartir ahora",

    catAll: "Todos",
    catRealism: "Realismo",
    catMinimal: "Minimalista",
    catMystic: "Místico",
    catBlackAndGrey: "Negro y Gris",
    catColor: "Color",
    catGeometric: "Geométrico",
    catAnimals: "Animales",
    catDark: "Dark Art",
    catFantasy: "Fantasía",
    catLettering: "Lettering",
    catTraditional: "Tradicional",
    catFineLine: "Línea Fina",

    details: "Detalles",
    follow: "Seguir",
    following: "Siguiendo",
    artist: "Artista",
    like: "Me gusta",
    liked: "Te gusta",
    share: "Compartir",
    save: "Guardar",
    saved: "Guardado",
    comments: "Comentarios",
    writeComment: "Escribe un comentario...",
    sendComment: "Enviar",
    deleteComment: "Eliminar",
    linkCopied: "¡Enlace copiado al portapapeles!",

    shareYourTattoo: "Compartir Tatuaje",
    uploadPhoto: "Subir foto del tatuaje",
    uploadPhotoDesc: "JPG, PNG (Elige de la galería del móvil o archivos)",
    chooseFromGallery: "Elegir de la Galería",
    changePhoto: "Cambiar foto",
    titleLabel: "Título",
    titlePlaceholder: "Ej: León y Reloj Antiguo...",
    categoryLabel: "Categoría",
    selectCategory: "Seleccionar categoría...",
    descLabel: "Descripción",
    descPlaceholder: "Cuenta la historia, el estilo o el significado...",
    socialLinksOptional: "Redes Sociales (Opcional)",
    publishTattoo: "Publicar Tatuaje",
    publishing: "Publicando...",
    publishedSuccess: "¡Tu tatuaje ha sido publicado con éxito!",

    myTattoos: "Mis Obras",
    aboutMe: "Sobre mí",
    favorites: "Favoritos",
    followers: "Seguidores",
    shares: "Obras",
    editProfile: "Editar Perfil",
    saveChanges: "Guardar",
    displayName: "Nombre visible",
    bio: "Biografía",
    instagramHandle: "Instagram",
    tiktokHandle: "TikTok",
    discordHandle: "Discord",
    websiteUrl: "Sitio web",
    profileUpdated: "¡Perfil actualizado con éxito!",

    communityHub: "Comunidad Tattoo",
    communitySubtitle: "Amantes del tatuaje y artistas de todo el mundo.",
    featuredArtists: "Artistas Destacados",
    latestArtwork: "Últimas Obras",
    trendingTags: "Estilos en Tendencia",

    aboutTitle: "Sobre Tatto's World",
    aboutSubtitle: "Plataforma premium para el arte corporal y las historias vivas.",
    discoverTitle: "Descubrir",
    discoverDesc: "Explora miles de piezas únicas en alta resolución.",
    createTitle: "Crear y Compartir",
    createDesc: "Sube tus tatuajes favoritos directamente desde tu móvil.",
    connectTitle: "Conectar",
    connectDesc: "Contacta directamente con tatuadores de élite.",

    allRightsReserved: "Todos los derechos reservados."
  },

  fr: {
    welcomeTagline: "More Than Just Tattoos",
    welcomeSubtitle: "Your skin. Your story.",
    welcomeDescription: "Découvrez des tatouages, partagez votre art et affirmez votre identité.",
    continueWithGoogle: "Continuer avec Google",
    continueAsGuest: "Continuer en tant qu'invité",
    or: "ou",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    signIn: "Connexion",
    whatWeOffer: "Ce que nous offrons",
    whatWeOfferSubtitle: "Le meilleur de la culture tattoo réuni au même endroit.",
    featureGalleryTitle: "Galerie de Tatouages",
    featureGalleryDesc: "Des milliers d'inspirations et de designs artistiques.",
    featureProfileTitle: "Profil & Communauté",
    featureProfileDesc: "Créez votre profil, partagez vos pièces et connectez-vous aux artistes.",
    featureShareTitle: "Partagez votre Tattoo",
    featureShareDesc: "Téléversez vos photos, racontez votre histoire.",
    featureCommentsTitle: "Likes et Commentaires",
    featureCommentsDesc: "Échangez avec la communauté et notez les créations.",
    featureSocialTitle: "Réseaux Sociaux",
    featureSocialDesc: "Instagram, TikTok, Discord pour un lien direct avec les tatoueurs.",
    featureLangTitle: "Multi-Langues",
    featureLangDesc: "Choisissez votre langue et échangez avec le monde entier.",
    motto: "Tattoos Connect People",

    navHome: "Accueil",
    navGallery: "Galerie",
    navProfile: "Mon Profil",
    navCreate: "Publier",
    navFavorites: "Favoris",
    navCommunity: "Communauté",
    navAbout: "À propos",
    navSettings: "Paramètres",
    navLogout: "Déconnexion",
    searchPlaceholder: "Rechercher tatouages, styles, artistes...",

    heroTitle1: "Votre prochain tatouage",
    heroTitle2: "commence ici",
    heroSubtitle: "Découvrez des designs exclusifs, rejoignez notre communauté internationale.",
    heroBtnExplore: "Explorer",
    heroBtnShare: "Partager un tattoo",

    popularTattoos: "Tatouages Populaires",
    viewAll: "Tout voir",
    categories: "Catégories",
    allCategories: "Toutes les catégories",
    discoverTattoos: "Découvrir les Tatouages",
    noTattoosFound: "Aucun tatouage dans cette catégorie pour le moment.",
    beFirstToShare: "Soyez le premier à partager votre création !",
    shareTattooNow: "Publier",

    catAll: "Tous",
    catRealism: "Réalisme",
    catMinimal: "Minimaliste",
    catMystic: "Mystique",
    catBlackAndGrey: "Noir & Gris",
    catColor: "Couleur",
    catGeometric: "Géométrique",
    catAnimals: "Animaux",
    catDark: "Dark Art",
    catFantasy: "Fantastique",
    catLettering: "Lettrage",
    catTraditional: "Traditionnel",
    catFineLine: "Lignes Fines",

    details: "Détails",
    follow: "Suivre",
    following: "Abonné",
    artist: "Artiste",
    like: "J'aime",
    liked: "Aimé",
    share: "Partager",
    save: "Enregistrer",
    saved: "Enregistré",
    comments: "Commentaires",
    writeComment: "Écrire un commentaire...",
    sendComment: "Envoyer",
    deleteComment: "Supprimer",
    linkCopied: "Lien copié dans le presse-papier !",

    shareYourTattoo: "Partager un Tatouage",
    uploadPhoto: "Téléverser la photo",
    uploadPhotoDesc: "JPG, PNG (Sélectionnez depuis votre galerie)",
    chooseFromGallery: "Choisir dans la galerie",
    changePhoto: "Modifier la photo",
    titleLabel: "Titre",
    titlePlaceholder: "Ex: Lion & Horloge Vintage...",
    categoryLabel: "Catégorie",
    selectCategory: "Sélectionner une catégorie...",
    descLabel: "Description",
    descPlaceholder: "Racontez l'histoire ou la symbolique de cette pièce...",
    socialLinksOptional: "Réseaux Sociaux (Optionnel)",
    publishTattoo: "Publier le Tatouage",
    publishing: "Publication...",
    publishedSuccess: "Votre tatouage a été publié avec succès !",

    myTattoos: "Créations",
    aboutMe: "À propos",
    favorites: "Favoris",
    followers: "Abonnés",
    shares: "Créations",
    editProfile: "Modifier le Profil",
    saveChanges: "Enregistrer",
    displayName: "Nom affiché",
    bio: "Biographie",
    instagramHandle: "Instagram",
    tiktokHandle: "TikTok",
    discordHandle: "Discord",
    websiteUrl: "Site Web",
    profileUpdated: "Profil mis à jour !",

    communityHub: "Communauté Tattoo",
    communitySubtitle: "Passionnés et artistes du monde entier.",
    featuredArtists: "Artistes en vedette",
    latestArtwork: "Dernières pièces",
    trendingTags: "Styles tendances",

    aboutTitle: "À propos de Tatto's World",
    aboutSubtitle: "La plateforme de référence pour l'art corporel.",
    discoverTitle: "Découvrir",
    discoverDesc: "Explorez des milliers de créations uniques.",
    createTitle: "Créer & Partager",
    createDesc: "Partagez facilement vos photos depuis votre téléphone.",
    connectTitle: "Se connecter",
    connectDesc: "Échangez directement avec les artistes.",

    allRightsReserved: "Tous droits réservés."
  },

  pt: {
    welcomeTagline: "More Than Just Tattoos",
    welcomeSubtitle: "Your skin. Your story.",
    welcomeDescription: "Descubra tatuagens, compartilhe sua arte e construa sua identidade.",
    continueWithGoogle: "Continuar com o Google",
    continueAsGuest: "Continuar como convidado",
    or: "ou",
    alreadyHaveAccount: "Já tem uma conta?",
    signIn: "Entrar",
    whatWeOffer: "O que oferecemos",
    whatWeOfferSubtitle: "Reunimos os melhores aspectos do universo da tatuagem.",
    featureGalleryTitle: "Galeria de Tatuagens",
    featureGalleryDesc: "Milhares de inspirações e obras de arte divididas por categorias.",
    featureProfileTitle: "Perfil e Comunidade",
    featureProfileDesc: "Crie seu perfil, compartilhe artes e conecte-se com tatuadores.",
    featureShareTitle: "Compartilhe Tatuagens",
    featureShareDesc: "Faça upload de fotos, conte sua história e inspire outros.",
    featureCommentsTitle: "Curtidas e Comentários",
    featureCommentsDesc: "Interaja, dê feedback e faça parte da conversa.",
    featureSocialTitle: "Redes Sociais",
    featureSocialDesc: "Instagram, TikTok, Discord e links diretos com os artistas.",
    featureLangTitle: "Suporte Multi-idioma",
    featureLangDesc: "Conecte-se com apaixonados por tattoos do mundo todo.",
    motto: "Tattoos Connect People",

    navHome: "Início",
    navGallery: "Galeria",
    navProfile: "Meu Perfil",
    navCreate: "Compartilhar",
    navFavorites: "Favoritos",
    navCommunity: "Comunidade",
    navAbout: "Sobre",
    navSettings: "Configurações",
    navLogout: "Sair",
    searchPlaceholder: "Buscar tatuagens, estilos, tatuadores...",

    heroTitle1: "Sua próxima tatuagem",
    heroTitle2: "começa aqui",
    heroSubtitle: "Descubra desenhos incríveis, conecte-se com artistas e compartilhe sua paixão.",
    heroBtnExplore: "Explorar",
    heroBtnShare: "Compartilhar",

    popularTattoos: "Tatuagens Populares",
    viewAll: "Ver tudo",
    categories: "Categorias",
    allCategories: "Todas as categorias",
    discoverTattoos: "Descobrir Tatuagens",
    noTattoosFound: "Nenhuma tatuagem encontrada nesta categoria.",
    beFirstToShare: "Seja o primeiro a compartilhar sua arte!",
    shareTattooNow: "Compartilhar agora",

    catAll: "Todas",
    catRealism: "Realismo",
    catMinimal: "Minimalista",
    catMystic: "Místico",
    catBlackAndGrey: "Preto e Cinza",
    catColor: "Colorido",
    catGeometric: "Geométrico",
    catAnimals: "Animais",
    catDark: "Dark Art",
    catFantasy: "Fantasia",
    catLettering: "Lettering",
    catTraditional: "Tradicional",
    catFineLine: "Traço Fino",

    details: "Detalhes",
    follow: "Seguir",
    following: "Seguindo",
    artist: "Tatuador",
    like: "Curtir",
    liked: "Curtido",
    share: "Compartilhar",
    save: "Salvar",
    saved: "Salvo",
    comments: "Comentários",
    writeComment: "Escreva um comentário...",
    sendComment: "Enviar",
    deleteComment: "Excluir",
    linkCopied: "Link copiado para a área de transferência!",

    shareYourTattoo: "Compartilhar Tatuagem",
    uploadPhoto: "Enviar foto da tatuagem",
    uploadPhotoDesc: "JPG, PNG (Escolha da galeria do celular ou arquivos)",
    chooseFromGallery: "Escolher da Galeria",
    changePhoto: "Trocar foto",
    titleLabel: "Título",
    titlePlaceholder: "Ex: Leão e Relógio Vintage...",
    categoryLabel: "Categoria",
    selectCategory: "Selecione uma categoria...",
    descLabel: "Descrição",
    descPlaceholder: "Conte a história, técnica ou significado por trás...",
    socialLinksOptional: "Redes Sociais (Opcional)",
    publishTattoo: "Publicar Tatuagem",
    publishing: "Publicando...",
    publishedSuccess: "Sua tatuagem foi compartilhada com sucesso!",

    myTattoos: "Publicações",
    aboutMe: "Sobre",
    favorites: "Favoritos",
    followers: "Seguidores",
    shares: "Publicações",
    editProfile: "Editar Perfil",
    saveChanges: "Salvar",
    displayName: "Nome de exibição",
    bio: "Biografia",
    instagramHandle: "Instagram",
    tiktokHandle: "TikTok",
    discordHandle: "Discord",
    websiteUrl: "Website",
    profileUpdated: "Perfil atualizado com sucesso!",

    communityHub: "Comunidade de Tatuagem",
    communitySubtitle: "Entusiastas e tatuadores de todo o planeta.",
    featuredArtists: "Artistas em Destaque",
    latestArtwork: "Últimas Obras",
    trendingTags: "Estilos em Alta",

    aboutTitle: "Sobre Tatto's World",
    aboutSubtitle: "Plataforma premium para a arte da tatuagem.",
    discoverTitle: "Descubra",
    discoverDesc: "Explore designs originais em alta definição.",
    createTitle: "Crie e Compartilhe",
    createDesc: "Publique fotos diretamente do seu smartphone.",
    connectTitle: "Conecte-se",
    connectDesc: "Fale com artistas via Instagram, TikTok e Discord.",

    allRightsReserved: "Todos os direitos reservados."
  },

  it: {
    welcomeTagline: "More Than Just Tattoos",
    welcomeSubtitle: "Your skin. Your story.",
    welcomeDescription: "Scopri tatuaggi, condividi la tua arte e crea la tua identità visiva.",
    continueWithGoogle: "Continua con Google",
    continueAsGuest: "Continua come ospite",
    or: "oppure",
    alreadyHaveAccount: "Hai già un account?",
    signIn: "Accedi",
    whatWeOffer: "Cosa offriamo",
    whatWeOfferSubtitle: "Abbiamo riunito i migliori artisti e appassionati di tatuaggi.",
    featureGalleryTitle: "Galleria Tatuaggi",
    featureGalleryDesc: "Migliaia di idee e opere suddivise per categorie.",
    featureProfileTitle: "Profilo e Community",
    featureProfileDesc: "Crea il tuo profilo, condividi i tuoi lavori e interagisci con i tatuatori.",
    featureShareTitle: "Condividi Tatuaggi",
    featureShareDesc: "Carica le tue foto, racconta la tua storia e ispira la community.",
    featureCommentsTitle: "Like e Commenti",
    featureCommentsDesc: "Lascia un commento, metti mi piace e scambia idee.",
    featureSocialTitle: "Profili Social",
    featureSocialDesc: "Instagram, TikTok, Discord e collegamenti diretti con gli artisti.",
    featureLangTitle: "Supporto Multilingua",
    featureLangDesc: "Scegli la tua lingua e connettiti a livello globale.",
    motto: "Tattoos Connect People",

    navHome: "Home",
    navGallery: "Galleria",
    navProfile: "Mio Profilo",
    navCreate: "Condividi",
    navFavorites: "Preferiti",
    navCommunity: "Community",
    navAbout: "Chi siamo",
    navSettings: "Impostazioni",
    navLogout: "Esci",
    searchPlaceholder: "Cerca tatuaggi, stili, tatuatori...",

    heroTitle1: "Il tuo prossimo tatuaggio",
    heroTitle2: "inizia qui",
    heroSubtitle: "Scopri disegni unici, connettiti con i migliori artisti e condividi la tua arte.",
    heroBtnExplore: "Esplora",
    heroBtnShare: "Condividi Tattoo",

    popularTattoos: "Tatuaggi Popolari",
    viewAll: "Vedi tutti",
    categories: "Categorie",
    allCategories: "Tutte le categorie",
    discoverTattoos: "Scopri i Tatuaggi",
    noTattoosFound: "Nessun tatuaggio trovato in questa categoria.",
    beFirstToShare: "Sii il primo a condividere un tatuaggio!",
    shareTattooNow: "Condividi ora",

    catAll: "Tutti",
    catRealism: "Realismo",
    catMinimal: "Minimale",
    catMystic: "Mistico",
    catBlackAndGrey: "Bianco e Nero",
    catColor: "A Colori",
    catGeometric: "Geometrico",
    catAnimals: "Animali",
    catDark: "Dark Art",
    catFantasy: "Fantasy",
    catLettering: "Lettering",
    catTraditional: "Tradizionale",
    catFineLine: "Fine Line",

    details: "Dettagli",
    follow: "Segui",
    following: "Seguito",
    artist: "Tatuatore",
    like: "Mi piace",
    liked: "Ti piace",
    share: "Condividi",
    save: "Salva",
    saved: "Salvato",
    comments: "Commenti",
    writeComment: "Scrivi un commento...",
    sendComment: "Invia",
    deleteComment: "Elimina",
    linkCopied: "Link copiato negli appunti!",

    shareYourTattoo: "Condividi Tatuaggio",
    uploadPhoto: "Carica foto del tatuaggio",
    uploadPhotoDesc: "JPG, PNG (Scegli dalla galleria del telefono o dai file)",
    chooseFromGallery: "Scegli dalla Galleria",
    changePhoto: "Cambia foto",
    titleLabel: "Titolo",
    titlePlaceholder: "Es: Leone e Orologio Vintage...",
    categoryLabel: "Categoria",
    selectCategory: "Seleziona una categoria...",
    descLabel: "Descrizione",
    descPlaceholder: "Racconta il significato o la tecnica di questo tatuaggio...",
    socialLinksOptional: "Social Links (Opzionale)",
    publishTattoo: "Pubblica Tatuaggio",
    publishing: "Pubblicazione...",
    publishedSuccess: "Il tuo tatuaggio è stato pubblicato con successo!",

    myTattoos: "Opere",
    aboutMe: "Chi sono",
    favorites: "Preferiti",
    followers: "Follower",
    shares: "Opere",
    editProfile: "Modifica Profilo",
    saveChanges: "Salva",
    displayName: "Nome visualizzato",
    bio: "Biografia",
    instagramHandle: "Instagram",
    tiktokHandle: "TikTok",
    discordHandle: "Discord",
    websiteUrl: "Sito Web",
    profileUpdated: "Profilo aggiornato con successo!",

    communityHub: "Community Tattoo",
    communitySubtitle: "Appassionati e tatuatori da ogni angolo del mondo.",
    featuredArtists: "Artisti in primo piano",
    latestArtwork: "Ultime creazioni",
    trendingTags: "Stili di tendenza",

    aboutTitle: "Informazioni su Tatto's World",
    aboutSubtitle: "La piattaforma d'élite per la body art e le storie di vita.",
    discoverTitle: "Scopri",
    discoverDesc: "Migliaia di creazioni artigianali in alta risoluzione.",
    createTitle: "Crea e Condividi",
    createDesc: "Carica i tuoi tatuaggi con facilità dallo smartphone.",
    connectTitle: "Connettiti",
    connectDesc: "Raggiungi gli artisti su Instagram, TikTok e Discord.",

    allRightsReserved: "Tutti i diritti riservati."
  }
};
