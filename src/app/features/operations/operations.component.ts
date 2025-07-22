import { Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef } from '@angular/core';
import { Operation } from 'src/app/core/models/operation.model';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Component({
  selector: 'app-operations',
  standalone: false,
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class OperationsComponent implements OnInit, AfterViewInit {
  operations: Operation[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private elementRef: ElementRef
  ) {}

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

  ngAfterViewInit() {
    // Forçar aplicação de estilos diretamente
    this.forceApplyStyles();
  }

  private forceApplyStyles() {
    const container = this.elementRef.nativeElement.querySelector('.operations-container');
    if (container) {
      // Aplicar estilos diretamente via JavaScript
      container.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #404040 50%, #2d2d2d 75%, #1a1a1a 100%)';
      container.style.color = 'white';
      container.style.minHeight = '100vh';
      container.style.padding = '2rem';
      container.style.fontFamily = 'Inter, sans-serif';
      container.style.position = 'relative';
      container.style.overflow = 'hidden';

      // Criar e aplicar pseudo-elemento ::before
      const beforeElement = document.createElement('div');
      beforeElement.style.content = "''";
      beforeElement.style.position = 'absolute';
      beforeElement.style.inset = '0';
      beforeElement.style.background = `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
      `;
      beforeElement.style.zIndex = '-1';
      beforeElement.style.pointerEvents = 'none';
      container.insertBefore(beforeElement, container.firstChild);
    }

    // Aplicar estilos aos cards
    const cards = this.elementRef.nativeElement.querySelectorAll('.operation-card');
    cards.forEach((card: HTMLElement) => {
      card.style.background = 'rgba(34, 34, 34, 0.8)';
      card.style.backdropFilter = 'blur(10px)';
      card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      card.style.borderRadius = '15px';
      card.style.padding = '2rem';
      card.style.color = 'white';
      card.style.position = 'relative';
      card.style.zIndex = '10';
      card.style.transition = 'all 0.3s ease';
    });

    // Aplicar estilos ao header
    const header = this.elementRef.nativeElement.querySelector('.operations-header');
    if (header) {
      header.style.background = 'rgba(34, 34, 34, 0.8)';
      header.style.backdropFilter = 'blur(10px)';
      header.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      header.style.borderRadius = '15px';
      header.style.padding = '1.5rem 2rem';
      header.style.marginBottom = '2rem';
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.justifyContent = 'space-between';
      header.style.color = 'white';
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
