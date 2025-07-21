import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-download-zip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './download-zip.component.html',
  styleUrls: ['./download-zip.component.scss']
})
export class DownloadZipComponent {
  zipFiles: string[] = [];
  loading = false;
  selectedFiles: Set<string> = new Set();
  selectAll = false;

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.loadFiles();
  }

  async loadFiles() {
    this.loading = true;
    try {
      this.zipFiles = await this.storageService.listZipFiles();
      // Reset selections when files are reloaded
      this.selectedFiles.clear();
      this.selectAll = false;
    } catch {
      alert('Erro ao carregar os arquivos ZIP!');
    } finally {
      this.loading = false;
    }
  }

  // Single file download
  download(file: string) {
    this.storageService.downloadZip(file);
  }

  // Toggle individual file selection
  toggleFileSelection(file: string) {
    if (this.selectedFiles.has(file)) {
      this.selectedFiles.delete(file);
    } else {
      this.selectedFiles.add(file);
    }
    this.updateSelectAllState();
  }

  // Toggle select all files
  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.zipFiles.forEach(file => this.selectedFiles.add(file));
    } else {
      this.selectedFiles.clear();
    }
  }

  // Update select all checkbox state based on individual selections
  updateSelectAllState() {
    this.selectAll = this.zipFiles.length > 0 && this.selectedFiles.size === this.zipFiles.length;
  }

  // Check if a file is selected
  isFileSelected(file: string): boolean {
    return this.selectedFiles.has(file);
  }

  // Get count of selected files
  getSelectedCount(): number {
    return this.selectedFiles.size;
  }

  // Download all selected files
  downloadSelected() {
    if (this.selectedFiles.size === 0) {
      alert('Selecione pelo menos um arquivo para baixar.');
      return;
    }

    // Download each selected file
    this.selectedFiles.forEach(file => {
      setTimeout(() => {
        this.storageService.downloadZip(file);
      }, 100); // Small delay between downloads to avoid overwhelming the browser
    });

    // Optional: Show success message
    alert(`Iniciando download de ${this.selectedFiles.size} arquivo(s).`);
  }

  // Clear all selections
  clearSelection() {
    this.selectedFiles.clear();
    this.selectAll = false;
  }
}
