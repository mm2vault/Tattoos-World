import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, Menu, Heart, MessageCircle, X
} from 'lucide-react';
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
    if (notificationsOpen) document.addEventListener('mousedown', handleClickOutside);
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
    if (type === 'like') return <Heart className="w-4 h-4 text-red-400 fill-red-400" />;
    if (type === 'comment') return <MessageCircle className="w-4 h-4 text-sky-400" />;
    return <span className="text-sm text-white">＋</span>;
  };

  return (
    <header className="sticky top-0 z-30 h-[62px] border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="h-full w-full px-3 sm:px-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:hidden min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 rounded-full text-white hover:bg-white/10 cursor-pointer"
            aria-label="Menüyü aç"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onProfileClick}
            className="font-brush text-[18px] tracking-wide text-white truncate"
          >
            TATTOO'S WORLD
          </button>
        </div>

        <div className="hidden lg:block w-[210px]">
          <span className="text-sm text-[#8e8e8e]">Topluluk akışı</span>
        </div>

        <div className="flex-1 max-w-[360px]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d8d8d]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ara"
              aria-label="Dövme, sanatçı veya etiket ara"
              className="w-full h-9 bg-[#1a1a1a] border border-transparent focus:border-white/15 rounded-lg pl-10 pr-9 text-sm text-white placeholder-[#8d8d8d] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#888] hover:text-white"
                aria-label="Aramayı temizle"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="hidden sm:inline-flex p-2.5 rounded-full text-white hover:bg-white/10 cursor-pointer"
            aria-label="Beğeniler"
          >
            <Heart className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="hidden sm:inline-flex p-2.5 rounded-full text-white hover:bg-white/10 cursor-pointer"
            aria-label="Mesajlar"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className="relative p-2.5 rounded-full text-white hover:bg-white/10 cursor-pointer"
              aria-label="Bildirimler"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-black" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-1rem))] rounded-2xl border border-white/10 bg-[#121212] shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">Bildirimler</span>
                  <span className="text-[11px] text-[#777]">Tümü okundu</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="w-7 h-7 mx-auto text-[#555] mb-2" />
                      <p className="text-sm text-[#888]">Henüz bildirim yok.</p>
                    </div>
                  ) : (
                    notifications.slice(0, 30).map((notification) => (
                      <div key={notification.id} className="flex gap-3 px-4 py-3 hover:bg-white/[0.04]">
                        <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {notification.senderAvatar
                            ? <img src={notification.senderAvatar} alt="" className="w-full h-full object-cover" />
                            : notificationIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white leading-relaxed">{notification.text}</p>
                          {notification.tattooTitle && <p className="text-[11px] text-[#666] mt-0.5 truncate">{notification.tattooTitle}</p>}
                          <p className="text-[10px] text-[#555] mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                        </div>
                        {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />}
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => tattooStore.clearNotifications()}
                    className="w-full py-3 border-t border-white/10 text-xs text-[#777] hover:text-white cursor-pointer"
                  >
                    Bildirimleri temizle
                  </button>
                )}
              </div>
            )}
          </div>

          {onLoginWithGoogle && (!currentUser.email || currentUser.email.includes('guest@') || currentUser.email.includes('alex@')) && (
            <button
              type="button"
              onClick={onLoginWithGoogle}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white text-black px-3.5 py-2 text-xs font-semibold hover:bg-[#eaeaea] cursor-pointer"
            >
              Giriş Yap
            </button>
          )}

          <button
            type="button"
            onClick={onProfileClick}
            className="ml-1 rounded-full p-[2px] hover:bg-white/20 cursor-pointer"
            aria-label="Profil"
          >
            <img
              src={currentUser.photoURL || './images/users/avatar_inkedlife.jpg'}
              alt={currentUser.displayName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-white/20"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
