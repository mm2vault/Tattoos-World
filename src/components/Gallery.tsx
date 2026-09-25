import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
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
  // Exact 5 popular items matching the image
  const popularTattoos = [
    {
      id: 'pop_butterfly',
      title: 'Butterfly',
      handle: '@lunatattoos',
      category: 'Minimal',
      likes: '0',
      image: './images/tattoos/butterfly_ink.jpg',
      fullTattoo: tattoos.find(t => t.id === 'tattoo_2') || tattoos[1],
    },
    {
      id: 'pop_snake',
      title: 'Snake',
      handle: '@darksoul',
      category: 'Seri',
      likes: '0',
      image: './images/tattoos/snake_serpent.jpg',
      fullTattoo: tattoos.find(t => t.id === 'tattoo_3') || tattoos[2],
    },
    {
      id: 'pop_rose',
      title: 'Rose',
      handle: '@inkedlife',
      category: 'Realizm',
      likes: '0',
      image: './images/tattoos/rose_dark.jpg',
      fullTattoo: tattoos.find(t => t.id === 'tattoo_4') || tattoos[3],
    },
    {
      id: 'pop_cross',
      title: 'Cross',
      handle: '@tattoartist',
      category: 'Minimal',
      likes: '0',
      image: './images/tattoos/cross_gothic.jpg',
      fullTattoo: tattoos.find(t => t.id === 'tattoo_5') || tattoos[4],
    },
    {
      id: 'pop_wolf',
      title: 'Wolf',
      handle: '@blackink',
      category: 'Realizm',
      likes: '0',
      image: './images/tattoos/wolf_dark.jpg',
      fullTattoo: tattoos.find(t => t.id === 'tattoo_6') || tattoos[5],
    },
  ];

  // Exact categories matching image
  const categoriesList: { id: CategoryId; name: string; image: string }[] = [
    { id: 'realism', name: 'Realizm', image: './images/tattoos/lion_clock.jpg' },
    { id: 'minimal', name: 'Minimal', image: './images/tattoos/butterfly_ink.jpg' },
    { id: 'black_and_grey', name: 'Siyah & Gri', image: './images/tattoos/rose_dark.jpg' },
    { id: 'color', name: 'Renkli', image: './images/tattoos/dragon_oriental.jpg' },
    { id: 'geometric', name: 'Geometrik', image: './images/tattoos/snake_serpent.jpg' },
    { id: 'animals', name: 'Diğer', image: './images/tattoos/cross_gothic.jpg' },
  ];

  // Filter tattoos based on search and category
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
        tattoo.creatorName.toLowerCase().includes(query))
    );
  });

  const handleLikeTattoo = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const res = tattooStore.toggleLike(id);
    onTattooUpdated();
    onToast(res.isLiked ? 'Beğenildi' : 'Beğeni kaldırıldı');
  };

  return (
    <div className="space-y-10 pb-8">
      
      {/* 1. POPÜLER DÖVMELER (Matching Mockup Top Section) */}
      {!searchQuery && selectedCategory === 'all' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Popüler Dövmeler
            </h2>
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs text-[#888888] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Tümünü Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5 Cards Row matching image */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {popularTattoos.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.fullTattoo) onSelectTattoo(item.fullTattoo);
                }}
                className="group relative rounded-2xl overflow-hidden bg-[#121212] border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer flex flex-col aspect-[3/4.5]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />

                {/* Bottom Details matching image */}
                <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] text-white font-semibold mb-1">
                    <Heart className="w-3 h-3 text-white fill-white" />
                    <span>{item.likes}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-tight truncate">
                    {item.title}
                  </h3>

                  <p 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCreator(item.handle);
                    }}
                    className="text-xs text-[#888888] hover:text-white transition-colors cursor-pointer truncate"
                  >
                    {item.handle}
                  </p>

                  <p className="text-[11px] text-[#666666]">
                    {item.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. KATEGORİLER (Matching Circular Cards in Image) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white font-display">
            Kategoriler
          </h2>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs text-[#888888] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Tüm Kategoriler</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-5 overflow-x-auto pb-2 scrollbar-none">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                className="group flex flex-col items-center gap-2 cursor-pointer shrink-0"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border p-0.5 transition-all ${
                  isSelected ? 'border-white ring-2 ring-white/40 scale-105' : 'border-white/15 hover:border-white/40'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25" />
                  </div>
                </div>

                <span className={`text-xs font-medium transition-colors ${
                  isSelected ? 'text-white font-bold' : 'text-[#888888] group-hover:text-white'
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. DISCOVER TATTOOS MASONRY STREAM */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white font-display">
            {searchQuery ? `"${searchQuery}" Sonuçları` : 'Keşfet'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredTattoos.map((tattoo) => {
            const liked = tattooStore.isLiked(tattoo.id, currentUser.uid);

            return (
              <div
                key={tattoo.id}
                onClick={() => onSelectTattoo(tattoo)}
                className="group relative rounded-2xl overflow-hidden bg-[#121212] border border-white/10 hover:border-white/25 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                  <img
                    src={tattoo.image}
                    alt={tattoo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                  {/* Like heart */}
                  <button
                    onClick={(e) => handleLikeTattoo(e, tattoo.id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:scale-110 transition-transform"
                    aria-label="Like"
                  >
                    <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-3.5 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight truncate group-hover:text-[#EAEAEA]">
                      {tattoo.title}
                    </h4>
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCreator(tattoo.creatorHandle);
                      }}
                      className="text-xs text-[#888888] hover:text-white transition-colors cursor-pointer truncate mt-0.5"
                    >
                      {tattoo.creatorHandle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#666666] pt-1 border-t border-white/5">
                    <span>{tattoo.categoryName}</span>
                    <span className="flex items-center gap-1 text-white/80">
                      <Heart className="w-3 h-3 fill-current" />
                      {tattoo.likesCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
