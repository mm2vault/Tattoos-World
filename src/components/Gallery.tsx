import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, ArrowRight, ChevronLeft, ChevronRight, Grid3X3, LayoutList, Link2, Flag, Trash2 } from 'lucide-react';
import { Tattoo, CategoryId, UserProfile, Story } from '../types';
import { tattooStore } from '../services/tattooStore';

interface GalleryProps {
  tattoos: Tattoo[];
  onSelectTattoo: (tattoo: Tattoo) => void;
  onSelectCreator: (handle: string) => void;
  onSelectProfile?: (profile: UserProfile) => void;
  onOpenCreate: () => void;
  searchQuery: string;
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  currentUser: UserProfile;
  onToast: (msg: string) => void;
  onTattooUpdated: () => void;
  onSearchChange: (query: string) => void;
  stories?: Story[];
  onOpenCreateStory?: () => void;
  onOpenStory?: (storyId: string) => void;
  initialViewMode?: 'feed' | 'grid';
}

export const Gallery: React.FC<GalleryProps> = ({
  tattoos,
  onSelectTattoo,
  onSelectCreator,
  onSelectProfile,
  onOpenCreate,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  currentUser,
  onToast,
  onTattooUpdated,
  onSearchChange,
  stories = [],
  onOpenCreateStory = () => {},
  onOpenStory = () => {},
  initialViewMode = 'feed',
}) => {
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>(initialViewMode);
  const [activeSlides, setActiveSlides] = useState<Record<string, number>>({});
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [doubleTapId, setDoubleTapId] = useState<string | null>(null);
  const [artistOnly, setArtistOnly] = useState(false);
  const [remoteProfiles, setRemoteProfiles] = useState<UserProfile[]>([]);
  const [searchFilter, setSearchFilter] = useState<'all' | 'people' | 'tattoos'>('all');

  useEffect(() => {
    if (initialViewMode === 'feed') {
      if (selectedCategory !== 'all') onSelectCategory('all');
      if (searchQuery) onSearchChange('');
      setArtistOnly(false);
    }
  }, [initialViewMode]);

  useEffect(() => {
    if (!searchQuery.trim()) setSearchFilter('all');
  }, [searchQuery]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2 || initialViewMode !== 'grid') {
      setRemoteProfiles([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const results = await tattooStore.searchPublicUsers(query);
      if (!cancelled) setRemoteProfiles(results);
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, initialViewMode]);

  const categoriesList: { id: CategoryId; name: string; image: string }[] = [
    { id: 'realism', name: 'Realizm', image: './images/tattoos/lion_clock.jpg' },
    { id: 'minimal', name: 'Minimal', image: './images/tattoos/butterfly_ink.jpg' },
    { id: 'black_and_grey', name: 'Siyah & Gri', image: './images/tattoos/rose_dark.jpg' },
    { id: 'color', name: 'Renkli', image: './images/tattoos/dragon_oriental.jpg' },
    { id: 'geometric', name: 'Geometrik', image: './images/tattoos/snake_serpent.jpg' },
    { id: 'animals', name: 'Hayvanlar', image: './images/tattoos/cross_gothic.jpg' },
  ];

  const trendingTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    tattoos.forEach((tattoo) => (tattoo.tags || []).forEach((tag) => {
      const clean = String(tag).trim().replace(/^#/, '');
      if (clean) counts.set(clean.toLowerCase(), (counts.get(clean.toLowerCase()) || 0) + 1);
    }));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [tattoos]);

  const styleCounts = React.useMemo(() => {
    const counts = new Map<CategoryId, number>();
    tattoos.forEach((tattoo) => counts.set(tattoo.category, (counts.get(tattoo.category) || 0) + 1));
    return counts;
  }, [tattoos]);

  const artistProfiles = React.useMemo(() => {
    const profiles = new Map<string, {
      handle: string;
      name: string;
      image: string;
      verified: boolean;
      posts: number;
      styles: string[];
    }>();

    tattoos.forEach((tattoo) => {
      const creatorRole = String(tattoo.creatorRole || '').trim().toLowerCase();
      const isArtist =
        creatorRole === 'artist' ||
        creatorRole.includes('sanat') ||
        Boolean(tattoo.creatorVerified);
      if (!isArtist) return;
      const handle = String(tattoo.creatorHandle || '').trim();
      if (!handle) return;
      const key = handle.toLowerCase();
      const existing = profiles.get(key);
      const style = tattoo.categoryName || '';
      if (existing) {
        existing.posts += 1;
        if (style && !existing.styles.includes(style) && existing.styles.length < 3) existing.styles.push(style);
        existing.verified = existing.verified || Boolean(tattoo.creatorVerified);
      } else {
        profiles.set(key, {
          handle,
          name: tattoo.creatorName || handle,
          image: tattoo.creatorPhoto || tattoo.image,
          verified: Boolean(tattoo.creatorVerified),
          posts: 1,
          styles: style ? [style] : [],
        });
      }
    });

    return Array.from(profiles.values())
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 8);
  }, [tattoos]);

  const filteredTattoos = tattoos.filter((tattoo) => {
    const matchesCategory = selectedCategory === 'all' || tattoo.category === selectedCategory;
    const creatorRole = String(tattoo.creatorRole || '').trim().toLowerCase();
    const matchesArtist =
      !artistOnly ||
      creatorRole === 'artist' ||
      creatorRole.includes('sanat') ||
      Boolean(tattoo.creatorVerified);
    const query = searchQuery.toLowerCase().trim();
    const normalizedQuery = query.replace(/^#/, '').replace(/^@/, '');
    if (!query) return matchesCategory && matchesArtist;

    return (
      matchesCategory &&
      matchesArtist &&
      (String(tattoo.title || '').toLowerCase().includes(normalizedQuery) ||
        String(tattoo.description || '').toLowerCase().includes(normalizedQuery) ||
        String(tattoo.categoryName || '').toLowerCase().includes(normalizedQuery) ||
        String(tattoo.creatorHandle || '').toLowerCase().includes(normalizedQuery) ||
        String(tattoo.creatorName || '').toLowerCase().includes(normalizedQuery) ||
        (Array.isArray(tattoo.tags) && tattoo.tags.some((tag) => String(tag).replace(/^#/, '').toLowerCase().includes(normalizedQuery))))
    );
  }).sort((a, b) => {
    const ad = new Date(a.createdAt).getTime() || 0;
    const bd = new Date(b.createdAt).getTime() || 0;
    return bd - ad;
  });

  const toggleLike = (id: string) => {
    const res = tattooStore.toggleLike(id);
    onTattooUpdated();
    onToast(res.isLiked ? 'Beğenildi' : 'Beğeni kaldırıldı');
  };

  const buildPostUrl = (tattooId: string) => {
    const url = new URL(window.location.href);
    url.hash = `post=${encodeURIComponent(tattooId)}`;
    return url.toString();
  };

  const handleShare = async (tattoo: Tattoo) => {
    try {
      const shareUrl = buildPostUrl(tattoo.id);
      if (navigator.share) {
        await navigator.share({
          title: tattoo.title,
          text: `@${tattoo.creatorHandle.replace(/^@/, '')} tarafından paylaşılan dövme`,
          url: shareUrl,
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        onToast('Gönderi bağlantısı kopyalandı');
        return;
      }
      onToast('Bağlantı kopyalanamadı');
    } catch {
      // User closed the share dialog.
    }
  };

  const handlePostAction = async (action: 'copy' | 'report' | 'delete' | 'open', tattoo: Tattoo) => {
    setOpenMenuId(null);
    if (action === 'open') {
      onSelectTattoo(tattoo);
      return;
    }
    if (action === 'copy') {
      try {
        const url = buildPostUrl(tattoo.id);
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          onToast('Gönderi bağlantısı kopyalandı');
        } else {
          onToast('Bağlantı kopyalanamadı');
        }
      } catch {
        onToast('Bağlantı kopyalanamadı');
      }
      return;
    }
    if (action === 'report') {
      const reason = window.prompt('Bu gönderiyi neden bildirmek istiyorsun?');
      if (!reason?.trim()) return;
      const ok = await tattooStore.reportTattoo(tattoo.id, reason);
      onToast(ok ? 'Bildirim alındı.' : 'Bildirim gönderilemedi.');
      return;
    }

    const confirmed = window.confirm('Bu gönderiyi silmek istediğine emin misin?');
    if (!confirmed) return;
    const deleted = tattooStore.deleteTattoo(tattoo.id, currentUser);
    if (deleted) {
      onTattooUpdated();
      onToast('Gönderi silindi.');
    } else {
      onToast('Bu gönderiyi silme yetkin yok.');
    }
  };

  const getSlides = (tattoo: Tattoo) => Array.from(new Set([tattoo.image, ...(tattoo.additionalImages || [])].filter(Boolean))).slice(0, 10);

  const profileResults = React.useMemo(() => {
    const profiles = new Map<string, {
      handle: string;
      name: string;
      image: string;
      role: string;
      verified: boolean;
    }>();

    const currentHandle = String(currentUser.handle || '').trim();
    if (currentHandle) {
      profiles.set(currentHandle.toLowerCase(), {
        handle: currentHandle,
        name: currentUser.displayName || currentHandle,
        image: currentUser.photoURL || './images/users/avatar_inkedlife.jpg',
        role: currentUser.isArtist ? 'Sanatçı' : 'Üye',
        verified: Boolean(currentUser.verified),
      });
    }

    tattoos.forEach((tattoo) => {
      const handle = String(tattoo.creatorHandle || '').trim();
      if (!handle) return;
      const key = handle.toLowerCase();
      if (profiles.has(key)) {
        const existing = profiles.get(key)!;
        profiles.set(key, {
          ...existing,
          role: existing.role === 'Sanatçı' || tattoo.creatorRole === 'artist' ? 'Sanatçı' : existing.role,
          verified: existing.verified || Boolean(tattoo.creatorVerified),
        });
        return;
      }
      profiles.set(key, {
        handle,
        name: tattoo.creatorName || handle,
        image: tattoo.creatorPhoto || tattoo.image,
        role: tattoo.creatorRole === 'artist' ? 'Sanatçı' : 'Üye',
        verified: Boolean(tattoo.creatorVerified),
      });
    });

    const query = searchQuery.trim().toLowerCase().replace(/^@/, '');
    const merged = new Map<string, {
      handle: string;
      name: string;
      image: string;
      role: string;
      verified: boolean;
    }>();

    Array.from(profiles.values()).forEach((profile) => {
      if (!query || profile.handle.toLowerCase().replace(/^@/, '').includes(query) || profile.name.toLowerCase().includes(query)) {
        merged.set(profile.handle.toLowerCase(), profile);
      }
    });

    remoteProfiles.forEach((profile) => {
      const handle = String(profile.handle || '').trim();
      if (!handle) return;
      const key = handle.toLowerCase();
      merged.set(key, {
        handle,
        name: profile.displayName || handle,
        image: profile.photoURL || './images/users/avatar_inkedlife.jpg',
        role: profile.isArtist || profile.role === 'artist' ? 'Sanatçı' : 'Üye',
        verified: Boolean(profile.verified),
      });
    });

    return Array.from(merged.values()).slice(0, 12);
  }, [currentUser, searchQuery, tattoos, remoteProfiles]);

  const storyCreators = React.useMemo(() => {
    const active = stories
      .filter((story) => new Date(story.expiresAt).getTime() > Date.now())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const grouped = new Map<string, { handle: string; name: string; image: string; storyId: string; hasUnseen: boolean }>();

    active.forEach((story) => {
      const key = story.creatorId;
      if (grouped.has(key)) {
        const current = grouped.get(key)!;
        current.hasUnseen = current.hasUnseen || !story.viewedBy.includes(currentUser.uid);
        return;
      }
      grouped.set(key, {
        handle: story.creatorHandle,
        name: story.creatorName || story.creatorHandle,
        image: story.creatorPhoto || story.mediaUrl,
        storyId: story.id,
        hasUnseen: !story.viewedBy.includes(currentUser.uid),
      });
    });

    const mine = grouped.get(currentUser.uid);
    const others = Array.from(grouped.values())
      .filter((creator) => creator.handle.toLowerCase() !== String(currentUser.handle || '').toLowerCase())
      .slice(0, 9);

    return [
      {
        handle: currentUser.handle || '@sen',
        name: 'Hikâyen',
        image: currentUser.photoURL || './images/users/avatar_inkedlife.jpg',
        storyId: mine?.storyId || '',
        hasStory: Boolean(mine),
        hasUnseen: mine?.hasUnseen || false,
        isCurrentUser: true,
      },
      ...others.map((creator) => ({
        ...creator,
        hasStory: true,
        isCurrentUser: false,
      })),
    ];
  }, [stories, currentUser.uid, currentUser.handle, currentUser.photoURL]);

  return (
    <div className="w-full pb-12">
      <section className="border-b border-white/[0.08] pb-4 mb-2">
        <div className="mx-auto w-full max-w-[640px] overflow-x-auto scrollbar-none">
          <div className="flex gap-4 px-4 sm:px-2 py-1">
            {storyCreators.map((creator) => (
              <button
                key={creator.handle}
                type="button"
                onClick={() => {
                  if (creator.hasStory && creator.storyId) onOpenStory(creator.storyId);
                  else onOpenCreateStory();
                }}
                className="w-[68px] shrink-0 flex flex-col items-center gap-1.5 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                <div className={"relative rounded-full p-[2px] " + (creator.hasUnseen ? 'bg-gradient-to-tr from-white via-white/70 to-white/20' : 'bg-white/20')}>
                  <div className="w-[58px] h-[58px] rounded-full bg-black p-[2px]">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-full h-full rounded-full object-cover border border-black"
                    />
                  </div>
                  {creator.isCurrentUser && (
                    <span
                      className="absolute -right-0.5 bottom-0.5 w-5 h-5 rounded-full bg-white text-black border-2 border-black flex items-center justify-center text-[12px] font-bold leading-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCreateStory();
                      }}
                    >
                      +
                    </span>
                  )}
                </div>
                <span className="w-full truncate text-[11px] text-[#c7c7c7]">{creator.name}</span>
              </button>
            ))}
            {storyCreators.length === 1 && (
              <button
                type="button"
                onClick={onOpenCreateStory}
                className="w-[68px] shrink-0 flex flex-col items-center gap-1.5 cursor-pointer text-[#777] hover:text-white"
              >
                <div className="w-[62px] h-[62px] rounded-full border border-dashed border-white/20 bg-white/[0.03] flex items-center justify-center">
                  <span className="text-xl">+</span>
                </div>
                <span className="text-[11px]">Hikâye ekle</span>
              </button>
            )}
          </div>
        </div>
      </section>
      {viewMode === 'grid' && (
      <section className="px-3 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${selectedCategory === 'all' ? 'bg-white text-black border-white' : 'bg-[#111111] text-[#999999] border-white/10 hover:text-white'}`}
          >
            Tümü
          </button>
          {categoriesList.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${selectedCategory === category.id ? 'bg-white text-black border-white' : 'bg-[#111111] text-[#999999] border-white/10 hover:text-white'}`}
            >
              <img src={category.image} alt="" className="w-5 h-5 rounded-full object-cover" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </section>
      )}

      {viewMode === 'grid' && !searchQuery.trim() && artistProfiles.length > 0 && (
        <section className="px-3 sm:px-0 space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="tw-kicker">INK ARTISTS</p>
              <h2 className="text-sm sm:text-base font-semibold text-white mt-1">Sanatçıları keşfet</h2>
              <p className="text-[10px] text-[#666] mt-0.5">Portföylerini incele ve doğrudan iletişime geç</p>
            </div>
            <button
              type="button"
              onClick={() => setArtistOnly((value) => !value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-colors cursor-pointer ${artistOnly ? 'bg-white text-black border-white' : 'bg-white/5 text-[#aaa] border-white/10 hover:text-white'}`}
            >
              {artistOnly ? 'Tüm gönderiler' : 'Sadece sanatçılar'}
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
            {artistProfiles.map((artist) => (
              <a
                key={artist.handle}
                href={'#profile=' + encodeURIComponent(artist.handle.replace(/^@/, ''))}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectCreator(artist.handle);
                }}
                className="relative z-20 pointer-events-auto group min-w-[190px] sm:min-w-[215px] rounded-2xl border border-white/10 bg-[#101010] p-3 text-left hover:border-white/25 hover:bg-white/[0.035] transition-all cursor-pointer no-underline"
                aria-label={artist.name + ' profilini aç'}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/15 shrink-0 group-hover:border-white/30 transition-colors"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{artist.name}</span>
                      {artist.verified && <span className="text-[9px] text-sky-300">✓</span>}
                    </span>
                    <span className="block text-[10px] text-[#666] truncate">{artist.handle}</span>
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[9px] text-[#777]">{artist.posts} portföy paylaşımı</span>
                  <span className="text-[9px] text-white/60 group-hover:text-white transition-colors">Profili aç →</span>
                </div>
                {artist.styles.length > 0 && (
                  <div className="flex gap-1 mt-2 overflow-hidden">
                    {artist.styles.map((style) => (
                      <span key={style} className="px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] text-[#999] whitespace-nowrap">
                        {style}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {viewMode === 'grid' && !searchQuery.trim() && (
        <section className="px-3 sm:px-0 space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white">Tattoo stillerini keşfet</h2>
            <p className="text-[10px] text-[#666] mt-0.5">Topluluktaki en çok kullanılan tarzlara göz at</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {categoriesList.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className={`group relative h-24 sm:h-28 overflow-hidden rounded-2xl border transition-all cursor-pointer ${
                  selectedCategory === category.id ? 'border-white' : 'border-white/10 hover:border-white/25'
                }`}
              >
                <img src={category.image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 p-2 text-left">
                  <p className="text-[11px] font-bold text-white">{category.name}</p>
                  <p className="text-[9px] text-white/60">{styleCounts.get(category.id) || 0} paylaşım</p>
                </div>
              </button>
            ))}
          </div>

          {trendingTags.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#101010] p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-white">Trend etiketler</h3>
                  <p className="text-[9px] text-[#666] mt-0.5">Toplulukta öne çıkan dövme etiketleri</p>
                </div>
                <span className="text-[9px] text-[#555]">#{trendingTags.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trendingTags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSearchChange('#' + tag)}
                    className="px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#bbb] hover:text-white hover:border-white/25 transition-colors cursor-pointer"
                  >
                    #{tag} <span className="text-[#666] ml-0.5">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {viewMode === 'grid' && searchQuery.trim() && (
        <section className="px-3 sm:px-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2">
            {[
              { id: 'all' as const, label: 'Tümü', count: profileResults.length + filteredTattoos.length },
              { id: 'people' as const, label: 'Kişiler', count: profileResults.length },
              { id: 'tattoos' as const, label: 'Dövmeler', count: filteredTattoos.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSearchFilter(tab.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold border transition-colors cursor-pointer ${
                  searchFilter === tab.id
                    ? 'bg-white text-black border-white'
                    : 'bg-[#111] text-[#888] border-white/10 hover:text-white'
                }`}
              >
                {tab.label}
                <span className={searchFilter === tab.id ? 'ml-1 opacity-60' : 'ml-1 text-[#555]'}>{tab.count}</span>
              </button>
            ))}
          </div>

          {(searchFilter === 'all' || searchFilter === 'people') && profileResults.length > 0 && (
        <section className="px-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-white">Kişiler ve sanatçılar</h2>
              <p className="text-[10px] text-[#666] mt-0.5">
                {profileResults.length} profil{remoteProfiles.length > 0 ? ' · Topluluktan' : ''}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {profileResults.map((profile) => (
              <button
                key={profile.handle}
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (onSelectProfile) onSelectProfile(profile);
                  else onSelectCreator(profile.handle);
                }}
                onTouchStart={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (onSelectProfile) onSelectProfile(profile);
                  else onSelectCreator(profile.handle);
                }}
                className="relative z-30 pointer-events-auto touch-manipulation flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#111111] px-3 py-2.5 text-left hover:border-white/20 hover:bg-white/[0.04] transition-colors cursor-pointer"
                aria-label={profile.name + ' profilini aç'}
              >
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-semibold text-white truncate">{profile.name}</span>
                    {profile.verified && <span className="text-[9px] text-sky-300">✓</span>}
                  </span>
                  <span className="block text-[10px] text-[#777] truncate">@{profile.handle.replace(/^@/, '')}</span>
                  <span className="block text-[10px] text-[#555] mt-0.5">{profile.role}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
          )}

          {searchFilter === 'people' && profileResults.length === 0 && (
            <div className="py-10 text-center text-xs text-[#666]">Bu arama için kullanıcı bulunamadı.</div>
          )}
        </section>
      )}

      <section className={`space-y-3 pt-1 ${searchQuery.trim() && searchFilter === 'people' ? 'hidden' : ''}`}>
        {viewMode === 'grid' && (
          <div className="flex items-center justify-between px-3 sm:px-0">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">
                {searchQuery ? `"${searchQuery}" sonuçları` : 'Keşfet'}
              </h2>
              <p className="text-[10px] text-[#666] mt-0.5">
                {filteredTattoos.length} dövme
              </p>
            </div>
            <span className="text-[10px] text-[#666] hidden sm:block">Sanatçıları ve stilleri keşfet</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className={`sm:block ${viewMode === 'feed' ? 'hidden' : 'block'}`}>
            <h2 className="text-sm sm:text-base font-semibold text-white sr-only">
              {searchQuery ? `"${searchQuery}" Sonuçları` : 'Keşfet'}
            </h2>
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-xl bg-[#111111] border border-white/10 ${viewMode === 'feed' ? 'hidden sm:flex' : 'flex'}`}>
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

        {searchQuery.trim() && searchFilter === 'people' ? null : filteredTattoos.length === 0 ? (
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
          <div className="mx-auto w-full max-w-[620px]">
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
                  className="overflow-hidden bg-black border-b border-white/[0.08] pb-8 mb-8"
                >
                  <header className="flex items-center justify-between gap-3 px-1 sm:px-2 py-3">
                    <button
                      type="button"
                      onClick={() => onSelectCreator(tattoo.creatorHandle)}
                      className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                    >
                      {tattoo.creatorPhoto ? (
                        <img src={tattoo.creatorPhoto} alt={tattoo.creatorName} className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {tattoo.creatorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-white truncate">{tattoo.creatorHandle}</span>
                          {tattoo.creatorVerified && <span className="text-[10px] text-blue-400">✓</span>}
                        </div>
                        <p className="text-[10px] text-[#777777] truncate">{tattoo.categoryName}{daysAgo ? ` · ${daysAgo}` : ''}</p>
                      </div>
                    </button>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((current) => current === tattoo.id ? null : tattoo.id);
                        }}
                        className="p-2 rounded-full text-[#666666] hover:text-white hover:bg-white/5 cursor-pointer"
                        aria-label="Gönderi seçenekleri"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {openMenuId === tattoo.id && (
                        <div
                          className="absolute right-0 top-10 z-30 w-48 rounded-2xl border border-white/10 bg-[#151515] shadow-2xl overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button type="button" onClick={() => handlePostAction('open', tattoo)} className="w-full px-4 py-3 text-left text-xs text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer">
                            <ArrowRight className="w-4 h-4" />
                            Gönderiyi aç
                          </button>
                          <button type="button" onClick={() => handlePostAction('copy', tattoo)} className="w-full px-4 py-3 text-left text-xs text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer">
                            <Link2 className="w-4 h-4" />
                            Bağlantıyı kopyala
                          </button>
                          <button type="button" onClick={() => handlePostAction('report', tattoo)} className="w-full px-4 py-3 text-left text-xs text-[#f0c6c6] hover:bg-white/5 flex items-center gap-2 cursor-pointer">
                            <Flag className="w-4 h-4" />
                            Bildir
                          </button>
                          {(tattoo.creatorId === currentUser.uid || String(tattoo.creatorHandle || '').toLowerCase() === String(currentUser.handle || '').toLowerCase() || tattooStore.isCurrentUserAdmin()) && (
                            <button type="button" onClick={() => handlePostAction('delete', tattoo)} className="w-full px-4 py-3 text-left text-xs text-red-300 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                              Gönderiyi sil
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </header>

                  <div
                    className="relative aspect-[4/5] sm:aspect-square bg-black overflow-hidden cursor-pointer"
                    onDoubleClick={() => {
                      if (liked) return;
                      toggleLike(tattoo.id);
                      setDoubleTapId(tattoo.id);
                      window.setTimeout(() => setDoubleTapId((current) => current === tattoo.id ? null : current), 850);
                    }}
                    onClick={() => onSelectTattoo(tattoo)}
                  >
                    <img
                      src={slides[activeIndex] || tattoo.image}
                      alt={tattoo.title}
                      className="w-full h-full object-cover select-none"
                      loading="lazy"
                      draggable={false}
                    />

                    {doubleTapId === tattoo.id && (
                      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                        <Heart className="w-28 h-28 text-white fill-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.55)] animate-[ping_0.7s_ease-out_1]" />
                      </div>
                    )}

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

                  <div className="px-1 sm:px-2 pt-3 pb-1">
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
                          onTattooUpdated();
                          onToast(next ? 'Kaydedildi' : 'Kaydedilenlerden kaldırıldı');
                        }}
                        className={`p-2 rounded-full ${saved ? 'text-white' : 'text-white'} hover:bg-white/5`}
                        aria-label={saved ? 'Kaydı kaldır' : 'Kaydet'}
                      >
                        <Bookmark className={`w-6 h-6 ${saved ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    <p className="text-[13px] font-semibold text-white mt-1.5">
                      {tattoo.likesCount.toLocaleString()} beğeni
                    </p>

                    <div className="mt-2 text-[13px] text-[#e8e8e8] leading-[1.45]">
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
                      className="text-[11px] text-[#707070] mt-2 hover:text-white cursor-pointer"
                    >
                      {tattoo.commentsCount > 0 ? `${tattoo.commentsCount} yorumu gör` : 'Yorum ekle...'}
                    </button>

                    {tattoo.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-x-2 gap-y-1 mt-3">
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
          <div className="grid grid-cols-3 gap-[2px] sm:gap-[3px] bg-black">
            {filteredTattoos.map((tattoo) => {
              const liked = tattooStore.isLiked(tattoo.id, currentUser.uid);
              return (
                <div
                  key={tattoo.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectTattoo(tattoo)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTattoo(tattoo);
                    }
                  }}
                  className="group relative aspect-square overflow-hidden bg-[#111] cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/50"
                >
                  <div className="relative w-full h-full overflow-hidden bg-black">
                    <img src={tattoo.image} alt={tattoo.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(tattoo.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/55 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label="Beğen"
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] sm:text-xs font-semibold text-white truncate">{tattoo.creatorHandle}</p>
                      <p className="text-[9px] sm:text-[11px] text-white/70 truncate">{tattoo.categoryName}</p>
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
