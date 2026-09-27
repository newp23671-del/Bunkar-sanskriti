import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Category } from '../types/index.ts';

interface CategoriesSpotlightProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoriesSpotlight: React.FC<CategoriesSpotlightProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F5] border-b border-[#EAE2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-4 border-b border-[#E8DFD5]">
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#8B1E2F]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Curated Departments</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C1A17]">
              Explore by Creation
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs uppercase tracking-widest font-semibold text-[#8B1E2F] hover:text-[#701523] flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.filter(c => c.enabled).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group relative h-96 overflow-hidden bg-[#241E19] cursor-pointer shadow-xs hover:shadow-xl transition-all duration-500 border border-[#E3D9CC]"
            >
              {/* Category Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-95"
                loading="lazy"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Content overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#E0C696] font-semibold block">
                  Atelier Curation
                </span>
                <h3 className="font-serif text-2xl font-semibold tracking-wide text-white">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#D8C7B5] line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.description}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#E0C696] uppercase tracking-wider">
                  <span>Explore Pieces</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
