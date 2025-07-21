
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = 'https://qktpnoekulrlporjoqqw.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdHBub2VrdWxybHBvcmpvcXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc1MzU2NSwiZXhwIjoyMDY3MzI5NTY1fQ.al9re5AAvitwKi2dUjH1DdqlTKCodUBt-kyD9RaSX1o';
    this.supabase = createClient(supabaseUrl, supabaseKey);
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
