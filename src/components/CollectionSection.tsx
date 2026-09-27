import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Sparkles, MessageCircle } from 'lucide-react';
import type { Product, Category } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { createWhatsAppUrl } from '../utils/whatsapp.ts';

interface CollectionSectionProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
}) => {
  const { settings } = useSettings();
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Extract unique fabrics
  const fabrics = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.fabric) set.add(p.fabric);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedFabric !== 'All' && p.fabric !== selectedFabric) {
        return false;
      }
      if (inStockOnly && !p.available) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        return (a.price ?? 999999) - (b.price ?? 999999);
      }
      if (sortBy === 'price-desc') {
        return (b.price ?? 0) - (a.price ?? 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // 'featured'
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedFabric, inStockOnly, sortBy]);

  const customOrderWhatsAppUrl = createWhatsAppUrl(
    settings.whatsappNumber,
    "Hello Bunkar Sanskriti, I am looking for a specific Banarasi weave / custom color. Please share what options you can craft."
  );

  return (
    <section id="collection" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#EAE2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#8B1E2F]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Master Artisan Catalog</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1A17] tracking-tight">
            The Varanasi Collection
          </h2>
          <p className="text-sm sm:text-base text-[#615647] font-normal leading-relaxed">
            From heirloom bridal Katan silks to gossamer organzas and rich unstitched suit fabrics.
          </p>
        </div>

        {/* Category Filter Bar (Functional segmented buttons conforming to rule 1A) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors border cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#8B1E2F] text-white border-[#8B1E2F] shadow-xs'
                : 'bg-white text-[#4A4237] border-[#D9CFBF] hover:border-[#8B1E2F]'
            }`}
          >
            All Collections
          </button>
          {categories.filter(c => c.enabled).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors border cursor-pointer ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-[#8B1E2F] text-white border-[#8B1E2F] shadow-xs'
                  : 'bg-white text-[#4A4237] border-[#D9CFBF] hover:border-[#8B1E2F]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sub-Filters: Fabric, Sorting & In-Stock */}
        <div className="bg-white border border-[#E8DFD5] p-4 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Fabric Filter */}
            <div className="flex items-center gap-2">
              <span className="font-semibold uppercase tracking-wider text-[#635748]">Fabric:</span>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="px-2.5 py-1.5 border border-[#D9CFBF] bg-[#FAF8F5] text-[#1C1A17] font-medium focus:outline-none focus:border-[#8B1E2F]"
              >
                {fabrics.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* In-Stock Toggle */}
            <label className="flex items-center gap-2 cursor-pointer font-medium text-[#4A4237]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#8B1E2F]"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <div className="flex items-center gap-4 justify-between md:justify-end">
            <span className="text-[#7A6E5F]">
              Showing <strong className="text-[#1C1A17]">{filteredProducts.length}</strong> items
            </span>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B1E2F]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 border border-[#D9CFBF] bg-[#FAF8F5] text-[#1C1A17] font-medium focus:outline-none focus:border-[#8B1E2F]"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center bg-white border border-[#E8DFD5] space-y-4">
            <p className="font-serif text-2xl text-[#1C1A17]">No weaves match your selected filters</p>
            <p className="text-xs text-[#7A6E5F] max-w-md mx-auto leading-relaxed">
              We frequently weave custom sarees and suit fabrics to order. You can contact our master weavers directly on WhatsApp.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedFabric('All');
                  onSelectCategory('All');
                  setInStockOnly(false);
                }}
                className="px-6 py-2.5 bg-[#1C1A17] text-white text-xs uppercase tracking-wider font-semibold"
              >
                Reset Filters
              </button>
              <a
                href={customOrderWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1E7453] text-white text-xs uppercase tracking-wider font-semibold"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Custom Order on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
