import { Routes } from '@angular/router';

import { RouteKey } from './models';

/**
 * Add all the lazy loaded modules in this routes else add it on the defaul-page-module
 */
export const appRoutes: Routes = [
  {
    path: 'console/:id',
    loadChildren: () => import('./page-layout/console-page/console-page.module').then(m => m.ConsolePageModule),
    data: { routeId: RouteKey.Console }
  },
  {
    path: 'maintenance',
    loadChildren: () => import('./page-layout/maintenance-page/maintenance-page.module').then(m => m.MaintenancePageModule),
    data: { routeId: RouteKey.Maintenance }
  },
  {
    path: 'system-message',
    loadChildren: () => import('./page-layout/system-message-page/system-message-page.module').then(m => m.SystemMessagePageModule),
    data: { routeId: RouteKey.SystemMessagePage }
  },
  {
    path: '',
    loadChildren: () => import('./page-layout/default-page/default-page.module').then(m => m.DefaultPageModule)
  }
];
