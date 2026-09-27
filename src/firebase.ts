import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Unsubscribe 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { Order, Product, Enquiry } from './types/index.ts';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without this line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL: Validate connection to Firestore on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Expected in rules if doc doesn't exist, but server responded
    return true;
  }
}

// Run boot check
testConnection().catch(err => console.warn('Firestore connection check:', err));

// Order Persistence in Firestore
export async function saveOrderToFirestore(order: Order): Promise<void> {
  const docPath = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), {
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
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

// Enquiry Persistence in Firestore
export async function saveEnquiryToFirestore(enquiry: Enquiry): Promise<void> {
  const docPath = `enquiries/${enquiry.id}`;
  try {
    await setDoc(doc(db, 'enquiries', enquiry.id), {
      customerName: enquiry.customerName,
      customerPhone: enquiry.customerPhone,
      customerEmail: enquiry.customerEmail || '',
      productId: enquiry.productId || '',
      productName: enquiry.productName || '',
      message: enquiry.message,
      status: enquiry.status || 'Pending',
      createdAt: enquiry.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

// Listen to orders in real-time (for Admin panel)
export function subscribeToOrders(
  onOrders: (orders: Order[]) => void, 
  onError?: (err: Error) => void
): Unsubscribe {
  const ordersPath = 'orders';
  const q = query(collection(db, ordersPath));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        orders.push({
          id: d.id,
          reference: data.reference || d.id,
          customerName: data.customerName || 'Guest',
          customerPhone: data.customerPhone || '',
          customerEmail: data.customerEmail,
          customerAddress: data.customerAddress || '',
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          customerNote: data.customerNote,
          status: data.status || 'New',
          adminNotes: data.adminNotes,
          createdAt: data.createdAt || new Date().toISOString(),
          viaWhatsApp: Boolean(data.viaWhatsApp),
        });
      });
      onOrders(orders);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.LIST, ordersPath);
        } catch (e: any) {
          onError(e);
        }
      }
    }
  );
}

// Update order status in Firestore
export async function updateOrderStatusInFirestore(orderId: string, status: Order['status'], adminNotes?: string): Promise<void> {
  const docPath = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      adminNotes: adminNotes || '',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Auth helpers
export async function signInAdminWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutAdminFromFirebase(): Promise<void> {
  await signOut(auth);
}
