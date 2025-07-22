
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = 'https://qktpnoekulrlporjoqqw.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdHBub2VrdWxybHBvcmpvcXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTM1NjUsImV4cCI6MjA2NzMyOTU2NX0.1r8YH8p4lGnXhR6xwGZzhp7B1Z2FNqMwF-N-8BLKAQo';
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async getOperations() {
    return this.getClient()
      .from('operations')
      .select(`
        id,
        operation_type,
        start_date,
        end_date,
        operation_id,
        plot_id,
        plots (
          name,
          farm_id
        )
      `);
  }
}
