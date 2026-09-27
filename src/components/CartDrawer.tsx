import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  MessageCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { api } from '../utils/api.ts';
import { createWhatsAppUrl, generateCartOrderMessage } from '../utils/whatsapp.ts';
import { saveOrderToFirestore } from '../firebase.ts';

export const CartDrawer: React.FC = () => {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    subtotal, 
    hasUnpricedItems 
  } = useCart();
  const { settings } = useSettings();

  // Customer Checkout Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrderRef, setCompletedOrderRef] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCheckoutToWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!customerAddress.trim()) {
      setErrorMessage('Please enter your delivery address with city and pin code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit order to database
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerNote: customerNote.trim() || undefined,
        totalAmount: subtotal,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.salePrice ?? i.product.price,
          quantity: i.quantity,
          selectedVariant: i.selectedVariant,
          image: i.product.images?.[0],
        })),
        viaWhatsApp: true,
      };

      const createdOrder = await api.submitOrder(orderPayload);
      const orderRef = createdOrder.reference || 'BS-' + Date.now().toString().slice(-6);

      // Also persist to Firebase Cloud Firestore directly
      saveOrderToFirestore(createdOrder).catch((e) => console.warn('Firestore direct save note:', e));

      // 2. Build formatted WhatsApp message
      const whatsAppMsg = generateCartOrderMessage({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items,
        customerNote: customerNote.trim(),
        orderReference: orderRef,
      });

      const waUrl = createWhatsAppUrl(settings.whatsappNumber, whatsAppMsg);

      // 3. Clear cart and set completed order state
      setCompletedOrderRef(orderRef);
      clearCart();

      // 4. Open WhatsApp
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Order submission error:', err);
      // Fallback: still open WhatsApp even if DB write had an issue
      const whatsAppMsg = generateCartOrderMessage({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items,
        customerNote: customerNote.trim(),
      });
      const waUrl = createWhatsAppUrl(settings.whatsappNumber, whatsAppMsg);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setCompletedOrderRef('DIRECT-WA');
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-lg bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8B1E2F]" />
            <h2 className="font-serif text-xl font-semibold text-[#1C1A17]">Your Selected Items</h2>
            <span className="text-xs text-[#8A7D6E] font-medium">({items.length})</span>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setCompletedOrderRef(null);
            }}
            className="p-1.5 text-[#524A40] hover:text-[#8B1E2F] rounded-full hover:bg-[#F2ECE4] transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {completedOrderRef ? (
            /* Order Success State */
            <div className="py-12 px-4 text-center space-y-4 bg-white border border-[#E8DFD5] p-6 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">
                Order Sent on WhatsApp!
              </h3>
              <p className="text-xs text-[#706455] leading-relaxed max-w-xs mx-auto">
                Reference ID: <span className="font-bold text-[#8B1E2F]">#{completedOrderRef}</span>. Our team at Bunkar Sanskriti will review your order on WhatsApp and confirm dispatch.
              </p>
              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCompletedOrderRef(null);
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3 bg-[#1C1A17] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#332C25] transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart State */
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#EFE8DF] flex items-center justify-center text-[#8C7D6D]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#1C1A17]">Your Cart is Empty</h3>
              <p className="text-xs text-[#756A5B] max-w-xs mx-auto">
                Explore our authentic Banarasi sarees, suits, and designer brocade fabrics.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8B1E2F] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#721524] transition-colors cursor-pointer"
              >
                <span>Browse Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Product List */}
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const p = item.product;
                  const itemPrice = p.salePrice ?? p.price;
                  const itemImage = p.images?.[0] || '/src/assets/images/hero_banarasi_saree_1790522952613.jpg';

                  return (
                    <div 
                      key={`${p.id}-${item.selectedVariant || idx}`}
                      className="flex gap-4 p-3 bg-white border border-[#EBE3D7] shadow-2xs"
                    >
                      {/* Thumbnail */}
                      <img
                        src={itemImage}
                        alt={p.name}
                        className="w-18 h-22 object-cover object-center bg-[#F7F3EE] shrink-0"
                      />

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif text-sm font-semibold text-[#1C1A17] line-clamp-1">
                              {p.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(p.id, item.selectedVariant)}
                              className="text-[#968777] hover:text-[#8B1E2F] p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-[11px] text-[#7A6E5F] mt-0.5">
                            <span>{p.category}</span>
                            {item.selectedVariant && (
                              <span className="ml-1 text-[#8B1E2F]">({item.selectedVariant})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-[#D9CFBF] bg-[#FAF8F5]">
                            <button
                              onClick={() => updateQuantity(p.id, item.quantity - 1, item.selectedVariant)}
                              className="p-1 hover:bg-[#EAE2D5] text-[#241F1A]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-[#1C1A17]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(p.id, item.quantity + 1, item.selectedVariant)}
                              className="p-1 hover:bg-[#EAE2D5] text-[#241F1A]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            {itemPrice !== null ? (
                              <span className="font-serif text-sm font-semibold text-[#8B1E2F]">
                                ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-[#8B1E2F]">
                                Price on request
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal Banner */}
              <div className="p-4 bg-white border border-[#E8DFD5] space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-wider text-[#6B6154] font-medium">Estimated Subtotal</span>
                  <span className="font-serif text-xl font-bold text-[#1C1A17]">
                    ₹{subtotal.toLocaleString('en-IN')}
                    {hasUnpricedItems && <span className="text-xs text-[#8B1E2F] font-normal ml-1">(+ bespoke items)</span>}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C7D6C]">
                  Delivery charges and exact timeline will be confirmed on WhatsApp based on your destination pin code.
                </p>
              </div>

              {/* Customer Information Form before WhatsApp */}
              <form id="cart-order-form" onSubmit={handleCheckoutToWhatsApp} className="p-4 bg-white border border-[#E8DFD5] space-y-3">
                <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#1C1A17] pb-1 border-b border-[#F0E9DF]">
                  Order Delivery Details
                </h4>

                {errorMessage && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] uppercase font-semibold text-[#544C41] mb-1">
                    Your Full Name <span className="text-[#8B1E2F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-semibold text-[#544C41] mb-1">
                    WhatsApp Phone Number <span className="text-[#8B1E2F]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-semibold text-[#544C41] mb-1">
                    Full Delivery Address (with Pin Code) <span className="text-[#8B1E2F]">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House/Flat No, Street, City, State, PIN"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-semibold text-[#544C41] mb-1">
                    Special Note / Fall-Pico / Customization (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Need matching tassels, urgent delivery date"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                  />
                </div>
              </form>
            </>
          )}

        </div>

        {/* Footer Actions */}
        {items.length > 0 && !completedOrderRef && (
          <div className="p-5 border-t border-[#E8DFD5] bg-white space-y-2">
            <button
              form="cart-order-form"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#1E7453] hover:bg-[#165a40] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{isSubmitting ? 'Preparing Order...' : 'Send Order to WhatsApp'}</span>
            </button>
            <p className="text-[10px] text-center text-[#827464]">
              Pre-filled formatted order will open directly in WhatsApp with {settings.whatsappNumber}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
