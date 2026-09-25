import React, { useState } from 'react';
import { 
  Bell, Shield, Globe, Moon, User, LogOut, Check, Eye, Zap, Database 
} from 'lucide-react';
import { UserProfile, SupportedLanguage } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLogout: () => void;
  onToast: (msg: string) => void;
}

const SETTINGS_KEY = 'tattos_world_settings_v1';

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  currentLanguage,
  onLanguageChange,
  onLogout,
  onToast,
}) => {
  const [notifyLikes, setNotifyLikes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').notifyLikes ?? true; } catch { return true; }
  });
  const [notifyComments, setNotifyComments] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').notifyComments ?? true; } catch { return true; }
  });
  const [notifyArtists, setNotifyArtists] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').notifyArtists ?? true; } catch { return true; }
  });
  const [profilePublic, setProfilePublic] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').profilePublic ?? true; } catch { return true; }
  });
  const [reduceMotion, setReduceMotion] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').reduceMotion ?? false; } catch { return false; }
  });
  const [autoplay, setAutoplay] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}').autoplay ?? true; } catch { return true; }
  });

  const saveSetting = (key: string, value: boolean) => {
    try {
      const current = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, [key]: value }));
    } catch {}
  };

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
                  saveSetting('notifyLikes', !notifyLikes);
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
                  saveSetting('notifyComments', !notifyComments);
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
                  saveSetting('notifyArtists', !notifyArtists);
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

        {/* Section 3: Gizlilik & Deneyim */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Gizlilik & Deneyim</span>
          </h3>
          <div className="bg-[#141414] border border-white/10 rounded-2xl divide-y divide-white/5">
            {[
              {icon: Eye, title:'Profilimi toplulukta göster', desc:'Profiliniz ve paylaşımlarınız diğer üyeler tarafından görülebilsin.', value:profilePublic, set:setProfilePublic, key:'profilePublic'},
              {icon: Zap, title:'Hareketli geçişler', desc:'Arayüz animasyonlarını ve yumuşak geçişleri kullan.', value:!reduceMotion, set:(v:boolean)=>setReduceMotion(!v), key:'reduceMotion', invert:true},
              {icon: Moon, title:'Medya otomatik oynatma', desc:'Hareketli içeriklerde otomatik oynatmayı etkinleştir.', value:autoplay, set:setAutoplay, key:'autoplay'},
            ].map((item) => {
              const Icon = item.icon;
              return <div key={item.key} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 text-[#999999] shrink-0" />
                  <div><h4 className="text-xs font-bold text-white">{item.title}</h4><p className="text-[11px] text-[#777777]">{item.desc}</p></div>
                </div>
                <button onClick={() => { item.set(!item.value); saveSetting(item.key, item.key === 'reduceMotion' ? !item.value : !item.value); onToast('Ayar kaydedildi'); }} className={`w-11 h-6 rounded-full relative shrink-0 ${item.value ? 'bg-white' : 'bg-[#2a2a2a]'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full ${item.value ? 'right-1 bg-black' : 'left-1 bg-white/60'}`} />
                </button>
              </div>;
            })}
          </div>
        </div>

        {/* Section 4: Veri & Hesap */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            <span>Veri & Hesap</span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => { const data = { profile: currentUser, settings: JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'), exportedAt: new Date().toISOString() }; const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='tattoos-world-profile.json'; a.click(); URL.revokeObjectURL(a.href); onToast('Profil verileri dışa aktarıldı'); }} className="p-4 rounded-2xl bg-[#141414] border border-white/10 text-left hover:border-white/25 transition-all cursor-pointer">
              <p className="text-xs font-bold text-white">Verilerimi dışa aktar</p><p className="text-[11px] text-[#777777] mt-1">Profil ve yerel ayarlarını JSON olarak kaydet.</p>
            </button>
            <button onClick={() => { localStorage.removeItem(SETTINGS_KEY); onToast('Yerel ayarlar sıfırlandı'); }} className="p-4 rounded-2xl bg-[#141414] border border-white/10 text-left hover:border-red-500/30 transition-all cursor-pointer">
              <p className="text-xs font-bold text-white">Tercihleri sıfırla</p><p className="text-[11px] text-[#777777] mt-1">Bildirim ve görünüm tercihlerini varsayılana döndür.</p>
            </button>
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

        {/* Section 6: Gizlilik & Çıkış */}
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
