export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number | null; // null represents "Contact for Price"
  salePrice?: number | null;
  description: string;
  shortDescription?: string;
  images: string[];
  available: boolean;
  featured: boolean;
  tags: string[];
  fabric?: string;
  weave?: string;
  color?: string;
  zariType?: string;
  isOutlet?: boolean;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  enabled: boolean;
  displayOrder: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type OrderStatus = 'New' | 'Contacted' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number | null;
  quantity: number;
  selectedVariant?: string;
  image?: string;
}

export interface Order {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  customerNote?: string;
  status: OrderStatus;
  adminNotes?: string;
  createdAt: string;
  viaWhatsApp: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  lastInteraction: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId?: string;
  productName?: string;
  message: string;
  status: 'Pending' | 'Responded' | 'Closed';
  createdAt: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface BusinessHoursDay {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string; // e.g. "10:30"
  closeTime: string; // e.g. "20:30"
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  sonuPhone: string;
  shopPhone: string;
  amanPhone: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  instagramHandle: string;
  instagramUrl: string;
  whatsappNumber: string;
  businessHours: BusinessHoursDay[];
}

export interface AdminStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalEnquiries: number;
  availableProducts: number;
  unavailableProducts: number;
  recentOrders: Order[];
  recentEnquiries: Enquiry[];
  estimatedRevenue: number;
}

export interface AdminAccountInfo {
  isRegistered: boolean;
  username?: string;
  fullName?: string;
  email?: string;
  registeredAt?: string;
}

export interface AdminSetupStatus {
  isRegistered: boolean;
  slotAvailable: boolean;
  username?: string;
  fullName?: string;
  email?: string;
  registeredAt?: string;
  message?: string;
}
