import React, { useState } from 'react';
import { 
  Bell, Shield, Globe, Moon, User, LogOut, Check 
} from 'lucide-react';
import { UserProfile, SupportedLanguage } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLogout: () => void;
  onToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  currentLanguage,
  onLanguageChange,
  onLogout,
  onToast,
}) => {
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyArtists, setNotifyArtists] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
      
      <div className="rounded-3xl bg-[#0d0d0d] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div>
          <h2 className="text-xl font-bold text-white font-display">Ayarlar</h2>
          <p className="text-xs text-[#888888] mt-0.5">
            Hesap tercihlerinizi ve bildirimlerinizi yönetin.
          </p>
        </div>

        {/* Section 1: Profil & Hesap Bilgileri */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            <span>Hesap Bilgileri</span>
          </h3>

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.photoURL || './images/users/avatar_inkedlife.jpg'}
                alt={currentUser.displayName}
                className="w-12 h-12 rounded-full object-cover border border-white/20"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{currentUser.displayName}</h4>
                <p className="text-xs text-[#888888]">{currentUser.email}</p>
                <p className="text-[11px] text-[#AAAAAA] font-mono mt-0.5">{currentUser.handle}</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Aktif Hesap
            </span>
          </div>
        </div>

        {/* Section 2: Bildirimler */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Bildirim Tercihleri</span>
          </h3>

          <div className="bg-[#141414] border border-white/10 rounded-2xl divide-y divide-white/5">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Beğeni Bildirimleri</h4>
                <p className="text-[11px] text-[#777777]">Dövmeleriniz beğenildiğinde anında bildirim alın.</p>
              </div>
              <button
                onClick={() => {
                  setNotifyLikes(!notifyLikes);
                  onToast('Bildirim ayarı kaydedildi');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notifyLikes ? 'bg-white' : 'bg-[#2a2a2a]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  notifyLikes ? 'right-1 bg-black' : 'left-1 bg-white/60'
                }`} />
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Yorum Bildirimleri</h4>
                <p className="text-[11px] text-[#777777]">Paylaşımlarınıza yeni yorum yapıldığında haber ver.</p>
              </div>
              <button
                onClick={() => {
                  setNotifyComments(!notifyComments);
                  onToast('Bildirim ayarı kaydedildi');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notifyComments ? 'bg-white' : 'bg-[#2a2a2a]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  notifyComments ? 'right-1 bg-black' : 'left-1 bg-white/60'
                }`} />
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Takip Edilen Sanatçılar</h4>
                <p className="text-[11px] text-[#777777]">Takip ettiğiniz sanatçılar yeni dövme yüklediğinde bildir.</p>
              </div>
              <button
                onClick={() => {
                  setNotifyArtists(!notifyArtists);
                  onToast('Bildirim ayarı kaydedildi');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notifyArtists ? 'bg-white' : 'bg-[#2a2a2a]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                  notifyArtists ? 'right-1 bg-black' : 'left-1 bg-white/60'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Dil ve Bölge */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Dil Seçimi (Language)</span>
          </h3>

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Aktif Arayüz Dili</h4>
              <p className="text-[11px] text-[#777777]">9 farklı dil arasından seçim yapabilirsiniz.</p>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => {
                onLanguageChange(e.target.value as SupportedLanguage);
                onToast('Dil güncellendi');
              }}
              className="bg-[#1c1c1c] border border-white/15 rounded-xl px-3.5 py-1.5 text-xs text-white cursor-pointer focus:outline-none"
            >
              <option value="tr">Türkçe (TR)</option>
              <option value="en">English (EN)</option>
              <option value="az">Azərbaycan (AZ)</option>
              <option value="ru">Русский (RU)</option>
              <option value="de">Deutsch (DE)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
              <option value="pt">Português (PT)</option>
              <option value="it">Italiano (IT)</option>
            </select>
          </div>
        </div>

        {/* Section 4: Gizlilik & Çıkış */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Oturumu Kapat</span>
          </button>

          <p className="text-[11px] text-[#555555]">
            Tatto's World v1.0.0 (Production)
          </p>
        </div>

      </div>

    </div>
  );
};
