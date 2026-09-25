import React from 'react';
import { Users, Sparkles, Heart, MessageSquare, Flame, CheckCircle2, ArrowRight } from 'lucide-react';
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

  const featuredArtists = React.useMemo(() => {
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
      .slice(0, 6);
  }, [tattoos, currentUser.uid]);
  const popularTattoos = [...tattoos].sort((a, b) => b.likesCount - a.likesCount).slice(0, 4);
  const latestTattoos = [...tattoos].slice(0, 6);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#111111] border border-white/10 p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#CCFF00]">
            <Users className="w-3.5 h-3.5" />
            <span>GLOBAL TATTOO COLLECTIVE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display uppercase">
            {t.communityHub}
          </h1>

          <p className="text-sm sm:text-base text-[#AAAAAA] leading-relaxed">
            {t.communitySubtitle}
          </p>
        </div>
      </div>

      {/* Featured Creators Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="text-xl font-bold text-white font-display">
              {t.featuredArtists}
            </h2>
          </div>
        </div>

        {featuredArtists.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#111111] p-8 text-center text-sm text-[#777777]">
            Henüz topluluk sanatçısı yok. İlk dövmeni paylaş ve topluluğun ilk yaratıcılarından biri ol.
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {featuredArtists.map((artist) => {
            const isFollowing = tattooStore.isFollowing(artist.handle);
            return (
              <div
                key={artist.uid}
                onClick={() => onSelectCreator(artist.handle)}
                className="group rounded-2xl bg-[#151515] border border-white/10 p-5 hover:border-[#CCFF00]/40 transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={artist.photoURL}
                      alt={artist.displayName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border border-white/15 group-hover:scale-105 transition-transform"
                    />
                    <CheckCircle2 className="w-4 h-4 text-[#CCFF00] bg-black rounded-full absolute bottom-0 right-0" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#CCFF00] transition-colors truncate">
                      {artist.displayName}
                    </h3>
                    <p className="text-xs text-[#888888] font-mono">{artist.handle}</p>
                    <p className="text-xs text-[#AAAAAA] line-clamp-2 mt-1.5 leading-snug">
                      {artist.bio}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#777777]">
                  <span>{artist.followersCount.toLocaleString()} {t.followers}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const following = tattooStore.toggleFollow(artist.handle);
                      onToast(following ? `${artist.handle} ${t.following}` : `${t.follow} iptal edildi`);
                    }}
                    className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                      isFollowing
                        ? 'bg-white/10 text-white'
                        : 'bg-[#CCFF00] text-black hover:bg-[#b4f309]'
                    }`}
                  >
                    {isFollowing ? t.following : t.follow}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* Latest & Trending Discussions / Works */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="text-xl font-bold text-white font-display">
              {t.latestArtwork}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestTattoos.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectTattoo(item)}
              className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden hover:border-white/20 transition-all cursor-pointer group flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white font-medium border border-white/10">
                  {item.categoryName}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#CCFF00] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#888888] line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#777777]">
                  <span className="text-[#AAAAAA]">{item.creatorHandle}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#CCFF00]">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      {item.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {item.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
