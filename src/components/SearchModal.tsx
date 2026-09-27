import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import type { Product } from '../types/index.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = searchTerm.toLowerCase().trim();

  const results = q
    ? products.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q) ||
          p.weave?.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-2xl bg-white shadow-2xl border border-[#E8DFD5] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD5] flex items-center gap-3 bg-[#FAF8F5]">
          <Search className="w-5 h-5 text-[#8B1E2F] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search by weave, silk type (Katan, Organza), category, or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm sm:text-base bg-transparent text-[#1C1A17] placeholder-[#9E9080] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#8C7E6E] hover:text-[#1C1A17]"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-[#544B3F] hover:text-[#8B1E2F] ml-1"
            aria-label="Close search modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Search Suggestions if empty */}
        {!searchTerm ? (
          <div className="p-6 text-xs text-[#6B5F4E] space-y-4">
            <span className="font-semibold uppercase tracking-wider text-[#1C1A17] block">
              Suggested Searches:
            </span>
            <div className="flex flex-wrap gap-2">
              {['Katan Silk', 'Kadhwa Saree', 'Tanchoi Suit', 'Organza', 'Designer Brocade', 'Bridal Red', 'Sapphire Blue'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="px-3 py-1.5 bg-[#F2ECE4] hover:bg-[#8B1E2F] hover:text-white transition-colors text-[#3A332B] font-medium"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          /* Empty state */
          <div className="p-12 text-center space-y-3">
            <p className="font-serif text-lg text-[#1C1A17]">No weaves found matching "{searchTerm}"</p>
            <p className="text-xs text-[#7A6E5F] max-w-sm mx-auto">
              Try searching by generic terms like "saree", "suit", "brocade", or explore our primary collections directly.
            </p>
          </div>
        ) : (
          /* Results list */
          <div className="max-h-96 overflow-y-auto divide-y divide-[#F2ECE4]">
            <div className="px-4 py-2 bg-[#F9F5F0] text-[11px] uppercase tracking-wider text-[#736554] font-medium">
              Found {results.length} result(s)
            </div>
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelect(product)}
                className="p-3.5 hover:bg-[#FAF8F5] transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.images?.[0] || '/src/assets/images/hero_banarasi_saree_1790522952613.jpg'}
                    alt={product.name}
                    className="w-12 h-14 object-cover object-center bg-[#F2ECE4] shrink-0"
                  />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#857766] font-medium">
                      {product.category} {product.fabric && `· ${product.fabric}`}
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-[#1C1A17]">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#7A6E5F] line-clamp-1">
                      {product.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {product.price !== null ? (
                    <span className="font-serif text-sm font-bold text-[#8B1E2F]">
                      ₹{(product.salePrice ?? product.price).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#8B1E2F] uppercase">
                      On Request
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-[#857766] ml-auto mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
