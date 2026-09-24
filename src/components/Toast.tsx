import React, { useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClear: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClear }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClear();
    }, 2400);
    return () => clearTimeout(timer);
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200 pointer-events-none">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#181818] border border-white/20 text-white shadow-2xl text-xs font-semibold backdrop-blur-md">
        <span className="w-5 h-5 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shrink-0">
          <Check className="w-3 h-3 stroke-[3]" />
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
};
