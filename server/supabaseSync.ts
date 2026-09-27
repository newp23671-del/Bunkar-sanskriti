import { supabase, testSupabaseConnection } from './supabase.ts';
import { db } from './db.ts';
import type { Order, Product, Category, BusinessSettings, Enquiry } from '../src/types/index.ts';

/**
 * Service to sync and query between local store & Supabase
 */
export const supabaseSync = {
  /**
   * Save an order to Supabase
   */
  async recordOrder(order: Order): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.from('orders').insert([
        {
          id: order.id,
          reference: order.reference,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          customer_email: order.customerEmail || null,
          customer_address: order.customerAddress,
          items: order.items,
          total_amount: order.totalAmount,
          customer_note: order.customerNote || null,
          status: order.status,
          admin_notes: order.adminNotes || null,
          via_whatsapp: order.viaWhatsApp,
          created_at: order.createdAt,
          updated_at: new Date().toISOString(),
        }
      ]);

      if (error) {
        console.warn('Supabase order insert warning:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase order insert exception:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Update order status in Supabase
   */
  async updateOrderStatus(id: string, status: string, adminNotes?: string): Promise<boolean> {
    try {
      const payload: any = { status, updated_at: new Date().toISOString() };
      if (adminNotes !== undefined) payload.admin_notes = adminNotes;
      const { error } = await supabase.from('orders').update(payload).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Sync a product to Supabase
   */
  async syncProduct(product: Product): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('products').upsert([
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: product.price,
          sale_price: product.salePrice || null,
          short_description: product.shortDescription || null,
          description: product.description,
          images: product.images,
          available: product.available,
          featured: product.featured,
          is_outlet: product.isOutlet || false,
          fabric: product.fabric || null,
          weave: product.weave || null,
          color: product.color || null,
          zari_type: product.zariType || null,
          tags: product.tags || [],
          variants: product.variants || [],
          created_at: product.createdAt,
          updated_at: product.updatedAt,
        }
      ]);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete a product from Supabase
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Sync all local products & categories to Supabase
   */
  async syncAllToSupabase(): Promise<{
    productsSynced: number;
    categoriesSynced: number;
    ordersSynced: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let productsSynced = 0;
    let categoriesSynced = 0;
    let ordersSynced = 0;

    const data = db.getAllData();

    // 1. Sync Categories
    for (const cat of data.categories) {
      try {
        const { error } = await supabase.from('categories').upsert([
          {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image: cat.image,
            enabled: cat.enabled,
            display_order: cat.displayOrder,
          }
        ]);
        if (error) errors.push(`Category ${cat.name}: ${error.message}`);
        else categoriesSynced++;
      } catch (err: any) {
        errors.push(`Category ${cat.name}: ${err.message}`);
      }
    }

    // 2. Sync Products
    for (const prod of data.products) {
      const res = await this.syncProduct(prod);
      if (res.success) productsSynced++;
      else errors.push(`Product ${prod.name}: ${res.error}`);
    }

    // 3. Sync Orders
    for (const ord of data.orders) {
      const res = await this.recordOrder(ord);
      if (res.success) ordersSynced++;
      else errors.push(`Order ${ord.reference}: ${res.error}`);
    }

    return {
      productsSynced,
      categoriesSynced,
      ordersSynced,
      errors,
    };
  },

  /**
   * Pull products from Supabase if table is populated
   */
  async getProductsFromSupabase(): Promise<Product[] | null> {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error || !data || data.length === 0) return null;

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        category: row.category,
        price: row.price !== null ? Number(row.price) : null,
        salePrice: row.sale_price !== null ? Number(row.sale_price) : null,
        shortDescription: row.short_description || '',
        description: row.description || '',
        images: row.images || [],
        available: Boolean(row.available),
        featured: Boolean(row.featured),
        isOutlet: Boolean(row.is_outlet),
        fabric: row.fabric || '',
        weave: row.weave || '',
        color: row.color || '',
        zariType: row.zari_type || '',
        tags: row.tags || [],
        variants: row.variants || [],
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    } catch {
      return null;
    }
  },

  /**
   * Pull orders from Supabase
   */
  async getOrdersFromSupabase(): Promise<Order[] | null> {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        reference: row.reference,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email || undefined,
        customerAddress: row.customer_address,
        items: row.items || [],
        totalAmount: Number(row.total_amount || 0),
        customerNote: row.customer_note || undefined,
        status: row.status,
        adminNotes: row.admin_notes || undefined,
        viaWhatsApp: Boolean(row.via_whatsapp),
        createdAt: row.created_at,
      }));
    } catch {
      return null;
    }
  }
};
