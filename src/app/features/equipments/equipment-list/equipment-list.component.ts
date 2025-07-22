import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, ElementRef } from '@angular/core';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { Equipment } from 'src/app/core/models/equipment.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  standalone: false,
  selector: 'app-equipment-list',
  templateUrl: './equipment-list.component.html',
  styleUrls: ['./equipment-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EquipmentListComponent implements OnInit, AfterViewInit {
  equipments: Equipment[] = [];
  dataSource = new MatTableDataSource<Equipment>([]);
  displayedColumns: string[] = [
    'name',
    'model_name',
    'type_name',
    'model_year',
    'serial_number',
    'make_name'
  ];

  filterTerm = '';
  loading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private supabaseService: SupabaseService,
    private elementRef: ElementRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('equipments')
        .select(`
          id, equipment_id, name, serial_number, model_year, type_name, model_name, make_name
        `);

      if (error) throw error;
      this.equipments = data as Equipment[];
      this.dataSource.data = this.equipments;
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Forçar aplicação de estilos diretamente
    setTimeout(() => {
      this.forceApplyStyles();
    }, 100);
  }

  private forceApplyStyles() {
    const container = this.elementRef.nativeElement.querySelector('.equipments-container');
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

    // Aplicar estilos ao header
    const header = this.elementRef.nativeElement.querySelector('.equipments-header');
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

    // Aplicar estilos à tabela
    const table = this.elementRef.nativeElement.querySelector('.mat-table, .equipment-table');
    if (table) {
      table.style.background = 'rgba(34, 34, 34, 0.8)';
      table.style.backdropFilter = 'blur(10px)';
      table.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      table.style.borderRadius = '15px';
      table.style.color = 'white';
    }

    // Aplicar estilos às células
    const cells = this.elementRef.nativeElement.querySelectorAll('.mat-header-cell, .mat-cell');
    cells.forEach((cell: HTMLElement) => {
      cell.style.color = 'white';
      cell.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
    });

    // Aplicar estilos às linhas
    const rows = this.elementRef.nativeElement.querySelectorAll('.mat-row');
    rows.forEach((row: HTMLElement) => {
      row.addEventListener('mouseenter', () => {
        row.style.background = 'rgba(255, 255, 255, 0.05)';
      });
      row.addEventListener('mouseleave', () => {
        row.style.background = 'transparent';
      });
    });
  }

  filterEquipments(): void {
    this.dataSource.filter = this.filterTerm.trim().toLowerCase();
  }

  // Filtro customizado para buscar em múltiplos campos
  constructorFn() {
    this.dataSource.filterPredicate = (data: Equipment, filter: string) => {
      const term = filter.trim().toLowerCase();
      return (
        data.name.toLowerCase().includes(term) ||
        data.model_name.toLowerCase().includes(term) ||
        data.serial_number.toLowerCase().includes(term) ||
        data.type_name.toLowerCase().includes(term) ||
        data.make_name.toLowerCase().includes(term) ||
        data.model_year.toString().includes(term)
      );
    };
  }

  ngOnChanges() {
    this.constructorFn();
  }

  ngAfterContentInit() {
    this.constructorFn();
  }

  // Utility methods for the improved UI
  clearSearch(): void {
    this.filterTerm = '';
    this.filterEquipments();
  }

  getUniqueManufacturers(): number {
    const manufacturers = new Set(this.equipments.map(eq => eq.make_name));
    return manufacturers.size;
  }

  getUniqueTypes(): number {
    const types = new Set(this.equipments.map(eq => eq.type_name));
    return types.size;
  }

  getAverageYear(): number {
    if (this.equipments.length === 0) return new Date().getFullYear();
    const sum = this.equipments.reduce((acc, eq) => acc + eq.model_year, 0);
    return Math.round(sum / this.equipments.length);
  }

  isOldEquipment(year: number): boolean {
    return new Date().getFullYear() - year > 10;
  }

  getManufacturerIcon(manufacturer: string): string {
    const icons: { [key: string]: string } = {
      'JOHN DEERE': '🟢',
      'CATERPILLAR': '🟡',
      'CASE': '🔴',
      'NEW HOLLAND': '🔵',
      'MASSEY FERGUSON': '🟠',
      'VALTRA': '🟣'
    };
    return icons[manufacturer.toUpperCase()] || '🏭';
  }

  getManufacturerClass(manufacturer: string): string {
    return manufacturer.toLowerCase().replace(/\s+/g, '-');
  }
}
