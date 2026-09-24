import React, { useState } from 'react';
import { Globe, ChevronRight, Sparkles } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';

interface WelcomeScreenProps {
  onLoginWithGoogle: () => void;
  onLoginAsGuest: () => void;
  onExploreDirectly?: () => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoginWithGoogle,
  onLoginAsGuest,
  onExploreDirectly,
  currentLanguage,
  onLanguageChange,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const t = translations[currentLanguage];

  const features = [
    {
      title: 'Dövme Galerisi',
      desc: 'Binlerce dövme fikri ve ilham verici tasarım. Kategorilere göre keşfet.',
      image: './images/tattoos/lion_clock.jpg',
    },
    {
      title: 'Profil ve Topluluk',
      desc: 'Kendi profilini oluştur, dövmelerini paylaş, diğer sanatçılarla etkileşime geç.',
      image: './images/users/avatar_inkedlife.jpg',
    },
    {
      title: 'Dövme Paylaş',
      desc: 'Kendi dövmelerini yükle, hikayeni anlat, topluluğa katıl.',
      image: './images/tattoos/butterfly_ink.jpg',
    },
    {
      title: 'Yorum ve Beğeni',
      desc: 'Beğen, yorum yap, fikirlerini paylaş ve toplulukla etkileşim kur.',
      image: './images/users/avatar_luna.jpg',
    },
    {
      title: 'Sosyal Bağlantılar',
      desc: 'Instagram, TikTok, Discord ve daha fazlası. Sanatçılarla doğrudan bağlantı kur.',
      image: './images/tattoos/snake_serpent.jpg',
    },
    {
      title: 'Çoklu Dil Desteği',
      desc: 'Dilediğin dili seç, dünyanın her yerinden insanlarla iletişim kur.',
      image: './images/tattoos/rose_dark.jpg',
    },
  ];

  const currentLangObj = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-1 flex items-center justify-center">
        
        {/* Main Card with Split View exactly matching image */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl min-h-[660px]">
          
          {/* LEFT PANEL: Face Tattoo Background + Brush Logo + Auth Buttons */}
          <div className="lg:col-span-7 relative p-8 sm:p-12 flex flex-col justify-between overflow-hidden group">
            
            {/* High-contrast Face Tattoo Portrait Artwork */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url('./images/ui/welcome_face_tattoo.jpg')` }}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

            {/* Top Bar of Left Card: Logo + Language */}
            <div className="relative z-10 flex items-center justify-between">
              {/* Brush stylized logo top left */}
              <div className="flex items-center gap-2">
                <span className="font-brush text-2xl tracking-wider text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] -rotate-2 select-none">
                  TATTOO'S WORLD
                </span>
              </div>

              {/* Language Pill Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs text-white hover:border-white/40 transition-all cursor-pointer"
                >
                  <span className="font-medium">{currentLangObj.label}</span>
                  <span className="text-[10px] text-[#888888]">→</span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-[#151515]/95 backdrop-blur-xl border border-white/15 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          onLanguageChange(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                          currentLanguage === l.code ? 'text-white font-bold bg-white/5' : 'text-[#888888]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center Area: Big Graffiti Title & Slogans */}
            <div className="relative z-10 text-center my-auto py-10">
              
              {/* Slanted Brush Title */}
              <div className="inline-block transform -rotate-3 mb-2 select-none">
                <h1 className="font-brush text-5xl sm:text-6xl md:text-7xl text-white tracking-wide leading-none uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                  TATTOO'S<br />WORLD
                </h1>
                {/* Brush underline accent */}
                <div className="h-1 w-3/4 mx-auto bg-white/80 rounded-full mt-1.5 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              </div>

              {/* Subheading: More Than Just Tattoos */}
              <h2 className="mt-4 text-lg sm:text-xl font-bold text-white tracking-wide">
                More Than Just Tattoos
              </h2>

              {/* Discover • Share • Create • Be Inspired */}
              <p className="mt-1 text-xs sm:text-sm text-[#AAAAAA] tracking-wider font-medium">
                Discover • Share • Create • Be Inspired
              </p>

              {/* Authentication Buttons exactly matching image */}
              <div className="mt-8 max-w-sm mx-auto space-y-3">
                {/* White Button: Google ile Giriş Yap */}
                <button
                  onClick={onLoginWithGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-[#EAEAEA] transition-all duration-200 transform hover:-translate-y-0.5 shadow-xl cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google ile Giriş Yap</span>
                </button>

                {/* veya */}
                <div className="flex items-center justify-center py-0.5">
                  <span className="text-[11px] text-[#777777] font-medium">veya</span>
                </div>

                {/* Dark Button: Hesap Oluştur */}
                <button
                  onClick={onLoginAsGuest}
                  className="w-full flex items-center justify-center py-3 px-6 rounded-full bg-black/60 border border-white/20 text-white font-medium text-xs sm:text-sm hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer"
                >
                  Hesap Oluştur
                </button>

                {/* Zaten hesabın var mı? Giriş Yap */}
                <div className="pt-2 flex flex-col items-center gap-2">
                  <p className="text-xs text-[#888888]">
                    Zaten hesabın var mı?{' '}
                    <button
                      onClick={onLoginAsGuest}
                      className="text-white font-semibold underline underline-offset-4 hover:text-[#DDDDDD] cursor-pointer"
                    >
                      Giriş Yap
                    </button>
                  </p>

                  {/* Direct Explore Link */}
                  {onExploreDirectly && (
                    <button
                      onClick={onExploreDirectly}
                      className="text-xs text-[#AAAAAA] hover:text-white transition-colors cursor-pointer pt-1 flex items-center gap-1"
                    >
                      <span>Uygulamaya doğrudan giriş yap</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Indicator: Kaydır mouse scroll */}
            <div className="relative z-10 flex items-center gap-2 text-xs text-[#666666]">
              <div className="w-3.5 h-6 rounded-full border border-white/20 flex items-start justify-center p-1">
                <div className="w-1 h-1.5 rounded-full bg-white animate-bounce" />
              </div>
              <span className="text-[11px] tracking-wide">Kaydır</span>
            </div>

          </div>

          {/* RIGHT PANEL: Neler Sunuyoruz? + 6 Feature Rows + Signature */}
          <div className="lg:col-span-5 bg-[#0f0f0f] border-t lg:border-t-0 lg:border-l border-white/10 p-8 sm:p-10 flex flex-col justify-between">
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white font-display">
                  Neler Sunuyoruz?
                </h3>
                <p className="text-xs text-[#888888] mt-1">
                  Dövme dünyasının en güzel yönlerini tek bir yerde topladık.
                </p>
              </div>

              {/* 6 Feature Rows in vertical stack */}
              <div className="space-y-4">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 group">
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 relative bg-[#181818]">
                      <img
                        src={feat.image}
                        alt={feat.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {feat.title}
                      </h4>
                      <p className="text-[11px] text-[#888888] line-clamp-2 mt-0.5 leading-snug">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Signature: Tattoos Connect People */}
            <div className="pt-6 border-t border-white/10 text-center">
              <span className="font-script text-2xl sm:text-3xl text-white/90 font-bold tracking-wider inline-block">
                Tattoos Connect People
              </span>
              <div className="w-24 h-0.5 bg-white/40 mx-auto rounded-full mt-1" />
            </div>

          </div>

        </div>

      </div>

      {/* Subtle Footer Bar */}
      <div className="w-full border-t border-white/5 py-3 px-6 text-center text-[11px] text-[#555555]">
        <p>Tatto's World © 2025 · Tüm hakları saklıdır.</p>
      </div>

    </div>
  );
};
