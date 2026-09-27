import type { 
  Product, 
  Category, 
  Order, 
  Customer, 
  Enquiry, 
  BusinessSettings, 
  AdminStats,
  AdminSetupStatus,
  AdminAccountInfo
} from '../types/index.ts';

export interface SettingsResponse extends BusinessSettings {
  currentStatus: {
    isOpen: boolean;
    statusText: string;
    day: string;
    detail: string;
  };
}

const getHeaders = (token?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Settings
  async getSettings(): Promise<SettingsResponse> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<BusinessSettings>, token: string): Promise<SettingsResponse> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(cat: Omit<Category, 'id'>, token: string): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>, token: string): Promise<Category> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(id: string, token: string): Promise<boolean> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return true;
  },

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    isOutlet?: boolean;
    available?: boolean;
    sortBy?: string;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.featured !== undefined) query.set('featured', String(params.featured));
    if (params?.isOutlet !== undefined) query.set('isOutlet', String(params.isOutlet));
    if (params?.available !== undefined) query.set('available', String(params.available));
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'>, token: string): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>, token: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(id: string, token: string): Promise<boolean> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return true;
  },

  // Orders
  async submitOrder(orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress: string;
    items: any[];
    totalAmount: number;
    customerNote?: string;
    viaWhatsApp: boolean;
  }): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to submit order');
    return res.json();
  },

  async getOrders(token: string): Promise<Order[]> {
    const res = await fetch('/api/orders', {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async updateOrderStatus(id: string, status: Order['status'], adminNotes: string | undefined, token: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ status, adminNotes }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Enquiries
  async submitEnquiry(enquiryData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    productId?: string;
    productName?: string;
    message: string;
  }): Promise<Enquiry> {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(enquiryData),
    });
    if (!res.ok) throw new Error('Failed to submit enquiry');
    return res.json();
  },

  async getEnquiries(token: string): Promise<Enquiry[]> {
    const res = await fetch('/api/enquiries', {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch enquiries');
    return res.json();
  },

  async updateEnquiryStatus(id: string, status: Enquiry['status'], token: string): Promise<Enquiry> {
    const res = await fetch(`/api/enquiries/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update enquiry status');
    return res.json();
  },

  // Customers
  async getCustomers(token: string): Promise<Customer[]> {
    const res = await fetch('/api/customers', {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  // Admin
  async adminLogin(username: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed');
    }
    return res.json();
  },

  async checkAdminAuth(token: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/me', {
        headers: getHeaders(token),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getAdminStats(token: string): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats', {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async getAdminSetupStatus(): Promise<AdminSetupStatus> {
    const res = await fetch('/api/admin/setup-status');
    if (!res.ok) throw new Error('Failed to fetch admin setup status');
    return res.json();
  },

  async registerAdmin(data: {
    username: string;
    password: string;
    fullName?: string;
    email?: string;
  }): Promise<{ token: string; user: any; message?: string }> {
    const res = await fetch('/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register admin account');
    }
    return res.json();
  },

  async getAdminAccount(token: string): Promise<AdminAccountInfo> {
    const res = await fetch('/api/admin/account', {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch admin account details');
    return res.json();
  },

  async updateAdminProfile(
    data: { fullName?: string; email?: string; newPassword?: string },
    token: string
  ): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/admin/account', {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update admin profile');
    }
    return res.json();
  },

  async updateProductPricing(
    id: string,
    data: {
      price?: number | null;
      salePrice?: number | null;
      images?: string[];
      available?: boolean;
    },
    token: string
  ): Promise<Product> {
    const res = await fetch(`/api/products/${id}/pricing`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product pricing and images');
    }
    return res.json();
  },

  // Supabase Integration
  async getSupabaseStatus(): Promise<{
    projectId: string;
    url: string;
    connected: boolean;
    tablesFound: {
      orders: boolean;
      products: boolean;
      categories: boolean;
      settings: boolean;
    };
    error?: string;
  }> {
    const res = await fetch('/api/supabase/status');
    if (!res.ok) throw new Error('Failed to fetch Supabase status');
    return res.json();
  },

  async syncToSupabase(token: string): Promise<{
    success: boolean;
    message: string;
    productsSynced: number;
    categoriesSynced: number;
    ordersSynced: number;
    errors: string[];
  }> {
    const res = await fetch('/api/supabase/sync', {
      method: 'POST',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to sync to Supabase');
    return res.json();
  },

  // Firebase Firestore Integration
  async getFirebaseStatus(): Promise<{
    projectId: string;
    databaseId: string;
    region: string;
    connected: boolean;
    error?: string;
  }> {
    const res = await fetch('/api/firebase/status');
    if (!res.ok) throw new Error('Failed to fetch Firebase status');
    return res.json();
  },

  async syncToFirebase(token: string): Promise<{
    success: boolean;
    message: string;
    productsSynced: number;
    categoriesSynced: number;
    ordersSynced: number;
    errors: string[];
  }> {
    const res = await fetch('/api/firebase/sync', {
      method: 'POST',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to sync to Firebase');
    return res.json();
  },
};
