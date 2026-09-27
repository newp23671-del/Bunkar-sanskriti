import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { 
  Product, 
  Category, 
  Order, 
  Customer, 
  Enquiry, 
  BusinessSettings, 
  AdminStats 
} from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'bunkar_store.json');

// Default initial database content
const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'BUNKAR SANSKRITI',
  tagline: 'TRADITION WOVEN WITH GRACE',
  sonuPhone: '9305564295',
  shopPhone: '9250420097',
  amanPhone: '8468098924',
  email: 'shadabk3050@gamil.com',
  address: 'Plot No-17, Ravindrapuri Extension, Lanka Road, Opp. Oriyana Hospital, Near Champaran Restaurant, Varanasi – 221005, Uttar Pradesh, India',
  googleMapsUrl: 'https://maps.app.goo.gl/Bnx9Se7HRZ9hL7bB9',
  instagramHandle: '@BUNKAR.__SANSKRITI',
  instagramUrl: 'https://www.instagram.com/BUNKAR.__SANSKRITI',
  whatsappNumber: '9305564295',
  businessHours: [
    { day: 'Monday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Tuesday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Wednesday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Thursday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Friday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Saturday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Sunday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
  ],
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Banarasi Saree',
    slug: 'banarasi-saree',
    description: 'Masterpieces in Pure Katan Silk, Organza, Georgette & Tussar with intricate handwoven zari motifs.',
    image: '/src/assets/images/hero_banarasi_saree_1790522952613.jpg',
    enabled: true,
    displayOrder: 1,
  },
  {
    id: 'cat-2',
    name: 'Suit',
    slug: 'suit',
    description: 'Bespoke Banarasi unstitched silk suit fabrics, sets and festive ensembles with artisanal dupattas.',
    image: '/src/assets/images/banarasi_suit_collection_1790522981322.jpg',
    enabled: true,
    displayOrder: 2,
  },
  {
    id: 'cat-3',
    name: 'Designer Material',
    slug: 'designer-material',
    description: 'Rich Banarasi brocades, kadhwa fabrics, and silk textiles crafted for couturiers and bespoke tailoring.',
    image: '/src/assets/images/designer_brocade_textile_1790522995915.jpg',
    enabled: true,
    displayOrder: 3,
  },
  {
    id: 'cat-4',
    name: 'Factory Outlet',
    slug: 'factory-outlet',
    description: 'Direct-from-loom authentic Varanasi textiles, outlet specials and exclusive factory rates.',
    image: '/src/assets/images/banarasi_saree_royal_1790522967794.jpg',
    enabled: true,
    displayOrder: 4,
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Royal Crimson Katan Silk Kadhwa Saree',
    slug: 'royal-crimson-katan-silk-kadhwa-saree',
    category: 'Banarasi Saree',
    price: 18500,
    salePrice: 16800,
    shortDescription: 'Opulent pure Katan silk saree woven with timeless antique gold floral kadhwa jaal and rich pallu.',
    description: 'An exemplary heirloom piece representing the pinnacle of Varanasi weaving. Woven on traditional pit looms in pure Mulberry Katan silk, this crimson saree features magnificent floral kadhwa motifs rendered in fine antique golden zari. The dense meenakari border and intricately designed pallu lend an unmatched majesty for weddings and grand festive celebrations. Comes with an unstitched matching blouse piece with zari border.',
    images: [
      '/src/assets/images/hero_banarasi_saree_1790522952613.jpg',
      '/src/assets/images/banarasi_saree_royal_1790522967794.jpg',
      '/src/assets/images/designer_brocade_textile_1790522995915.jpg'
    ],
    available: true,
    featured: true,
    tags: ['Bridal', 'Kadhwa Jaal', 'Pure Silk', 'Heirloom', 'Best Seller'],
    fabric: 'Pure Katan Silk',
    weave: 'Kadhwa Handloom',
    color: 'Crimson Red & Antique Gold',
    zariType: 'Antique Gold Zari',
    isOutlet: false,
    variants: [
      { name: 'Color', options: ['Crimson Red', 'Rani Pink', 'Maroon Wine'] }
    ],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Regal Sapphire Katan Silk Meenakari Saree',
    slug: 'regal-sapphire-katan-silk-meenakari-saree',
    category: 'Banarasi Saree',
    price: 21500,
    salePrice: 19800,
    shortDescription: 'Deep royal blue Katan silk saree with fine meenakari motifs and elaborate golden zari pallu.',
    description: 'A striking sapphire blue Banarasi Katan silk saree handcrafted by master weavers in Varanasi. Detailed with delicate multi-colored meenakari floral bootis across the body and finished with a royal gold brocade pallu. The luminous drape reflects subtle undertones under ambient light, making it a coveted piece for evening galas and wedding receptions.',
    images: [
      '/src/assets/images/banarasi_saree_royal_1790522967794.jpg',
      '/src/assets/images/hero_banarasi_saree_1790522952613.jpg'
    ],
    available: true,
    featured: true,
    tags: ['Meenakari', 'Royal Blue', 'Pure Silk', 'Cocktail', 'Wedding'],
    fabric: 'Pure Katan Silk',
    weave: 'Meenakari Brocade',
    color: 'Sapphire Blue & Gold',
    zariType: 'Fine Tested Zari',
    isOutlet: false,
    variants: [
      { name: 'Color', options: ['Sapphire Blue', 'Midnight Navy', 'Teal Green'] }
    ],
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-02T10:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'Blush Rose Banarasi Silk Suit Set with Kadhwa Dupatta',
    slug: 'blush-rose-banarasi-silk-suit-set',
    category: 'Suit',
    price: 12500,
    salePrice: 11200,
    shortDescription: 'Pastel blush pink unstitched pure silk suit fabric paired with a lavish handwoven zari dupatta.',
    description: 'Celebrate contemporary grace infused with Varanasi tradition. This three-piece unstitched luxury ensemble includes fine Banarasi silk shirt fabric with subtle zari butas, pure silk bottom fabric, and a breathtaking full-length Kadhwa zari dupatta that steals the spotlight. Perfect for daytime festivities, poojas, and intimate ceremonies.',
    images: [
      '/src/assets/images/banarasi_suit_collection_1790522981322.jpg',
      '/src/assets/images/designer_brocade_textile_1790522995915.jpg'
    ],
    available: true,
    featured: true,
    tags: ['Suit Ensemble', 'Pastel', 'Kadhwa Dupatta', 'Festive Wear'],
    fabric: 'Pure Silk & Chanderi Silk',
    weave: 'Banarasi Buta Weave',
    color: 'Blush Pink & Muted Gold',
    zariType: 'Zari Weave',
    isOutlet: false,
    variants: [
      { name: 'Color', options: ['Blush Pink', 'Mint Green', 'Ivory Cream'] }
    ],
    createdAt: '2026-03-03T10:00:00.000Z',
    updatedAt: '2026-03-03T10:00:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'Emerald Floral Heritage Banarasi Brocade Fabric',
    slug: 'emerald-floral-heritage-banarasi-brocade-fabric',
    category: 'Designer Material',
    price: 3200,
    salePrice: null,
    shortDescription: 'Price per meter. Rich emerald green brocade with pure zari floral jaal for lehengas, sherwanis & jackets.',
    description: 'Artisanal Banarasi brocade fabric woven with intricate gold and resham threads on a deep emerald green ground. Designed specifically for haute couture garments, wedding lehengas, jackets, bespoke sherwanis, and luxury blouses. The weight is balanced, providing structured drape and regal sheen.',
    images: [
      '/src/assets/images/designer_brocade_textile_1790522995915.jpg',
      '/src/assets/images/banarasi_saree_royal_1790522967794.jpg'
    ],
    available: true,
    featured: true,
    tags: ['Brocade', 'Per Meter', 'Designer Fabric', 'Lehenga Fabric'],
    fabric: 'Banarasi Silk Brocade',
    weave: 'Tanchoi Brocade',
    color: 'Emerald Green & Gold',
    zariType: 'Gold Brocade Zari',
    isOutlet: false,
    variants: [
      { name: 'Quantity (Meters)', options: ['1 Meter', '2.5 Meters', '5 Meters', '9 Meters (Full Lehenga)'] }
    ],
    createdAt: '2026-03-04T10:00:00.000Z',
    updatedAt: '2026-03-04T10:00:00.000Z',
  },
  {
    id: 'prod-5',
    name: 'Varanasi Loom Direct: Vintage Rani Organza Saree',
    slug: 'varanasi-loom-direct-vintage-rani-organza-saree',
    category: 'Factory Outlet',
    price: 9800,
    salePrice: 8500,
    shortDescription: 'Exclusive factory outlet rate. Featherlight Banarasi Kora Organza saree with rose gold zari motifs.',
    description: 'Sourced directly from our Varanasi weaving units, this factory outlet special brings you authentic artisan weaving at transparent factory rates. Woven in sheer, crisp Kora Organza silk with contemporary geometric floral bootis and an understated border. Incredibly lightweight yet undeniably festive.',
    images: [
      '/src/assets/images/hero_banarasi_saree_1790522952613.jpg',
      '/src/assets/images/banarasi_suit_collection_1790522981322.jpg'
    ],
    available: true,
    featured: false,
    tags: ['Outlet Special', 'Organza Silk', 'Lightweight', 'Direct From Loom'],
    fabric: 'Kora Organza Silk',
    weave: 'Organza Jacquard',
    color: 'Rani Fuchsia & Rose Gold',
    zariType: 'Rose Gold Zari',
    isOutlet: true,
    createdAt: '2026-03-05T10:00:00.000Z',
    updatedAt: '2026-03-05T10:00:00.000Z',
  },
  {
    id: 'prod-6',
    name: 'Exclusive Bridal Jangla Gold Tissue Saree',
    slug: 'exclusive-bridal-jangla-gold-tissue-saree',
    category: 'Banarasi Saree',
    price: null, // "Contact for Price"
    salePrice: null,
    shortDescription: 'Masterpiece gold tissue silk saree woven with full all-over jangla hunting scene in pure zari.',
    description: 'A museum-grade collectible crafted over 12 weeks of meticulous pit loom weaving. Woven in golden tissue silk with a mesmerizing all-over jangla design depicting traditional flora, creepers, and paisley motifs. Reserved for brides and high-fashion connoisseurs. Contact us on WhatsApp for pricing, customization and high-resolution video viewing.',
    images: [
      '/src/assets/images/designer_brocade_textile_1790522995915.jpg',
      '/src/assets/images/hero_banarasi_saree_1790522952613.jpg'
    ],
    available: true,
    featured: true,
    tags: ['Custom Order', 'Bridal Exclusive', 'Tissue Silk', 'Jangla Weave'],
    fabric: 'Pure Gold Tissue Silk',
    weave: 'Jangla Handloom',
    color: 'Champagne Gold',
    zariType: 'Pure Antique Zari',
    isOutlet: false,
    createdAt: '2026-03-06T10:00:00.000Z',
    updatedAt: '2026-03-06T10:00:00.000Z',
  },
  {
    id: 'prod-7',
    name: 'Mustard Yellow Tanchoi Silk Festive Suit',
    slug: 'mustard-yellow-tanchoi-silk-festive-suit',
    category: 'Suit',
    price: 11000,
    salePrice: 9900,
    shortDescription: 'Vibrant turmeric mustard Banarasi Tanchoi unstitched silk suit with woven resham contrast dupatta.',
    description: 'Handcrafted in Varanasi using the heritage Tanchoi weaving technique where extra weft threads create an embossed satin-smooth motif on the face of the fabric. Soft on the skin with zero floats, paired with an artisanal matching dupatta and premium salwar fabric.',
    images: [
      '/src/assets/images/banarasi_suit_collection_1790522981322.jpg',
      '/src/assets/images/banarasi_saree_royal_1790522967794.jpg'
    ],
    available: true,
    featured: false,
    tags: ['Tanchoi Weave', 'Haldi Special', 'Festive Collection'],
    fabric: 'Tanchoi Silk',
    weave: 'Tanchoi Jacquard',
    color: 'Turmeric Mustard & Olive',
    zariType: 'Resham & Subtle Zari',
    isOutlet: false,
    createdAt: '2026-03-07T10:00:00.000Z',
    updatedAt: '2026-03-07T10:00:00.000Z',
  },
  {
    id: 'prod-8',
    name: 'Outlet Clearance: Mulberry Silk Brocade Stole & Fabric Combo',
    slug: 'outlet-clearance-mulberry-silk-brocade-combo',
    category: 'Factory Outlet',
    price: 4500,
    salePrice: 3800,
    shortDescription: 'Varanasi outlet surplus. 2.5 meters designer brocade fabric with matching Banarasi border.',
    description: 'Direct factory outlet offer. Pure Mulberry silk blend brocade cut piece ideal for designing crop tops, peplum jackets, or designer kurtas. Direct from the Ravindrapuri Extension outlet.',
    images: [
      '/src/assets/images/designer_brocade_textile_1790522995915.jpg',
      '/src/assets/images/hero_banarasi_saree_1790522952613.jpg'
    ],
    available: true,
    featured: false,
    tags: ['Outlet Deal', 'Direct From Varanasi', 'Clearance'],
    fabric: 'Mulberry Silk Blend',
    weave: 'Powerloom Jacquard',
    color: 'Wine & Gold',
    zariType: 'Tested Gold Zari',
    isOutlet: true,
    createdAt: '2026-03-08T10:00:00.000Z',
    updatedAt: '2026-03-08T10:00:00.000Z',
  }
];

export interface AdminAccountRecord {
  isRegistered: boolean;
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  registeredAt?: string;
  lastLoginAt?: string;
}

export interface StoreData {
  settings: BusinessSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  enquiries: Enquiry[];
  adminSessionToken?: string;
  adminAccount?: AdminAccountRecord;
}

class Store {
  private data: StoreData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
          products: parsed.products?.length ? parsed.products : DEFAULT_PRODUCTS,
          orders: parsed.orders || [],
          customers: parsed.customers || [],
          enquiries: parsed.enquiries || [],
          adminSessionToken: parsed.adminSessionToken,
          adminAccount: parsed.adminAccount,
        };
      }
    } catch (err) {
      console.error('Error loading store data, resetting to defaults:', err);
    }

    const initialData: StoreData = {
      settings: DEFAULT_SETTINGS,
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
      orders: [],
      customers: [],
      enquiries: [],
    };
    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: StoreData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving store data:', err);
    }
  }

  private persist() {
    this.saveDataDirect(this.data);
  }

  // --- Business Settings ---
  getSettings(): BusinessSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<BusinessSettings>): BusinessSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getCategory(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  createCategory(category: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    this.data.categories.push(newCat);
    this.persist();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.persist();
    return this.data.categories[idx];
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Products ---
  getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    isOutlet?: boolean;
    available?: boolean;
    sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  }): Product[] {
    let list = [...this.data.products];

    if (params?.category && params.category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === params.category?.toLowerCase());
    }

    if (params?.isOutlet !== undefined) {
      list = list.filter(p => Boolean(p.isOutlet) === params.isOutlet);
    }

    if (params?.featured !== undefined) {
      list = list.filter(p => Boolean(p.featured) === params.featured);
    }

    if (params?.available !== undefined) {
      list = list.filter(p => Boolean(p.available) === params.available);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.fabric?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q)
      );
    }

    if (params?.sortBy) {
      if (params.sortBy === 'price-asc') {
        list.sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));
      } else if (params.sortBy === 'price-desc') {
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      } else if (params.sortBy === 'newest') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (params.sortBy === 'featured') {
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      }
    } else {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.slug === id);
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'>): Product {
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.unshift(newProd);
    this.persist();
    return newProd;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { 
      ...this.data.products[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.persist();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Orders & WhatsApp tracking ---
  getOrders(): Order[] {
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createOrder(orderData: Omit<Order, 'id' | 'reference' | 'createdAt' | 'status'>): Order {
    const ref = 'BS-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      reference: ref,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    this.data.orders.unshift(newOrder);

    // Update or create customer
    const cleanPhone = orderData.customerPhone.trim();
    let customer = this.data.customers.find(c => c.phone === cleanPhone);
    if (customer) {
      customer.orderCount += 1;
      customer.totalSpent += newOrder.totalAmount;
      customer.lastInteraction = newOrder.createdAt;
      customer.address = orderData.customerAddress || customer.address;
      customer.name = orderData.customerName || customer.name;
    } else {
      customer = {
        id: `cust-${Date.now()}`,
        name: orderData.customerName,
        phone: cleanPhone,
        email: orderData.customerEmail,
        address: orderData.customerAddress,
        orderCount: 1,
        totalSpent: newOrder.totalAmount,
        lastInteraction: newOrder.createdAt,
        createdAt: newOrder.createdAt,
      };
      this.data.customers.unshift(customer);
    }

    this.persist();
    return newOrder;
  }

  updateOrderStatus(id: string, status: Order['status'], adminNotes?: string): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }
    this.persist();
    return order;
  }

  // --- Customers ---
  getCustomers(): Customer[] {
    return [...this.data.customers].sort(
      (a, b) => new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime()
    );
  }

  // --- Enquiries ---
  getEnquiries(): Enquiry[] {
    return [...this.data.enquiries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'status'>): Enquiry {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: `enq-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    this.data.enquiries.unshift(newEnquiry);

    // Track customer touchpoint
    const cleanPhone = enquiryData.customerPhone.trim();
    let customer = this.data.customers.find(c => c.phone === cleanPhone);
    if (customer) {
      customer.lastInteraction = newEnquiry.createdAt;
      customer.name = enquiryData.customerName || customer.name;
    } else {
      customer = {
        id: `cust-${Date.now()}`,
        name: enquiryData.customerName,
        phone: cleanPhone,
        email: enquiryData.customerEmail,
        address: '',
        orderCount: 0,
        totalSpent: 0,
        lastInteraction: newEnquiry.createdAt,
        createdAt: newEnquiry.createdAt,
      };
      this.data.customers.unshift(customer);
    }

    this.persist();
    return newEnquiry;
  }

  updateEnquiryStatus(id: string, status: Enquiry['status']): Enquiry | null {
    const enq = this.data.enquiries.find(e => e.id === id);
    if (!enq) return null;
    enq.status = status;
    this.persist();
    return enq;
  }

  // --- Admin Stats ---
  getAllData(): StoreData {
    return this.data;
  }

  // --- Admin Account Single-Slot Management ---
  getAdminSetupStatus(): {
    isRegistered: boolean;
    slotAvailable: boolean;
    username?: string;
    fullName?: string;
    email?: string;
    registeredAt?: string;
  } {
    const isReg = !!(this.data.adminAccount && this.data.adminAccount.isRegistered);
    return {
      isRegistered: isReg,
      slotAvailable: !isReg,
      username: isReg ? this.data.adminAccount?.username : undefined,
      fullName: isReg ? this.data.adminAccount?.fullName : undefined,
      email: isReg ? this.data.adminAccount?.email : undefined,
      registeredAt: isReg ? this.data.adminAccount?.registeredAt : undefined,
    };
  }

  registerSingleAdmin(data: {
    username: string;
    password: string;
    fullName?: string;
    email?: string;
  }): { username: string; fullName?: string; email?: string; registeredAt: string } {
    if (this.data.adminAccount && this.data.adminAccount.isRegistered) {
      throw new Error('Admin registration is strictly closed. The single admin slot has already been claimed.');
    }

    if (!data.username || !data.username.trim()) {
      throw new Error('Username is required.');
    }
    if (!data.password || data.password.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    const registeredAt = new Date().toISOString();
    this.data.adminAccount = {
      isRegistered: true,
      username: data.username.trim(),
      password: data.password.trim(),
      fullName: data.fullName?.trim() || 'Store Administrator',
      email: data.email?.trim() || 'shadabk3050@gamil.com',
      registeredAt,
      lastLoginAt: registeredAt,
    };

    this.persist();

    return {
      username: this.data.adminAccount.username,
      fullName: this.data.adminAccount.fullName,
      email: this.data.adminAccount.email,
      registeredAt,
    };
  }

  verifyAdminLogin(username: string, password: string): { valid: boolean; user?: { username: string; fullName?: string; email?: string } } {
    const u = username.trim();
    const p = password.trim();

    if (this.data.adminAccount && this.data.adminAccount.isRegistered) {
      if (this.data.adminAccount.username === u && this.data.adminAccount.password === p) {
        this.data.adminAccount.lastLoginAt = new Date().toISOString();
        this.persist();
        return {
          valid: true,
          user: {
            username: this.data.adminAccount.username,
            fullName: this.data.adminAccount.fullName,
            email: this.data.adminAccount.email,
          },
        };
      }
      return { valid: false };
    }

    // Default fallback if single slot has not yet been registered
    const defaultUser = process.env.ADMIN_USERNAME || 'admin';
    const defaultPass = process.env.ADMIN_PASSWORD || 'bunkar2026';
    if (u === defaultUser && p === defaultPass) {
      return {
        valid: true,
        user: {
          username: defaultUser,
          fullName: 'Bunkar Sanskriti Administrator',
          email: 'shadabk3050@gamil.com',
        },
      };
    }

    return { valid: false };
  }

  getAdminAccountInfo() {
    if (!this.data.adminAccount || !this.data.adminAccount.isRegistered) {
      return {
        isRegistered: false,
        username: undefined,
        fullName: undefined,
        email: undefined,
      };
    }
    return {
      isRegistered: true,
      username: this.data.adminAccount.username,
      fullName: this.data.adminAccount.fullName,
      email: this.data.adminAccount.email,
      registeredAt: this.data.adminAccount.registeredAt,
      lastLoginAt: this.data.adminAccount.lastLoginAt,
    };
  }

  updateAdminProfile(updates: {
    fullName?: string;
    email?: string;
    newPassword?: string;
  }): { success: boolean; error?: string } {
    if (!this.data.adminAccount || !this.data.adminAccount.isRegistered) {
      return { success: false, error: 'No admin account found to update' };
    }

    if (updates.fullName !== undefined) {
      this.data.adminAccount.fullName = updates.fullName.trim();
    }
    if (updates.email !== undefined) {
      this.data.adminAccount.email = updates.email.trim();
    }
    if (updates.newPassword && updates.newPassword.trim().length >= 4) {
      this.data.adminAccount.password = updates.newPassword.trim();
    }

    this.persist();
    return { success: true };
  }

  // --- Quick Update Product Price, Discount & Images ---
  updateProductPricingAndImages(
    id: string,
    updates: {
      price?: number | null;
      salePrice?: number | null;
      images?: string[];
      available?: boolean;
    }
  ): Product | null {
    const prod = this.data.products.find(p => p.id === id);
    if (!prod) return null;

    if (updates.price !== undefined) prod.price = updates.price;
    if (updates.salePrice !== undefined) prod.salePrice = updates.salePrice;
    if (updates.images !== undefined && updates.images.length > 0) prod.images = updates.images;
    if (updates.available !== undefined) prod.available = updates.available;
    prod.updatedAt = new Date().toISOString();

    this.persist();
    return prod;
  }

  getAdminStats(): AdminStats {
    const totalProducts = this.data.products.length;
    const availableProducts = this.data.products.filter(p => p.available).length;
    const unavailableProducts = totalProducts - availableProducts;
    const totalCategories = this.data.categories.length;
    const totalOrders = this.data.orders.length;
    const totalEnquiries = this.data.enquiries.length;
    const recentOrders = this.getOrders().slice(0, 5);
    const recentEnquiries = this.getEnquiries().slice(0, 5);
    const estimatedRevenue = this.data.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalProducts,
      totalCategories,
      totalOrders,
      totalEnquiries,
      availableProducts,
      unavailableProducts,
      recentOrders,
      recentEnquiries,
      estimatedRevenue,
    };
  }
}

export const db = new Store();
