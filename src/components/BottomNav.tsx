import React from 'react';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreate: () => void;
  currentLanguage: SupportedLanguage;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreate,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[62px] bg-black/95 backdrop-blur-xl border-t border-white/10 px-3 flex items-center justify-around safe-area-bottom">
      <button
        type="button"
        onClick={() => onSelectTab('explore')}
        className={`p-2 rounded-full cursor-pointer ${
          currentTab === 'explore' ? 'text-white' : 'text-[#888]'
        }`}
        aria-label={t.navHome}
      >
        <Home className={`w-6 h-6 ${currentTab === 'explore' ? 'fill-white' : ''}`} />
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('gallery')}
        className={`p-2 rounded-full cursor-pointer ${
          currentTab === 'gallery' ? 'text-white' : 'text-[#888]'
        }`}
        aria-label={t.navGallery}
      >
        <Search className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={onOpenCreate}
        className="p-2 rounded-full text-white hover:bg-white/10 cursor-pointer"
        aria-label={t.navCreate}
      >
        <Plus className="w-7 h-7" />
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('messages')}
        className={`p-2 rounded-full cursor-pointer ${
          currentTab === 'messages' ? 'text-white' : 'text-[#888]'
        }`}
        aria-label="Mesajlar"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('profile')}
        className="p-0.5 rounded-full cursor-pointer"
        aria-label={t.navProfile}
      >
        <div className={`rounded-full p-[2px] ${currentTab === 'profile' ? 'ring-2 ring-white' : ''}`}>
          <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
            <img
              src="./images/users/avatar_inkedlife.jpg"
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </button>
    </nav>
  );
};
