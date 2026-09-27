import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  MessageCircle, 
  HelpCircle, 
  Check, 
  Shield, 
  Truck, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { createWhatsAppUrl, generateProductInquiryMessage } from '../utils/whatsapp.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenEnquiry: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenEnquiry,
}) => {
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>(() => {
    return product?.variants?.[0]?.options?.[0] || '';
  });
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const images = product.images?.length > 0 
    ? product.images 
    : ['/src/assets/images/hero_banarasi_saree_1790522952613.jpg'];

  const handleWhatsAppOrder = () => {
    let msg = `Hello Bunkar Sanskriti, I would like to order: *${product.name}*\n`;
    msg += `• Product ID: ${product.id}\n`;
    msg += `• Category: ${product.category}\n`;
    if (selectedVariant) {
      msg += `• Selected Option: ${selectedVariant}\n`;
    }
    msg += `• Quantity: ${quantity}\n`;
    if (product.price) {
      const unitPrice = product.salePrice ?? product.price;
      msg += `• Total Estimate: ₹${(unitPrice * quantity).toLocaleString('en-IN')}\n`;
    } else {
      msg += `• Price: On Request\n`;
    }
    msg += `\nPlease confirm availability and share order procedure.`;

    const url = createWhatsAppUrl(settings.whatsappNumber, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant || undefined);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const currentPrice = product.salePrice ?? product.price;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto relative shadow-2xl border border-[#E8DFD5] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-[#8B1E2F] text-[#1C1A17] hover:text-white rounded-full shadow-md transition-colors cursor-pointer"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Gallery Column */}
          <div className="md:col-span-6 bg-[#F7F3EE] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EFE8DF]">
            <div className="relative aspect-[4/5] overflow-hidden bg-white shadow-sm mb-4">
              <img
                src={images[selectedImageIdx]}
                alt={`${product.name} view ${selectedImageIdx + 1}`}
                className="w-full h-full object-cover object-center"
              />

              {/* Prev / Next controls if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-[#1C1A17] rounded-full shadow-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-[#1C1A17] rounded-full shadow-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 shrink-0 border-2 overflow-hidden cursor-pointer ${
                      selectedImageIdx === idx ? 'border-[#8B1E2F]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Category & Status */}
              <div className="flex items-center justify-between text-xs tracking-widest uppercase text-[#736657]">
                <div className="flex items-center gap-2 font-medium">
                  <span>{product.category}</span>
                  {product.weave && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{product.weave}</span>
                    </>
                  )}
                </div>
                <span className={`font-semibold ${product.available ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {product.available ? '● Available' : '● Made to Order'}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1A17] font-semibold leading-tight">
                {product.name}
              </h2>

              {/* Price */}
              <div className="pb-3 border-b border-[#EFE8DF]">
                {currentPrice !== null ? (
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#8B1E2F]">
                      ₹{currentPrice.toLocaleString('en-IN')}
                    </span>
                    {product.salePrice && product.price && (
                      <span className="text-sm text-[#948777] line-through">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-[11px] text-[#7A6E5F] uppercase tracking-wider">
                      (Inclusive of all taxes)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-xl font-bold text-[#8B1E2F]">
                      Price on Request
                    </span>
                    <span className="text-xs text-[#736657]">
                      · Bespoke / Collectible Weave
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="text-xs sm:text-sm text-[#474037] leading-relaxed space-y-2">
                <p>{product.description}</p>
              </div>

              {/* Textile Attributes Table */}
              <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-[#EFE8DF] bg-[#FAF8F5] p-3">
                {product.fabric && (
                  <div>
                    <span className="text-[#8A7D6E] block text-[10px] uppercase tracking-wider">Fabric</span>
                    <span className="font-medium text-[#1C1A17]">{product.fabric}</span>
                  </div>
                )}
                {product.weave && (
                  <div>
                    <span className="text-[#8A7D6E] block text-[10px] uppercase tracking-wider">Weaving Technique</span>
                    <span className="font-medium text-[#1C1A17]">{product.weave}</span>
                  </div>
                )}
                {product.color && (
                  <div>
                    <span className="text-[#8A7D6E] block text-[10px] uppercase tracking-wider">Color Tone</span>
                    <span className="font-medium text-[#1C1A17]">{product.color}</span>
                  </div>
                )}
                {product.zariType && (
                  <div>
                    <span className="text-[#8A7D6E] block text-[10px] uppercase tracking-wider">Zari Work</span>
                    <span className="font-medium text-[#1C1A17]">{product.zariType}</span>
                  </div>
                )}
              </div>

              {/* Variant Selector if available */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B352E]">
                    {product.variants[0].name}: <span className="font-normal text-[#8B1E2F]">{selectedVariant}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants[0].options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariant(opt)}
                        className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                          selectedVariant === opt
                            ? 'border-[#8B1E2F] bg-[#8B1E2F] text-white shadow-xs'
                            : 'border-[#D9CFBF] text-[#2E2822] hover:border-[#8B1E2F]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#3B352E]">Quantity:</span>
                <div className="flex items-center border border-[#D9CFBF] bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-sm font-semibold hover:bg-[#F2ECE4] text-[#2E2822]"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-semibold text-[#1C1A17]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 text-sm font-semibold hover:bg-[#F2ECE4] text-[#2E2822]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-4 border-t border-[#EFE8DF]">
              {addedNotice && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Added {quantity} item(s) to your shopping cart.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Primary WhatsApp Order */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 px-4 bg-[#1E7453] hover:bg-[#165a40] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Order on WhatsApp</span>
                </button>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.available}
                  className={`w-full py-3.5 px-4 text-xs font-semibold uppercase tracking-wider border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    product.available 
                      ? 'border-[#1C1A17] text-[#1C1A17] hover:bg-[#1C1A17] hover:text-white' 
                      : 'border-[#D9CFBF] text-[#A69B8D] cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Product Enquiry Link */}
              <button
                onClick={() => onOpenEnquiry(product)}
                className="w-full py-2 text-center text-xs text-[#7A6E5F] hover:text-[#8B1E2F] flex items-center justify-center gap-1.5 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ask a question about this piece (Video viewing / Customization)</span>
              </button>

              {/* Trust Badges */}
              <div className="pt-3 grid grid-cols-2 gap-2 text-[11px] text-[#7A6E5F]">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Varanasi Origin Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Pan-India & Global Dispatch</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
