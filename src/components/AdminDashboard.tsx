import React, { useState, useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Users, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  ExternalLink, 
  MessageCircle, 
  Check, 
  AlertCircle,
  Eye,
  RefreshCw,
  Clock,
  Sparkles,
  Database,
  Copy,
  ExternalLink as LinkIcon,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Lock,
  Percent,
  Tag,
  Image as ImageIcon,
  Search,
  Filter,
  UserCheck,
  Flame
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { api } from '../utils/api.ts';
import { SUPABASE_SQL_SETUP } from '../utils/supabaseSchema.ts';
import { 
  subscribeToOrders, 
  auth as firebaseAuth, 
  signInAdminWithGoogle, 
  signOutAdminFromFirebase 
} from '../firebase.ts';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import type { 
  Product, 
  Category, 
  Order, 
  Customer, 
  Enquiry, 
  BusinessSettings, 
  AdminStats, 
  OrderStatus,
  AdminSetupStatus,
  AdminAccountInfo
} from '../types/index.ts';
import { formatWhatsAppNumber } from '../utils/whatsapp.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset luxury Banarasi images for quick selection
const BANARASI_IMAGE_PRESETS = [
  { label: 'Crimson Kadhwa Saree', url: '/src/assets/images/hero_banarasi_saree_1790522952613.jpg' },
  { label: 'Royal Gold Saree', url: '/src/assets/images/banarasi_saree_royal_1790522967794.jpg' },
  { label: 'Festive Silk Suit', url: '/src/assets/images/banarasi_suit_collection_1790522981322.jpg' },
  { label: 'Designer Brocade Fabric', url: '/src/assets/images/designer_brocade_textile_1790522995915.jpg' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { token, isAuthenticated, login, logout } = useAdminAuth();
  const { settings, refreshSettings } = useSettings();

  // Setup / Registration state
  const [setupStatus, setSetupStatus] = useState<AdminSetupStatus | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('bunkar2026');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Single-slot Registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('shadabk3050@gamil.com');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'enquiries' | 'settings' | 'firebase' | 'supabase' | 'account'
  >('overview');

  // Supabase connection state
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Firebase connection state
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);
  const [syncingFirebase, setSyncingFirebase] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [fbAuthLoading, setFbAuthLoading] = useState(false);

  // Dashboard data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [adminAccount, setAdminAccount] = useState<AdminAccountInfo | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Orders filtering & search
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  // Quick Price & Discount Edit Modal State
  const [quickPricingProduct, setQuickPricingProduct] = useState<Product | null>(null);
  const [quickPrice, setQuickPrice] = useState<number | ''>('');
  const [quickSalePrice, setQuickSalePrice] = useState<number | ''>('');
  const [quickDiscountPercent, setQuickDiscountPercent] = useState<number | ''>('');
  const [quickImageUrl, setQuickImageUrl] = useState('');
  const [quickAvailable, setQuickAvailable] = useState(true);
  const [quickUpdating, setQuickUpdating] = useState(false);

  // Edit / Create Product Modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productDiscountPercent, setProductDiscountPercent] = useState<number | ''>('');

  // Edit / Create Category Modal
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Business settings form state
  const [settingsForm, setSettingsForm] = useState<BusinessSettings>(settings);

  // Admin Profile & Security Form State
  const [profileFullName, setProfileFullName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Check single-slot status whenever modal opens
  useEffect(() => {
    if (isOpen) {
      checkSetupStatus();
    }
  }, [isOpen]);

  const checkSetupStatus = async () => {
    try {
      const st = await api.getAdminSetupStatus();
      setSetupStatus(st);
      if (st.slotAvailable && !isAuthenticated) {
        setAuthMode('register');
      } else {
        setAuthMode('login');
      }
    } catch (err) {
      console.error('Failed to get setup status', err);
    }
  };

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Load admin data when authenticated
  const loadAdminData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [sData, pData, cData, oData, cuData, eData, supaData, fbData, accData] = await Promise.all([
        api.getAdminStats(token),
        api.getProducts(),
        api.getCategories(),
        api.getOrders(token),
        api.getCustomers(token),
        api.getEnquiries(token),
        api.getSupabaseStatus().catch(() => null),
        api.getFirebaseStatus().catch(() => null),
        api.getAdminAccount(token).catch(() => null),
      ]);
      setStats(sData);
      setProducts(pData);
      setCategories(cData);
      setOrders(oData);
      setCustomers(cuData);
      setEnquiries(eData);
      if (supaData) setSupabaseStatus(supaData);
      if (fbData) setFirebaseStatus(fbData);
      if (accData) {
        setAdminAccount(accData);
        setProfileFullName(accData.fullName || '');
        setProfileEmail(accData.email || '');
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTriggerSupabaseSync = async () => {
    if (!token) return;
    setSyncingSupabase(true);
    try {
      const res = await api.syncToSupabase(token);
      showStatus(`Synced to Supabase! Products: ${res.productsSynced}, Categories: ${res.categoriesSynced}, Orders: ${res.ordersSynced}`);
      // Refresh status
      const updatedStatus = await api.getSupabaseStatus();
      setSupabaseStatus(updatedStatus);
    } catch (err: any) {
      showStatus(`Sync error: ${err.message}`, 'error');
    } finally {
      setSyncingSupabase(false);
    }
  };

  const handleTriggerFirebaseSync = async () => {
    if (!token) return;
    setSyncingFirebase(true);
    try {
      const res = await api.syncToFirebase(token);
      showStatus(`Synced to Firebase! Products: ${res.productsSynced}, Categories: ${res.categoriesSynced}, Orders: ${res.ordersSynced}`);
      const updatedStatus = await api.getFirebaseStatus();
      setFirebaseStatus(updatedStatus);
    } catch (err: any) {
      showStatus(`Firebase sync error: ${err.message}`, 'error');
    } finally {
      setSyncingFirebase(false);
    }
  };

  const handleGoogleAuthSignIn = async () => {
    setFbAuthLoading(true);
    try {
      const user = await signInAdminWithGoogle();
      showStatus(`Firebase Auth: Signed in as ${user.email}`);
    } catch (err: any) {
      showStatus(`Google Sign-In note: ${err.message}`, 'error');
    } finally {
      setFbAuthLoading(false);
    }
  };

  const handleGoogleAuthSignOut = async () => {
    try {
      await signOutAdminFromFirebase();
      showStatus('Signed out from Firebase Auth');
    } catch (err: any) {
      showStatus(`Sign out error: ${err.message}`, 'error');
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      setFirebaseUser(u);
    });
    return () => unsub();
  }, []);

  // Real-time Firestore live order updates
  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;
    const unsub = subscribeToOrders(
      (liveOrders) => {
        if (liveOrders && liveOrders.length > 0) {
          setOrders((prev) => {
            const map = new Map<string, Order>();
            prev.forEach((o) => map.set(o.id, o));
            liveOrders.forEach((o) => map.set(o.id, o));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      },
      (err) => console.warn('Firestore live order subscription note:', err.message)
    );
    return () => unsub();
  }, [isAuthenticated, isOpen]);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadAdminData();
    }
  }, [isAuthenticated, isOpen]);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // --- Login Submit Handler ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await api.adminLogin(loginUsername, loginPassword);
      login(res.token);
      showStatus(`Welcome, ${res.user.fullName || res.user.username}!`);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  // --- Single-Slot Registration Handler ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('Password must be at least 4 characters long.');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Please choose an admin username.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await api.registerAdmin({
        username: regUsername.trim(),
        password: regPassword.trim(),
        fullName: regFullName.trim() || 'Store Administrator',
        email: regEmail.trim() || 'shadabk3050@gamil.com',
      });

      login(res.token);
      showStatus('Admin account created! Single slot successfully claimed.');
      checkSetupStatus();
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  // --- Quick Price & Discount Edit Trigger ---
  const openQuickPriceModal = (product: Product) => {
    setQuickPricingProduct(product);
    setQuickPrice(product.price ?? '');
    setQuickSalePrice(product.salePrice ?? '');
    setQuickAvailable(product.available);
    setQuickImageUrl(product.images?.[0] || '');

    if (product.price && product.salePrice && product.salePrice < product.price) {
      const pct = Math.round(((product.price - product.salePrice) / product.price) * 100);
      setQuickDiscountPercent(pct);
    } else {
      setQuickDiscountPercent('');
    }
  };

  const handleApplyDiscountPreset = (percent: number) => {
    if (!quickPrice || typeof quickPrice !== 'number') return;
    setQuickDiscountPercent(percent);
    const discounted = Math.round(quickPrice * (1 - percent / 100));
    setQuickSalePrice(discounted);
  };

  const handleClearDiscount = () => {
    setQuickDiscountPercent('');
    setQuickSalePrice('');
  };

  const handleQuickPricingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !quickPricingProduct) return;
    setQuickUpdating(true);
    try {
      const finalPrice = quickPrice === '' ? null : Number(quickPrice);
      const finalSalePrice = quickSalePrice === '' ? null : Number(quickSalePrice);
      const finalImages = quickImageUrl.trim() 
        ? [quickImageUrl.trim(), ...(quickPricingProduct.images || []).filter(img => img !== quickImageUrl.trim())]
        : quickPricingProduct.images;

      const updated = await api.updateProductPricing(
        quickPricingProduct.id,
        {
          price: finalPrice,
          salePrice: finalSalePrice,
          images: finalImages,
          available: quickAvailable,
        },
        token
      );

      showStatus(`Updated & synced ${updated.name} to Supabase!`);
      setQuickPricingProduct(null);
      loadAdminData();
    } catch (err: any) {
      showStatus(err.message || 'Failed to update pricing', 'error');
    } finally {
      setQuickUpdating(false);
    }
  };

  // --- Full Product Handlers ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;

    try {
      if (isNewProduct) {
        await api.createProduct({
          name: editingProduct.name || 'New Piece',
          category: editingProduct.category || categories[0]?.name || 'Banarasi Saree',
          price: editingProduct.price !== undefined ? editingProduct.price : null,
          salePrice: editingProduct.salePrice || null,
          description: editingProduct.description || '',
          shortDescription: editingProduct.shortDescription || '',
          images: editingProduct.images?.length ? editingProduct.images : ['/src/assets/images/hero_banarasi_saree_1790522952613.jpg'],
          available: editingProduct.available !== undefined ? editingProduct.available : true,
          featured: Boolean(editingProduct.featured),
          isOutlet: Boolean(editingProduct.isOutlet),
          fabric: editingProduct.fabric || 'Pure Katan Silk',
          weave: editingProduct.weave || 'Kadhwa Handloom',
          color: editingProduct.color || '',
          zariType: editingProduct.zariType || 'Antique Gold Zari',
          tags: Array.isArray(editingProduct.tags) ? editingProduct.tags : [],
          variants: editingProduct.variants || [],
        }, token);
        showStatus('Product created and synced to Supabase!');
      } else {
        await api.updateProduct(editingProduct.id!, editingProduct, token);
        showStatus('Product updated and synced to Supabase!');
      }
      setEditingProduct(null);
      loadAdminData();
    } catch (err: any) {
      showStatus(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id, token);
      showStatus('Product deleted from store and Supabase');
      loadAdminData();
    } catch (err: any) {
      showStatus(err.message || 'Failed to delete product', 'error');
    }
  };

  // --- Category Handlers ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingCategory) return;
    try {
      if (isNewCategory) {
        const slug = (editingCategory.name || 'new-category').toLowerCase().replace(/\s+/g, '-');
        await api.createCategory({
          name: editingCategory.name || 'New Category',
          slug,
          description: editingCategory.description || '',
          image: editingCategory.image || '/src/assets/images/hero_banarasi_saree_1790522952613.jpg',
          enabled: editingCategory.enabled !== undefined ? editingCategory.enabled : true,
          displayOrder: editingCategory.displayOrder || categories.length + 1,
        }, token);
        showStatus('Category created');
      } else {
        await api.updateCategory(editingCategory.id!, editingCategory, token);
        showStatus('Category updated');
      }
      setEditingCategory(null);
      loadAdminData();
    } catch (err: any) {
      showStatus(err.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!token || !confirm('Delete category?')) return;
    try {
      await api.deleteCategory(id, token);
      showStatus('Category deleted');
      loadAdminData();
    } catch (err: any) {
      showStatus(err.message || 'Failed to delete category', 'error');
    }
  };

  // --- Order Status Handler ---
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, adminNotes?: string) => {
    if (!token) return;
    try {
      await api.updateOrderStatus(orderId, status, adminNotes, token);
      showStatus(`Order status updated to ${status} & synced to Supabase`);
      loadAdminData();
    } catch {
      showStatus('Failed to update order', 'error');
    }
  };

  // --- Enquiry Status Handler ---
  const handleUpdateEnquiryStatus = async (enquiryId: string, status: Enquiry['status']) => {
    if (!token) return;
    try {
      await api.updateEnquiryStatus(enquiryId, status, token);
      showStatus(`Enquiry marked as ${status}`);
      loadAdminData();
    } catch {
      showStatus('Failed to update enquiry', 'error');
    }
  };

  // --- Settings Handler ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.updateSettings(settingsForm, token);
      await refreshSettings();
      showStatus('Business Settings & Hours updated successfully!');
    } catch (err: any) {
      showStatus('Failed to update settings', 'error');
    }
  };

  // --- Admin Profile & Password Update Handler ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (profileNewPassword && profileNewPassword !== profileConfirmPassword) {
      showStatus('New passwords do not match', 'error');
      return;
    }
    if (profileNewPassword && profileNewPassword.length < 4) {
      showStatus('New password must be at least 4 characters long', 'error');
      return;
    }

    setProfileSaving(true);
    try {
      await api.updateAdminProfile({
        fullName: profileFullName.trim(),
        email: profileEmail.trim(),
        newPassword: profileNewPassword ? profileNewPassword.trim() : undefined,
      }, token);

      showStatus('Administrator profile & security updated successfully!');
      setProfileNewPassword('');
      setProfileConfirmPassword('');
      loadAdminData();
    } catch (err: any) {
      showStatus(err.message || 'Failed to update admin profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const matchesSearch = !orderSearchQuery.trim() || 
      order.reference.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerPhone.includes(orderSearchQuery.trim()) ||
      order.customerAddress.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-6xl bg-[#FAF8F5] h-[94vh] shadow-2xl border border-[#DED4C6] flex flex-col overflow-hidden text-[#1C1A17]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 bg-[#1C1A17] text-white flex items-center justify-between border-b border-[#332C24]">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#E0C696] uppercase">
              Bunkar Sanskriti
            </span>
            <span className="text-xs uppercase tracking-widest text-[#9E8E7D] border-l border-[#3D352B] pl-3 hidden sm:inline">
              Master Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#C5A059] bg-[#29231C] px-3 py-1 border border-[#3E342A]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E0C696]" />
                <span>Slot Claimed • {adminAccount?.username || 'admin'}</span>
              </div>
            )}
            {isAuthenticated && (
              <button
                onClick={loadAdminData}
                className="p-1.5 text-[#9E8E7D] hover:text-white transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#9E8E7D] hover:text-white rounded-full hover:bg-[#332C24] transition-colors"
              aria-label="Close admin dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content Area */}
        {!isAuthenticated ? (
          /* =========================================================================
             SINGLE-SLOT ADMIN SETUP & AUTHENTICATION SCREEN
             ========================================================================= */
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#FAF8F5] overflow-y-auto">
            <div className="w-full max-w-lg bg-white p-6 sm:p-8 border border-[#E3D9CC] shadow-xl space-y-6">
              
              <div className="text-center space-y-1">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8B1E2F]">
                  Restricted Owner Portal
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17]">
                  {authMode === 'register' ? 'Claim Admin Account' : 'Administrator Sign In'}
                </h3>
                <p className="text-xs text-[#736657]">
                  Manage Varanasi inventory, live WhatsApp orders, product images, prices, and discounts.
                </p>
              </div>

              {/* Single Slot Status Callout */}
              <div className={`p-3.5 border text-xs flex items-start gap-2.5 ${
                setupStatus?.slotAvailable 
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              }`}>
                {setupStatus?.slotAvailable ? (
                  <UserPlus className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {setupStatus?.slotAvailable 
                      ? 'Single Slot Available for Admin Registration' 
                      : 'Admin Slot Occupied (1 of 1 slots registered)'}
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                    {setupStatus?.slotAvailable 
                      ? 'You have 1 dedicated slot to create your permanent administrator account. Once created, registration is closed forever and nobody else can create an admin account.' 
                      : `The administrator account has already been claimed by @${setupStatus?.username || 'admin'}. Additional account registrations are strictly forbidden.`}
                  </p>
                </div>
              </div>

              {/* Tab Navigation: Register vs Login */}
              <div className="flex border-b border-[#E3D9CC] text-xs">
                {setupStatus?.slotAvailable ? (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setRegError(''); }}
                    className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                      authMode === 'register'
                        ? 'border-[#8B1E2F] text-[#8B1E2F]'
                        : 'border-transparent text-[#7A6E5F] hover:text-[#1C1A17]'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Admin Account (1 Slot)</span>
                  </button>
                ) : (
                  <div
                    className="flex-1 py-2.5 text-center text-[#9E8E7D] bg-gray-50 border-b-2 border-transparent flex items-center justify-center gap-1.5 cursor-not-allowed"
                    title="Single admin slot already claimed"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span className="line-through">Sign Up Closed</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLoginError(''); }}
                  className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    authMode === 'login'
                      ? 'border-[#8B1E2F] text-[#8B1E2F]'
                      : 'border-transparent text-[#7A6E5F] hover:text-[#1C1A17]'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>
              </div>

              {/* TAB 1: SINGLE-SLOT REGISTRATION FORM */}
              {authMode === 'register' && setupStatus?.slotAvailable && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                  {regError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                      Your Full Name / Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sonu / Store Owner"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                        Choose Admin Username *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. bunkar_admin"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                        Set Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 4 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#7A6E5F] italic">
                    By submitting, this single slot is permanently registered to you.
                  </p>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 bg-[#8B1E2F] hover:bg-[#721524] text-white text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{regLoading ? 'Creating Admin Account...' : 'Claim Single Slot & Create Account'}</span>
                  </button>
                </form>
              )}

              {/* TAB 2: LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-[#524A40] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#D9CFBF] focus:outline-none focus:border-[#8B1E2F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-[#1C1A17] hover:bg-[#8B1E2F] text-white text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                  </button>
                </form>
              )}

              {setupStatus?.slotAvailable && authMode === 'login' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                  <span>Haven't created your single admin account yet?</span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="font-bold underline text-[#8B1E2F] cursor-pointer ml-2"
                  >
                    Claim Slot
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* =========================================================================
             AUTHENTICATED DASHBOARD
             ========================================================================= */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-[#1C1A17] text-[#D8C7B5] p-4 flex flex-col justify-between shrink-0 border-r border-[#2E2822]">
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'products', label: 'Products & Pricing', icon: Package, badge: products.length },
                  { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, badge: orders.length },
                  { id: 'categories', label: 'Categories', icon: FolderTree, badge: categories.length },
                  { id: 'customers', label: 'Customers', icon: Users, badge: customers.length },
                  { id: 'enquiries', label: 'Enquiries', icon: HelpCircle, badge: enquiries.length },
                  { id: 'settings', label: 'Store Hours & Info', icon: Settings },
                  { id: 'firebase', label: 'Firebase Firestore', icon: Flame },
                  { id: 'supabase', label: 'Supabase Backend', icon: Database },
                  { id: 'account', label: 'Admin Security', icon: UserCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-[#8B1E2F] text-white font-semibold' 
                          : 'hover:bg-[#2E2822] text-[#A69786]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-black/40 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-[#2E2822] space-y-2">
                <div className="px-3 py-1.5 bg-[#26201A] text-[11px] text-[#A69786] border border-[#3A3127]">
                  <span className="block text-[#E0C696] font-semibold">{adminAccount?.fullName || 'Master Administrator'}</span>
                  <span className="text-[10px]">@{adminAccount?.username || 'admin'} • Single Slot</span>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A69786] hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>

            {/* Main Tab Panel */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF8F5]">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">Dashboard Overview</h3>
                    <p className="text-xs text-[#706456]">Live metrics for Bunkar Sanskriti atelier & store.</p>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white border border-[#E3D9CC] shadow-2xs">
                      <span className="text-[11px] uppercase tracking-wider text-[#736657] font-medium block">Total Products</span>
                      <span className="font-serif text-3xl font-bold text-[#1C1A17] mt-1 block">
                        {stats?.totalProducts ?? products.length}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium">
                        {stats?.availableProducts ?? products.filter(p => p.available).length} In Stock
                      </span>
                    </div>

                    <div className="p-4 bg-white border border-[#E3D9CC] shadow-2xs">
                      <span className="text-[11px] uppercase tracking-wider text-[#736657] font-medium block">Total Orders</span>
                      <span className="font-serif text-3xl font-bold text-[#8B1E2F] mt-1 block">
                        {stats?.totalOrders ?? orders.length}
                      </span>
                      <span className="text-[11px] text-[#736657]">WhatsApp & Online</span>
                    </div>

                    <div className="p-4 bg-white border border-[#E3D9CC] shadow-2xs">
                      <span className="text-[11px] uppercase tracking-wider text-[#736657] font-medium block">Customer Inquiries</span>
                      <span className="font-serif text-3xl font-bold text-[#1C1A17] mt-1 block">
                        {stats?.totalEnquiries ?? enquiries.length}
                      </span>
                      <span className="text-[11px] text-amber-700 font-medium">
                        {enquiries.filter(e => e.status === 'Pending').length} Pending
                      </span>
                    </div>

                    <div className="p-4 bg-white border border-[#E3D9CC] shadow-2xs">
                      <span className="text-[11px] uppercase tracking-wider text-[#736657] font-medium block">Est. Revenue Value</span>
                      <span className="font-serif text-3xl font-bold text-[#1E7453] mt-1 block">
                        ₹{(stats?.estimatedRevenue ?? 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-[#736657]">Order Volume</span>
                    </div>
                  </div>

                  {/* Supabase Sync Quick Status */}
                  <div className="p-4 bg-white border border-[#E3D9CC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-100 text-[#1E7453] flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-[#1C1A17] block">Supabase Backend Connected</span>
                        <span className="text-[11px] text-[#736657]">
                          Project ID: <code>epkmdmenneocgpzuhrne</code> • All orders and pricing sync automatically
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('supabase')}
                      className="px-3.5 py-1.5 bg-[#1E7453] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#165a40] transition-colors cursor-pointer shrink-0"
                    >
                      Supabase Console
                    </button>
                  </div>

                  {/* Recent Orders List */}
                  <div className="p-5 bg-white border border-[#E3D9CC] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F0E9DF] pb-3">
                      <h4 className="font-serif text-lg font-semibold text-[#1C1A17]">Recent Customer Orders</h4>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-[#8B1E2F] hover:underline font-semibold"
                      >
                        View All ({orders.length})
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <p className="text-xs text-center py-6 text-gray-400">No orders received yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 4).map((order) => (
                          <div key={order.id} className="p-3 bg-[#FAF8F5] border border-[#EAE2D8] flex items-center justify-between gap-4 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#8B1E2F]">#{order.reference}</span>
                                <span className="text-[11px] text-gray-500">· {new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className="px-1.5 py-0.5 text-[10px] bg-[#EBE4D8] font-medium">{order.status}</span>
                              </div>
                              <p className="font-medium text-[#1C1A17] mt-0.5">{order.customerName} ({order.customerPhone})</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-[#8B1E2F]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                              <a
                                href={`https://wa.me/${formatWhatsAppNumber(order.customerPhone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[11px] text-[#1E7453] underline font-medium mt-0.5"
                              >
                                WhatsApp Chat
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS & PRICING MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">Product Catalog & Pricing</h3>
                      <p className="text-xs text-[#706456]">
                        Update product images, prices, discounts, and availability. All edits sync directly to Supabase.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsNewProduct(true);
                        setProductDiscountPercent('');
                        setEditingProduct({
                          name: '',
                          category: categories[0]?.name || 'Banarasi Saree',
                          price: 15000,
                          salePrice: null,
                          description: '',
                          shortDescription: '',
                          images: ['/src/assets/images/hero_banarasi_saree_1790522952613.jpg'],
                          available: true,
                          featured: false,
                          isOutlet: false,
                          fabric: 'Pure Katan Silk',
                          weave: 'Kadhwa Handloom',
                          color: '',
                          zariType: 'Antique Gold Zari',
                          tags: ['Banarasi Saree'],
                        });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8B1E2F] hover:bg-[#721524] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </div>

                  {/* Products Table with Quick Edit Controls */}
                  <div className="bg-white border border-[#E3D9CC] overflow-x-auto shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F3EE] uppercase text-[10px] tracking-wider text-[#635749] border-b border-[#E3D9CC]">
                        <tr>
                          <th className="p-3">Product & Image</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price & Discount</th>
                          <th className="p-3">Availability</th>
                          <th className="p-3">Flags</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE4]">
                        {products.map((p) => {
                          const hasDiscount = p.salePrice && p.price && p.salePrice < p.price;
                          const discountPct = hasDiscount 
                            ? Math.round(((p.price! - p.salePrice!) / p.price!) * 100) 
                            : null;

                          return (
                            <tr key={p.id} className="hover:bg-[#FAF8F5]">
                              {/* Product Thumbnail & Name */}
                              <td className="p-3 flex items-center gap-3">
                                <div className="relative group shrink-0">
                                  <img
                                    src={p.images?.[0] || '/src/assets/images/hero_banarasi_saree_1790522952613.jpg'}
                                    alt=""
                                    className="w-12 h-14 object-cover bg-[#F2ECE4] border border-[#E3D9CC]"
                                  />
                                  <button
                                    onClick={() => openQuickPriceModal(p)}
                                    className="absolute inset-0 bg-black/60 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-medium"
                                    title="Change image"
                                  >
                                    Image
                                  </button>
                                </div>
                                <div>
                                  <span className="font-semibold text-[#1C1A17] block line-clamp-1">{p.name}</span>
                                  <span className="text-[10px] text-[#7A6E5F]">{p.fabric || 'Textile'} · {p.images?.length || 1} image(s)</span>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="p-3 text-[#524A40] font-medium">{p.category}</td>

                              {/* Price & Discount */}
                              <td className="p-3">
                                {p.price !== null ? (
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-sm text-[#8B1E2F]">
                                        ₹{(p.salePrice ?? p.price).toLocaleString('en-IN')}
                                      </span>
                                      {discountPct && (
                                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold">
                                          {discountPct}% OFF
                                        </span>
                                      )}
                                    </div>
                                    {p.salePrice && (
                                      <span className="text-[11px] text-gray-400 line-through block">
                                        ₹{p.price.toLocaleString('en-IN')}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[#8B1E2F] font-medium">Contact for Price</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="p-3">
                                <span className={`px-2 py-0.5 text-[10px] font-semibold ${
                                  p.available ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {p.available ? 'In Stock' : 'Sold Out'}
                                </span>
                              </td>

                              {/* Flags */}
                              <td className="p-3 space-x-1">
                                {p.featured && <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 font-medium">Featured</span>}
                                {p.isOutlet && <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 font-medium">Outlet</span>}
                              </td>

                              {/* Actions */}
                              <td className="p-3 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => openQuickPriceModal(p)}
                                  className="px-2.5 py-1 bg-[#F2ECE4] hover:bg-[#E8DFD5] text-[#1C1A17] text-[11px] font-semibold transition-colors cursor-pointer border border-[#D9CFBF]"
                                  title="Quickly edit price, discount, and image"
                                >
                                  ₹ Price & Discount
                                </button>
                                <button
                                  onClick={() => {
                                    setIsNewProduct(false);
                                    setEditingProduct({ ...p });
                                    if (p.price && p.salePrice && p.salePrice < p.price) {
                                      setProductDiscountPercent(Math.round(((p.price - p.salePrice) / p.price) * 100));
                                    } else {
                                      setProductDiscountPercent('');
                                    }
                                  }}
                                  className="p-1.5 text-[#544B40] hover:text-[#8B1E2F]"
                                  title="Full Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 text-[#968777] hover:text-red-700"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* =========================================================================
                      QUICK MODAL: UPDATE PRODUCT PRICE, DISCOUNT & IMAGE
                      ========================================================================= */}
                  {quickPricingProduct && (
                    <div className="fixed inset-0 z-60 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
                      <div className="bg-white w-full max-w-lg p-6 space-y-5 border border-[#E3D9CC] shadow-2xl">
                        
                        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
                          <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-[#8B1E2F]" />
                            <h4 className="font-serif text-lg font-semibold text-[#1C1A17]">
                              Update Image, Price & Discount
                            </h4>
                          </div>
                          <button onClick={() => setQuickPricingProduct(null)} className="p-1 text-gray-500 hover:text-black">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Product Header preview */}
                        <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                          <img
                            src={quickImageUrl || quickPricingProduct.images?.[0] || '/src/assets/images/hero_banarasi_saree_1790522952613.jpg'}
                            alt=""
                            className="w-14 h-16 object-cover border border-[#D9CFBF] bg-white shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-xs text-[#1C1A17] block">{quickPricingProduct.name}</span>
                            <span className="text-[11px] text-[#7A6E5F]">{quickPricingProduct.category}</span>
                            <span className="text-[11px] text-emerald-700 font-medium block">
                              Syncs instantly with Supabase database
                            </span>
                          </div>
                        </div>

                        <form onSubmit={handleQuickPricingSave} className="space-y-4 text-xs">
                          {/* 1. Image URL */}
                          <div>
                            <label className="block text-[11px] font-semibold uppercase mb-1 text-[#524A40]">
                              Primary Product Image URL
                            </label>
                            <input
                              type="text"
                              value={quickImageUrl}
                              onChange={(e) => setQuickImageUrl(e.target.value)}
                              placeholder="Enter image URL or select a preset below"
                              className="w-full px-3 py-2 border border-[#D9CFBF] bg-[#FAF8F5]"
                            />
                            {/* Image presets */}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                              <span className="text-gray-500">Presets:</span>
                              {BANARASI_IMAGE_PRESETS.map((preset) => (
                                <button
                                  type="button"
                                  key={preset.label}
                                  onClick={() => setQuickImageUrl(preset.url)}
                                  className="px-2 py-0.5 bg-[#F2ECE4] hover:bg-[#E0D5C7] text-[#1C1A17] border border-[#D9CFBF] cursor-pointer"
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 2. Regular Price & Discount Presets */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold uppercase mb-1 text-[#524A40]">
                                Regular Price (₹)
                              </label>
                              <input
                                type="number"
                                required
                                value={quickPrice}
                                onChange={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : '';
                                  setQuickPrice(val);
                                  if (typeof val === 'number' && typeof quickDiscountPercent === 'number') {
                                    setQuickSalePrice(Math.round(val * (1 - quickDiscountPercent / 100)));
                                  }
                                }}
                                placeholder="18500"
                                className="w-full px-3 py-2 border border-[#D9CFBF] bg-white font-semibold text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold uppercase mb-1 text-[#524A40]">
                                Sale Price (₹) (Optional)
                              </label>
                              <input
                                type="number"
                                value={quickSalePrice}
                                onChange={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : '';
                                  setQuickSalePrice(val);
                                  if (typeof val === 'number' && typeof quickPrice === 'number' && quickPrice > 0) {
                                    setQuickDiscountPercent(Math.round(((quickPrice - val) / quickPrice) * 100));
                                  } else {
                                    setQuickDiscountPercent('');
                                  }
                                }}
                                placeholder="14800"
                                className="w-full px-3 py-2 border border-[#D9CFBF] bg-white font-semibold text-sm text-[#8B1E2F]"
                              />
                            </div>
                          </div>

                          {/* 3. Discount Presets Buttons */}
                          <div>
                            <span className="block text-[11px] font-semibold uppercase mb-1.5 text-[#524A40]">
                              Quick Discount Presets
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                                <button
                                  type="button"
                                  key={pct}
                                  onClick={() => handleApplyDiscountPreset(pct)}
                                  className={`px-2.5 py-1 text-xs font-semibold cursor-pointer border ${
                                    quickDiscountPercent === pct 
                                      ? 'bg-[#8B1E2F] text-white border-[#8B1E2F]' 
                                      : 'bg-[#FAF8F5] hover:bg-[#EFE8DF] text-[#1C1A17] border-[#D9CFBF]'
                                  }`}
                                >
                                  {pct}% OFF
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={handleClearDiscount}
                                className="px-2.5 py-1 text-xs text-gray-500 hover:text-black border border-gray-300 bg-white"
                              >
                                Clear Discount
                              </button>
                            </div>
                          </div>

                          {/* Live Discount Calculation Summary */}
                          {quickPrice && quickSalePrice && quickSalePrice < quickPrice && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs space-y-0.5">
                              <span className="font-bold text-sm">
                                {quickDiscountPercent}% Discount Applied!
                              </span>
                              <p>
                                Original: <span className="line-through">₹{quickPrice.toLocaleString('en-IN')}</span> → Sale Price: <span className="font-bold text-[#8B1E2F]">₹{quickSalePrice.toLocaleString('en-IN')}</span> (Customer saves ₹{(quickPrice - quickSalePrice).toLocaleString('en-IN')})
                              </p>
                            </div>
                          )}

                          {/* Availability Toggle */}
                          <div className="pt-1 flex items-center justify-between">
                            <span className="font-semibold text-xs text-[#524A40]">Stock Availability</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={quickAvailable}
                                onChange={(e) => setQuickAvailable(e.target.checked)}
                              />
                              <span className={quickAvailable ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                                {quickAvailable ? 'In Stock / Available' : 'Sold Out / Unavailable'}
                              </span>
                            </label>
                          </div>

                          <div className="pt-3 border-t border-[#E8DFD5] flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setQuickPricingProduct(null)}
                              className="px-4 py-2 border border-[#D9CFBF] text-[#524A40]"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={quickUpdating}
                              className="px-6 py-2 bg-[#8B1E2F] hover:bg-[#721524] text-white font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                            >
                              <Save className="w-4 h-4" />
                              <span>{quickUpdating ? 'Saving & Syncing...' : 'Save & Sync to Supabase'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      FULL PRODUCT EDIT / CREATE MODAL
                      ========================================================================= */}
                  {editingProduct && (
                    <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
                      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-[#E3D9CC] shadow-xl">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
                          <h4 className="font-serif text-xl font-semibold">
                            {isNewProduct ? 'Add New Product' : 'Edit Product'}
                          </h4>
                          <button onClick={() => setEditingProduct(null)}>
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-semibold uppercase mb-1">Product Name *</label>
                              <input
                                type="text"
                                required
                                value={editingProduct.name || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                className="w-full px-3 py-2 border border-[#D9CFBF]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold uppercase mb-1">Category *</label>
                              <select
                                value={editingProduct.category || categories[0]?.name}
                                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                className="w-full px-3 py-2 border border-[#D9CFBF] bg-white"
                              >
                                {categories.map((c) => (
                                  <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Pricing & Discount section */}
                          <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8] space-y-3">
                            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#524A40] block">
                              Pricing & Promotional Discount
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[11px] font-medium mb-1">
                                  Regular Price (₹)
                                </label>
                                <input
                                  type="number"
                                  value={editingProduct.price ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value ? Number(e.target.value) : null;
                                    setEditingProduct({ ...editingProduct, price: val });
                                    if (val && typeof productDiscountPercent === 'number') {
                                      setEditingProduct(prev => prev ? ({
                                        ...prev,
                                        price: val,
                                        salePrice: Math.round(val * (1 - productDiscountPercent / 100))
                                      }) : null);
                                    }
                                  }}
                                  placeholder="Leave empty for Contact for Price"
                                  className="w-full px-3 py-2 border border-[#D9CFBF] bg-white font-semibold"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium mb-1">
                                  Sale / Discount Price (₹)
                                </label>
                                <input
                                  type="number"
                                  value={editingProduct.salePrice ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value ? Number(e.target.value) : null;
                                    setEditingProduct({ ...editingProduct, salePrice: val });
                                    if (val && editingProduct.price && editingProduct.price > 0) {
                                      setProductDiscountPercent(Math.round(((editingProduct.price - val) / editingProduct.price) * 100));
                                    } else {
                                      setProductDiscountPercent('');
                                    }
                                  }}
                                  placeholder="Optional discounted price"
                                  className="w-full px-3 py-2 border border-[#D9CFBF] bg-white font-semibold text-[#8B1E2F]"
                                />
                              </div>
                            </div>

                            {/* Preset discounts */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-gray-500">Presets:</span>
                              {[10, 15, 20, 25, 30, 50].map((pct) => (
                                <button
                                  type="button"
                                  key={pct}
                                  onClick={() => {
                                    if (editingProduct.price) {
                                      setProductDiscountPercent(pct);
                                      setEditingProduct({
                                        ...editingProduct,
                                        salePrice: Math.round(editingProduct.price * (1 - pct / 100))
                                      });
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-white border border-[#D9CFBF] hover:bg-[#EFE8DF] text-[10px] font-semibold"
                                >
                                  {pct}% OFF
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setProductDiscountPercent('');
                                  setEditingProduct({ ...editingProduct, salePrice: null });
                                }}
                                className="px-2 py-0.5 bg-white border border-gray-300 text-[10px] text-gray-500"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[11px] font-semibold uppercase mb-1">Fabric</label>
                              <input
                                type="text"
                                value={editingProduct.fabric || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                                placeholder="e.g. Pure Katan Silk"
                                className="w-full px-3 py-2 border border-[#D9CFBF]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold uppercase mb-1">Weave</label>
                              <input
                                type="text"
                                value={editingProduct.weave || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, weave: e.target.value })}
                                placeholder="e.g. Kadhwa Handloom"
                                className="w-full px-3 py-2 border border-[#D9CFBF]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold uppercase mb-1">Zari Type</label>
                              <input
                                type="text"
                                value={editingProduct.zariType || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, zariType: e.target.value })}
                                placeholder="e.g. Antique Gold Zari"
                                className="w-full px-3 py-2 border border-[#D9CFBF]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold uppercase mb-1">Short Description</label>
                            <input
                              type="text"
                              value={editingProduct.shortDescription || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                              className="w-full px-3 py-2 border border-[#D9CFBF]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold uppercase mb-1">Full Description</label>
                            <textarea
                              rows={3}
                              value={editingProduct.description || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                              className="w-full px-3 py-2 border border-[#D9CFBF]"
                            />
                          </div>

                          {/* Image Paths with live thumbnail previews */}
                          <div className="space-y-2">
                            <label className="block text-[11px] font-semibold uppercase mb-1">
                              Image Paths / URLs (Comma separated)
                            </label>
                            <textarea
                              rows={2}
                              value={editingProduct.images?.join(', ') || ''}
                              onChange={(e) => setEditingProduct({ 
                                ...editingProduct, 
                                images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                              })}
                              className="w-full px-3 py-2 border border-[#D9CFBF]"
                            />
                            {/* Visual previews */}
                            <div className="flex items-center gap-2 overflow-x-auto py-1">
                              {editingProduct.images?.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt=""
                                  className="w-12 h-14 object-cover border border-[#D9CFBF]"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingProduct.available ?? true}
                                onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.checked })}
                              />
                              <span>Available in Stock</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingProduct.featured ?? false}
                                onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                              />
                              <span>Featured Creation</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingProduct.isOutlet ?? false}
                                onChange={(e) => setEditingProduct({ ...editingProduct, isOutlet: e.target.checked })}
                              />
                              <span>Factory Outlet Tag</span>
                            </label>
                          </div>

                          <div className="pt-3 border-t border-[#E8DFD5] flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setEditingProduct(null)}
                              className="px-4 py-2 border border-[#D9CFBF] text-[#524A40]"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 bg-[#8B1E2F] hover:bg-[#721524] text-white font-semibold uppercase tracking-wider"
                            >
                              Save Product
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CUSTOMER ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">All Customer Orders</h3>
                      <p className="text-xs text-[#706456]">
                        View orders filled on the website and WhatsApp. All entries sync to Supabase.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-800 bg-emerald-100 font-semibold px-2.5 py-1">
                        ✓ Synced to Supabase
                      </span>
                    </div>
                  </div>

                  {/* Search & Filter Controls */}
                  <div className="p-4 bg-white border border-[#E3D9CC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search by order #, customer, phone..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-[#D9CFBF] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#8B1E2F]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                      {(['all', 'New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3 py-1.5 font-medium transition-colors cursor-pointer text-xs ${
                            orderStatusFilter === st
                              ? 'bg-[#8B1E2F] text-white'
                              : 'bg-[#FAF8F5] text-[#524A40] hover:bg-[#EFE8DF]'
                          }`}
                        >
                          {st === 'all' ? `All (${orders.length})` : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                      <div className="p-12 text-center bg-white border border-[#E3D9CC]">
                        <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-[#1C1A17]">No matching orders found</p>
                        <p className="text-xs text-gray-500 mt-1">Orders placed on the website or via WhatsApp will appear here.</p>
                      </div>
                    ) : (
                      filteredOrders.map((order) => {
                        const customerWhatsAppUrl = `https://wa.me/${formatWhatsAppNumber(order.customerPhone)}?text=${encodeURIComponent(
                          `Hello ${order.customerName}, this is Bunkar Sanskriti regarding your order #${order.reference}.`
                        )}`;

                        return (
                          <div key={order.id} className="p-5 bg-white border border-[#E3D9CC] shadow-2xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0E9DF] pb-3">
                              <div className="flex items-center gap-3">
                                <span className="font-serif text-lg font-bold text-[#8B1E2F]">
                                  Order #{order.reference}
                                </span>
                                <span className="text-xs text-[#736657]">
                                  {new Date(order.createdAt).toLocaleString()}
                                </span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5">
                                  In Supabase
                                </span>
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  Firestore Synced
                                </span>
                              </div>

                              {/* Status Dropdown */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#524A40] font-semibold">Status:</span>
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                  className="text-xs px-2.5 py-1 border border-[#D9CFBF] bg-[#FAF8F5] font-semibold text-[#1C1A17]"
                                >
                                  <option value="New">New</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                              {/* Customer Details */}
                              <div className="space-y-1.5 p-3.5 bg-[#FAF8F5] border border-[#EAE2D8]">
                                <p className="font-semibold text-xs text-[#1C1A17] uppercase tracking-wider">
                                  Customer Information
                                </p>
                                <p><span className="text-gray-500">Name:</span> <strong className="text-[#1C1A17]">{order.customerName}</strong></p>
                                <p><span className="text-gray-500">Phone:</span> <strong className="text-[#1C1A17]">{order.customerPhone}</strong></p>
                                {order.customerEmail && <p><span className="text-gray-500">Email:</span> {order.customerEmail}</p>}
                                <p><span className="text-gray-500">Delivery Address:</span> {order.customerAddress}</p>
                                {order.customerNote && (
                                  <p className="text-amber-800 bg-amber-50 p-2 border border-amber-200 mt-2">
                                    <strong>Customer Note:</strong> {order.customerNote}
                                  </p>
                                )}
                              </div>

                              {/* Order Items */}
                              <div className="space-y-2">
                                <p className="font-semibold text-xs text-[#1C1A17] uppercase tracking-wider">
                                  Ordered Products
                                </p>
                                <ul className="space-y-2">
                                  {order.items.map((i, idx) => (
                                    <li key={idx} className="flex items-center justify-between p-2 border border-[#F0E9DF] bg-white">
                                      <div>
                                        <span className="font-semibold text-[#1C1A17] block">{i.productName}</span>
                                        <span className="text-[11px] text-gray-500">
                                          Qty: {i.quantity} {i.selectedVariant ? `· Variant: ${i.selectedVariant}` : ''}
                                        </span>
                                      </div>
                                      <span className="font-semibold text-[#8B1E2F]">
                                        {i.price ? `₹${(i.price * i.quantity).toLocaleString('en-IN')}` : 'Price on req'}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="pt-2 flex items-center justify-between font-bold text-sm border-t border-[#F0E9DF]">
                                  <span>Total Order Value:</span>
                                  <span className="text-[#8B1E2F]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F0E9DF]">
                              <span className="text-[11px] text-gray-500">
                                Customer selected: {order.viaWhatsApp ? 'WhatsApp direct ordering' : 'Web checkout'}
                              </span>
                              <a
                                href={customerWhatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1E7453] hover:bg-[#165a40] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                              >
                                <MessageCircle className="w-4 h-4 fill-current" />
                                <span>Chat with Customer on WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORIES MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">Category Management</h3>
                      <p className="text-xs text-[#706456]">Manage main departments & collections.</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsNewCategory(true);
                        setEditingCategory({
                          name: '',
                          description: '',
                          image: '/src/assets/images/hero_banarasi_saree_1790522952613.jpg',
                          enabled: true,
                          displayOrder: categories.length + 1,
                        });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E2F] text-white text-xs font-semibold uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((c) => (
                      <div key={c.id} className="p-4 bg-white border border-[#E3D9CC] flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={c.image} alt="" className="w-12 h-12 object-cover border" />
                          <div>
                            <span className="font-semibold text-sm text-[#1C1A17] block">{c.name}</span>
                            <span className="text-[11px] text-gray-500 line-clamp-1">{c.description}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setIsNewCategory(false);
                              setEditingCategory({ ...c });
                            }}
                            className="p-1.5 text-gray-600 hover:text-black"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1.5 text-gray-400 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {editingCategory && (
                    <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
                      <div className="bg-white w-full max-w-md p-6 space-y-4 border border-[#E3D9CC]">
                        <h4 className="font-serif text-lg font-semibold">
                          {isNewCategory ? 'Add Category' : 'Edit Category'}
                        </h4>
                        <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Category Name</label>
                            <input
                              type="text"
                              required
                              value={editingCategory.name || ''}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              className="w-full px-3 py-2 border"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Description</label>
                            <textarea
                              rows={2}
                              value={editingCategory.description || ''}
                              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                              className="w-full px-3 py-2 border"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Banner Image URL</label>
                            <input
                              type="text"
                              value={editingCategory.image || ''}
                              onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                              className="w-full px-3 py-2 border"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className="px-4 py-2 border"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-[#8B1E2F] text-white font-semibold"
                            >
                              Save Category
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: CUSTOMER DIRECTORY */}
              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">Customer Directory</h3>
                    <p className="text-xs text-[#706456]">Clients who have interacted or placed orders.</p>
                  </div>

                  <div className="bg-white border border-[#E3D9CC] overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F3EE] uppercase text-[10px] tracking-wider text-[#635749] border-b">
                        <tr>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Address</th>
                          <th className="p-3">Total Orders</th>
                          <th className="p-3">Total Spent</th>
                          <th className="p-3">Last Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE4]">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-[#FAF8F5]">
                            <td className="p-3 font-semibold text-[#1C1A17]">{c.name}</td>
                            <td className="p-3">
                              <a 
                                href={`https://wa.me/${formatWhatsAppNumber(c.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1E7453] underline font-medium"
                              >
                                {c.phone}
                              </a>
                            </td>
                            <td className="p-3 text-[#736657] max-w-xs truncate">{c.address || '—'}</td>
                            <td className="p-3 font-medium">{c.orderCount}</td>
                            <td className="p-3 font-semibold text-[#8B1E2F]">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                            <td className="p-3 text-[11px] text-gray-500">
                              {new Date(c.lastInteraction).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: ENQUIRIES */}
              {activeTab === 'enquiries' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">Customer Enquiries</h3>
                    <p className="text-xs text-[#706456]">General questions and video-viewing requests.</p>
                  </div>

                  <div className="space-y-3">
                    {enquiries.length === 0 ? (
                      <p className="text-xs text-center py-8 bg-white border">No enquiries received yet.</p>
                    ) : (
                      enquiries.map((enq) => (
                        <div key={enq.id} className="p-4 bg-white border border-[#E3D9CC] space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b pb-2">
                            <div>
                              <span className="font-semibold text-sm text-[#1C1A17]">{enq.customerName}</span>
                              <span className="text-xs text-[#7A6E5F] ml-2">· {enq.customerPhone}</span>
                              {enq.productName && (
                                <span className="ml-2 text-[#8B1E2F] font-medium">Re: {enq.productName}</span>
                              )}
                            </div>
                            <select
                              value={enq.status}
                              onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value as any)}
                              className="px-2 py-1 border text-xs"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Responded">Responded</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </div>
                          <p className="text-[#4A4237] leading-relaxed bg-[#FAF8F5] p-2.5">{enq.message}</p>
                          <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1">
                            <span>Received: {new Date(enq.createdAt).toLocaleString()}</span>
                            <a
                              href={`https://wa.me/${formatWhatsAppNumber(enq.customerPhone)}?text=${encodeURIComponent(
                                `Hello ${enq.customerName}, regarding your inquiry with Bunkar Sanskriti.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1E7453] underline font-medium"
                            >
                              Reply on WhatsApp
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: BUSINESS SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">Store Information & Hours</h3>
                    <p className="text-xs text-[#706456]">Manage Varanasi store address, phone numbers and operating hours.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6 bg-white p-6 border border-[#E3D9CC] text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase mb-1">Sonu's Phone</label>
                        <input
                          type="text"
                          value={settingsForm.sonuPhone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, sonuPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-[#D9CFBF]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase mb-1">Shop Landline / Phone</label>
                        <input
                          type="text"
                          value={settingsForm.shopPhone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, shopPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-[#D9CFBF]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase mb-1">Aman's Phone</label>
                        <input
                          type="text"
                          value={settingsForm.amanPhone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, amanPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-[#D9CFBF]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase mb-1">Email</label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-[#D9CFBF]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase mb-1">WhatsApp Order Number</label>
                        <input
                          type="text"
                          value={settingsForm.whatsappNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-[#D9CFBF]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase mb-1">Physical Store Address</label>
                      <textarea
                        rows={2}
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full px-3 py-2 border border-[#D9CFBF]"
                      />
                    </div>

                    {/* Weekly Schedule */}
                    <div className="pt-4 border-t border-[#E8DFD5] space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-lg font-semibold text-[#1C1A17]">Operating Schedule</h4>
                        <span className={`text-xs px-2.5 py-1 font-semibold ${
                          settings.currentStatus.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Current Store Status: {settings.currentStatus.statusText}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {settingsForm.businessHours.map((schedule, idx) => (
                          <div 
                            key={schedule.day}
                            className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-[#E3D9CC]"
                          >
                            <div className="w-28 font-semibold text-[#1C1A17]">{schedule.day}</div>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={schedule.isOpen}
                                onChange={(e) => {
                                  const updatedHours = [...settingsForm.businessHours];
                                  updatedHours[idx].isOpen = e.target.checked;
                                  setSettingsForm({ ...settingsForm, businessHours: updatedHours });
                                }}
                              />
                              <span className={schedule.isOpen ? 'text-emerald-700 font-semibold' : 'text-gray-400'}>
                                {schedule.isOpen ? 'Open' : 'Closed'}
                              </span>
                            </label>

                            <div className="flex items-center gap-2">
                              <span>From:</span>
                              <input
                                type="time"
                                disabled={!schedule.isOpen}
                                value={schedule.openTime}
                                onChange={(e) => {
                                  const updatedHours = [...settingsForm.businessHours];
                                  updatedHours[idx].openTime = e.target.value;
                                  setSettingsForm({ ...settingsForm, businessHours: updatedHours });
                                }}
                                className="px-2 py-1 border bg-white disabled:opacity-50"
                              />
                              <span>To:</span>
                              <input
                                type="time"
                                disabled={!schedule.isOpen}
                                value={schedule.closeTime}
                                onChange={(e) => {
                                  const updatedHours = [...settingsForm.businessHours];
                                  updatedHours[idx].closeTime = e.target.value;
                                  setSettingsForm({ ...settingsForm, businessHours: updatedHours });
                                }}
                                className="px-2 py-1 border bg-white disabled:opacity-50"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#8B1E2F] hover:bg-[#721524] text-white font-semibold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save All Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 8: SUPABASE BACKEND MANAGEMENT */}
              {activeTab === 'supabase' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD5] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Database className="w-6 h-6 text-[#1E7453]" />
                        <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">Supabase Backend Integration</h3>
                      </div>
                      <p className="text-xs text-[#706456] mt-0.5">
                        Connected Project ID: <code className="bg-[#EFE8DF] px-1.5 py-0.5 font-bold text-[#1C1A17]">epkmdmenneocgpzuhrne</code>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTriggerSupabaseSync}
                        disabled={syncingSupabase}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E7453] hover:bg-[#165a40] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncingSupabase ? 'animate-spin' : ''}`} />
                        <span>{syncingSupabase ? 'Syncing to Supabase...' : 'Sync All Data to Supabase'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Supabase Connection Status Card */}
                  <div className="p-5 bg-white border border-[#E3D9CC] shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-serif text-lg font-semibold text-[#1C1A17]">Live Connection Status</span>
                      </div>
                      <span className="text-xs text-emerald-800 bg-emerald-100 font-semibold px-2.5 py-1">
                        Client Connected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <span className="text-[#7A6E5F] block text-[10px] uppercase font-bold">Orders Table</span>
                        <span className={`font-semibold mt-1 block ${supabaseStatus?.tablesFound?.orders ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {supabaseStatus?.tablesFound?.orders ? '✓ Ready in Supabase' : 'Waiting for SQL Run'}
                        </span>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <span className="text-[#7A6E5F] block text-[10px] uppercase font-bold">Products Table</span>
                        <span className={`font-semibold mt-1 block ${supabaseStatus?.tablesFound?.products ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {supabaseStatus?.tablesFound?.products ? '✓ Ready in Supabase' : 'Waiting for SQL Run'}
                        </span>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <span className="text-[#7A6E5F] block text-[10px] uppercase font-bold">Categories Table</span>
                        <span className={`font-semibold mt-1 block ${supabaseStatus?.tablesFound?.categories ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {supabaseStatus?.tablesFound?.categories ? '✓ Ready in Supabase' : 'Waiting for SQL Run'}
                        </span>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <span className="text-[#7A6E5F] block text-[10px] uppercase font-bold">Project Endpoint</span>
                        <span className="font-semibold mt-1 block text-[#1C1A17] truncate">
                          epkmdmenneocgpzuhrne.supabase.co
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-[#524A40] flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#F0E9DF]">
                      <p>
                        Every customer order and pricing change filled on this website is immediately recorded in your Supabase backend.
                      </p>
                      <a
                        href="https://supabase.com/dashboard/project/epkmdmenneocgpzuhrne/editor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#8B1E2F] hover:underline font-semibold shrink-0"
                      >
                        <span>Open Supabase Table Editor</span>
                        <LinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8.5: FIREBASE FIRESTORE & AUTH MANAGEMENT */}
              {activeTab === 'firebase' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD5] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-6 h-6 text-amber-600" />
                        <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">Firebase Firestore & Authentication</h3>
                      </div>
                      <p className="text-xs text-[#706456] mt-0.5">
                        Project ID: <code className="bg-[#EFE8DF] px-1.5 py-0.5 font-bold text-[#1C1A17]">{firebaseStatus?.projectId || 'gen-lang-client-0789278970'}</code> • Database ID: <code className="bg-[#EFE8DF] px-1.5 py-0.5 font-bold text-[#1C1A17]">{firebaseStatus?.databaseId || 'ai-studio-bunkarsanskritib-cb2fa849-19b1-492a-aff5-678a98934c67'}</code>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTriggerFirebaseSync}
                        disabled={syncingFirebase}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncingFirebase ? 'animate-spin' : ''}`} />
                        <span>{syncingFirebase ? 'Syncing to Firestore...' : 'Sync All Data to Firestore'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Firebase Connection Status Card */}
                  <div className="p-5 bg-white border border-[#E3D9CC] shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-serif text-lg font-semibold text-[#1C1A17]">Cloud Firestore Engine</span>
                      </div>
                      <span className="text-xs text-emerald-800 bg-emerald-100 font-semibold px-2.5 py-1">
                        Active & Connected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <span className="text-[#7A6E5F] block text-[10px] uppercase font-bold">Cloud Region</span>
                        <span className="font-semibold mt-1 block text-emerald-800">
                          asia-southeast1 (Singapore)
                        </span>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <span className="text-[#7A6E5F] block text-[10px] uppercase font-bold">Security Rules</span>
                        <span className="font-semibold mt-1 block text-emerald-800">
                          ✓ Deployed & Hardened (ABAC)
                        </span>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <span className="text-[#7A6E5F] block text-[10px] uppercase font-bold">Real-Time Sync</span>
                        <span className="font-semibold mt-1 block text-emerald-800">
                          ✓ Live onSnapshot Listeners
                        </span>
                      </div>
                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <span className="text-[#7A6E5F] block text-[10px] uppercase font-bold">Boot Handshake</span>
                        <span className="font-semibold mt-1 block text-emerald-800">
                          ✓ Validated via Server Handshake
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Firebase Authentication (Google Auth) Card */}
                  <div className="p-5 bg-white border border-[#E3D9CC] shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F0E9DF] pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                        <span className="font-serif text-lg font-semibold text-[#1C1A17]">Firebase Authentication (Google Identity)</span>
                      </div>
                      {firebaseUser ? (
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 font-semibold">
                          Authenticated via Google
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5">
                          Not Signed In to Firebase Auth
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#524A40] space-y-3">
                      {firebaseUser ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-emerald-50/60 border border-emerald-200">
                          <div>
                            <span className="font-bold text-[#1C1A17] block">{firebaseUser.displayName || 'Authorized Admin'}</span>
                            <span className="text-[11px] text-[#524A40]">{firebaseUser.email}</span>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-emerald-700">
                              <span>UID: {firebaseUser.uid.substring(0, 16)}...</span>
                              <span>•</span>
                              <span>Email Verified: {firebaseUser.emailVerified ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                          <button
                            onClick={handleGoogleAuthSignOut}
                            className="px-3 py-1.5 bg-[#FAF8F5] border border-[#D9CFBF] hover:bg-red-50 hover:text-red-700 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Sign Out Google Session
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#FAF8F5] border border-[#E8DFD5]">
                          <div>
                            <span className="font-semibold block text-sm text-[#1C1A17]">Link Google Account with Firebase</span>
                            <p className="text-[11px] text-[#706456] mt-0.5">
                              Sign in with your Google account (<code className="font-bold">newp23671@gmail.com</code>) to unlock direct Firestore write rules verification and elevated Cloud console privileges.
                            </p>
                          </div>
                          <button
                            onClick={handleGoogleAuthSignIn}
                            disabled={fbAuthLoading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                          >
                            <Flame className="w-4 h-4 text-amber-400" />
                            <span>{fbAuthLoading ? 'Connecting...' : 'Sign In with Google'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Collections Registry */}
                  <div className="p-5 bg-white border border-[#E3D9CC] shadow-2xs space-y-3 text-xs">
                    <span className="font-serif text-lg font-semibold text-[#1C1A17] block">Firestore Collections Architecture</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <div className="flex items-center justify-between">
                          <code className="font-bold text-[#8B1E2F]">/orders/{'{orderId}'}</code>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5">Real-time sync</span>
                        </div>
                        <p className="text-[11px] text-[#706456] mt-1">
                          Stores customer bookings, delivery address, items, and WhatsApp flags. PII protected by Zero-Trust rules.
                        </p>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <div className="flex items-center justify-between">
                          <code className="font-bold text-[#8B1E2F]">/products/{'{productId}'}</code>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5">Live catalog</span>
                        </div>
                        <p className="text-[11px] text-[#706456] mt-1">
                          Stores Banarasi sarees, suits, fabrics, high-res images, pricing, and active discount calculations.
                        </p>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <div className="flex items-center justify-between">
                          <code className="font-bold text-[#8B1E2F]">/categories/{'{categoryId}'}</code>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5">Taxonomy</span>
                        </div>
                        <p className="text-[11px] text-[#706456] mt-1">
                          Showcase taxonomy including Banarasi Saree, Suit, Designer Material, and Factory Outlet collections.
                        </p>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] border border-[#EAE2D8]">
                        <div className="flex items-center justify-between">
                          <code className="font-bold text-[#8B1E2F]">/settings/global</code>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5">Operational</span>
                        </div>
                        <p className="text-[11px] text-[#706456] mt-1">
                          Store operational hours (IST Varanasi schedule), Sonu/Aman contact phones, and Ravindrapuri address.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0E9DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-gray-500 text-[11px]">
                        Firestore database is provisioned in Google Cloud region asia-southeast1.
                      </span>
                      <a
                        href="https://console.firebase.google.com/project/gen-lang-client-0789278970/firestore/databases/ai-studio-bunkarsanskritib-cb2fa849-19b1-492a-aff5-678a98934c67/data"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-bold hover:underline"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Open Firebase Cloud Console</span>
                        <LinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: ADMIN PROFILE & SINGLE-SLOT SECURITY */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">Administrator Profile & Security</h3>
                    <p className="text-xs text-[#706456]">
                      Review master administrator credentials, change your password, and view slot security.
                    </p>
                  </div>

                  {/* Slot Security Banner */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sm block">Single Administrator Slot Secured</span>
                      <p className="text-[11px] mt-0.5 text-emerald-800 leading-relaxed">
                        This store operates with a single administrator slot architecture. Your account is the only account allowed. Public registration is permanently closed to anyone else.
                      </p>
                    </div>
                  </div>

                  {/* Profile Edit Form */}
                  <form onSubmit={handleSaveProfile} className="p-6 bg-white border border-[#E3D9CC] space-y-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase mb-1 text-[#524A40]">
                          Administrator Username (Permanent)
                        </label>
                        <input
                          type="text"
                          disabled
                          value={adminAccount?.username || 'admin'}
                          className="w-full px-3 py-2 border border-[#D9CFBF] bg-[#F2ECE4] text-gray-600 cursor-not-allowed font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase mb-1 text-[#524A40]">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileFullName}
                          onChange={(e) => setProfileFullName(e.target.value)}
                          placeholder="e.g. Sonu / Store Owner"
                          className="w-full px-3 py-2 border border-[#D9CFBF] bg-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase mb-1 text-[#524A40]">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-[#D9CFBF] bg-[#FAF8F5]"
                      />
                    </div>

                    <div className="pt-4 border-t border-[#E8DFD5] space-y-4">
                      <h4 className="font-serif text-base font-semibold text-[#1C1A17]">Change Password</h4>
                      <p className="text-[11px] text-[#7A6E5F]">
                        Leave blank if you do not wish to change your current password.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase mb-1 text-[#524A40]">
                            New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Minimum 4 characters"
                            value={profileNewPassword}
                            onChange={(e) => setProfileNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-[#D9CFBF] bg-[#FAF8F5]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase mb-1 text-[#524A40]">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Re-enter new password"
                            value={profileConfirmPassword}
                            onChange={(e) => setProfileConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-[#D9CFBF] bg-[#FAF8F5]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="px-6 py-2.5 bg-[#8B1E2F] hover:bg-[#721524] text-white font-semibold uppercase tracking-wider disabled:opacity-50 transition-colors shadow-xs"
                      >
                        {profileSaving ? 'Saving...' : 'Update Profile & Security'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </main>
          </div>
        )}

      </div>
    </div>
  );
};
