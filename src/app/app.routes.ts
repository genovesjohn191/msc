import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  { path: 'servers', loadChildren: './features/+servers/servers.module#ServersModule' },
  { path: 'dashboard', loadChildren: './features/+dashboard/dashboard.module#DashboardModule' },
  { path: 'servers', loadChildren: './features/+servers/servers.module#ServersModule' },
  { path: 'networking', loadChildren: './features/+networking/networking.module#NetworkingModule' },
  { path: 'catalog', loadChildren: './features/+catalog/catalog.module#CatalogModule' }
];
