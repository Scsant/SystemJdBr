import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DownloadZipComponent } from './features/dashboard/download-zip/download-zip.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'equipments',
    loadChildren: () =>
      import('./features/equipments/equipments.module').then(m => m.EquipmentsModule)
  },
  {
    path: 'operations',
    loadChildren: () =>
      import('./features/operations/operations.module').then(m => m.OperationsModule)
  },
  { path: 'download-zip', component: DownloadZipComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}


