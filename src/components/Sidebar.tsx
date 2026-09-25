import React from 'react';
import {
  Home, Compass, User, PlusCircle, Heart, MessageSquare, Settings,
  LogOut, ShieldCheck, Users, Info
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreate: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  adminEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreate,
  onLogout,
  isAdmin,
  onOpenAdmin,
  adminEmail,
}) => {
  const menuItems = [
    { id: 'explore', label: 'Ana Sayfa', icon: Home },
    { id: 'gallery', label: 'Keşfet', icon: Compass },
    { id: 'community', label: 'Topluluk', icon: Users },
    { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
    { id: 'favorites', label: 'Kaydedilenler', icon: Heart },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[238px] border-r border-white/10 bg-black z-40 px-4 py-7 flex-col">
      <button
        onClick={() => onSelectTab('explore')}
        className="px-3 mb-9 text-left cursor-pointer group"
        aria-label="Tattoos World ana sayfa"
      >
        <span className="font-brush text-[24px] tracking-wide text-white uppercase group-hover:opacity-80 transition-opacity">
          TATTOO'S WORLD
        </span>
      </button>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id || (item.id === 'explore' && currentTab === 'gallery' && false);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                active
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'text-[#b4b4b4] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon className={`w-[22px] h-[22px] ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenCreate}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm text-[#b4b4b4] hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
        >
          <PlusCircle className="w-[22px] h-[22px] stroke-[1.8]" />
          <span>Oluştur</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('about')}
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm transition-all cursor-pointer ${
            currentTab === 'about'
              ? 'bg-white/[0.08] text-white font-semibold'
              : 'text-[#b4b4b4] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Info className="w-[22px] h-[22px] stroke-[1.8]" />
          <span>Hakkımızda</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-white/[0.08] text-white font-semibold'
              : 'text-[#b4b4b4] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Settings className="w-[22px] h-[22px] stroke-[1.8]" />
          <span>Ayarlar</span>
        </button>

        {isAdmin && onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="w-full mt-2 flex items-center gap-4 px-3 py-3 rounded-xl text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-[22px] h-[22px]" />
            <span>Admin Paneli</span>
          </button>
        )}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        {isAdmin && adminEmail && (
          <div className="px-3 pb-1 text-[10px] text-amber-300/80 font-mono truncate">
            {adminEmail}
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm text-[#b4b4b4] hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-[22px] h-[22px] stroke-[1.8]" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
};
