import React, { useState, useRef, useMemo } from 'react';
import { 
  CheckCircle2, Globe, Sparkles, 
  Edit3, Heart, Image as ImageIcon, X, Save, 
  Camera, Trash2, Plus, Upload, ShieldCheck,
  ExternalLink, Link as LinkIcon, Check, AlertCircle
} from 'lucide-react';
import { Tattoo, UserProfile, SupportedLanguage } from '../types';
import { tattooStore } from '../services/tattooStore';
import { 
  detectPlatform, 
  getProfileDetectedLinks, 
  normalizeUrl, 
  DetectedPlatform 
} from '../utils/linkDetector';

interface ProfileViewProps {
  profileUser: UserProfile;
  currentUser: UserProfile;
  tattoos: Tattoo[];
  onSelectTattoo: (tattoo: Tattoo) => void;
  onOpenCreate: () => void;
  currentLanguage: SupportedLanguage;
  onToast: (msg: string) => void;
  onUserUpdated: (user: UserProfile) => void;
  onTattooUpdated?: () => void;
  initialTab?: 'creations' | 'about' | 'favorites';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileUser,
  currentUser,
  tattoos,
  onSelectTattoo,
  onOpenCreate,
  onToast,
  onUserUpdated,
  onTattooUpdated,
  initialTab = 'creations',
}) => {
  const [activeTab, setActiveTab] = useState<'creations' | 'about' | 'favorites'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tattooToDelete, setTattooToDelete] = useState<Tattoo | null>(null);

  const isOwnProfile = 
    profileUser.uid === currentUser.uid || 
    profileUser.handle.toLowerCase() === currentUser.handle.toLowerCase();

  const isFollowing = tattooStore.isFollowing(profileUser.handle);

  // Hidden file inputs for direct one-click upload
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editName, setEditName] = useState(currentUser.displayName);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editPhotoURL, setEditPhotoURL] = useState(currentUser.photoURL || '');
  const [editBannerURL, setEditBannerURL] = useState(currentUser.bannerURL || '');
  
  // Custom Links Editor State
  const [editCustomLinks, setEditCustomLinks] = useState<string[]>([]);
  const [newLinkInput, setNewLinkInput] = useState('');
  const [linkInputError, setLinkInputError] = useState('');

  // Detected platform in real-time as user types into newLinkInput
  const previewDetection = useMemo(() => {
    if (!newLinkInput.trim()) return null;
    return detectPlatform(newLinkInput);
  }, [newLinkInput]);

  // Detected links displayed on the profile header
  const profileDetectedLinks = useMemo(() => {
    return getProfileDetectedLinks(profileUser);
  }, [profileUser]);

  // Open Edit Modal with fresh data from currentUser
  const openEditModal = () => {
    setEditName(currentUser.displayName);
    setEditBio(currentUser.bio);
    setEditPhotoURL(currentUser.photoURL || '');
    setEditBannerURL(currentUser.bannerURL || '');

    // Initialize custom links
    const initialLinks: string[] = [];
    if (currentUser.customLinks && currentUser.customLinks.length > 0) {
      initialLinks.push(...currentUser.customLinks);
    } else {
      // Fallback from legacy fields
      const existing = getProfileDetectedLinks(currentUser);
      existing.forEach(e => initialLinks.push(e.sanitizedUrl));
    }
    setEditCustomLinks(initialLinks);
    setNewLinkInput('');
    setLinkInputError('');
    setEditModalOpen(true);
  };

  const handleToggleFollow = () => {
    const following = tattooStore.toggleFollow(profileUser.handle);
    onToast(following ? `${profileUser.handle} takip ediliyor` : 'Takipten çıkıldı');
  };

  // Direct banner upload from cover button
  const handleDirectBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = tattooStore.updateProfile({ bannerURL: result });
      onUserUpdated(updated);
      setEditBannerURL(result);
      onToast('Kapak fotoğrafı güncellendi');
    };
    reader.readAsDataURL(file);
  };

  // Direct avatar (PP) upload from avatar overlay
  const handleDirectAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = tattooStore.updateProfile({ photoURL: result });
      onUserUpdated(updated);
      setEditPhotoURL(result);
      onToast('Profil fotoğrafı güncellendi');
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar inside modal
  const handleModalAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload banner inside modal
  const handleModalBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditBannerURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add a link from input to custom links list
  const handleAddLink = () => {
    setLinkInputError('');
    if (!newLinkInput.trim()) {
      setLinkInputError('Lütfen bir bağlantı adresi girin');
      return;
    }

    const normalized = normalizeUrl(newLinkInput.trim());
    if (!normalized || normalized === 'https://') {
      setLinkInputError('Geçerli bir web veya profil adresi girin');
      return;
    }

    // Check if already in list
    if (editCustomLinks.some(l => l.toLowerCase() === normalized.toLowerCase())) {
      setLinkInputError('Bu bağlantı zaten listenizde mevcut');
      return;
    }

    const platform = detectPlatform(normalized);
    setEditCustomLinks(prev => [...prev, normalized]);
    setNewLinkInput('');
    setLinkInputError('');
    onToast(`${platform ? platform.name : 'Bağlantı'} başarıyla eklendi`);
  };

  // Remove a link from custom links list
  const handleRemoveLink = (urlToRemove: string) => {
    setEditCustomLinks(prev => prev.filter(u => u !== urlToRemove));
  };

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // Map backwards compatible fields
    const instaLink = editCustomLinks.find(l => l.includes('instagram.com'));
    const tiktokLink = editCustomLinks.find(l => l.includes('tiktok.com'));
    const webLink = editCustomLinks.find(l => 
      !l.includes('instagram.com') && 
      !l.includes('tiktok.com') && 
      !l.includes('facebook.com') && 
      !l.includes('youtube.com')
    );

    const updated: UserProfile = {
      ...currentUser,
      displayName: editName.trim() || currentUser.displayName,
      bio: editBio.trim(),
      photoURL: editPhotoURL || currentUser.photoURL,
      bannerURL: editBannerURL || currentUser.bannerURL,
      customLinks: editCustomLinks,
      instagram: instaLink || currentUser.instagram || '',
      tiktok: tiktokLink || currentUser.tiktok || '',
      website: webLink || currentUser.website || '',
    };

    tattooStore.setCurrentUser(updated);
    tattooStore.updateProfile(updated);
    onUserUpdated(updated);
    setEditModalOpen(false);
    onToast('Profil ve sosyal medya bağlantıları güncellendi');
  };

  // Delete a tattoo trigger - opens custom in-app confirmation modal
  const handleDeleteTattoo = (e: React.MouseEvent, item: Tattoo) => {
    e.stopPropagation();
    setTattooToDelete(item);
  };

  const confirmDeleteTattoo = () => {
    if (!tattooToDelete) return;
    const ok = tattooStore.deleteTattoo(tattooToDelete.id, currentUser);
    if (ok) {
      onToast(`"${tattooToDelete.title}" başarıyla silindi`);
      if (onTattooUpdated) onTattooUpdated();
    }
    setTattooToDelete(null);
  };

  // User's own creations
  const userTattoos = tattoos.filter(
    (item) => item.creatorId === profileUser.uid || item.creatorHandle.toLowerCase() === profileUser.handle.toLowerCase()
  );

  const favoriteTattoos = tattoos.filter((item) =>
    (profileUser.savedTattooIds || []).includes(item.id)
  );

  const displayBanner = profileUser.bannerURL || './images/tattoos/hero_sleeve.jpg';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Hidden File Inputs for Direct One-Click Change */}
      <input
        ref={bannerFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectBannerUpload}
        className="hidden"
      />
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectAvatarUpload}
        className="hidden"
      />

      {/* Profile Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0d0d0d] border border-white/10 shadow-2xl">
        
        {/* Banner Cover Artwork (profilin arkasındaki resim) */}
        <div 
          className="h-44 sm:h-56 w-full bg-cover bg-center relative transition-all duration-300"
          style={{ backgroundImage: `url('${displayBanner}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-black/30" />

          {/* If own profile: Quick "Kapağı Değiştir" button */}
          {isOwnProfile && (
            <button
              onClick={() => bannerFileInputRef.current?.click()}
              className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer shadow-lg hover:scale-105"
              title="Kapak / Arka Plan Fotoğrafını Değiştir"
            >
              <Camera className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span className="hidden sm:inline">Kapağı Değiştir</span>
            </button>
          )}
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-6 -mt-16 sm:-mt-20 relative z-10 flex flex-col items-center text-center">
          
          {/* Avatar (PP) with verified checkmark & hover camera button */}
          <div className="relative mb-3 group">
            <img
              src={profileUser.photoURL || './images/users/avatar_inkedlife.jpg'}
              alt={profileUser.displayName}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#0d0d0d] shadow-2xl bg-black"
            />
            
            {/* Blue Verified Badge or Admin Badge */}
            {profileUser.isAdmin ? (
              <span className="bg-amber-500 text-black text-[10px] font-bold p-1 rounded-full absolute bottom-1 right-1 border-2 border-[#0d0d0d] shadow" title="Master Admin">
                👑
              </span>
            ) : (
              <CheckCircle2 className="w-5 h-5 text-blue-400 bg-black rounded-full absolute bottom-1 right-1 border border-black" />
            )}

            {/* If own profile: Hover camera overlay to change PP */}
            {isOwnProfile && (
              <button
                onClick={() => avatarFileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity border-4 border-[#0d0d0d]"
                title="Profil Fotoğrafını Değiştir"
              >
                <Camera className="w-5 h-5 mb-0.5 text-[#CCFF00]" />
                <span className="text-[9px] font-bold">Değiştir</span>
              </button>
            )}
          </div>

          {/* Name & Handle & Stats */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-1.5 font-display">
              <span>{profileUser.displayName || profileUser.handle}</span>
            </h1>
            
            <p className="text-xs text-[#888888] flex items-center justify-center gap-2">
              <span className="text-[#AAAAAA]">{profileUser.handle}</span>
              <span>•</span>
              <span>{profileUser.isAdmin ? 'Master Admin' : (profileUser.isArtist ? 'Tattoo Artist' : 'Dövme Tutkunu')}</span>
              <span>•</span>
              <span>{profileUser.followersCount > 1000 ? (profileUser.followersCount / 1000).toFixed(1) + 'K' : profileUser.followersCount} Takipçi</span>
              <span>•</span>
              <span>{userTattoos.length} Paylaşım</span>
            </p>

            <p className="text-xs text-[#CCCCCC] max-w-md mx-auto pt-1 leading-relaxed">
              {profileUser.bio || 'Sanat, hayatın en gerçek halidir. Daha fazla dövme, daha fazla hikaye...'}
            </p>
          </div>

          {/* Action Buttons: Takip Et / Profili Düzenle / Dövme Ekle */}
          <div className="mt-4 flex items-center gap-2">
            {isOwnProfile ? (
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Profili Düzenle</span>
              </button>
            ) : (
              <button
                onClick={handleToggleFollow}
                className={`px-8 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-md ${
                  isFollowing
                    ? 'bg-white/15 text-white hover:bg-red-500/20 hover:text-red-400'
                    : 'bg-white text-black hover:bg-[#EAEAEA]'
                }`}
              >
                {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
              </button>
            )}

            {isOwnProfile && (
              <button
                onClick={onOpenCreate}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dövme Ekle</span>
              </button>
            )}
          </div>

          {/* ================= AUTO-DETECTED PROFILE LINKS ================= */}
          {/* Automatically recognized buttons (TikTok, Instagram, Facebook, YouTube, etc.) */}
          <div className="w-full max-w-2xl mt-5 pt-4 border-t border-white/5">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {profileDetectedLinks.length > 0 ? (
                profileDetectedLinks.map((link, idx) => (
                  <a
                    key={`${link.id}-${idx}`}
                    href={link.sanitizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${link.name}: ${link.sanitizedUrl} (Yeni sekmede açılır)`}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border cursor-pointer shadow-sm group transition-all duration-200 hover:scale-[1.04] ${link.badgeBg} ${link.borderColor} ${link.textColor} ${link.hoverBg}`}
                  >
                    <span className="shrink-0 transition-transform group-hover:scale-110">
                      {link.icon('w-4 h-4')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[12px]">{link.name}</span>
                      {link.displayLabel && link.displayLabel !== link.name && (
                        <span className="text-[10px] text-white/60 max-w-[110px] truncate">
                          {link.displayLabel}
                        </span>
                      )}
                      <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                  </a>
                ))
              ) : (
                !isOwnProfile && (
                  <p className="text-xs text-[#777777] italic py-1">Bağlantı eklenmemiş</p>
                )
              )}

              {/* If own profile: Quick button to add social/app links */}
              {isOwnProfile && (
                <button
                  onClick={openEditModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/50 text-xs text-[#BBBBBB] hover:text-white transition-all cursor-pointer"
                  title="TikTok, Instagram, Facebook veya Web Sitesi linkinizi ekleyin"
                >
                  <Plus className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span className="font-semibold">
                    {profileDetectedLinks.length === 0 ? '+ Sosyal Medya Linki Ekle (TikTok, Instagram, Facebook...)' : '+ Link Ekle'}
                  </span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Paylaşımlar / Hakkında / Favorilerim */}
      <div className="flex items-center justify-center gap-8 border-b border-white/10 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('creations')}
          className={`pb-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'creations'
              ? 'text-white border-b-2 border-white'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <span>Paylaşımlar</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
            {userTattoos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`pb-2 transition-all cursor-pointer ${
            activeTab === 'about'
              ? 'text-white border-b-2 border-white'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Hakkında
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'favorites'
              ? 'text-white border-b-2 border-white'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <span>Favorilerim</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
            {favoriteTattoos.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Paylaşımlar (Creations) with Delete Option */}
      {activeTab === 'creations' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {userTattoos.length > 0 ? (
            userTattoos.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectTattoo(item)}
                className="group relative rounded-2xl overflow-hidden bg-[#141414] border border-white/10 aspect-[3/3.8] cursor-pointer shadow-lg hover:border-white/30 transition-all"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Delete button for owner or admin */}
                {(isOwnProfile || currentUser.isAdmin) && (
                  <button
                    onClick={(e) => handleDeleteTattoo(e, item)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg z-20 hover:scale-110"
                    title="Bu dövmeyi sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/70 to-transparent">
                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                  <div className="flex items-center gap-1 text-[11px] text-[#AAAAAA] mt-0.5">
                    <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                    <span>{item.likesCount > 1000 ? (item.likesCount / 1000).toFixed(1) + 'K' : item.likesCount}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[#111111] border border-white/10 text-xs text-[#777777] space-y-3">
              <p>Henüz paylaşılan bir dövme tasarımı yok.</p>
              {isOwnProfile && (
                <button
                  onClick={onOpenCreate}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-bold hover:bg-[#EAEAEA] cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>İlk Dövmeni Paylaş</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Hakkında (About) with Active Links */}
      {activeTab === 'about' && (
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Biyografi</h3>
            <p className="text-xs text-[#AAAAAA] leading-relaxed">
              {profileUser.bio || 'Henüz bir biyografi eklenmemiş.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-[11px] text-[#777777]">Kullanıcı Adı</p>
              <p className="text-xs font-semibold text-white mt-0.5">{profileUser.handle}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#777777]">Rol</p>
              <p className="text-xs font-semibold text-white mt-0.5">
                {profileUser.isAdmin ? '👑 Sistem Yöneticisi (Admin)' : (profileUser.isArtist ? 'Sanatçı (Tattoo Artist)' : 'Topluluk Üyesi')}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#777777]">Katılma Tarihi</p>
              <p className="text-xs font-semibold text-white mt-0.5">{profileUser.createdAt || '2026'}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#777777]">Doğrulanmış Profil</p>
              <p className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1.5">
                {profileUser.verified || profileUser.isAdmin ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Doğrulanmış Hesap</span>
                  </>
                ) : (
                  <span>Standart Hesap</span>
                )}
              </p>
            </div>
          </div>

          {/* Social Links List in About Tab */}
          {profileDetectedLinks.length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[11px] text-[#777777] mb-2.5">Bağlantılar & Sosyal Ağlar</p>
              <div className="flex flex-wrap gap-2">
                {profileDetectedLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.sanitizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] border border-white/10 text-xs text-[#DDDDDD] hover:text-white transition-colors"
                  >
                    {link.icon('w-3.5 h-3.5')}
                    <span className="font-semibold">{link.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[#888888]" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Favorilerim (Saved/Favorites) */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {favoriteTattoos.length > 0 ? (
            favoriteTattoos.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectTattoo(item)}
                className="group relative rounded-2xl overflow-hidden bg-[#141414] border border-white/10 aspect-[3/3.8] cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 inset-x-0 p-3 bg-black/60">
                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[#111111] border border-white/10 text-xs text-[#777777]">
              Henüz kaydedilen favori dövme yok. Keşfet sekmesinden beğendiğiniz dövmeleri kaydedebilirsiniz.
            </div>
          )}
        </div>
      )}

      {/* ================= EDIT PROFILE MODAL ================= */}
      {/* PP + Cover Banner + Info + Auto-detected Social Links */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141414] border border-white/20 rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-display">Profili Düzenle</h3>
                <p className="text-[11px] text-[#888888]">Profil fotoğrafı, kapak resmi, biyografi ve sosyal medya bağlantılarınızı yönetin.</p>
              </div>
              <button 
                onClick={() => setEditModalOpen(false)} 
                className="text-[#888888] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              
              {/* 1. Kapak / Arka Plan Resmi Yükleme */}
              <div>
                <label className="block text-white font-semibold mb-1.5 flex items-center justify-between">
                  <span>Kapak / Arka Plan Resmi</span>
                  <span className="text-[10px] text-[#888888]">Geniş format (Banner)</span>
                </label>
                
                <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-white/15 bg-black">
                  <img
                    src={editBannerURL || displayBanner}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 hover:bg-black/90 border border-white/25 text-white font-semibold cursor-pointer transition-all shadow-md">
                      <Camera className="w-4 h-4 text-[#CCFF00]" />
                      <span>Kapak Fotoğrafı Seç</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleModalBannerUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Profil Fotoğrafı (PP) Yükleme */}
              <div>
                <label className="block text-white font-semibold mb-1.5">
                  Profil Fotoğrafı (PP)
                </label>
                
                <div className="flex items-center gap-4 bg-[#1b1b1b] p-3.5 rounded-2xl border border-white/10">
                  <img
                    src={editPhotoURL || currentUser.photoURL || './images/users/avatar_inkedlife.jpg'}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20 bg-black shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs cursor-pointer hover:bg-[#EAEAEA] transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Yeni Fotoğraf Yükle</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleModalAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-[#777777]">JPG, PNG veya WebP. Max 10MB.</p>
                  </div>
                </div>
              </div>

              {/* 3. Ad Soyad */}
              <div>
                <label className="block text-[#AAAAAA] mb-1 font-medium">Ad Soyad / İsim</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#1b1b1b] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white/40"
                  placeholder="İsminiz..."
                />
              </div>

              {/* 4. Bio */}
              <div>
                <label className="block text-[#AAAAAA] mb-1 font-medium">Biyografi (Hakkında)</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#1b1b1b] border border-white/15 rounded-xl px-3.5 py-2.5 text-white resize-none focus:outline-none focus:border-white/40"
                  placeholder="Kendiniz veya dövme tarzınız hakkında kısa bir açıklama..."
                />
              </div>

              {/* 5. Otomatik Algılamalı Sosyal Medya ve Link Yönetimi */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="block text-white font-semibold flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>Sosyal Medya & Web Bağlantıları</span>
                  </label>
                  <span className="text-[10px] text-[#CCFF00] font-mono">Otomatik Algılama</span>
                </div>
                <p className="text-[11px] text-[#888888] leading-tight">
                  Herhangi bir link yapıştırın (TikTok, Instagram, Facebook, YouTube, WhatsApp vb.). Sistem platformu otomatik algılar ve profilinizde özel butonunu oluşturur.
                </p>

                {/* Quick Autofill Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#777777] mr-1">Hızlı Ekle:</span>
                  <button
                    type="button"
                    onClick={() => { setNewLinkInput('https://tiktok.com/@'); setLinkInputError(''); }}
                    className="px-2 py-1 rounded-md bg-[#202020] hover:bg-[#2a2a2a] text-[10px] text-white border border-white/10 cursor-pointer"
                  >
                    + TikTok
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewLinkInput('https://instagram.com/'); setLinkInputError(''); }}
                    className="px-2 py-1 rounded-md bg-[#202020] hover:bg-[#2a2a2a] text-[10px] text-white border border-white/10 cursor-pointer"
                  >
                    + Instagram
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewLinkInput('https://facebook.com/'); setLinkInputError(''); }}
                    className="px-2 py-1 rounded-md bg-[#202020] hover:bg-[#2a2a2a] text-[10px] text-white border border-white/10 cursor-pointer"
                  >
                    + Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewLinkInput('https://youtube.com/@'); setLinkInputError(''); }}
                    className="px-2 py-1 rounded-md bg-[#202020] hover:bg-[#2a2a2a] text-[10px] text-white border border-white/10 cursor-pointer"
                  >
                    + YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewLinkInput('https://wa.me/'); setLinkInputError(''); }}
                    className="px-2 py-1 rounded-md bg-[#202020] hover:bg-[#2a2a2a] text-[10px] text-white border border-white/10 cursor-pointer"
                  >
                    + WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewLinkInput('https://'); setLinkInputError(''); }}
                    className="px-2 py-1 rounded-md bg-[#202020] hover:bg-[#2a2a2a] text-[10px] text-white border border-white/10 cursor-pointer"
                  >
                    + Web Sitesi
                  </button>
                </div>

                {/* Input & Add Button */}
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLinkInput}
                      onChange={(e) => { setNewLinkInput(e.target.value); setLinkInputError(''); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLink();
                        }
                      }}
                      className="flex-1 bg-[#1b1b1b] border border-white/15 rounded-xl px-3.5 py-2 text-white text-xs placeholder-[#666666] focus:outline-none focus:border-white/40 font-mono"
                      placeholder="Örn: https://tiktok.com/@kullanici veya facebook.com/sayfa"
                    />
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ekle</span>
                    </button>
                  </div>

                  {/* Real-time platform detection feedback */}
                  {previewDetection && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1b1b1b] border border-white/10 text-[11px]">
                      <span className="p-1 rounded-md bg-white/10 text-white">
                        {previewDetection.icon('w-3.5 h-3.5')}
                      </span>
                      <div className="flex-1">
                        <span className="text-[#CCFF00] font-semibold">✓ Algılanan Platform: </span>
                        <span className="text-white font-bold">{previewDetection.name}</span>
                        {previewDetection.displayLabel && (
                          <span className="text-[#888888] ml-1">({previewDetection.displayLabel})</span>
                        )}
                        <span className="text-[#888888] block text-[10px]">Profilinizde özel {previewDetection.name} butonu olarak açılacak.</span>
                      </div>
                    </div>
                  )}

                  {linkInputError && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{linkInputError}</span>
                    </p>
                  )}
                </div>

                {/* List of currently attached links */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-[#888888]">Eklenen Bağlantılar ({editCustomLinks.length}):</p>
                  {editCustomLinks.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {editCustomLinks.map((url, index) => {
                        const detected = detectPlatform(url);
                        return (
                          <div 
                            key={index}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#181818] border border-white/10 hover:border-white/20 transition-all text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className="p-1.5 rounded-lg bg-black text-white shrink-0">
                                {detected ? detected.icon('w-3.5 h-3.5') : <Globe className="w-3.5 h-3.5" />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-white truncate text-[11px]">
                                  {detected ? detected.name : 'Web Sitesi'}
                                </p>
                                <p className="text-[10px] text-[#888888] truncate font-mono">
                                  {url}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-white/10 transition-colors"
                                title="Bağlantıyı yeni sekmede test et"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveLink(url)}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer"
                                title="Bağlantıyı kaldır"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#666666] italic bg-[#181818] p-3 rounded-xl border border-white/5 text-center">
                      Henüz bir bağlantı eklenmedi. Yukarıdaki alandan TikTok, Instagram, Facebook veya Web linkinizi ekleyin.
                    </p>
                  )}
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-white hover:bg-white/5 cursor-pointer font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-lg"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Tattoo In-App Confirmation Modal (Replaces window.confirm) */}
      {tattooToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#141414] border border-white/20 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Dövmeyi Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-[#888888] mt-1.5 leading-relaxed">
                <span className="text-white font-semibold">"{tattooToDelete.title}"</span> adlı dövme paylaşımınız kalıcı olarak silinecek. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTattooToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDeleteTattoo}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors cursor-pointer shadow-lg shadow-red-600/30"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
