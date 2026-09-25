import React from 'react';
import { Users, Heart, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Tattoo, SupportedLanguage, UserProfile } from '../types';
import { translations } from '../i18n/translations';
import { tattooStore } from '../services/tattooStore';

interface CommunityViewProps {
  tattoos: Tattoo[];
  onSelectTattoo: (tattoo: Tattoo) => void;
  onSelectCreator: (handle: string) => void;
  currentLanguage: SupportedLanguage;
  currentUser: UserProfile;
  onToast: (msg: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  tattoos,
  onSelectTattoo,
  onSelectCreator,
  currentLanguage,
  currentUser,
  onToast,
}) => {
  const t = translations[currentLanguage];

  const creators = React.useMemo(() => {
    const seen = new Set<string>();
    return tattoos
      .slice()
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .map((tattoo) => tattooStore.getArtistProfile(tattoo.creatorHandle))
      .filter((artist): artist is UserProfile => Boolean(artist) && artist.uid !== currentUser.uid)
      .filter((artist) => {
        const key = artist.uid || artist.handle;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
  }, [tattoos, currentUser.uid]);

  const feed = React.useMemo(
    () => tattoos.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 12),
    [tattoos]
  );

  return (
    <div className="w-full max-w-[935px] mx-auto pb-12">
      <section className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2 px-1 mb-4">
          <Users className="w-5 h-5 text-white" />
          <h1 className="text-base font-semibold text-white">Tattoos World</h1>
          <span className="text-[#666]">•</span>
          <span className="text-sm text-[#888]">{t.communityHub}</span>
        </div>

        {creators.length > 0 ? (
          <div className="flex gap-5 overflow-x-auto scrollbar-none px-1 pb-1">
            {creators.map((artist) => (
              <button
                key={artist.uid}
                type="button"
                onClick={() => onSelectCreator(artist.handle)}
                className="shrink-0 w-[72px] flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <div className="rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-fuchsia-500 to-purple-600">
                  <div className="w-[64px] h-[64px] p-[2px] rounded-full bg-black">
                    <img
                      src={artist.photoURL || './images/users/avatar_inkedlife.jpg'}
                      alt={artist.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="w-full truncate text-[11px] text-[#d5d5d5]">{artist.displayName}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-1 py-8 text-center text-sm text-[#777]">
            İlk dövme sanatçısını sen keşfet ve topluluğu başlat.
          </div>
        )}
      </section>

      <section className="pt-6">
        <div className="grid grid-cols-3 border border-white/10">
          {feed.map((tattoo) => (
            <button
              key={tattoo.id}
              type="button"
              onClick={() => onSelectTattoo(tattoo)}
              className="group relative aspect-square overflow-hidden bg-[#090909] border-r border-b border-white/10 cursor-pointer"
            >
              <img
                src={tattoo.image}
                alt={tattoo.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white text-sm font-bold">
                <span className="flex items-center gap-1.5"><Heart className="w-5 h-5 fill-white" />{tattoo.likesCount}</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="w-5 h-5 fill-white" />{tattoo.commentsCount}</span>
              </div>
            </button>
          ))}
        </div>

        {feed.length === 0 && (
          <div className="py-16 text-center text-sm text-[#777]">
            Henüz topluluk gönderisi yok.
          </div>
        )}
      </section>

      <section className="mt-8 border-t border-white/10 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white">Öne çıkan tattoo artist'ler</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {creators.slice(0, 6).map((artist) => {
            const following = tattooStore.isFollowing(artist.handle);
            return (
              <div key={artist.uid} className="flex items-center gap-3 border border-white/10 rounded-xl px-3 py-3 bg-[#0d0d0d]">
                <button type="button" onClick={() => onSelectCreator(artist.handle)} className="shrink-0 cursor-pointer">
                  <img src={artist.photoURL || './images/users/avatar_inkedlife.jpg'} alt={artist.displayName} className="w-11 h-11 rounded-full object-cover" />
                </button>
                <button type="button" onClick={() => onSelectCreator(artist.handle)} className="min-w-0 flex-1 text-left cursor-pointer">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-white truncate">{artist.displayName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  </div>
                  <span className="text-[11px] text-[#777] truncate block">{artist.handle}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = tattooStore.toggleFollow(artist.handle);
                    onToast(next ? 'Takip edildi' : 'Takipten çıkıldı');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                    following ? 'bg-white/10 text-white' : 'bg-white text-black hover:bg-[#eaeaea]'
                  }`}
                >
                  {following ? 'Takip' : 'Takip Et'}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
