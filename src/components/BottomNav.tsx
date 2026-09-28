import React from 'react';
import { Home, Search, Plus, Heart } from 'lucide-react';
import { SupportedLanguage, UserProfile } from '../types';
import { translations } from '../i18n/translations';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreate: () => void;
  currentLanguage: SupportedLanguage;
  currentUser: UserProfile;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreate,
  currentLanguage,
  currentUser,
}) => {
  const t = translations[currentLanguage];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[68px] bg-black/95 backdrop-blur-xl border-t border-white/10 px-3 flex items-center justify-around safe-area-bottom">
      <button
        type="button"
        onClick={() => onSelectTab('explore')}
        className={`min-w-[52px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl cursor-pointer ${
          currentTab === 'explore' ? 'text-white' : 'text-[#888]'
        }`}
        aria-label={t.navHome}
      >
        <Home className={`w-5 h-5 ${currentTab === 'explore' ? 'fill-white' : ''}`} /><span className="text-[9px]">Ana Sayfa</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('gallery')}
        className={`p-2 rounded-full cursor-pointer ${
          currentTab === 'gallery' ? 'text-white' : 'text-[#888]'
        }`}
        aria-label={t.navGallery}
      >
        <Search className="w-5 h-5" /><span className="text-[9px]">Keşfet</span>
      </button>

      <button
        type="button"
        onClick={onOpenCreate}
        className="min-w-[52px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-white hover:bg-white/10 cursor-pointer"
        aria-label={t.navCreate}
      >
        <Plus className="w-6 h-6" /><span className="text-[9px]">Paylaş</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('favorites')}
        className={`p-2 rounded-full cursor-pointer ${
          currentTab === 'favorites' ? 'text-white' : 'text-[#888]'
        }`}
        aria-label="Kaydedilenler"
      >
        <Heart className={`w-5 h-5 ${currentTab === 'favorites' ? 'fill-white' : ''}`} /><span className="text-[9px]">Kayıtlar</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('profile')}
        className="min-w-[52px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl cursor-pointer"
        aria-label={t.navProfile}
      >
        <div className={`rounded-full p-[2px] ${currentTab === 'profile' ? 'ring-2 ring-white' : ''}`}>
          <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
            <img
              src={currentUser.photoURL || './images/users/avatar_inkedlife.jpg'}
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </button>
    </nav>
  );
};
