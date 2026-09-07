import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Resilient dummy client for development without keys
const createDummyClient = () => {
  const noop = () => Promise.resolve({ data: null, error: null, count: 0 });
  const authNoop = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: noop,
    signUp: noop,
    signOut: noop,
    admin: { updateUserById: noop }
  };

  const proxy: any = new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'auth') return authNoop;
      if (prop === 'from') return () => ({
        select: () => ({
          eq: () => ({ single: noop, order: () => Promise.resolve({ data: [], error: null }) }),
          order: () => Promise.resolve({ data: [], error: null }),
          single: noop
        }),
        insert: noop,
        update: () => ({ eq: noop }),
        delete: () => ({ eq: noop }),
      });
      return noop;
    }
  });

  return proxy;
};

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyClient();

export async function logActivity(userId: string, userName: string, action: string, details?: string) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      user_name: userName,
      action,
      details
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
