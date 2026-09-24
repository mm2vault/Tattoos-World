import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Instagram, Globe, Sparkles } from 'lucide-react';
import { CategoryId, SupportedLanguage } from '../types';

interface CreateTattooModalProps {
  onClose: () => void;
  onSubmit: (tattooData: {
    title: string;
    category: CategoryId;
    categoryName: string;
    description: string;
    image: string;
    socialLinks?: {
      instagram?: string;
      tiktok?: string;
      discord?: string;
      website?: string;
    };
  }) => void;
  currentLanguage: SupportedLanguage;
}

export const CreateTattooModal: React.FC<CreateTattooModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('realism');
  const [description, setDescription] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [discord, setDiscord] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImagePreview(uploadEvent.target?.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setErrorMsg('Lütfen bir dövme görseli yükleyin.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Lütfen başlık girin.');
      return;
    }

    setIsSubmitting(true);
    const categoryObj = categories.find((c) => c.id === category);

    setTimeout(() => {
      onSubmit({
        title: title.trim(),
        category,
        categoryName: categoryObj?.name || 'Realizm',
        description: description.trim(),
        image: imagePreview,
        socialLinks: {
          instagram: instagram.trim() || undefined,
          tiktok: tiktok.trim() || undefined,
          discord: discord.trim() || undefined,
          website: website.trim() || undefined,
        },
      });
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      
      {/* Modal Container matching center right of image */}
      <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-7 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display">
            Dövme Paylaş
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#888888] hover:text-white transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          {/* Upload Box with Dashed Border matching image */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center hover:border-white/30 bg-[#141414] cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                  <ImageIcon className="w-5 h-5 text-[#AAAAAA]" />
                </div>
                <h4 className="text-xs font-bold text-white">
                  Dövme fotoğrafını yükle
                </h4>
                <p className="text-[11px] text-[#777777]">
                  JPG, PNG (Max 10MB)
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-4 py-1.5 rounded-full bg-[#202020] border border-white/15 text-xs text-white hover:bg-white hover:text-black transition-all cursor-pointer font-medium"
                >
                  Galeriden Seç
                </button>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-white/20 aspect-[16/10] bg-black">
                <img
                  src={imagePreview}
                  alt="Önizleme"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-xs text-white hover:border-white"
                >
                  Değiştir
                </button>
              </div>
            )}
          </div>

          {/* Başlık */}
          <div>
            <label className="block text-xs font-semibold text-[#888888] mb-1">
              Başlık
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Dövme başlığı..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-[#555555] focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-[#888888] mb-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white/30 cursor-pointer"
            >
              <option value="" disabled>Kategori seç...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#161616] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-xs font-semibold text-[#888888] mb-1">
              Açıklama
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dövme hakkında kısa bir açıklama yaz..."
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-[#555555] focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          {/* Sosyal Bağlantılar (İsteğe bağlı) matching image */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-[#888888]">
              Sosyal Bağlantılar <span className="font-normal text-[#666666]">(İsteğe bağlı)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram linki"
                className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-white/30"
              />
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="TikTok linki"
                className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-white/30"
              />
              <input
                type="text"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="Discord linki"
                className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-white/30"
              />
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Web sitesi linki"
                className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Full-width Paylaş button matching image */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#1e1e1e] border border-white/20 text-white font-semibold text-xs hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Paylaşılıyor...' : 'Paylaş'}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
