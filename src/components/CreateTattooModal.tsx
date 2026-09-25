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
    additionalImages?: string[];
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const available = Math.max(0, 10 - imagePreviews.length);
    if (available === 0) {
      setErrorMsg('Bir dövme için en fazla 10 fotoğraf ekleyebilirsiniz.');
      e.target.value = '';
      return;
    }

    const selected = files.slice(0, available);
    const invalid = selected.find((file) => !file.type.startsWith('image/'));
    if (invalid) {
      setErrorMsg('Lütfen yalnızca geçerli görsel dosyaları seçin.');
      e.target.value = '';
      return;
    }

    // Camera/gallery images can be several MB each. Compress them before storing
    // them in the browser/Firestore so shared tattoos survive reloads reliably.
    const compressImage = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          const img = new Image();
          img.onerror = reject;
          img.onload = () => {
            const maxSide = 1100;
            const scale = Math.min(1, maxSide / img.width, maxSide / img.height);
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('canvas'));
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.68));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });

    Promise.all(selected.map(compressImage)).then((results) => {
      setImagePreviews((prev) => [...prev, ...results].slice(0, 10));
      setErrorMsg('');
      e.target.value = '';
    }).catch(() => {
      setErrorMsg('Görseller yüklenirken bir hata oluştu.');
      e.target.value = '';
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imagePreviews.length === 0) {
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
        image: imagePreviews[0],
        additionalImages: imagePreviews.slice(1),
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-150">
      
      {/* Modal Container matching center right of image */}
      <div className="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-2xl p-4 sm:p-6 my-2 sm:my-6 max-h-[calc(100dvh-1rem)] sm:max-h-none overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display">
            Yeni Dövme Gönderisi
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
              multiple
              className="hidden"
            />

            {imagePreviews.length === 0 ? (
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
                  JPG, PNG (en fazla 10 fotoğraf)
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
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {imagePreviews.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/15 bg-black">
                      <img src={img} alt={`Dövme fotoğrafı ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 text-white text-xs border border-white/20 hover:bg-red-500/80"
                        aria-label={`Fotoğrafı sil ${index + 1}`}
                      >×</button>
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] text-white">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                  {imagePreviews.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border border-dashed border-white/20 bg-[#141414] text-[#999999] hover:text-white hover:border-white/40 flex flex-col items-center justify-center gap-1"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-[10px]">Fotoğraf ekle</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#777777]">{imagePreviews.length}/10 fotoğraf · İlk fotoğraf kapak olarak kullanılır.</p>
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
              className="w-full py-3 rounded-lg bg-white text-black font-semibold text-xs hover:bg-[#eaeaea] transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Paylaşılıyor...' : 'Paylaş'}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
