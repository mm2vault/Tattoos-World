import React from 'react';
import { Home, Search, Plus, MessageCircle } from 'lucide-react';
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[72px] bg-[#080808]/92 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-12px_40px_rgba(0,0,0,.35)] px-3 flex items-center justify-around safe-area-bottom">
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
        className={`min-w-[52px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl cursor-pointer ${
          currentTab === 'gallery' ? 'text-white' : 'text-[#888]'
        }`}
        aria-label={t.navGallery}
      >
        <Search className="w-5 h-5" /><span className="text-[9px]">Keşfet</span>
      </button>

      <button
        type="button"
        onClick={onOpenCreate}
        className="min-w-[52px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-2xl text-white bg-white/[0.08] border border-white/10 hover:bg-white/[0.13] cursor-pointer transition-all"
        aria-label={t.navCreate}
      >
        <Plus className="w-6 h-6" /><span className="text-[9px]">Paylaş</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('messages')}
        className={`min-w-[52px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl cursor-pointer ${
          currentTab === 'messages' ? 'text-white' : 'text-[#888]'
        }`}
        aria-label="Mesajlar"
      >
        <MessageCircle className="w-5 h-5" /><span className="text-[9px]">Mesajlar</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('profile')}
        className="min-w-[52px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl cursor-pointer"
        aria-label={t.navProfile}
      >
        <div className={`flex flex-col items-center gap-0.5 rounded-2xl px-2 py-1 ${currentTab === 'profile' ? 'bg-white/[0.07]' : ''}`}>
          <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
            <img
              src={currentUser.photoURL || './images/users/avatar_inkedlife.jpg'}
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <span className="text-[9px]">Profil</span>
      </button>
    </nav>
  );
};
