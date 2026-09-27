import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Instagram, ShieldCheck, Heart, UserPlus, KeyRound } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';
import { api } from '../utils/api.ts';

interface FooterProps {
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const { settings } = useSettings();
  const [adminStatus, setAdminStatus] = useState<{ isRegistered: boolean; slotAvailable: boolean } | null>(null);

  useEffect(() => {
    api.getAdminSetupStatus().then(setAdminStatus).catch(() => null);
  }, []);

  return (
    <footer className="bg-[#1C1A17] text-[#D8C7B5] pt-16 pb-12 border-t border-[#2E2A24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#2E2A24]">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-serif text-2xl sm:text-3xl text-white font-semibold tracking-wider uppercase block">
              BUNKAR SANSKRITI
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C5A059] font-medium">
              {settings.tagline}
            </p>
            <p className="text-xs text-[#9E8E7D] leading-relaxed max-w-sm">
              A premium Varanasi-based traditional textile and fashion brand specializing in authentic Banarasi sarees, suits, and designer materials. Woven with generations of artisan grace.
            </p>
            <div className="pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#E0C696] hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>{settings.instagramHandle}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-[#A89886]">
              {['home', 'collection', 'about', 'factory-outlet', 'contact'].map((id) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate(id)}
                    className="hover:text-white capitalize transition-colors cursor-pointer"
                  >
                    {id.replace('-', ' ')}
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-[#2E2A24]">
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#E0C696] text-[#C5A059] flex items-center gap-1.5 font-medium transition-colors cursor-pointer text-[11px]"
                >
                  {adminStatus?.slotAvailable ? (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-[#E0C696]" />
                      <span>Admin Sign-Up (1 Slot Open)</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Admin Login</span>
                    </>
                  )}
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-[#A89886]">
              <li>
                <button onClick={() => onNavigate('collection')} className="hover:text-white transition-colors">
                  Banarasi Saree
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('collection')} className="hover:text-white transition-colors">
                  Suit Ensembles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('collection')} className="hover:text-white transition-colors">
                  Designer Material
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('factory-outlet')} className="hover:text-white transition-colors">
                  Factory Outlet
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-3 text-xs text-[#A89886]">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
              Varanasi Atelier & Outlet
            </h4>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {settings.address}
              </p>
            </div>
            <div className="flex items-start gap-2.5 pt-1">
              <Phone className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p>Sonu: <a href={`tel:${settings.sonuPhone}`} className="text-white hover:underline">{settings.sonuPhone}</a></p>
                <p>Shop: <a href={`tel:${settings.shopPhone}`} className="text-white hover:underline">{settings.shopPhone}</a></p>
                <p>Aman: <a href={`tel:${settings.amanPhone}`} className="text-white hover:underline">{settings.amanPhone}</a></p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
              <a href={`mailto:${settings.email}`} className="text-white hover:underline">
                {settings.email}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A6E5F]">
          <p>© {new Date().getFullYear()} BUNKAR SANSKRITI. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Tradition Woven With Grace</span>
            <button
              onClick={onOpenAdmin}
              className="text-[#C5A059] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-[#241F1A] px-3 py-1.5 border border-[#3A332C]"
            >
              {adminStatus?.slotAvailable ? (
                <>
                  <UserPlus className="w-3.5 h-3.5 text-[#E0C696]" />
                  <span className="font-semibold text-[#E0C696]">Admin Sign-Up (1 Slot Available) / Login</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Admin Login</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
