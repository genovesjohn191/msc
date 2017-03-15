import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  { path: 'servers', loadChildren: './features/+servers/servers.module#ServersModule' }
];
