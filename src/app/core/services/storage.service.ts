import { Injectable } from '@angular/core';
import { supabase } from 'src/app/core/services/supabase-client';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private bucket = 'linhas';

  async listZipFiles(): Promise<string[]> {
    const { data, error } = await supabase.storage.from(this.bucket).list();
    if (error) throw error;
    return (data ?? [])
      .filter((file: { name: string }) => file.name.toLowerCase().endsWith('.zip'))
      .map((file: { name: string }) => file.name);
  }

  async downloadZip(fileName: string): Promise<void> {
    const { data, error } = await supabase.storage.from(this.bucket).download(fileName);
    if (error || !data) throw error;
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async listAllZipFiles(): Promise<string[]> {
    const allFiles: string[] = [];
    let offset = 0;
    const limit = 100; // ou o valor que você definiu na função
    let keepGoing = true;

    while (keepGoing) {
      const { data, error } = await supabase.rpc('list_objects', {
        bucketid: 'linhas',
        prefix: '',
        limits: limit,
        offsets: offset
      });
      if (error) throw error;
      const zipFiles = (data ?? [])
        .filter((file: { name: string }) => file.name.toLowerCase().endsWith('.zip'))
        .map((file: { name: string }) => file.name);
      allFiles.push(...zipFiles);
      if (!data || data.length < limit) {
        keepGoing = false;
      } else {
        offset += limit;
      }
    }
    return allFiles;
  }
} 