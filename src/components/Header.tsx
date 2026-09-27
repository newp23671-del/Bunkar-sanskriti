import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  MessageCircle, 
  Phone, 
  Clock, 
  MapPin 
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { createWhatsAppUrl } from '../utils/whatsapp.ts';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  onOpenSearch,
}) => {
  const { totalCount, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'collection', label: 'Collection' },
    { id: 'about', label: 'About' },
    { id: 'factory-outlet', label: 'Factory Outlet' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const whatsAppGeneralUrl = createWhatsAppUrl(
    settings.whatsappNumber,
    `Hello Bunkar Sanskriti, I am visiting your website and would like to enquire about your Banarasi collection.`
  );

  return (
    <>
      {/* Top Notice Bar with Live Business Hours Status & Direct WhatsApp Call */}
      <aside aria-label="Announcement banner" className="bg-[#1C1A17] text-[#D8C7B5] text-xs py-1.5 px-4 border-b border-[#2E2A24]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px] tracking-wide">
            <span className="flex items-center gap-1.5">
              <span 
                className={`inline-block w-2 h-2 rounded-full ${
                  settings.currentStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-medium text-white">{settings.currentStatus.statusText}</span>
              <span className="text-[#A89885] hidden sm:inline">· {settings.currentStatus.detail}</span>
            </span>
            <span className="hidden md:inline text-[#665D52]">|</span>
            <span className="hidden md:flex items-center gap-1 text-[#A89885]">
              <MapPin className="w-3 h-3 text-[#C5A059]" />
              <span>Ravindrapuri Extension, Lanka Road, Varanasi</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a 
              href={`tel:${settings.sonuPhone}`} 
              className="hover:text-white transition-colors hidden sm:flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-[#C5A059]" />
              <span>Sonu: {settings.sonuPhone}</span>
            </a>
            <span className="text-[#665D52] hidden sm:inline">·</span>
            <a 
              href={`tel:${settings.shopPhone}`} 
              className="hover:text-white transition-colors hidden lg:flex items-center gap-1"
            >
              <span>Shop: {settings.shopPhone}</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm border-b border-[#E8DFD5] py-3' 
            : 'bg-[#FAF8F5] border-b border-[#EFE8DF] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Zone 1: Brand Title (Single text element wordmark in display serif) */}
          <div className="flex items-center">
            <button
              onClick={() => handleLinkClick('home')}
              className="text-left group cursor-pointer"
            >
              <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-[#1C1A17] group-hover:text-[#8B1E2F] transition-colors uppercase">
                Bunkar Sanskriti
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean text links with subtle hover underline) */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] tracking-widest font-medium uppercase text-[#4A453E]">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`transition-colors py-1 relative cursor-pointer ${
                    isActive 
                      ? 'text-[#8B1E2F] font-semibold' 
                      : 'hover:text-[#8B1E2F]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#8B1E2F]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Search, Cart, WhatsApp CTA) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#4A453E] hover:text-[#8B1E2F] transition-colors rounded-full hover:bg-[#EFE8DF]/60 cursor-pointer"
              title="Search collection"
              aria-label="Search collection"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#4A453E] hover:text-[#8B1E2F] transition-colors rounded-full hover:bg-[#EFE8DF]/60 relative cursor-pointer"
              title="View Cart"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B1E2F] text-white text-[10px] font-semibold flex items-center justify-center rounded-full shadow-sm">
                  {totalCount}
                </span>
              )}
            </button>

            {/* WhatsApp CTA (Primary conversion) */}
            <a
              href={whatsAppGeneralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs tracking-wider uppercase font-semibold text-white bg-[#1E7453] hover:bg-[#165a40] transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span className="whitespace-nowrap">Order on WhatsApp</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#2A2723] hover:text-[#8B1E2F] transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#1C1A17]/70 backdrop-blur-xs flex justify-end">
          <div className="w-[85%] max-w-sm bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E8DFD5]">
                <span className="font-serif text-xl font-semibold tracking-wider text-[#1C1A17] uppercase">
                  Bunkar Sanskriti
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#4A453E] hover:text-[#8B1E2F]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Status Indicator */}
              <div className="py-3 px-3 my-4 bg-[#F2ECE4] border border-[#E0D5C7] text-xs flex items-center justify-between">
                <span className="font-medium text-[#2A2723] flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${settings.currentStatus.isOpen ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                  Store Status:
                </span>
                <span className={`font-semibold ${settings.currentStatus.isOpen ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {settings.currentStatus.statusText}
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1 py-2">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link.id)}
                      className={`text-left py-3 px-3 tracking-widest uppercase text-sm font-medium transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-[#8B1E2F] text-white font-semibold' 
                          : 'text-[#3E3932] hover:bg-[#EFE8DF]'
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-6 border-t border-[#E8DFD5] space-y-3">
              <a
                href={whatsAppGeneralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1E7453] text-white text-xs font-semibold uppercase tracking-wider shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Order on WhatsApp</span>
              </a>

              <div className="text-xs text-[#5C5449] space-y-1.5 pt-2">
                <p className="font-medium text-[#1C1A17]">Direct Contacts:</p>
                <p>Sonu: <a href={`tel:${settings.sonuPhone}`} className="text-[#8B1E2F] underline">{settings.sonuPhone}</a></p>
                <p>Shop: <a href={`tel:${settings.shopPhone}`} className="text-[#8B1E2F] underline">{settings.shopPhone}</a></p>
                <p>Aman: <a href={`tel:${settings.amanPhone}`} className="text-[#8B1E2F] underline">{settings.amanPhone}</a></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
