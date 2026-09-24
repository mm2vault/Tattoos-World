import React from 'react';

interface HeroProps {
  onExplore: () => void;
  onShare: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  onShare,
}) => {
  return (
    <section className="w-full mb-8">
      <div className="relative rounded-3xl overflow-hidden bg-[#0e0e0e] border border-white/10 p-6 sm:p-10 lg:p-12 min-h-[300px] flex flex-col justify-center shadow-xl">
        
        {/* Right side portrait visual matching image */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 bg-cover bg-right sm:bg-center opacity-40 sm:opacity-55 pointer-events-none"
          style={{ backgroundImage: `url('./images/ui/hero_tattoo_portrait.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/85 to-transparent" />

        {/* Faint TATTOO'S WORLD watermark in the background of the image */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block opacity-25 pointer-events-none select-none">
          <span className="font-brush text-5xl lg:text-6xl text-white tracking-widest uppercase -rotate-6 block">
            TATTOO'S<br />WORLD
          </span>
        </div>

        {/* Text and Actions matching image */}
        <div className="relative z-10 max-w-lg space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1] font-display">
            Your Next Tattoo<br />Starts Here
          </h1>

          <p className="text-xs sm:text-sm text-[#AAAAAA] leading-relaxed max-w-md">
            Discover unique tattoo designs, connect with artists, share your own and be part of our community.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onExplore}
              className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-[#EAEAEA] transition-all cursor-pointer shadow-lg"
            >
              Keşfet
            </button>

            <button
              onClick={onShare}
              className="px-6 py-2.5 rounded-full bg-[#1c1c1c] border border-white/15 text-white font-medium text-xs sm:text-sm hover:bg-[#252525] hover:border-white/30 transition-all cursor-pointer"
            >
              Dövme Ekle
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
