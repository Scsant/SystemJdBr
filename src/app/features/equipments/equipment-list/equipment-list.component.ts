import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
export class EquipmentListComponent implements OnInit {
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

  constructor(private supabaseService: SupabaseService) {}

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
