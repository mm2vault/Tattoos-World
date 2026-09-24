import React, { useState } from 'react';
import { 
  X, Wifi, Battery, Signal, Search, Menu, 
  Home, Compass, Plus, User, Heart, Sparkles 
} from 'lucide-react';
import { Tattoo, UserProfile } from '../types';

interface MobileDeviceFrameProps {
  onClose: () => void;
  tattoos: Tattoo[];
  currentUser: UserProfile;
  onSelectTattoo: (tattoo: Tattoo) => void;
  onOpenCreate: () => void;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  onClose,
  tattoos,
  currentUser,
  onSelectTattoo,
  onOpenCreate,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'gallery' | 'profile'>('home');

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Close button outside phone */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all cursor-pointer shadow-xl z-50"
        title="Kapat"
      >
        <X className="w-5 h-5" />
      </button>

      {/* iPhone Phone Frame matching bottom right of image */}
      <div className="relative w-[360px] sm:w-[390px] h-[780px] bg-[#000000] rounded-[52px] border-[10px] border-[#222222] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between select-none">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111111] border border-white/10" />
        </div>

        {/* iPhone Status Bar (9:41, wifi, battery) */}
        <div className="px-7 pt-4 pb-2 flex items-center justify-between text-[11px] text-white font-semibold z-30 shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-white">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Mobile App Header */}
        <div className="px-5 py-2 flex items-center justify-between border-b border-white/10 z-20 shrink-0">
          <span className="font-brush text-lg text-white uppercase tracking-wider">
            TATTOO'S WORLD
          </span>
          <div className="flex items-center gap-3 text-white">
            <Search className="w-4 h-4 cursor-pointer" />
            <Menu className="w-4 h-4 cursor-pointer" />
          </div>
        </div>

        {/* Mobile App Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 scrollbar-none">
          
          {/* Mobile Hero matching image */}
          <div className="rounded-2xl bg-[#0e0e0e] border border-white/10 p-5 relative overflow-hidden">
            <div 
              className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center opacity-30 pointer-events-none"
              style={{ backgroundImage: `url('./images/ui/hero_tattoo_portrait.jpg')` }}
            />
            <div className="relative z-10 space-y-2">
              <h2 className="text-xl font-bold text-white leading-tight font-display">
                Your Next Tattoo<br />Starts Here
              </h2>
              <p className="text-[11px] text-[#888888] leading-relaxed">
                Discover unique tattoo designs, connect with artists, share your own and be part of our community.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('gallery')}
                  className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold"
                >
                  Keşfet
                </button>
                <button
                  onClick={onOpenCreate}
                  className="px-4 py-1.5 rounded-full bg-[#1c1c1c] border border-white/15 text-white text-xs font-semibold"
                >
                  Dövme Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Popüler Dövmeler Header & Cards matching bottom right of image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-display">Popüler Dövmeler</h3>
              <span className="text-[10px] text-[#888888] flex items-center gap-0.5">
                Tümünü Gör →
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Butterfly Card */}
              <div
                onClick={() => onSelectTattoo(tattoos[1] || tattoos[0])}
                className="rounded-2xl overflow-hidden bg-[#121212] border border-white/10 aspect-[3/4.2] relative cursor-pointer group"
              >
                <img
                  src="./images/tattoos/butterfly_ink.jpg"
                  alt="Butterfly"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 inset-x-2.5 space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-white font-bold">
                    <Heart className="w-2.5 h-2.5 fill-white" />
                    <span>12.4K</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">Butterfly</h4>
                  <p className="text-[10px] text-[#888888]">@lunatattoos</p>
                  <p className="text-[9px] text-[#666666]">Minimal</p>
                </div>
              </div>

              {/* Snake Card */}
              <div
                onClick={() => onSelectTattoo(tattoos[2] || tattoos[0])}
                className="rounded-2xl overflow-hidden bg-[#121212] border border-white/10 aspect-[3/4.2] relative cursor-pointer group"
              >
                <img
                  src="./images/tattoos/snake_serpent.jpg"
                  alt="Snake"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 inset-x-2.5 space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-white font-bold">
                    <Heart className="w-2.5 h-2.5 fill-white" />
                    <span>9.9K</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">Snake</h4>
                  <p className="text-[10px] text-[#888888]">@darksoul</p>
                  <p className="text-[9px] text-[#666666]">Seri</p>
                </div>
              </div>
            </div>
          </div>

          {/* More Tattoos Feed */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-white font-display">Keşfet</h3>
            <div className="grid grid-cols-2 gap-3">
              {tattoos.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTattoo(t)}
                  className="rounded-xl overflow-hidden bg-[#141414] border border-white/10 aspect-square relative cursor-pointer"
                >
                  <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black to-transparent">
                    <p className="text-[10px] font-bold text-white truncate">{t.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* iPhone Mobile Bottom Navigation matching image */}
        <div className="h-16 bg-[#080808] border-t border-white/10 px-6 flex items-center justify-between text-white shrink-0 z-30">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'home' ? 'text-white' : 'text-[#666666]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[9px] font-medium">Ana Sayfa</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'gallery' ? 'text-white' : 'text-[#666666]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[9px] font-medium">Galeri</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg -mt-3 cursor-pointer hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'profile' ? 'text-white' : 'text-[#666666]'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[9px] font-medium">Profil</span>
          </button>
        </div>

        {/* Home Indicator Bar */}
        <div className="h-4 bg-black flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>

      </div>

    </div>
  );
};
