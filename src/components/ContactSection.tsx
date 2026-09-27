import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  MessageCircle, 
  Navigation, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext.tsx';
import { createWhatsAppUrl } from '../utils/whatsapp.ts';
import { api } from '../utils/api.ts';

export const ContactSection: React.FC = () => {
  const { settings } = useSettings();

  // Enquiry form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const whatsAppGeneralUrl = createWhatsAppUrl(
    settings.whatsappNumber,
    "Hello Bunkar Sanskriti, I have an enquiry regarding your Varanasi collection."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please provide your name, phone number, and message.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitEnquiry({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        message: message.trim(),
      });
      setSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError('Failed to send enquiry. Please contact us via WhatsApp or Phone directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#EAE2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#8B1E2F]">
            <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Connect with our Varanasi Atelier</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1A17] tracking-tight">
            Contact Bunkar Sanskriti
          </h2>
          <p className="text-sm sm:text-base text-[#615647] font-normal leading-relaxed">
            Whether inquiring about bridal trousseau, bulk materials, or planning a visit to our Lanka Road outlet, our team is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Business Details & Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Business Info Card */}
            <div className="p-6 sm:p-8 bg-white border border-[#E8DFD5] shadow-xs space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-bold tracking-wider text-[#1C1A17] uppercase">
                  {settings.businessName}
                </h3>
                <p className="text-xs uppercase tracking-widest text-[#8B1E2F] font-semibold mt-0.5">
                  {settings.tagline}
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 text-xs sm:text-sm text-[#4A4237]">
                <MapPin className="w-5 h-5 text-[#8B1E2F] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1C1A17] block mb-0.5">Physical Outlet Address</span>
                  <p className="leading-relaxed">{settings.address}</p>
                </div>
              </div>

              {/* Direct Phone Numbers */}
              <div className="flex items-start gap-3 text-xs sm:text-sm text-[#4A4237]">
                <Phone className="w-5 h-5 text-[#8B1E2F] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-[#1C1A17] block mb-0.5">Direct Phone Numbers</span>
                  <p>
                    <span className="text-[#75695B]">Sonu:</span>{' '}
                    <a href={`tel:${settings.sonuPhone}`} className="text-[#1C1A17] font-medium hover:text-[#8B1E2F] underline">
                      {settings.sonuPhone}
                    </a>
                  </p>
                  <p>
                    <span className="text-[#75695B]">Shop:</span>{' '}
                    <a href={`tel:${settings.shopPhone}`} className="text-[#1C1A17] font-medium hover:text-[#8B1E2F] underline">
                      {settings.shopPhone}
                    </a>
                  </p>
                  <p>
                    <span className="text-[#75695B]">Aman:</span>{' '}
                    <a href={`tel:${settings.amanPhone}`} className="text-[#1C1A17] font-medium hover:text-[#8B1E2F] underline">
                      {settings.amanPhone}
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 text-xs sm:text-sm text-[#4A4237]">
                <Mail className="w-5 h-5 text-[#8B1E2F] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1C1A17] block mb-0.5">Official Email</span>
                  <a href={`mailto:${settings.email}`} className="text-[#8B1E2F] underline font-medium">
                    {settings.email}
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-3 text-xs sm:text-sm text-[#4A4237]">
                <Instagram className="w-5 h-5 text-[#8B1E2F] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#1C1A17] block mb-0.5">Instagram Official</span>
                  <a 
                    href={settings.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#8B1E2F] underline font-medium"
                  >
                    {settings.instagramHandle}
                  </a>
                </div>
              </div>

              {/* Quick Action Button Group */}
              <div className="pt-4 border-t border-[#F0E9DF] grid grid-cols-2 gap-2">
                <a
                  href={`tel:${settings.sonuPhone}`}
                  className="py-2.5 px-3 bg-[#1C1A17] hover:bg-[#362F27] text-white text-[11px] font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>

                <a
                  href={whatsAppGeneralUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#1E7453] hover:bg-[#165a40] text-white text-[11px] font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`mailto:${settings.email}`}
                  className="py-2.5 px-3 bg-white border border-[#332B23] text-[#1C1A17] hover:bg-[#F2ECE4] text-[11px] font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>

                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#8B1E2F] hover:bg-[#721524] text-white text-[11px] font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>

            </div>

            {/* Business Hours Widget */}
            <div className="p-6 bg-white border border-[#E8DFD5] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0E9DF]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8B1E2F]" />
                  <h4 className="font-serif text-base font-semibold text-[#1C1A17]">Business Hours</h4>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 ${
                  settings.currentStatus.isOpen 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {settings.currentStatus.statusText}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {settings.businessHours.map((schedule) => {
                  const isCurrentDay = schedule.day === settings.currentStatus.day;
                  return (
                    <div 
                      key={schedule.day}
                      className={`flex justify-between py-1 px-1.5 ${
                        isCurrentDay ? 'bg-[#F5EFEB] font-medium text-[#1C1A17]' : 'text-[#615647]'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {isCurrentDay && <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E2F]" />}
                        <span>{schedule.day}</span>
                      </span>
                      <span>
                        {schedule.isOpen ? `${schedule.openTime} – ${schedule.closeTime}` : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#8C7D6D] pt-1">
                * Timings subject to festive and auspicious days in Varanasi.
              </p>
            </div>

          </div>

          {/* Right Column: Google Maps & Direct Message Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Google Maps Visual Card */}
            <div className="bg-white border border-[#E8DFD5] shadow-xs overflow-hidden">
              <div className="p-4 bg-[#F7F3EE] border-b border-[#E8DFD5] flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#1C1A17]">
                    Varanasi Location Map
                  </h4>
                  <p className="text-[11px] text-[#786C5D]">
                    Ravindrapuri Extension, Lanka Road (Opp. Oriyana Hospital)
                  </p>
                </div>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B1E2F] hover:bg-[#721524] text-white text-[11px] font-semibold uppercase tracking-wider transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Open in Google Maps</span>
                </a>
              </div>

              {/* Embedded interactive map iframe */}
              <div className="w-full h-72 sm:h-80 bg-[#EAE2D8] relative">
                <iframe
                  title="Bunkar Sanskriti Location Varanasi"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.412128521035!2d82.99264147612702!3d25.290356777648356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e31f7c8443e27%3A0xb5b79659be83e54b!2sRavindrapuri%20Ext%2C%20Lanka%2C%20Varanasi%2C%20Uttar%20Pradesh%20221005!5e0!3m2!1sen!2sin!4v1711536000000!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Direct Enquiry Form */}
            <div className="p-6 sm:p-8 bg-white border border-[#E8DFD5] shadow-xs space-y-4">
              <div className="border-b border-[#F0E9DF] pb-3">
                <h4 className="font-serif text-xl font-semibold text-[#1C1A17]">
                  Send a Direct Message / Custom Saree Inquiry
                </h4>
                <p className="text-xs text-[#706455] mt-0.5">
                  Looking for a specific weave, custom dye, or trousseau consultation? Leave your details below.
                </p>
              </div>

              {success ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h5 className="font-serif text-lg font-semibold text-emerald-950">Thank You!</h5>
                  <p className="text-xs leading-relaxed max-w-sm mx-auto">
                    Your enquiry has been received by our Varanasi team. We will reach out to you via WhatsApp / phone shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-2 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                        Your Full Name <span className="text-[#8B1E2F]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ananya Sen"
                        className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                        Phone / WhatsApp <span className="text-[#8B1E2F]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9305564295"
                        className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ananya@example.com"
                      className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                      Your Message / Inquiry <span className="text-[#8B1E2F]">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe what kind of Banarasi saree, suit fabric or bridal requirements you have..."
                      className="w-full text-xs px-3 py-2.5 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#8B1E2F] hover:bg-[#701523] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Sending Enquiry...' : 'Submit Enquiry to Atelier'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
