import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'epkmdmenneocgpzuhrne';
export const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_qBHfMLBcA6kN6KCunj13YA_t44dsyTe';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Checks connectivity to Supabase backend
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tablesFound: {
    orders: boolean;
    products: boolean;
    categories: boolean;
    settings: boolean;
  };
  error?: string;
}> {
  const result = {
    connected: false,
    tablesFound: {
      orders: false,
      products: false,
      categories: false,
      settings: false,
    },
    error: undefined as string | undefined,
  };

  try {
    const [ordRes, prodRes, catRes, setRes] = await Promise.allSettled([
      supabase.from('orders').select('id').limit(1),
      supabase.from('products').select('id').limit(1),
      supabase.from('categories').select('id').limit(1),
      supabase.from('business_settings').select('id').limit(1),
    ]);

    result.connected = true;

    if (ordRes.status === 'fulfilled' && !ordRes.value.error) {
      result.tablesFound.orders = true;
    }
    if (prodRes.status === 'fulfilled' && !prodRes.value.error) {
      result.tablesFound.products = true;
    }
    if (catRes.status === 'fulfilled' && !catRes.value.error) {
      result.tablesFound.categories = true;
    }
    if (setRes.status === 'fulfilled' && !setRes.value.error) {
      result.tablesFound.settings = true;
    }
  } catch (err: any) {
    result.error = err.message || 'Connection failed';
  }

  return result;
}
