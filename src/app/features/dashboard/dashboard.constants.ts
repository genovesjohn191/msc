import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { McsRouteKey } from '@app/models';
import { DashboardComponent } from './dashboard.component';
import { DashboardGuard } from './dashboard.guard';

/**
 * List of services for the main module
 */
export const dashboardProviders: any[] = [
  DashboardGuard
];

/**
 * List of all the entry components
 */
export const dashboardRoutesComponents: any[] = [
  DashboardComponent
];

/**
 * List of routes for the main module
 */
export const dashboardRoutes: Routes = [
  {
    path: CoreRoutes.getNavigationPath(McsRouteKey.Dashboard),
    component: DashboardComponent,
    canActivate: [DashboardGuard],
    data: { routeId: McsRouteKey.Dashboard }
  }
];
