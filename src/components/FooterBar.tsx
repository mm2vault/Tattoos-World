import React from 'react';
import { Globe } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface FooterBarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN' },
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
  { code: 'de', label: 'DE' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'pt', label: 'PT' },
  { code: 'it', label: 'IT' },
];

export const FooterBar: React.FC<FooterBarProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <footer className="w-full bg-[#070707] border-t border-white/10 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs select-none">
      
      {/* Left: Globe + Language codes matching image */}
      <div className="flex items-center gap-3 text-[#777777]">
        <Globe className="w-4 h-4 text-[#888888]" />
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => onLanguageChange(l.code)}
              className={`hover:text-white transition-colors cursor-pointer ${
                currentLanguage === l.code ? 'text-white font-bold underline underline-offset-4' : ''
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center: — Tattoos Connect People — cursive handwriting signature */}
      <div className="text-center">
        <span className="font-script text-xl sm:text-2xl text-white/90 font-bold tracking-wide">
          — Tattoos Connect People —
        </span>
      </div>

      {/* Right: Copyright matching image */}
      <div className="text-[#666666] text-[11px]">
        <span>Tatto's World  © 2025  |  Tüm hakları saklıdır.</span>
      </div>

    </footer>
  );
};
