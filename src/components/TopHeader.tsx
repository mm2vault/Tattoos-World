import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, LayoutGrid, Smartphone, Check, Sparkles, Heart, MessageSquare, X } from 'lucide-react';
import { UserProfile, Notification } from '../types';
import { tattooStore } from '../services/tattooStore';

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentUser: UserProfile;
  onProfileClick: () => void;
  onLoginWithGoogle?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenMobileFrame: () => void;
  showcaseMode: boolean;
  onToggleShowcaseMode: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  searchQuery,
  onSearchChange,
  currentUser,
  onProfileClick,
  onLoginWithGoogle,
  onToggleMobileMenu,
  onOpenMobileFrame,
  showcaseMode,
  onToggleShowcaseMode,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => tattooStore.getNotifications());
  const [unreadCount, setUnreadCount] = useState(() => tattooStore.getUnreadNotificationCount());
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refreshNotifications = () => {
      setNotifications(tattooStore.getNotifications());
      setUnreadCount(tattooStore.getUnreadNotificationCount());
    };
    refreshNotifications();
    tattooStore.syncNotificationsFromFirestore().catch(() => {});
    window.addEventListener('tattoos-world-notifications', refreshNotifications);
    return () => window.removeEventListener('tattoos-world-notifications', refreshNotifications);
  }, [currentUser.uid]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const handleToggleNotifications = async () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    if (nextOpen) {
      await tattooStore.markNotificationsRead();
      setNotifications(tattooStore.getNotifications());
      setUnreadCount(0);
    }
  };

  const notificationIcon = (type: Notification['type']) => {
    if (type === 'like') return <Heart className="w-4 h-4 text-red-400" />;
    if (type === 'comment') return <MessageSquare className="w-4 h-4 text-sky-400" />;
    return <span className="text-sm">＋</span>;
  };
  return (
    <header className="w-full bg-[#080808]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sticky top-0 z-20 mb-12 sm:mb-0">
      
      {/* Mobile brand & hamburger */}
      <div className="flex items-center gap-3 xl:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded-lg text-[#888888] hover:text-white"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-brush text-lg text-white uppercase">
          TATTOO'S WORLD
        </span>
      </div>

      {/* Search Input matching image */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Dövmelerde ara..."
            className="w-full bg-[#121212] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
      </div>

      {/* Mobile search is shown below the header row so phone users can always find tattoos. */}
      <div className="sm:hidden absolute left-3 right-3 top-16 z-30">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Dövme, stil, sanatçı veya etiket ara..."
            aria-label="Dövme ara"
            className="w-full bg-[#121212] border border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white/30 shadow-xl transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#777777] hover:text-white hover:bg-white/10 cursor-pointer"
              aria-label="Aramayı temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* View Switchers: Board View + Mobile Simulator */}
      <div className="flex items-center gap-2">
        
        {/* Toggle 6-Screen Showcase Board */}
        <button
          onClick={onToggleShowcaseMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            showcaseMode
              ? 'bg-white text-black shadow-md'
              : 'bg-[#181818] border border-white/15 text-[#CCCCCC] hover:text-white hover:border-white/30'
          }`}
          title="Tüm ekranları yan yana incele"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{showcaseMode ? 'Canlı Uygulama' : 'Tasarım Panosu'}</span>
        </button>

        {/* Launch Mobile Phone Mockup */}
        <button
          onClick={onOpenMobileFrame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181818] border border-white/15 text-xs text-[#CCCCCC] hover:text-white hover:border-white/30 transition-all cursor-pointer"
          title="Mobil telefon simülatörünü aç"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mobil Görünüm</span>
        </button>

        {/* Notification Bell with Dropdown Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={handleToggleNotifications}
            className={`p-2 rounded-full transition-colors cursor-pointer relative ${
              notificationsOpen ? 'bg-white/15 text-white' : 'text-[#888888] hover:text-white hover:bg-white/5'
            }`}
            aria-label="Notifications"
            title="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1 ring-2 ring-[#080808] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1rem))] bg-[#121212] border border-white/15 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 px-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Bildirimler</span>
                </span>
                <span className="text-[10px] text-[#888888]">Tümü Okundu</span>
              </div>

              <div className="space-y-1.5 text-xs max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-[#666666]">
                    <Bell className="w-7 h-7 mx-auto mb-2 opacity-40" />
                    <p className="text-xs text-[#888888]">Henüz bildirim yok.</p>
                    <p className="text-[10px] mt-1">Beğeni, yorum ve takipler burada görünecek.</p>
                  </div>
                ) : (
                  <>
                    {notifications.slice(0, 30).map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 hover:bg-white/5 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                          {notification.senderAvatar ? <img src={notification.senderAvatar} alt="" className="w-full h-full object-cover" /> : notificationIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-white leading-relaxed">{notification.text}</p>
                          {notification.tattooTitle && <p className="text-[10px] text-[#666666] mt-0.5 truncate">{notification.tattooTitle}</p>}
                          <p className="text-[9px] text-[#555555] mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                        </div>
                        {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />}
                      </div>
                    ))}
                    <button
                      onClick={() => tattooStore.clearNotifications()}
                      className="w-full py-2 mt-1 text-[10px] text-[#777777] hover:text-white border-t border-white/5 cursor-pointer"
                    >
                      Bildirimleri temizle
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Google Login button if guest */}
        {onLoginWithGoogle && (!currentUser.email || currentUser.email.includes('guest@') || currentUser.email.includes('alex@')) && (
          <button
            onClick={onLoginWithGoogle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-[#eaeaea] transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            <span className="hidden sm:inline">Giriş Yap</span>
          </button>
        )}

        {/* User Profile Avatar */}
        <button
          onClick={onProfileClick}
          className="p-0.5 rounded-full hover:ring-2 hover:ring-white/20 transition-all cursor-pointer ml-1"
          aria-label="My Profile"
        >
          <img
            src={currentUser.photoURL || './images/users/avatar_inkedlife.jpg'}
            alt={currentUser.displayName}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-white/15"
          />
        </button>
      </div>

    </header>
  );
};
