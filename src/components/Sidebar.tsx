import React from 'react';
import { 
  Home, Compass, User, PlusCircle, Heart, MessageSquare, Settings, LogOut, ShieldCheck, Users, Info 
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
    { id: 'gallery', label: 'Galeri', icon: Compass },
    { id: 'community', label: 'Topluluk', icon: Users },
    { id: 'profile', label: 'Profilim', icon: User },
    { id: 'create', label: 'Dövme Ekle', icon: PlusCircle, isAction: true },
    { id: 'favorites', label: 'Favorilerim', icon: Heart },
    { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
    { id: 'about', label: 'Hakkımızda', icon: Info },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <aside className="hidden xl:flex flex-col justify-between w-60 h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/10 p-5 shrink-0 z-30 select-none">
      
      {/* Top Branding matching image */}
      <div className="space-y-6">
        <button
          onClick={() => onSelectTab('explore')}
          className="block text-left group cursor-pointer"
        >
          <span className="font-brush text-2xl tracking-wider text-white uppercase drop-shadow -rotate-2 inline-block group-hover:scale-105 transition-transform">
            TATTOO'S WORLD
          </span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction) {
                    onOpenCreate();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-[#888888] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#777777]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Panel Button visible ONLY if the authenticated user is admin */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="w-full mt-3 flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Paneli</span>
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Logout Button matching image */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        {isAdmin && adminEmail && (
          <div className="px-2 text-[10px] text-amber-400 font-mono truncate">
            👑 Yönetici: {adminEmail}
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış Yap</span>
        </button>
      </div>

    </aside>
  );
};
