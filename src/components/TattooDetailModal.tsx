import React, { useState } from 'react';
import { 
  X, Heart, MessageSquare, Share2, Bookmark, Flag, 
  ChevronLeft, ChevronRight, Sparkles, Trash2, ShieldCheck 
} from 'lucide-react';
import { Tattoo, Comment, SupportedLanguage, UserProfile } from '../types';
import { tattooStore } from '../services/tattooStore';

interface TattooDetailModalProps {
  tattoo: Tattoo;
  onClose: () => void;
  onSelectCreator: (handle: string) => void;
  onOpenMessages?: (handle: string, prefill?: string) => void;
  currentLanguage: SupportedLanguage;
  currentUser: UserProfile;
  onToast: (msg: string) => void;
  onTattooUpdated: () => void;
}

export const TattooDetailModal: React.FC<TattooDetailModalProps> = ({
  tattoo,
  onClose,
  onSelectCreator,
  onOpenMessages,
  currentUser,
  onToast,
  onTattooUpdated,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(() => tattooStore.getComments(tattoo.id));

  // Show the cover plus the extra photos uploaded with this tattoo (max 10 total).
  const thumbnails = React.useMemo(() => {
    const list = [tattoo.image, ...(tattoo.additionalImages || [])];
    return Array.from(new Set(list.filter(Boolean))).slice(0, 10);
  }, [tattoo.image, tattoo.additionalImages]);

  const currentImg = thumbnails[activeImageIndex] || tattoo.image;
  const isLiked = tattooStore.isLiked(tattoo.id, currentUser.uid);
  const isSaved = tattooStore.isSaved(tattoo.id);
  const isFollowing = tattooStore.isFollowing(tattoo.creatorHandle);

  const handleToggleLike = () => {
    const result = tattooStore.toggleLike(tattoo.id);
    onTattooUpdated();
    onToast(result.isLiked ? 'Beğenildi' : 'Beğeni kaldırıldı');
  };

  const handleToggleSave = () => {
    const saved = tattooStore.toggleSaveTattoo(tattoo.id);
    onToast(saved ? 'Kaydedildi' : 'Kaydedilenlerden kaldırıldı');
  };

  const handleToggleFollow = () => {
    const following = tattooStore.toggleFollow(tattoo.creatorHandle);
    onToast(following ? `${tattoo.creatorHandle} takip ediliyor` : 'Takipten çıkıldı');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onToast('Bağlantı kopyalandı');
    }
  };

  const handleReport = async () => {
    if (!window.confirm('Bu dövmeyi uygunsuz veya kurallara aykırı bulduğunuz için bildirmek istiyor musunuz?')) return;
    const reason = window.prompt('Kısa bir neden yazın (spam, uygunsuz içerik, telif vb.):', 'Uygunsuz içerik');
    if (!reason?.trim()) return;
    const sent = await tattooStore.reportTattoo(tattoo.id, reason);
    onToast(sent ? 'Bildirim moderasyona gönderildi' : 'Rapor göndermek için Google ile giriş yapmalısınız');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    tattooStore.addComment(tattoo.id, commentText);
    setComments(tattooStore.getComments(tattoo.id));
    setCommentText('');
    onTattooUpdated();
    onToast('Yorum gönderildi');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 md:p-6 lg:p-8 animate-in fade-in duration-150">
      
      {/* Modal Container matching bottom left of image */}
      <div className="relative w-full max-w-6xl h-[100dvh] md:h-[92vh] bg-[#0c0c0c] border border-white/10 rounded-none md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Top Left Close 'X' Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-40 p-2.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Large High-Resolution Tattoo Artwork */}
        <div className="relative w-full md:w-3/5 h-[38dvh] sm:h-[48dvh] md:h-full bg-black flex items-center justify-center overflow-hidden select-none shrink-0">
          <img
            src={currentImg}
            alt={tattoo.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain md:object-cover"
          />

          {/* Bottom Thumbnails Strip + < 1/5 > pagination */}
          <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between">
            {/* Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto p-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
              {thumbnails.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-white scale-105' : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* < 1/5 > Pagination Indicator matching image */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-xs text-white">
              <button
                onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : thumbnails.length - 1))}
                className="hover:text-white/70"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs">{activeImageIndex + 1} / {thumbnails.length}</span>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev < thumbnails.length - 1 ? prev + 1 : 0))}
                className="hover:text-white/70"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details, Comments, Input matching image */}
        <div className="w-full md:w-2/5 flex-1 min-h-0 flex flex-col justify-between bg-[#111111] overflow-hidden">
          
          {/* Top Bar: < Detaylar & Sparkle */}
          <div className="p-4 sm:p-6 border-b border-white/10 space-y-3 sm:space-y-4 shrink-0">
            <div className="flex items-center justify-between text-xs text-[#888888]">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-white hover:text-[#AAAAAA] cursor-pointer font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Detaylar</span>
              </button>

              <div className="flex items-center gap-2">
                {(currentUser.isAdmin || currentUser.uid === tattoo.creatorId || currentUser.handle.toLowerCase() === tattoo.creatorHandle.toLowerCase()) && (
                  <button
                    onClick={() => {
                      if (window.confirm(`"${tattoo.title}" dövmesini silmek istediğinizden emin misiniz?`)) {
                        tattooStore.deleteTattoo(tattoo.id, currentUser);
                        onTattooUpdated();
                        onToast('Dövme başarıyla silindi');
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[10px] font-bold border border-red-500/30 cursor-pointer"
                    title="Dövmeyi Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Sil</span>
                  </button>
                )}
                <Sparkles className="w-4 h-4 text-[#888888]" />
              </div>
            </div>

            {/* Creator Row */}
            <div className="flex items-center justify-between pt-1">
              <div
                onClick={() => {
                  onSelectCreator(tattoo.creatorHandle);
                  onClose();
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={tattoo.creatorPhoto || './images/users/avatar_inkedlife.jpg'}
                  alt={tattoo.creatorName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:underline">
                    {tattoo.creatorHandle}
                  </h4>
                  <p className="text-[11px] text-[#888888]">Sanatçı</p>
                </div>
              </div>

              {onOpenMessages && (
                <button
                  onClick={() => onOpenMessages(tattoo.creatorHandle, `Merhaba ${tattoo.creatorHandle}, bu dövmeniz hakkında bilgi almak ve randevu oluşturmak istiyorum. Uygun gün ve saatleriniz nedir?`)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-[#e8e8e8] transition-all cursor-pointer"
                >Randevu Mesajı</button>
              )}
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-white/15 text-white hover:bg-red-500/20 hover:text-red-400'
                    : 'bg-[#1e1e1e] border border-white/20 text-white hover:bg-white hover:text-black'
                }`}
              >
                {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
              </button>
            </div>

            {/* Title & Tags */}
            <div className="space-y-2 pt-1">
              <h2 className="text-xl font-bold text-white font-display">
                {tattoo.title}
              </h2>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-[#1c1c1c] text-[#CCCCCC] text-[11px] font-medium border border-white/10">
                  {tattoo.categoryName || 'Tasarım'}
                </span>
                {tattoo.tags && tattoo.tags.length > 0 ? (
                  tattoo.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#151515] text-[#AAAAAA] text-[10px] border border-white/5">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="px-2.5 py-1 rounded-md bg-[#1c1c1c] text-[#888888] text-[11px] font-medium border border-white/5">
                    Özel Tasarım
                  </span>
                )}
              </div>

              <p className="text-xs text-[#AAAAAA] leading-relaxed pt-1">
                {tattoo.description}
              </p>
            </div>

            {/* Actions: Heart 2.4K, Comment, Share, Save */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isLiked ? 'text-red-500 font-bold' : 'text-[#888888] hover:text-white'
                  }`}
                  title={isLiked ? 'Beğeniyi Kaldır' : 'Beğen'}
                >
                  <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                  <span className="font-semibold">{tattoo.likesCount > 1000 ? (tattoo.likesCount / 1000).toFixed(1) + 'K' : tattoo.likesCount}</span>
                </button>

                <div className="flex items-center gap-1.5 text-[#AAAAAA]">
                  <MessageSquare className="w-4 h-4" />
                  <span>{comments.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#AAAAAA]">
                <button onClick={handleShare} className="hover:text-white cursor-pointer" title="Paylaş">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={handleToggleSave} className="hover:text-white cursor-pointer" title="Kaydet">
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : ''}`} />
                </button>
                <button onClick={handleReport} className="hover:text-red-400 cursor-pointer" title="Bildir">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Comments Feed matching image */}
          <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto space-y-4">
            <h3 className="text-xs font-bold text-[#888888]">
              Yorumlar ({comments.length})
            </h3>

            <div className="space-y-3.5">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => c.userHandle && onSelectCreator(c.userHandle)}
                    className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                    title="Profili aç"
                  >
                    <img
                    src={c.userAvatar || './images/users/avatar_inkedlife.jpg'}
                    alt={c.userName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                    />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <button type="button" onClick={() => c.userHandle && onSelectCreator(c.userHandle)} className="font-bold text-white hover:underline text-left cursor-pointer">{c.userName}</button>
                      {(currentUser.isAdmin || currentUser.uid === c.userId) && (
                        <button
                          onClick={() => {
                            tattooStore.deleteComment(tattoo.id, c.id);
                            setComments(tattooStore.getComments(tattoo.id));
                            onTattooUpdated();
                            onToast('Yorum silindi');
                          }}
                          className="text-[#666666] hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                          title="Yorumu Sil"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[#CCCCCC] mt-0.5 leading-relaxed">{c.text}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#666666] mt-1">
                      <span>{c.createdAt}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5" />
                        {c.likes || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Input with >> send button */}
          <form
            onSubmit={handleAddComment}
            className="p-3 sm:p-4 bg-[#0a0a0a] border-t border-white/10 flex items-center gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Yorum yaz..."
              className="flex-1 bg-[#161616] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center hover:bg-[#EAEAEA] disabled:opacity-30 transition-all cursor-pointer shrink-0"
              aria-label="Gönder"
            >
              <span className="text-xs font-mono font-bold tracking-tighter">»</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
