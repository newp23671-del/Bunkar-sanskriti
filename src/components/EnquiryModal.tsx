import React, { useState } from 'react';
import { X, Send, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { useSettings } from '../context/SettingsContext.tsx';
import { api } from '../utils/api.ts';
import { createWhatsAppUrl } from '../utils/whatsapp.ts';
import { saveEnquiryToFirestore } from '../firebase.ts';

interface EnquiryModalProps {
  product: Product | null;
  onClose: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ product, onClose }) => {
  const { settings } = useSettings();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    product ? `Hello, I would like to inquire about "${product.name}". Could you share video presentation and customization options?` : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please provide your name, phone number, and enquiry details.');
      return;
    }

    setSubmitting(true);
    try {
      const enquiryData = {
        id: 'enq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        productId: product.id,
        productName: product.name,
        message: message.trim(),
        status: 'Pending' as const,
        createdAt: new Date().toISOString(),
      };
      await api.submitEnquiry(enquiryData);
      saveEnquiryToFirestore(enquiryData).catch((e) => console.warn('Firestore enquiry save note:', e));
      setSuccess(true);
    } catch {
      setError('Unable to save enquiry. You can send it directly via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendViaWhatsApp = () => {
    let msg = `Hello Bunkar Sanskriti,\nI have an enquiry regarding *${product.name}* (ID: ${product.id}):\n\n`;
    msg += `• Name: ${name || 'Customer'}\n`;
    if (phone) msg += `• Phone: ${phone}\n`;
    msg += `• Enquiry: ${message || 'Please share more photos and details.'}\n`;

    const url = createWhatsAppUrl(settings.whatsappNumber, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-lg bg-white shadow-2xl border border-[#E8DFD5] overflow-hidden p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#524A40] hover:text-[#8B1E2F] rounded-full hover:bg-[#F2ECE4]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[#E8DFD5] pb-3 mb-4">
          <span className="text-[10px] uppercase tracking-widest text-[#8B1E2F] font-semibold">
            Product Enquiry & Video Call
          </span>
          <h3 className="font-serif text-xl font-semibold text-[#1C1A17] mt-0.5">
            {product.name}
          </h3>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-serif text-xl font-semibold text-[#1C1A17]">Enquiry Received</h4>
            <p className="text-xs text-[#706456] leading-relaxed max-w-sm mx-auto">
              Thank you {name}. Our Banarasi weavers and team will review your query and contact you with video clips and full details.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleSendViaWhatsApp}
                className="w-full py-2.5 bg-[#1E7453] hover:bg-[#165a40] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Also Chat on WhatsApp Now</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-[#635749] underline"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#544C41] mb-1">
                Your Name <span className="text-[#8B1E2F]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Mukherjee"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#544C41] mb-1">
                WhatsApp Phone Number <span className="text-[#8B1E2F]">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#544C41] mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya@example.com"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-semibold text-[#544C41] mb-1">
                Your Question / Inquiry <span className="text-[#8B1E2F]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-[#8B1E2F] hover:bg-[#721524] text-white font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
              </button>
              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                className="flex-1 py-3 bg-[#1E7453] hover:bg-[#165a40] text-white font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Ask on WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
