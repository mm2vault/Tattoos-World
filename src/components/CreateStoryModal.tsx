import React, { useMemo, useState } from 'react';
import { ImagePlus, X, Type } from 'lucide-react';

interface CreateStoryModalProps {
  onClose: () => void;
  onSubmit: (image: string, text?: string) => Promise<void> | void;
}

const MAX_DATA_URL_LENGTH = 820_000;

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.onload = () => {
      const source = String(reader.result || '');
      const image = new Image();
      image.onload = () => {
        const maxSide = 1280;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(source);
          return;
        }
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.onerror = () => reject(new Error('Görsel açılamadı.'));
      image.src = source;
    };
    reader.readAsDataURL(file);
  });

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ onClose, onSubmit }) => {
  const [image, setImage] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = Boolean(image) && !busy;
  const fileLabel = useMemo(() => image ? 'Fotoğraf hazır' : 'Galeriden fotoğraf seç', [image]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Hikâyeye sadece görsel ekleyebilirsin.');
      return;
    }
    try {
      setError('');
      const compressed = await compressImage(file);
      if (compressed.length > MAX_DATA_URL_LENGTH) {
        setError('Bu fotoğraf hâlâ çok büyük. Daha küçük bir fotoğraf seç.');
        return;
      }
      setImage(compressed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fotoğraf yüklenemedi.');
    }
  };

  const submit = async () => {
    if (!image || busy) return;
    setBusy(true);
    try {
      await onSubmit(image, text.trim() || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hikâye paylaşılırken hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="tw-kicker">STORY STUDIO</p>
            <h2 className="text-lg font-semibold text-white mt-1">Hikâyen</h2>
            <p className="text-[11px] text-[#777] mt-0.5">24 saat görünür kalır.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-[#888] hover:text-white hover:bg-white/5 cursor-pointer" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="block">
            <span className="sr-only">Fotoğraf seç</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="relative aspect-[9/13] rounded-2xl overflow-hidden border border-dashed border-white/15 bg-[#080808] flex items-center justify-center cursor-pointer hover:border-white/30 transition-colors">
              {image ? (
                <>
                  <img src={image} alt="Hikâye önizleme" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                  {text && (
                    <div className="absolute inset-x-5 bottom-7 text-center text-xl font-semibold text-white drop-shadow-lg whitespace-pre-wrap break-words">
                      {text}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10 text-[9px] text-white">
                      24 SAAT
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center px-8">
                  <ImagePlus className="w-9 h-9 mx-auto text-white/55" />
                  <p className="text-sm font-semibold text-white mt-3">{fileLabel}</p>
                  <p className="text-[10px] text-[#666] mt-1">Dikey fotoğraflar daha iyi görünür.</p>
                </div>
              )}
            </div>
          </label>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-[#777]" />
              <span className="text-[11px] text-[#aaa]">Hikâye yazısı</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 140))}
              rows={2}
              placeholder="Bugün stüdyoda..."
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-[#555] outline-none focus:border-white/25 resize-none"
            />
            <div className="text-right text-[9px] text-[#555] mt-1">{text.length}/140</div>
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="w-full rounded-xl bg-white text-black py-3 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-white/90 transition-colors"
          >
            {busy ? 'Paylaşılıyor...' : 'Hikâyeyi paylaş'}
          </button>
        </div>
      </div>
    </div>
  );
};
