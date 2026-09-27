import React from 'react';
import { Award, Compass, HeartHandshake, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-24 bg-[#F5EFEB] border-b border-[#EAE2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#8B1E2F]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>The Heritage of Varanasi</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1A17] tracking-tight">
            Craftsmanship That Transcends Generations
          </h2>
          <p className="text-sm sm:text-base text-[#615647] font-normal leading-relaxed">
            Nestled in the historic holy city of Varanasi, BUNKAR SANSKRITI bridges centuries of ancestral weaving artistry with modern Indian silhouettes.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Images collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="overflow-hidden shadow-md bg-white">
                <img
                  src="/src/assets/images/designer_brocade_textile_1790522995915.jpg"
                  alt="Intricate Banarasi brocade textile weaving detail"
                  className="w-full h-56 sm:h-72 object-cover object-center transform hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5 bg-white border border-[#E3D9CC]">
                <span className="font-serif text-2xl font-bold text-[#8B1E2F] block">Varanasi Looms</span>
                <p className="text-xs text-[#6B5F50] mt-1 leading-relaxed">
                  Traditional pit looms and jacquard frames preserving indigenous weaving vocabularies.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-5 bg-[#1C1A17] text-[#FAF8F5]">
                <span className="font-serif text-xl font-medium text-[#E0C696] block">Pure Silks & Zari</span>
                <p className="text-xs text-[#B5A898] mt-1 leading-relaxed">
                  Carefully sourced Katan, Tanchoi, and Organza silks paired with refined zari filaments.
                </p>
              </div>
              <div className="overflow-hidden shadow-md bg-white">
                <img
                  src="/src/assets/images/banarasi_saree_royal_1790522967794.jpg"
                  alt="Authentic Royal Blue Banarasi Saree Drape"
                  className="w-full h-56 sm:h-72 object-cover object-center transform hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#1C1A17] font-semibold leading-snug">
              Authentic Banarasi Elegance, Reimagined with Grace
            </h3>

            <div className="space-y-4 text-sm text-[#4E4438] leading-relaxed">
              <p>
                In the historic lanes of Varanasi, weaving is not merely an occupation; it is a sacred meditation practiced across centuries. At <strong>BUNKAR SANSKRITI</strong>, each drape reflects the harmony of warp and weft, where master weavers intertwine opulent silk yarns with shimmering zari to create textiles fit for kings and brides.
              </p>
              <p>
                Our collections embody both grand ceremonial heritage and the fluid versatility required for modern occasions. Whether it is an heirloom Kadhwa bridal saree, a lightweight organza piece for festive soirees, an unstitched bespoke silk suit, or rich brocade material for designer couture, each piece reflects genuine Varanasi textile traditions.
              </p>
              <p>
                Operating with transparent factory outlet values from our Ravindrapuri Extension atelier, we eliminate unnecessary middlemen to bring you authentic, meticulously inspected textiles straight from the loom.
              </p>
            </div>

            {/* Hallmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#DFD5C6]">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#EBE3D7] text-[#8B1E2F] shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#1C1A17]">Authentic Origins</h4>
                  <p className="text-xs text-[#6B5F50] mt-0.5">Directly woven and curated in the artisan clusters of Varanasi.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#EBE3D7] text-[#8B1E2F] shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#1C1A17]">Contemporary Styling</h4>
                  <p className="text-xs text-[#6B5F50] mt-0.5">Pastel palettes, lightweight drapes, and modern bridal sensibilities.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
