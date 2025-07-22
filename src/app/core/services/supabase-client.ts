import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qktpnoekulrlporjoqqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdHBub2VrdWxybHBvcmpvcXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTM1NjUsImV4cCI6MjA2NzMyOTU2NX0.1r8YH8p4lGnXhR6xwGZzhp7B1Z2FNqMwF-N-8BLKAQo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'agro-telematics-auth-token'
  },
  global: {
    headers: {
      'x-application-name': 'agro-telematics-app'
    }
  }
}); 