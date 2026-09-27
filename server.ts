import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { supabase, testSupabaseConnection, SUPABASE_PROJECT_ID, SUPABASE_URL } from './server/supabase.ts';
import { supabaseSync } from './server/supabaseSync.ts';
import { firebaseSync } from './server/firebaseSync.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Helper: Calculate store open status
export function getStoreStatus(settings = db.getSettings()) {
  try {
    // Varanasi is in IST (UTC + 5:30)
    const now = new Date();
    // Convert to IST
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (3600000 * 5.5));
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
    const currentDayName = dayNames[istTime.getDay()];
    
    const daySchedule = settings.businessHours.find(h => h.day === currentDayName);
    
    if (!daySchedule || !daySchedule.isOpen) {
      return {
        isOpen: false,
        statusText: 'Closed',
        day: currentDayName,
        detail: 'Closed today',
      };
    }

    const currentHour = istTime.getHours();
    const currentMin = istTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMin;

    const [openH, openM] = daySchedule.openTime.split(':').map(Number);
    const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);

    const openTotalMinutes = openH * 60 + (openM || 0);
    const closeTotalMinutes = closeH * 60 + (closeM || 0);

    const isOpenNow = currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;

    return {
      isOpen: isOpenNow,
      statusText: isOpenNow ? 'Open Now' : 'Closed',
      day: currentDayName,
      detail: isOpenNow 
        ? `Open until ${formatTime12(daySchedule.closeTime)}` 
        : `Opens at ${formatTime12(daySchedule.openTime)}`,
    };
  } catch (err) {
    return {
      isOpen: true,
      statusText: 'Open Now',
      day: 'Today',
      detail: 'Visit our store',
    };
  }
}

function formatTime12(time24: string) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m || 0).padStart(2, '0')} ${period}`;
}

// Secure session token management for admin
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bunkar2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_TOKEN = 'bs-token-' + Buffer.from(ADMIN_USERNAME + ':' + ADMIN_PASSWORD).toString('base64');
const validAdminTokens = new Set<string>([DEFAULT_ADMIN_TOKEN]);

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token || !validAdminTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized. Admin session invalid or expired.' });
  }
  next();
}

// --- API ROUTES ---

// 1. Business Settings & Hours
app.get('/api/settings', (_req, res) => {
  const settings = db.getSettings();
  const status = getStoreStatus(settings);
  res.json({ ...settings, currentStatus: status });
});

app.put('/api/settings', requireAdmin, (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    const status = getStoreStatus(updated);
    res.json({ ...updated, currentStatus: status });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update settings' });
  }
});

// 2. Categories
app.get('/api/categories', (_req, res) => {
  res.json(db.getCategories());
});

app.post('/api/categories', requireAdmin, (req, res) => {
  try {
    const newCat = db.createCategory(req.body);
    res.status(201).json(newCat);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', requireAdmin, (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

app.delete('/api/categories/:id', requireAdmin, (req, res) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true });
});

// 3. Products
app.get('/api/products', (req, res) => {
  const { category, search, featured, isOutlet, available, sortBy } = req.query;
  const products = db.getProducts({
    category: category as string,
    search: search as string,
    featured: featured !== undefined ? featured === 'true' : undefined,
    isOutlet: isOutlet !== undefined ? isOutlet === 'true' : undefined,
    available: available !== undefined ? available === 'true' : undefined,
    sortBy: sortBy as any,
  });
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const newProd = db.createProduct(req.body);
    // Background sync to Supabase and Firebase
    supabaseSync.syncProduct(newProd).catch(e => console.warn('Supabase product sync err:', e));
    firebaseSync.syncProduct(newProd).catch(e => console.warn('Firebase product sync err:', e));
    res.status(201).json(newProd);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  // Sync to Supabase and Firebase
  supabaseSync.syncProduct(updated).catch(e => console.warn('Supabase product update err:', e));
  firebaseSync.syncProduct(updated).catch(e => console.warn('Firebase product update err:', e));
  res.json(updated);
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found' });
  // Delete in Supabase and Firebase
  supabaseSync.deleteProduct(req.params.id).catch(e => console.warn('Supabase product delete err:', e));
  firebaseSync.deleteProduct(req.params.id).catch(e => console.warn('Firebase product delete err:', e));
  res.json({ success: true });
});

// 4. Orders
app.get('/api/orders', requireAdmin, async (_req, res) => {
  // Check Supabase first, fallback to local db
  const supaOrders = await supabaseSync.getOrdersFromSupabase();
  if (supaOrders && supaOrders.length > 0) {
    return res.json(supaOrders);
  }
  res.json(db.getOrders());
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items } = req.body;
    if (!customerName || !customerPhone || !customerAddress || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order details' });
    }
    const order = db.createOrder(req.body);
    // Immediately persist to Supabase & Firebase
    const supaResult = await supabaseSync.recordOrder(order);
    const fbResult = await firebaseSync.recordOrder(order);
    if (!supaResult.success) {
      console.warn('Order saved to local DB. Supabase status:', supaResult.error);
    }
    if (!fbResult.success) {
      console.warn('Firebase order record note:', fbResult.error);
    }
    res.status(201).json({ ...order, supabaseSynced: supaResult.success, firebaseSynced: fbResult.success });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
  const { status, adminNotes } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status, adminNotes);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  supabaseSync.updateOrderStatus(req.params.id, status, adminNotes).catch(e => console.warn(e));
  firebaseSync.updateOrderStatus(req.params.id, status, adminNotes).catch(e => console.warn(e));
  res.json(updated);
});

// 5. Customers
app.get('/api/customers', requireAdmin, (_req, res) => {
  res.json(db.getCustomers());
});

// 6. Enquiries
app.get('/api/enquiries', requireAdmin, (_req, res) => {
  res.json(db.getEnquiries());
});

app.post('/api/enquiries', (req, res) => {
  try {
    const { customerName, customerPhone, message } = req.body;
    if (!customerName || !customerPhone || !message) {
      return res.status(400).json({ error: 'Name, phone and message are required' });
    }
    const enquiry = db.createEnquiry(req.body);
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record enquiry' });
  }
});

app.put('/api/enquiries/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const updated = db.updateEnquiryStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Enquiry not found' });
  res.json(updated);
});

// 7. Admin Stats & Auth
app.get('/api/admin/stats', requireAdmin, (_req, res) => {
  res.json(db.getAdminStats());
});

// 8. Supabase Backend Health & Sync API
app.get('/api/supabase/status', async (_req, res) => {
  const status = await testSupabaseConnection();
  res.json({
    projectId: SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    ...status,
  });
});

app.post('/api/supabase/sync', requireAdmin, async (_req, res) => {
  try {
    const syncRes = await supabaseSync.syncAllToSupabase();
    res.json({
      success: true,
      message: 'Sync completed',
      ...syncRes,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// 8.1 Firebase Cloud Firestore Health & Sync API
app.get('/api/firebase/status', async (_req, res) => {
  const status = await firebaseSync.testConnection();
  res.json({
    projectId: firebaseSync.getProjectId(),
    databaseId: firebaseSync.getDatabaseId(),
    region: 'asia-southeast1',
    connected: status.connected,
    error: status.error,
  });
});

app.post('/api/firebase/sync', requireAdmin, async (_req, res) => {
  try {
    const syncRes = await firebaseSync.syncAllToFirebase();
    res.json({
      success: true,
      message: 'Firebase sync completed',
      ...syncRes,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Firebase sync failed' });
  }
});

// 9. Admin Single-Slot Setup & Authentication
app.get('/api/admin/setup-status', (_req, res) => {
  res.json(db.getAdminSetupStatus());
});

app.post('/api/admin/register', (req, res) => {
  try {
    const newAdmin = db.registerSingleAdmin(req.body);
    const sessionToken = 'bs-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
    validAdminTokens.add(sessionToken);
    res.status(201).json({
      success: true,
      message: 'Admin account created successfully! Single slot claimed.',
      token: sessionToken,
      user: {
        username: newAdmin.username,
        role: 'admin',
        fullName: newAdmin.fullName,
        email: newAdmin.email,
      },
    });
  } catch (err: any) {
    res.status(403).json({ error: err.message || 'Admin registration failed' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const result = db.verifyAdminLogin(username, password);
  if (result.valid) {
    const sessionToken = 'bs-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
    validAdminTokens.add(sessionToken);
    return res.json({
      token: sessionToken,
      user: {
        username: result.user?.username || username,
        role: 'admin',
        fullName: result.user?.fullName,
        email: result.user?.email,
      },
    });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

app.get('/api/admin/account', requireAdmin, (_req, res) => {
  res.json(db.getAdminAccountInfo());
});

app.put('/api/admin/account', requireAdmin, (req, res) => {
  const updateResult = db.updateAdminProfile(req.body);
  if (!updateResult.success) {
    return res.status(400).json({ error: updateResult.error });
  }
  res.json({ success: true, message: 'Admin profile updated successfully' });
});

app.get('/api/admin/me', requireAdmin, (_req, res) => {
  const account = db.getAdminAccountInfo();
  res.json({
    authenticated: true,
    user: {
      username: account.username || ADMIN_USERNAME,
      fullName: account.fullName,
      email: account.email,
      role: 'admin',
    },
  });
});

// Quick pricing and images update endpoint
app.patch('/api/products/:id/pricing', requireAdmin, async (req, res) => {
  try {
    const { price, salePrice, images, available } = req.body;
    const updated = db.updateProductPricingAndImages(req.params.id, {
      price,
      salePrice,
      images,
      available,
    });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    
    // Background sync to Supabase & Firebase
    supabaseSync.syncProduct(updated).catch((e) => console.warn('Supabase product sync warning:', e));
    firebaseSync.syncProduct(updated).catch((e) => console.warn('Firebase product sync warning:', e));
    
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update pricing' });
  }
});

// --- VITE MIDDLEWARE / STATIC ASSETS ---
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Bunkar Sanskriti server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
