import React, { useState } from 'react';
import { 
  ShieldCheck, Trash2, Edit3, Star, X, CheckCircle, 
  Layers, Users, MessageSquare, AlertTriangle, Save, Plus 
} from 'lucide-react';
import { Tattoo, UserProfile, CategoryId } from '../types';
import { tattooStore } from '../services/tattooStore';

interface AdminPanelModalProps {
  onClose: () => void;
  tattoos: Tattoo[];
  currentUser: UserProfile;
  onTattooUpdated: () => void;
  onToast: (msg: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  onClose,
  tattoos,
  currentUser,
  onTattooUpdated,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'tattoos' | 'users' | 'comments'>('tattoos');

  // Editing tattoo state
  const [editingTattoo, setEditingTattoo] = useState<Tattoo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<CategoryId>('realism');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');
  const [tattooToDelete, setTattooToDelete] = useState<{ id: string; title: string } | null>(null);

  const categories: { id: CategoryId; name: string }[] = [
    { id: 'realism', name: 'Realizm' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'black_and_grey', name: 'Siyah & Gri' },
    { id: 'color', name: 'Renkli' },
    { id: 'geometric', name: 'Geometrik' },
    { id: 'animals', name: 'Hayvanlar' },
    { id: 'dark', name: 'Dark / Seri' },
    { id: 'fantasy', name: 'Fantastik' },
    { id: 'fine_line', name: 'Fine Line' },
  ];

  const totalLikes = tattoos.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);
  const totalComments = tattoos.reduce((acc, curr) => acc + (curr.commentsCount || 0), 0);

  const allComments = React.useMemo(() => {
    const res: { tattooId: string; tattooTitle: string; comment: any }[] = [];
    tattoos.forEach((t) => {
      const list = tattooStore.getComments(t.id);
      list.forEach((c) => {
        res.push({ tattooId: t.id, tattooTitle: t.title, comment: c });
      });
    });
    return res;
  }, [tattoos]);

  const handleDeleteTattoo = (id: string, title: string) => {
    setTattooToDelete({ id, title });
  };

  const confirmDeleteTattoo = () => {
    if (!tattooToDelete) return;
    const ok = tattooStore.adminDeleteTattoo(tattooToDelete.id);
    if (ok) {
      onTattooUpdated();
      onToast(`"${tattooToDelete.title}" başarıyla silindi`);
    }
    setTattooToDelete(null);
  };

  const handleToggleFeatured = (id: string) => {
    const isFeat = tattooStore.adminToggleFeatured(id);
    onTattooUpdated();
    onToast(isFeat ? 'Dövme öne çıkarıldı' : 'Öne çıkarma kaldırıldı');
  };

  const handleStartEdit = (tattoo: Tattoo) => {
    setEditingTattoo(tattoo);
    setEditTitle(tattoo.title);
    setEditCategory(tattoo.category);
    setEditDesc(tattoo.description);
    setEditImage(tattoo.image);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTattoo) return;

    const catObj = categories.find((c) => c.id === editCategory);
    tattooStore.adminUpdateTattoo(editingTattoo.id, {
      title: editTitle.trim(),
      image: editImage,
      category: editCategory,
      categoryName: catObj?.name || 'Realizm',
      description: editDesc.trim(),
    });

    onTattooUpdated();
    setEditingTattoo(null);
    onToast('Dövme güncellendi');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-5xl bg-[#0c0c0c] border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col max-h-[90vh]">
        
        {/* Admin Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#18140c] via-[#121212] to-[#0c0c0c] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-display">
                  Tatto's World Admin Paneli
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-black">
                  Master Yetki
                </span>
              </div>
              <p className="text-xs text-[#888888] flex items-center gap-1.5 mt-0.5">
                <span>Aktif Admin:</span>
                <span className="text-amber-300 font-mono font-medium">{currentUser.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#888888] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-[#0e0e0e] border-b border-white/5 text-xs">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-3.5">
            <span className="text-[#888888]">Toplam Dövme</span>
            <p className="text-lg font-bold text-white mt-1 font-mono">{tattoos.length}</p>
          </div>
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-3.5">
            <span className="text-[#888888]">Toplam Beğeni</span>
            <p className="text-lg font-bold text-amber-400 mt-1 font-mono">{totalLikes.toLocaleString()}</p>
          </div>
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-3.5">
            <span className="text-[#888888]">Toplam Yorum</span>
            <p className="text-lg font-bold text-white mt-1 font-mono">{totalComments}</p>
          </div>
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-3.5">
            <span className="text-[#888888]">Firebase Durumu</span>
            <p className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bağlı (tattoo-s-world)</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 border-b border-white/10 flex items-center gap-4 sm:gap-6 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('tattoos')}
            className={`py-3.5 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'tattoos'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tüm Dövmeleri Yönet ({tattoos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3.5 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Sanatçı & Kullanıcı Yönetimi</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3.5 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'comments'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Yorum Denetimi ({allComments.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* TAB 1: TATTOOS MANAGER */}
          {activeTab === 'tattoos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#888888]">
                <span>Platformdaki tüm dövmeleri düzenleyebilir, öne çıkarabilir veya silebilirsiniz.</span>
              </div>

              <div className="divide-y divide-white/10 border border-white/10 rounded-2xl bg-[#111111] overflow-hidden">
                {tattoos.map((tattoo) => (
                  <div
                    key={tattoo.id}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={tattoo.image}
                        alt={tattoo.title}
                        className="w-12 h-14 rounded-xl object-cover border border-white/15 shrink-0 bg-black"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{tattoo.title}</h4>
                          {tattoo.isFeatured && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                              Öne Çıkarılan
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#888888] truncate mt-0.5">
                          {tattoo.creatorHandle} · {tattoo.categoryName} · {tattoo.likesCount} Beğeni · {tattoo.commentsCount} Yorum
                        </p>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleToggleFeatured(tattoo.id)}
                        className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          tattoo.isFeatured
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-white/5 border-white/10 text-[#888888] hover:text-white'
                        }`}
                        title="Öne Çıkar / Kaldır"
                      >
                        <Star className={`w-3.5 h-3.5 ${tattoo.isFeatured ? 'fill-current' : ''}`} />
                        <span className="hidden md:inline">{tattoo.isFeatured ? 'Öne Çıkarıldı' : 'Öne Çıkar'}</span>
                      </button>

                      <button
                        onClick={() => handleStartEdit(tattoo)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Düzenle</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTattoo(tattoo.id, tattoo.title)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Sil</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: USERS & ARTISTS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                Master Admin (<span className="font-mono font-bold">{currentUser.email}</span>) olarak tüm kullanıcıların profil rollerini ve onaylı sanatçı rozetlerini değiştirebilirsiniz.
              </div>

              <div className="divide-y divide-white/10 border border-white/10 rounded-2xl bg-[#111111] overflow-hidden text-xs">
                [
                  { name: currentUser.displayName || 'Master Admin', handle: currentUser.handle || '@admin', email: currentUser.email || 'Admin', role: currentUser.isAdmin ? 'Master Admin' : 'Kullanıcı', verified: Boolean(currentUser.verified || currentUser.isAdmin) },
                ].map((user, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.verified && <CheckCircle className="w-3.5 h-3.5 text-blue-400" />}
                        </h4>
                        <p className="text-[11px] text-[#777777] font-mono">{user.handle} · {user.email}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-white font-medium text-[11px]">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COMMENTS MODERATION */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                Topluluk kurallarına aykırı veya spam yorumları tek tıkla silebilirsiniz.
              </div>

              {allComments.length === 0 ? (
                <div className="p-8 text-center text-[#888888] text-xs">
                  Henüz yorum bulunmuyor.
                </div>
              ) : (
                <div className="divide-y divide-white/10 border border-white/10 rounded-2xl bg-[#111111] overflow-hidden text-xs">
                  {allComments.map(({ tattooId, tattooTitle, comment }) => (
                    <div key={comment.id} className="p-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={comment.userAvatar || './images/users/avatar_inkedlife.jpg'}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0 mt-0.5"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{comment.userName}</span>
                            <span className="text-[10px] text-[#777777]">({tattooTitle} üzerinde)</span>
                          </div>
                          <p className="text-[#CCCCCC] mt-1 break-words">{comment.text}</p>
                          <span className="text-[10px] text-[#666666] mt-1 block">{comment.createdAt}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          tattooStore.adminDeleteComment(tattooId, comment.id);
                          onTattooUpdated();
                          onToast('Yorum başarıyla silindi');
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        title="Yorumu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sil</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Edit Tattoo Modal Sub-dialog */}
      {editingTattoo && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-white/20 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white font-display">
                Dövmeyi Düzenle (Admin)
              </h3>
              <button onClick={() => setEditingTattoo(null)} className="text-[#888888] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#888888] mb-1">Dövme Başlığı</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#202020] border border-white/15 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Dövme Görseli</label>
                <div className="flex items-center gap-3 bg-[#202020] border border-white/15 rounded-xl p-3">
                  <img src={editImage} alt="Önizleme" className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-black shrink-0" />
                  <label className="px-3 py-2 rounded-xl bg-white text-black font-bold cursor-pointer hover:bg-[#EAEAEA]">
                    Görsel Değiştir
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) return;
                        const reader = new FileReader();
                        reader.onload = () => setEditImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Kategori</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as CategoryId)}
                  className="w-full bg-[#202020] border border-white/15 rounded-xl px-3.5 py-2 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Açıklama</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-[#202020] border border-white/15 rounded-xl px-3.5 py-2 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTattoo(null)}
                  className="px-4 py-2 rounded-xl text-white hover:bg-white/5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin In-App Tattoo Delete Confirmation Modal */}
      {tattooToDelete && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#141414] border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Dövmeyi Sil (Admin)</h3>
              <p className="text-xs text-[#888888] mt-1.5 leading-relaxed">
                <span className="text-white font-semibold">"{tattooToDelete.title}"</span> adlı dövme sistemden kalıcı olarak silinecek. Emin misiniz?
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
