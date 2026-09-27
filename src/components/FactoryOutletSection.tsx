import React from 'react';
import { MapPin, Navigation, Tag, Sparkles, Phone, MessageCircle } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { createWhatsAppUrl } from '../utils/whatsapp.ts';

interface FactoryOutletSectionProps {
  outletProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

export const FactoryOutletSection: React.FC<FactoryOutletSectionProps> = ({
  outletProducts,
  onSelectProduct,
}) => {
  const { settings } = useSettings();

  const outletWhatsAppUrl = createWhatsAppUrl(
    settings.whatsappNumber,
    "Hello Bunkar Sanskriti, I am interested in your Factory Outlet collection and direct loom specials. Please share available items."
  );

  return (
    <section id="factory-outlet" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#EAE2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#8B1E2F]">
            <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Direct Loom Pricing</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1A17] tracking-tight">
            Varanasi Factory Outlet
          </h2>
          <p className="text-sm sm:text-base text-[#615647] font-normal leading-relaxed">
            Premium traditional textiles directly from our Varanasi outlet. Experience pure handcraft without retail markups.
          </p>
        </div>

        {/* Visit Our Store Highlight Banner */}
        <div className="bg-[#1C1A17] text-white p-6 sm:p-10 mb-14 shadow-xl border border-[#332C24] relative overflow-hidden">
          <div 
            className="absolute -right-10 -bottom-10 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" 
            aria-hidden="true" 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#E0C696] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Experience In-Store in Varanasi</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#FAF8F5]">
                Visit Our Physical Factory Outlet
              </h3>
              <div className="text-xs sm:text-sm text-[#D1C4B5] space-y-1 leading-relaxed">
                <p className="font-medium text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>{settings.address}</span>
                </p>
                <p className="text-[#9E8F7F] text-xs pl-6">
                  (Opp. Oriyana Hospital, Near Champaran Restaurant, Lanka Road)
                </p>
              </div>

              {/* Contact direct numbers */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-[#E3D7C8]">
                <span>Sonu: <a href={`tel:${settings.sonuPhone}`} className="text-white underline font-medium">{settings.sonuPhone}</a></span>
                <span>·</span>
                <span>Shop: <a href={`tel:${settings.shopPhone}`} className="text-white underline font-medium">{settings.shopPhone}</a></span>
                <span>·</span>
                <span>Aman: <a href={`tel:${settings.amanPhone}`} className="text-white underline font-medium">{settings.amanPhone}</a></span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#8B1E2F] hover:bg-[#701523] text-white text-xs font-semibold uppercase tracking-widest transition-colors shadow-md text-center"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions (Google Maps)</span>
              </a>

              <a
                href={outletWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#1E7453] hover:bg-[#165a40] text-white text-xs font-semibold uppercase tracking-widest transition-colors text-center"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Outlet Concierge</span>
              </a>
            </div>
          </div>
        </div>

        {/* Outlet Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#EAE2D8]">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1C1A17]">
                Available Outlet Selections
              </h3>
              <p className="text-xs text-[#706456] mt-0.5">
                Special loom prices on sarees, suit fabrics, and designer brocades.
              </p>
            </div>
            <span className="text-xs text-[#8B1E2F] font-semibold tracking-wider uppercase">
              {outletProducts.length} Items Available
            </span>
          </div>

          {outletProducts.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E8DFD5] space-y-3">
              <p className="font-serif text-lg text-[#1C1A17]">All outlet pieces currently reserved.</p>
              <p className="text-xs text-[#756A5B]">Contact us directly on WhatsApp to see fresh off-loom arrivals.</p>
              <a
                href={outletWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E7453] text-white text-xs uppercase tracking-wider font-semibold"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Enquire Fresh Off-Loom Stock</span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {outletProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
