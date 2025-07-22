import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qktpnoekulrlporjoqqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdHBub2VrdWxybHBvcmpvcXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTM1NjUsImV4cCI6MjA2NzMyOTU2NX0.1r8YH8p4lGnXhR6xwGZzhp7B1Z2FNqMwF-N-8BLKAQo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Desabilitar detecção de URL para evitar conflitos
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(`agro-app-${key}`);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(`agro-app-${key}`, value);
        } catch {
          // Silently fail if localStorage is not available
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(`agro-app-${key}`);
        } catch {
          // Silently fail if localStorage is not available
        }
      }
    },
    storageKey: 'session-v3', // Novo storage key para evitar conflitos
    flowType: 'implicit' // Usar fluxo implícito para reduzir complexidade
  },
  global: {
    headers: {
      'x-application-name': 'agro-telematics-app'
    }
  }
}); 