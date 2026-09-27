import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';

interface FeaturedCreationsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAll: () => void;
}

export const FeaturedCreations: React.FC<FeaturedCreationsProps> = ({
  products,
  onSelectProduct,
  onViewAll,
}) => {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const items = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#EAE2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#8B1E2F]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Master Artisan Highlights</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1A17] tracking-tight">
            Featured Creations
          </h2>
          <p className="text-sm sm:text-base text-[#615647] font-normal leading-relaxed">
            Exemplary heirlooms handwoven with meticulous care on the traditional pit looms of Varanasi.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#1C1A17] hover:bg-[#8B1E2F] text-white text-xs uppercase tracking-widest font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <span>View All Weaves</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
