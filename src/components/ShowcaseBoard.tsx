import React from 'react';
import { Tattoo, UserProfile, SupportedLanguage } from '../types';
import { WelcomeScreen } from './WelcomeScreen';
import { Hero } from './Hero';
import { Gallery } from './Gallery';
import { TattooDetailModal } from './TattooDetailModal';
import { ProfileView } from './ProfileView';
import { CreateTattooModal } from './CreateTattooModal';
import { Sparkles, Maximize2, Smartphone, Monitor } from 'lucide-react';

interface ShowcaseBoardProps {
  tattoos: Tattoo[];
  currentUser: UserProfile;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onSelectTattoo: (tattoo: Tattoo) => void;
  onSelectCreator: (handle: string) => void;
  onOpenCreate: () => void;
  onOpenMobileFrame: () => void;
  onSwitchToLive: () => void;
}

export const ShowcaseBoard: React.FC<ShowcaseBoardProps> = ({
  tattoos,
  currentUser,
  currentLanguage,
  onLanguageChange,
  onSelectTattoo,
  onSelectCreator,
  onOpenCreate,
  onOpenMobileFrame,
  onSwitchToLive,
}) => {
  const sampleTattoo = tattoos[0] || {
    id: 'tattoo_1',
    title: 'Lion & Clock',
    creatorName: 'Marco Vance',
    creatorHandle: '@inkedlife',
    creatorPhoto: './images/users/avatar_inkedlife.jpg',
    category: 'realism',
    categoryName: 'Realizm',
    image: './images/tattoos/lion_clock.jpg',
    description: 'Zamanın izinde... Güç, sabır ve yeniden doğuş. Bu tasarım, hayatın döngüsünü ve içsel gücü simgeliyor.',
    likesCount: 0,
    tags: ['realizm', 'siyah_gri', 'aslan', 'saat'],
    createdAt: '2 gün önce',
  };

  return (
    <div className="w-full bg-[#050505] p-4 sm:p-6 lg:p-8 space-y-12">
      
      {/* Top Banner introducing the Design Collage */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e0e0e] border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#CCFF00]" />
            <span>Tatto's World — 6 Ekran Tasarım Panosu</span>
          </h2>
          <p className="text-xs text-[#888888] mt-0.5">
            Referans görseldeki 6 ana ekranın tamamı canlı ve interaktif olarak sunulmaktadır.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileFrame}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobil Cihaz Simülatörü</span>
          </button>

          <button
            onClick={onSwitchToLive}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-lg"
          >
            <Monitor className="w-4 h-4" />
            <span>Canlı Uygulamaya Dön</span>
          </button>
        </div>
      </div>

      {/* Grid of the 6 Screen Surfaces matching the user's reference board */}
      <div className="space-y-16">
        
        {/* ROW 1: Welcome Screen (Top Left) & Dashboard Explore (Top Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          
          {/* SCREEN 1: Welcome Screen */}
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a] shadow-2xl relative">
            <div className="p-3 bg-[#111111] border-b border-white/10 flex items-center justify-between text-xs text-[#888888]">
              <span className="font-bold text-white font-display">1. Karşılama Ekranı (Welcome Screen)</span>
              <span className="text-[11px] font-mono">Görselin Sol Üstü</span>
            </div>
            <div className="transform scale-[0.92] origin-top -mb-16">
              <WelcomeScreen
                onLoginWithGoogle={onSwitchToLive}
                onLoginAsGuest={onSwitchToLive}
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
              />
            </div>
          </div>

          {/* SCREEN 2: Dashboard & Explore Feed */}
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a] shadow-2xl">
            <div className="p-3 bg-[#111111] border-b border-white/10 flex items-center justify-between text-xs text-[#888888]">
              <span className="font-bold text-white font-display">2. Keşif & Dashboard (Main Screen)</span>
              <span className="text-[11px] font-mono">Görselin Sağ Üstü</span>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              <Hero onExplore={() => {}} onShare={onOpenCreate} />
              <Gallery
                tattoos={tattoos}
                onSelectTattoo={onSelectTattoo}
                onSelectCreator={onSelectCreator}
                onOpenCreate={onOpenCreate}
                searchQuery=""
                selectedCategory="all"
                onSelectCategory={() => {}}
                currentUser={currentUser}
                onToast={() => {}}
                onTattooUpdated={() => {}}
              />
            </div>
          </div>

        </div>

        {/* ROW 2: Tattoo Detail (Bottom Left), Profile (Bottom Center), Share Modal & Mobile (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* SCREEN 3: Tattoo Detail Modal */}
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a] shadow-2xl flex flex-col">
            <div className="p-3 bg-[#111111] border-b border-white/10 flex items-center justify-between text-xs text-[#888888]">
              <span className="font-bold text-white font-display">3. Dövme Detay Ekranı</span>
              <span className="text-[11px] font-mono">Görselin Sol Altı</span>
            </div>
            <div className="p-4">
              <div 
                onClick={() => onSelectTattoo(sampleTattoo)}
                className="group relative rounded-2xl overflow-hidden border border-white/15 bg-[#121212] aspect-[3/4.2] cursor-pointer"
              >
                <img
                  src="./images/tattoos/lion_clock.jpg"
                  alt="Lion Clock"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-4 inset-x-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                    <span>Lion & Clock</span>
                    <span className="text-[11px] text-[#AAAAAA]">• 2.4K Beğeni</span>
                  </div>
                  <p className="text-[11px] text-[#888888] line-clamp-2">
                    Zamanın izinde... Güç, sabır ve yeniden doğuş.
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold">
                    Detayları Görüntüle →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SCREEN 4: Artist Profile */}
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a] shadow-2xl flex flex-col">
            <div className="p-3 bg-[#111111] border-b border-white/10 flex items-center justify-between text-xs text-[#888888]">
              <span className="font-bold text-white font-display">4. Sanatçı Profili (@inkedlife)</span>
              <span className="text-[11px] font-mono">Görselin Alt Ortası</span>
            </div>
            <div className="p-4">
              <ProfileView
                profileUser={{
                  uid: 'artist_1',
                  displayName: 'Marco Vance',
                  handle: '@inkedlife',
                  photoURL: './images/users/avatar_inkedlife.jpg',
                  bio: 'Sanat, hayatın en gerçek halidir. Daha fazla dövme, daha fazla hikaye...',
                  email: 'marco@tattosworld.com',
                  instagram: '@inkedlife_marco',
                  tiktok: '@marco_tattoos',
                  discord: 'inkedlife#0001',
                  website: 'https://inkedlife.art',
                  followersCount: 3420,
                  followingCount: 184,
                  savedTattooIds: [],
                  createdAt: '2024-01-15',
                }}
                currentUser={currentUser}
                tattoos={tattoos}
                onSelectTattoo={onSelectTattoo}
                onOpenCreate={onOpenCreate}
                currentLanguage={currentLanguage}
                onToast={() => {}}
                onUserUpdated={() => {}}
              />
            </div>
          </div>

          {/* SCREEN 5 & 6: Dövme Paylaş & Mobil Görünüm */}
          <div className="space-y-6">
            
            {/* SCREEN 5: Dövme Paylaş */}
            <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a] shadow-2xl">
              <div className="p-3 bg-[#111111] border-b border-white/10 flex items-center justify-between text-xs text-[#888888]">
                <span className="font-bold text-white font-display">5. Dövme Paylaş Modalı</span>
                <span className="text-[11px] font-mono">Görselin Sağ Ortası</span>
              </div>
              <div className="p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white">
                  <Sparkles className="w-6 h-6 text-[#CCFF00]" />
                </div>
                <h4 className="text-sm font-bold text-white">Kendi Dövmeni Paylaş</h4>
                <p className="text-xs text-[#888888]">
                  Fotoğraf yükleme alanı, başlık, stil seçimi ve sosyal medya bağlantıları.
                </p>
                <button
                  onClick={onOpenCreate}
                  className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-[#EAEAEA] transition-all cursor-pointer"
                >
                  Paylaş Modalı Aç
                </button>
              </div>
            </div>

            {/* SCREEN 6: Mobil Görünüm */}
            <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#0a0a0a] shadow-2xl">
              <div className="p-3 bg-[#111111] border-b border-white/10 flex items-center justify-between text-xs text-[#888888]">
                <span className="font-bold text-white font-display">6. Mobil Arayüz (iPhone)</span>
                <span className="text-[11px] font-mono">Görselin Sağ Altı</span>
              </div>
              <div className="p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">iPhone Cihaz Önizlemesi</h4>
                <p className="text-xs text-[#888888]">
                  Mock-up'taki 9:41 status barı, mobil hero ve alt menüsüyle birebir.
                </p>
                <button
                  onClick={onOpenMobileFrame}
                  className="px-5 py-2.5 rounded-full bg-[#1e1e1e] border border-white/20 text-white text-xs font-bold hover:bg-white hover:text-black transition-all cursor-pointer"
                >
                  Mobil Simülatörü Aç
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
