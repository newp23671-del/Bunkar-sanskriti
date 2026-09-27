import React from 'react';
import { ShoppingBag, MessageCircle, Eye } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { createWhatsAppUrl, generateProductInquiryMessage } from '../utils/whatsapp.ts';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = generateProductInquiryMessage(product);
    const url = createWhatsAppUrl(settings.whatsappNumber, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const mainImage = product.images?.[0] || '/src/assets/images/hero_banarasi_saree_1790522952613.jpg';

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group flex flex-col bg-white border border-[#EBE3D7] hover:border-[#8B1E2F]/40 transition-all duration-300 cursor-pointer overflow-hidden shadow-xs hover:shadow-md"
    >
      {/* Product Image Showcase */}
      <div className="relative aspect-[4/5] bg-[#F7F3EE] overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Quiet status badges (unboxed text or corner label) */}
        {!product.available && (
          <div className="absolute top-3 left-3 bg-[#1C1A17]/85 text-[#F2ECE4] text-[10px] uppercase tracking-widest px-2.5 py-1 font-medium backdrop-blur-xs">
            Sold Out / On Order
          </div>
        )}

        {product.isOutlet && product.available && (
          <div className="absolute top-3 left-3 bg-[#8B1E2F] text-white text-[10px] uppercase tracking-widest px-2.5 py-1 font-medium">
            Factory Outlet
          </div>
        )}

        {/* Hover Quick Overlay on Desktop */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-3 bg-white text-[#1C1A17] hover:text-[#8B1E2F] rounded-full shadow-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {product.available && (
            <button
              onClick={handleAddToCart}
              className="p-3 bg-[#8B1E2F] text-white hover:bg-[#721524] rounded-full shadow-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 delay-75"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Zero-Pill Static Metadata */}
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#857766] mb-1.5 font-medium">
            <span>{product.category}</span>
            {product.fabric && (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.fabric}</span>
              </>
            )}
          </div>

          <h3 className="font-serif text-lg font-medium text-[#1C1A17] group-hover:text-[#8B1E2F] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="text-xs text-[#6B6154] line-clamp-2 mt-1 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-[#F2ECE4]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              {product.price !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-lg font-semibold text-[#1C1A17]">
                    ₹{(product.salePrice ?? product.price).toLocaleString('en-IN')}
                  </span>
                  {product.salePrice && (
                    <span className="text-xs text-[#9E9080] line-through">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs tracking-wider uppercase font-semibold text-[#8B1E2F]">
                  Contact for Price
                </span>
              )}
            </div>

            <span className="text-[11px] text-[#8C7D6D]">
              {product.available ? 'In Stock' : 'On Order'}
            </span>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.available}
              className={`py-2 px-2 text-[11px] font-semibold uppercase tracking-wider transition-colors border text-center ${
                product.available 
                  ? 'border-[#332D26] text-[#1C1A17] hover:bg-[#1C1A17] hover:text-white cursor-pointer' 
                  : 'border-[#DDD4C7] text-[#A69B8D] cursor-not-allowed'
              }`}
            >
              Add to Cart
            </button>

            <button
              onClick={handleWhatsAppOrder}
              className="py-2 px-2 text-[11px] font-semibold uppercase tracking-wider bg-[#1E7453] hover:bg-[#165a40] text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
