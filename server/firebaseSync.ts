import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Order, Product, Category, BusinessSettings, Enquiry } from '../src/types/index.ts';
import { db } from './db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');

let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (e) {
  console.warn('Could not load firebase-applet-config.json on server:', e);
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const serverFirestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const firebaseSync = {
  getProjectId(): string {
    return firebaseConfig.projectId || '';
  },

  getDatabaseId(): string {
    return firebaseConfig.firestoreDatabaseId || '';
  },

  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      // Test read from test doc
      await getDoc(doc(serverFirestore, 'test', 'connection'));
      return { connected: true };
    } catch (err: any) {
      // If permission or offline
      return { connected: false, error: err.message };
    }
  },

  async recordOrder(order: Order): Promise<{ success: boolean; error?: string }> {
    try {
      await setDoc(doc(serverFirestore, 'orders', order.id), {
        reference: order.reference,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail || '',
        customerAddress: order.customerAddress,
        items: order.items,
        totalAmount: order.totalAmount,
        customerNote: order.customerNote || '',
        status: order.status,
        adminNotes: order.adminNotes || '',
        viaWhatsApp: Boolean(order.viaWhatsApp),
        createdAt: order.createdAt || new Date().toISOString(),
      });
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase order record err:', err.message);
      return { success: false, error: err.message };
    }
  },

  async updateOrderStatus(id: string, status: string, adminNotes?: string): Promise<boolean> {
    try {
      const payload: any = { status };
      if (adminNotes !== undefined) payload.adminNotes = adminNotes;
      await updateDoc(doc(serverFirestore, 'orders', id), payload);
      return true;
    } catch (err: any) {
      console.warn('Firebase order status update err:', err.message);
      return false;
    }
  },

  async syncProduct(product: Product): Promise<{ success: boolean; error?: string }> {
    try {
      await setDoc(doc(serverFirestore, 'products', product.id), {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        salePrice: product.salePrice ?? null,
        description: product.description,
        shortDescription: product.shortDescription || '',
        images: product.images || [],
        available: Boolean(product.available),
        featured: Boolean(product.featured),
        tags: product.tags || [],
        fabric: product.fabric || '',
        weave: product.weave || '',
        color: product.color || '',
        zariType: product.zariType || '',
        isOutlet: Boolean(product.isOutlet),
        variants: product.variants || [],
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
      });
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase product sync err:', err.message);
      return { success: false, error: err.message };
    }
  },

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(serverFirestore, 'products', productId));
      return true;
    } catch (err: any) {
      console.warn('Firebase product delete err:', err.message);
      return false;
    }
  },

  async syncAllToFirebase(): Promise<{
    productsSynced: number;
    categoriesSynced: number;
    ordersSynced: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let productsSynced = 0;
    let categoriesSynced = 0;
    let ordersSynced = 0;

    // 1. Sync Settings
    try {
      const settings = db.getSettings();
      await setDoc(doc(serverFirestore, 'settings', 'global'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
    } catch (e: any) {
      errors.push(`Settings sync: ${e.message}`);
    }

    // 2. Sync Categories
    const categories = db.getCategories();
    for (const cat of categories) {
      try {
        await setDoc(doc(serverFirestore, 'categories', cat.id), cat);
        categoriesSynced++;
      } catch (e: any) {
        errors.push(`Category ${cat.name}: ${e.message}`);
      }
    }

    // 3. Sync Products
    const products = db.getProducts();
    for (const prod of products) {
      try {
        const res = await this.syncProduct(prod);
        if (res.success) productsSynced++;
        else if (res.error) errors.push(`Product ${prod.name}: ${res.error}`);
      } catch (e: any) {
        errors.push(`Product ${prod.name}: ${e.message}`);
      }
    }

    // 4. Sync Orders
    const orders = db.getOrders();
    for (const ord of orders) {
      try {
        const res = await this.recordOrder(ord);
        if (res.success) ordersSynced++;
        else if (res.error) errors.push(`Order ${ord.reference}: ${res.error}`);
      } catch (e: any) {
        errors.push(`Order ${ord.reference}: ${e.message}`);
      }
    }

    return {
      productsSynced,
      categoriesSynced,
      ordersSynced,
      errors,
    };
  },
};
