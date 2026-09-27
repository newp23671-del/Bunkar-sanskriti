import type { CartItem, Product } from '../types/index.ts';

/**
 * Format an Indian phone number for wa.me URL
 * Strips non-digits and ensures 91 country code
 */
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Build pre-filled WhatsApp link
 */
export function createWhatsAppUrl(phone: string, text: string): string {
  const formattedPhone = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * Generate inquiry message for a specific product
 */
export function generateProductInquiryMessage(product: Product, selectedVariant?: string): string {
  let msg = `Hello Bunkar Sanskriti, I am interested in:\n\n`;
  msg += `*${product.name}*\n`;
  msg += `Category: ${product.category}\n`;
  if (product.price) {
    msg += `Price: ₹${product.price.toLocaleString('en-IN')}\n`;
  } else {
    msg += `Price: On Request\n`;
  }
  if (selectedVariant) {
    msg += `Selected Variant: ${selectedVariant}\n`;
  }
  if (product.fabric) {
    msg += `Fabric: ${product.fabric}\n`;
  }
  msg += `\nPlease share availability, detailed photos/video, and ordering details.`;
  return msg;
}

/**
 * Generate formatted order message for Shopping Cart
 */
export function generateCartOrderMessage(params: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  customerNote?: string;
  orderReference?: string;
}): string {
  const { customerName, customerPhone, customerAddress, items, customerNote, orderReference } = params;

  let msg = `✨ *NEW ORDER — BUNKAR SANSKRITI* ✨\n`;
  if (orderReference) {
    msg += `Ref ID: #${orderReference}\n`;
  }
  msg += `------------------------------------\n`;
  msg += `*Customer Details:*\n`;
  msg += `• Name: ${customerName}\n`;
  msg += `• Phone: ${customerPhone}\n`;
  msg += `• Delivery Address:\n${customerAddress}\n\n`;

  msg += `*Selected Products:*\n`;
  let subtotal = 0;
  let hasPriceOnRequest = false;

  items.forEach((item, idx) => {
    const p = item.product;
    const priceStr = p.price ? `₹${(p.price * item.quantity).toLocaleString('en-IN')}` : 'Price on request';
    if (p.price) {
      subtotal += p.price * item.quantity;
    } else {
      hasPriceOnRequest = true;
    }

    msg += `${idx + 1}. *${p.name}*\n`;
    msg += `   Qty: ${item.quantity} | ${priceStr}\n`;
    if (item.selectedVariant) {
      msg += `   Option: ${item.selectedVariant}\n`;
    }
  });

  msg += `------------------------------------\n`;
  if (subtotal > 0) {
    msg += `*Estimated Total:* ₹${subtotal.toLocaleString('en-IN')}${hasPriceOnRequest ? ' (+ items on request)' : ''}\n`;
  }

  if (customerNote && customerNote.trim()) {
    msg += `\n*Customer Note:* ${customerNote.trim()}\n`;
  }

  msg += `\nPlease confirm availability and share payment & dispatch details. Thank you!`;

  return msg;
}
