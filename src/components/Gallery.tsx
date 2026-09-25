import React, { useState } from 'react';
import { Heart, ArrowRight, MessageCircle, Bookmark, Share2, MoreHorizontal, ChevronLeft, ChevronRight, Grid3X3, LayoutList } from 'lucide-react';
import { Tattoo, CategoryId, UserProfile } from '../types';
import { tattooStore } from '../services/tattooStore';

interface GalleryProps {
  tattoos: Tattoo[];
  onSelectTattoo: (tattoo: Tattoo) => void;
  onSelectCreator: (handle: string) => void;
  onOpenCreate: () => void;
  searchQuery: string;
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  currentUser: UserProfile;
  onToast: (msg: string) => void;
  onTattooUpdated: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({
  tattoos,
  onSelectTattoo,
  onSelectCreator,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  currentUser,
  onToast,
  onTattooUpdated,
}) => {
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [activeSlides, setActiveSlides] = useState<Record<string, number>>({});
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});

  const categoriesList: { id: CategoryId; name: string; image: string }[] = [
    { id: 'realism', name: 'Realizm', image: './images/tattoos/lion_clock.jpg' },
    { id: 'minimal', name: 'Minimal', image: './images/tattoos/butterfly_ink.jpg' },
    { id: 'black_and_grey', name: 'Siyah & Gri', image: './images/tattoos/rose_dark.jpg' },
    { id: 'color', name: 'Renkli', image: './images/tattoos/dragon_oriental.jpg' },
    { id: 'geometric', name: 'Geometrik', image: './images/tattoos/snake_serpent.jpg' },
    { id: 'animals', name: 'Diğer', image: './images/tattoos/cross_gothic.jpg' },
  ];

  const filteredTattoos = tattoos.filter((tattoo) => {
    const matchesCategory = selectedCategory === 'all' || tattoo.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    return (
      matchesCategory &&
      (tattoo.title.toLowerCase().includes(query) ||
        tattoo.description.toLowerCase().includes(query) ||
        tattoo.categoryName.toLowerCase().includes(query) ||
        tattoo.creatorHandle.toLowerCase().includes(query) ||
        tattoo.creatorName.toLowerCase().includes(query) ||
        tattoo.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  });

  const toggleLike = (id: string) => {
    const res = tattooStore.toggleLike(id);
    onTattooUpdated();
    onToast(res.isLiked ? 'Beğenildi' : 'Beğeni kaldırıldı');
  };

  const handleShare = async (tattoo: Tattoo) => {
    try {
      const shareUrl = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: tattoo.title,
          text: `@${tattoo.creatorHandle.replace(/^@/, '')} tarafından paylaşılan dövme`,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard?.writeText(shareUrl);
      onToast('Gönderi bağlantısı kopyalandı');
    } catch {
      // User closed the share dialog.
    }
  };

  const getSlides = (tattoo: Tattoo) => Array.from(new Set([tattoo.image, ...(tattoo.additionalImages || [])].filter(Boolean))).slice(0, 10);

  const storyCreators = React.useMemo(() => {
    const result: { handle: string; name: string; image: string; isCurrentUser?: boolean }[] = [
      {
        handle: currentUser.handle || '@sen',
        name: 'Sen',
        image: currentUser.photoURL || './images/users/avatar_inkedlife.jpg',
        isCurrentUser: true,
      },
    ];
    const seen = new Set<string>([String(currentUser.handle || '@sen').toLowerCase()]);

    tattoos.forEach((tattoo) => {
      const handle = tattoo.creatorHandle || '@tattoo';
      const key = handle.toLowerCase();
      if (seen.has(key) || result.length >= 9) return;
      seen.add(key);
      result.push({
        handle,
        name: tattoo.creatorName || handle,
        image: tattoo.creatorPhoto || tattoo.image,
      });
    });

    return result;
  }, [currentUser.handle, currentUser.photoURL, tattoos]);

  return (
    <div className="space-y-5 pb-8">
      <section className="border-b border-white/10 pb-5">
        <div className="mx-auto w-full max-w-2xl overflow-x-auto scrollbar-none">
          <div className="flex gap-4 px-3 sm:px-0">
            {storyCreators.map((creator) => (
              <button
                key={creator.handle}
                type="button"
                onClick={() => creator.isCurrentUser ? onOpenCreate() : onSelectCreator(creator.handle)}
                className="w-[68px] shrink-0 flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <div className="rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-fuchsia-500 to-purple-600">
                  <div className="w-[58px] h-[58px] rounded-full bg-black p-[2px]">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-full h-full rounded-full object-cover border border-black"
                    />
                  </div>
                </div>
                <span className="w-full truncate text-[11px] text-[#c7c7c7]">{creator.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white">
              {searchQuery ? `"${searchQuery}" Sonuçları` : 'Akış'}
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111111] border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('feed')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'feed' ? 'bg-white text-black' : 'text-[#777777] hover:text-white'}`}
              title="Akış görünümü"
              aria-label="Akış görünümü"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-black' : 'text-[#777777] hover:text-white'}`}
              title="Izgara görünümü"
              aria-label="Izgara görünümü"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredTattoos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#111111] p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">✦</div>
            <h3 className="text-sm font-bold text-white mt-4">Henüz gönderi yok</h3>
            <p className="text-xs text-[#666666] mt-1">İlk dövmeni paylaş ve akışı başlat.</p>
            <button
              onClick={onOpenCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#eaeaea] transition-colors"
            >
              İlk Gönderiyi Paylaş
            </button>
          </div>
        ) : viewMode === 'feed' ? (
          <div className="mx-auto w-full max-w-[630px] space-y-0">
            {filteredTattoos.map((tattoo) => {
              const liked = tattooStore.isLiked(tattoo.id, currentUser.uid);
              const saved = tattooStore.isSaved(tattoo.id);
              const slides = getSlides(tattoo);
              const activeIndex = Math.min(activeSlides[tattoo.id] || 0, Math.max(0, slides.length - 1));
              const captionExpanded = Boolean(expandedCaptions[tattoo.id]);
              const daysAgo = (() => {
                const date = new Date(tattoo.createdAt);
                if (Number.isNaN(date.getTime())) return '';
                const diff = Math.max(0, Date.now() - date.getTime());
                const days = Math.floor(diff / 86400000);
                return days === 0 ? 'Bugün' : days === 1 ? 'Dün' : `${days} gün önce`;
              })();

              return (
                <article
                  key={tattoo.id}
                  className="overflow-hidden bg-black border-b border-white/10 pb-6 mb-6"
                >
                  <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => onSelectCreator(tattoo.creatorHandle)}
                      className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                    >
                      {tattoo.creatorPhoto ? (
                        <img src={tattoo.creatorPhoto} alt={tattoo.creatorName} className="w-10 h-10 rounded-full object-cover border border-white/15 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {tattoo.creatorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">{tattoo.creatorHandle}</span>
                          {tattoo.creatorVerified && <span className="text-[10px] text-blue-400">✓</span>}
                        </div>
                        <p className="text-[10px] text-[#777777] truncate">{tattoo.categoryName}{daysAgo ? ` · ${daysAgo}` : ''}</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="p-2 rounded-full text-[#666666] hover:text-white hover:bg-white/5"
                      aria-label="Gönderi seçenekleri"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </header>

                  <div
                    className="relative aspect-[4/5] sm:aspect-square rounded-[4px] bg-black overflow-hidden cursor-pointer border border-white/10"
                    onDoubleClick={() => !liked && toggleLike(tattoo.id)}
                    onClick={() => onSelectTattoo(tattoo)}
                  >
                    <img
                      src={slides[activeIndex] || tattoo.image}
                      alt={tattoo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {slides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlides((prev) => ({ ...prev, [tattoo.id]: activeIndex === 0 ? slides.length - 1 : activeIndex - 1 }));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10"
                          aria-label="Önceki görsel"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlides((prev) => ({ ...prev, [tattoo.id]: activeIndex === slides.length - 1 ? 0 : activeIndex + 1 }));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10"
                          aria-label="Sonraki görsel"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 rounded-full px-2 py-1 bg-black/35 backdrop-blur-sm">
                          {slides.map((_, idx) => (
                            <span key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === activeIndex ? 'bg-white' : 'bg-white/35'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="px-4 sm:px-5 pt-3.5 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => toggleLike(tattoo.id)}
                          className={`p-2 rounded-full transition-all ${liked ? 'text-red-500' : 'text-white hover:bg-white/10'}`}
                          aria-label={liked ? 'Beğeniyi kaldır' : 'Beğen'}
                        >
                          <Heart className={`w-6 h-6 ${liked ? 'fill-red-500' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTattoo(tattoo)}
                          className="p-2 rounded-full text-white hover:bg-white/5"
                          aria-label="Yorumlar"
                        >
                          <MessageCircle className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare(tattoo)}
                          className="p-2 rounded-full text-white hover:bg-white/5"
                          aria-label="Paylaş"
                        >
                          <Share2 className="w-6 h-6" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const next = tattooStore.toggleSaveTattoo(tattoo.id);
                          onToast(next ? 'Kaydedildi' : 'Kaydedilenlerden kaldırıldı');
                        }}
                        className={`p-2 rounded-full ${saved ? 'text-white' : 'text-white'} hover:bg-white/5`}
                        aria-label={saved ? 'Kaydı kaldır' : 'Kaydet'}
                      >
                        <Bookmark className={`w-6 h-6 ${saved ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    <p className="text-xs font-bold text-white mt-1">
                      {tattoo.likesCount.toLocaleString()} beğeni
                    </p>

                    <div className="mt-2 text-sm text-[#e8e8e8] leading-relaxed">
                      <span className="font-bold mr-2">{tattoo.creatorHandle}</span>
                      <span className={captionExpanded ? '' : 'line-clamp-2'}>{tattoo.description}</span>
                      {tattoo.description.length > 100 && (
                        <button
                          type="button"
                          onClick={() => setExpandedCaptions((prev) => ({ ...prev, [tattoo.id]: !captionExpanded }))}
                          className="text-[#777777] ml-1 cursor-pointer hover:text-white"
                        >
                          {captionExpanded ? 'daha az' : 'daha fazla'}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectTattoo(tattoo)}
                      className="text-xs text-[#777777] mt-2 hover:text-white cursor-pointer"
                    >
                      {tattoo.commentsCount > 0 ? `${tattoo.commentsCount} yorumu gör` : 'Yorum ekle...'}
                    </button>

                    {tattoo.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {tattoo.tags.slice(0, 5).map((tag) => (
                          <span key={tag} className="text-[10px] text-[#777777]">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredTattoos.map((tattoo) => {
              const liked = tattooStore.isLiked(tattoo.id, currentUser.uid);
              return (
                <div
                  key={tattoo.id}
                  onClick={() => onSelectTattoo(tattoo)}
                  className="group relative rounded-2xl overflow-hidden bg-[#121212] border border-white/10 hover:border-white/25 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                    <img src={tattoo.image} alt={tattoo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(tattoo.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:scale-110 transition-transform"
                      aria-label="Beğen"
                    >
                      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                  </div>
                  <div className="p-3.5">
                    <h4 className="text-sm font-bold text-white truncate">{tattoo.title}</h4>
                    <p onClick={(e) => { e.stopPropagation(); onSelectCreator(tattoo.creatorHandle); }} className="text-xs text-[#888888] hover:text-white cursor-pointer truncate mt-0.5">
                      {tattoo.creatorHandle}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#666666] pt-2 mt-2 border-t border-white/5">
                      <span>{tattoo.categoryName}</span>
                      <span className="flex items-center gap-1 text-white/80"><Heart className="w-3 h-3 fill-current" />{tattoo.likesCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
