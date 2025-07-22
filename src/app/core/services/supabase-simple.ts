import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qktpnoekulrlporjoqqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdHBub2VrdWxybHBvcmpvcXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTM1NjUsImV4cCI6MjA2NzMyOTU2NX0.1r8YH8p4lGnXhR6xwGZzhp7B1Z2FNqMwF-N-8BLKAQo';

// Cliente Supabase sem persistência de sessão para evitar LockManager
export const supabaseSimple = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Desabilitar persistência para evitar LockManager
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: undefined // Sem storage para evitar conflitos
  },
  global: {
    headers: {
      'x-application-name': 'agro-telematics-simple'
    }
  }
});

// Cliente com storage manual personalizado (sem LockManager)
class SimpleStorage {
  private prefix = 'agro-simple-';

  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(this.prefix + key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(this.prefix + key, value);
    } catch {
      // Silently fail
    }
  }

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(this.prefix + key);
    } catch {
      // Silently fail
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: new SimpleStorage(),
    storageKey: 'auth-token-v4'
  },
  global: {
    headers: {
      'x-application-name': 'agro-telematics-app-v2'
    }
  }
});
