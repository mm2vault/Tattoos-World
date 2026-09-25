import React from 'react';
import { Home, Compass, PlusCircle, User } from 'lucide-react';
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
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-lg border-t border-white/10 px-4 py-2 flex items-center justify-around safe-area-bottom">
      {/* Home */}
      <button
        onClick={() => onSelectTab('explore')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
          currentTab === 'explore' ? 'text-[#CCFF00]' : 'text-[#888888]'
        }`}
        aria-label={t.navHome}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">{t.navHome}</span>
      </button>

      {/* Gallery */}
      <button
        onClick={() => onSelectTab('gallery')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
          currentTab === 'gallery' ? 'text-[#CCFF00]' : 'text-[#888888]'
        }`}
        aria-label={t.navGallery}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium">{t.navGallery}</span>
      </button>

      {/* Create / Share */}
      <button
        onClick={onOpenCreate}
        className="flex flex-col items-center gap-1 py-1 px-3 text-[#CCFF00] -mt-3 group"
        aria-label={t.navCreate}
      >
        <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shadow-lg shadow-[#CCFF00]/20 group-hover:scale-105 transition-transform">
          <PlusCircle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-bold text-white">{t.navCreate}</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => onSelectTab('profile')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
          currentTab === 'profile' ? 'text-[#CCFF00]' : 'text-[#888888]'
        }`}
        aria-label={t.navProfile}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">{t.navProfile}</span>
      </button>
    </div>
  );
};
