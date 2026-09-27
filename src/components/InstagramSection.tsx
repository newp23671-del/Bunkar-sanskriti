import React from 'react';
import { Instagram, ArrowUpRight, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';

export const InstagramSection: React.FC = () => {
  const { settings } = useSettings();

  const curatedPosts = [
    {
      image: '/src/assets/images/hero_banarasi_saree_1790522952613.jpg',
      caption: 'The rhythmic heartbeat of Varanasi looms. Pure crimson silk kadhwa jaal.',
    },
    {
      image: '/src/assets/images/banarasi_saree_royal_1790522967794.jpg',
      caption: 'Sapphire blue Katan drape with meenakari antique golden borders.',
    },
    {
      image: '/src/assets/images/banarasi_suit_collection_1790522981322.jpg',
      caption: 'Pastel poetry. Unstitched Banarasi suit sets with handwoven dupattas.',
    },
    {
      image: '/src/assets/images/designer_brocade_textile_1790522995915.jpg',
      caption: 'Intricate floral brocade textiles for bespoke couture and bridal lehengas.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F5] border-b border-[#EAE2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b border-[#E8DFD5]">
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#8B1E2F]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Social Journal</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17]">
              {settings.instagramHandle}
            </h2>
            <p className="text-xs text-[#736657]">
              Glimpses of Varanasi pit looms, drape tutorials, and fresh arrivals.
            </p>
          </div>

          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1A17] hover:bg-[#8B1E2F] text-white text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm cursor-pointer"
          >
            <Instagram className="w-4 h-4" />
            <span>Follow Our Journey</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Visual Gallery */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {curatedPosts.map((post, idx) => (
            <a
              key={idx}
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square bg-[#F7F3EE] overflow-hidden border border-[#EBE3D7] block shadow-2xs"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                loading="lazy"
              />

              {/* Hover overlay with Instagram icon & caption */}
              <div className="absolute inset-0 bg-[#1C1A17]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
                <div className="flex justify-end">
                  <Instagram className="w-5 h-5 text-[#E0C696]" />
                </div>
                <div>
                  <p className="text-[11px] leading-relaxed line-clamp-3 text-[#EDE5DC]">
                    {post.caption}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase font-semibold text-[#E0C696] mt-2">
                    <span>View on Instagram</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
