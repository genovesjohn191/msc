import { Routes } from '@angular/router';
import { RouteKey } from './models';

/**
 * Add all the lazy loaded modules in this routes else add it on the defaul-page-module
 */
export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: './page-layout/console-page/console-page.module#ConsolePageModule',
    data: { routeId: RouteKey.Console }
  },
  {
    path: '',
    loadChildren: './page-layout/maintenance-page/maintenance-page.module#MaintenancePageModule',
    data: { routeId: RouteKey.Maintenance }
  },
  {
    path: '',
    loadChildren: './page-layout/system-message-page/system-message-page.module#SystemMessagePageModule',
    data: { routeId: RouteKey.SystemMessagePage }
  },
  {
    path: '',
    loadChildren: './page-layout/default-page/default-page.module#DefaultPageModule'
  }
];
