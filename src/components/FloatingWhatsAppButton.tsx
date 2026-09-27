import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';
import { createWhatsAppUrl } from '../utils/whatsapp.ts';

export const FloatingWhatsAppButton: React.FC = () => {
  const { settings } = useSettings();

  const url = createWhatsAppUrl(
    settings.whatsappNumber,
    "Hello Bunkar Sanskriti, I am browsing your online store and would like assistance with your Banarasi collection."
  );

  return (
    <aside aria-label="WhatsApp quick contact" className="fixed bottom-6 right-6 z-30 sm:bottom-8 sm:right-8">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="group flex items-center gap-2.5 bg-[#1E7453] hover:bg-[#165a40] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
      >
        <MessageCircle className="w-6 h-6 fill-current text-white shrink-0" />
        <span className="hidden sm:inline font-sans text-xs tracking-wider uppercase font-semibold whitespace-nowrap">
          Order on WhatsApp
        </span>
      </a>
    </aside>
  );
};
