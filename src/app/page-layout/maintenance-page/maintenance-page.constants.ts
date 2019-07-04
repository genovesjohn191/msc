import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';

import { McsMaintenancePageGuard } from './maintenance-page.guard';
import { MaintenancePageComponent } from './maintenance-page.component';

/**
 * List of services for the main module
 */
export const maintenacePageProviders: any[] = [
  McsMaintenancePageGuard
];

/**
 * List of routes for the main module
 */
export const maintenacePageRoutes: Routes = [
  {
    path: '',
    component: MaintenancePageComponent,
    canActivate: [ McsMaintenancePageGuard ],
    data: { routeId: RouteKey.Maintenance }
  }
];
