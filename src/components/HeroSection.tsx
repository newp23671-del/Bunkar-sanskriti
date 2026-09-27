import React from 'react';
import { MessageCircle, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';
import { createWhatsAppUrl } from '../utils/whatsapp.ts';

interface HeroSectionProps {
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore }) => {
  const { settings } = useSettings();

  const heroWhatsAppUrl = createWhatsAppUrl(
    settings.whatsappNumber,
    "Hello Bunkar Sanskriti, I am looking for authentic Banarasi sarees and suits. Please share your catalog and bridal collections."
  );

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] pt-4 pb-16 lg:py-20 border-b border-[#EAE2D8]">
      {/* Subtle background glow */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#EED8B5]/20 rounded-full blur-3xl pointer-events-none -mr-40 -mt-20" 
        aria-hidden="true" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
            {/* Quiet text kicker with typographic separator */}
            <div className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-semibold text-[#8B1E2F]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Varanasi Heritage Atelier</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#6B6154]">Est. Lanka Road</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1C1A17] font-medium leading-[1.12] tracking-tight">
              Tradition Woven <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#8B1E2F]">With Grace</span>
            </h1>

            <p className="text-base sm:text-lg text-[#554D42] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover the timeless artistry of Banarasi weaving, reimagined for the modern wardrobe. Pure Katan silk, intricate zari brocades, and bespoke heirloom weaves direct from Varanasi.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {/* Primary CTA */}
              <button
                onClick={onExplore}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#8B1E2F] hover:bg-[#721524] text-white text-xs font-semibold uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary CTA: Order on WhatsApp */}
              <a
                href={heroWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-[#F2ECE4] border border-[#2E2822] text-[#1C1A17] text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-[#1E7453] fill-[#1E7453]" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Heritage pillars metadata */}
            <div className="pt-8 border-t border-[#EAE2D8] grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="block font-serif text-xl sm:text-2xl text-[#1C1A17] font-semibold">100%</span>
                <span className="text-[11px] sm:text-xs text-[#706456] uppercase tracking-wider">Authentic Varanasi</span>
              </div>
              <div>
                <span className="block font-serif text-xl sm:text-2xl text-[#1C1A17] font-semibold">Kadhwa</span>
                <span className="text-[11px] sm:text-xs text-[#706456] uppercase tracking-wider">Traditional Looms</span>
              </div>
              <div>
                <span className="block font-serif text-xl sm:text-2xl text-[#1C1A17] font-semibold">Direct</span>
                <span className="text-[11px] sm:text-xs text-[#706456] uppercase tracking-wider">Factory Outlet</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative antique gold frame line */}
              <div 
                aria-hidden="true" 
                className="absolute -inset-3 border border-[#C5A059]/40 translate-x-2 translate-y-2 pointer-events-none hidden sm:block" 
              />
              
              {/* Main Photo Card */}
              <div className="relative overflow-hidden bg-[#241E19] shadow-2xl">
                <img
                  src="/src/assets/images/hero_banarasi_saree_1790522952613.jpg"
                  alt="Opulent Crimson Banarasi Silk Saree with Antique Gold Zari Woven Jaal"
                  className="w-full h-[400px] sm:h-[480px] lg:h-[530px] object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                />

                {/* Subtle gradient vignette at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />

                {/* Text overlay caption */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-1.5 text-[11px] tracking-wider uppercase text-[#E0C696] font-medium mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>Ravindrapuri Ext., Varanasi</span>
                  </div>
                  <p className="font-serif text-lg sm:text-xl font-normal leading-snug">
                    Pure Katan Silk & Antique Gold Zari Weave
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
