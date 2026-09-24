import React from 'react';
import { Compass, Sparkles, Shield, Heart, Users, Share2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';

interface AboutViewProps {
  currentLanguage: SupportedLanguage;
  onExplore: () => void;
  onShare: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  currentLanguage,
  onExplore,
  onShare,
}) => {
  const t = translations[currentLanguage];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Mission */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#CCFF00]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TATTO'S WORLD MANIFESTO</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display uppercase tracking-tight">
          {t.aboutTitle}
        </h1>

        <p className="text-sm sm:text-base text-[#AAAAAA] leading-relaxed">
          {t.aboutSubtitle}
        </p>
      </div>

      {/* 3 Main Pillars: Discover, Create, Connect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Discover */}
        <div className="rounded-3xl bg-[#111111] border border-white/10 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#CCFF00]">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white font-display">{t.discoverTitle}</h3>
            <p className="text-xs sm:text-sm text-[#888888] leading-relaxed">
              {t.discoverDesc}
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <span className="text-[11px] font-mono text-[#CCFF00] tracking-wider uppercase">01. INSPIRATION</span>
          </div>
        </div>

        {/* Pillar 2: Create */}
        <div className="rounded-3xl bg-[#111111] border border-white/10 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#CCFF00]">
            <Share2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white font-display">{t.createTitle}</h3>
            <p className="text-xs sm:text-sm text-[#888888] leading-relaxed">
              {t.createDesc}
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <span className="text-[11px] font-mono text-[#CCFF00] tracking-wider uppercase">02. STORYTELLING</span>
          </div>
        </div>

        {/* Pillar 3: Connect */}
        <div className="rounded-3xl bg-[#111111] border border-white/10 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#CCFF00]">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white font-display">{t.connectTitle}</h3>
            <p className="text-xs sm:text-sm text-[#888888] leading-relaxed">
              {t.connectDesc}
            </p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <span className="text-[11px] font-mono text-[#CCFF00] tracking-wider uppercase">03. NETWORKING</span>
          </div>
        </div>
      </div>

      {/* Big Visual Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#151515] p-8 sm:p-12">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('./images/tattoos/lion_clock.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />

        <div className="relative z-10 max-w-lg space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
            "Your Skin. Your Story."
          </h2>
          <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
            Dövmeler yalnızca mürekkep değildir; hayatın dönüm noktaları, kazanılan savaşlar, anılar ve saf estetik kimliğimizdir.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onExplore}
              className="px-5 py-2.5 rounded-xl bg-[#CCFF00] text-black font-bold text-xs hover:bg-[#b4f309] cursor-pointer"
            >
              Dövmeleri Keşfet
            </button>
            <button
              onClick={onShare}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium text-xs hover:bg-white/20 cursor-pointer"
            >
              Sanatını Paylaş
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-white/5 text-xs text-[#666666]">
        <p>Tatto's World · {t.allRightsReserved}</p>
      </div>

    </div>
  );
};
