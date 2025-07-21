import { Component, OnInit } from '@angular/core';
import { Operation } from 'src/app/core/models/operation.model';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Component({
  selector: 'app-operations',
  standalone: false,
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.scss'
})
export class OperationsComponent implements OnInit {
  operations: Operation[] = [];
  loading = true;
  error: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      const { data, error } = await this.supabaseService.getOperations();
      if (error) throw error;
      this.operations = ((data as unknown) as any[]).map(op => ({
        ...op,
        plots: Array.isArray(op.plots) ? op.plots[0] : op.plots
      })) as Operation[];
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  // Utility methods for statistics
  getActiveOperations(): number {
    return this.operations.filter(op => !op.end_date || new Date(op.end_date) > new Date()).length;
  }

  getCompletedOperations(): number {
    return this.operations.filter(op => op.end_date && new Date(op.end_date) <= new Date()).length;
  }

  getUniqueTypes(): number {
    const types = new Set(this.operations.map(op => op.operation_type).filter(type => type != null));
    return types.size;
  }

  // UI helper methods
  getOperationIcon(type: string | undefined): string {
    if (!type) return '⚡';
    
    const icons: { [key: string]: string } = {
      'Plantio': '🌱',
      'Colheita': '🌾',
      'Irrigação': '💧',
      'Fertilização': '🧪',
      'Pulverização': '🚿',
      'Cultivo': '🚜',
      'Preparo do Solo': '🏗️'
    };
    return icons[type] || '⚡';
  }

  getOperationStatus(operation: Operation): string {
    if (!operation.start_date) return 'Agendada';
    if (!operation.end_date) return 'Em Andamento';
    return new Date(operation.end_date) <= new Date() ? 'Concluída' : 'Em Andamento';
  }

  getOperationStatusClass(operation: Operation): string {
    const status = this.getOperationStatus(operation);
    switch (status) {
      case 'Concluída': return 'status-completed';
      case 'Em Andamento': return 'status-active';
      case 'Agendada': return 'status-scheduled';
      default: return '';
    }
  }
}
