import { Routes } from '@angular/router';
/** Components */
import { DashboardComponent } from './dashboard.component';
import { DashboardGuard } from './dashboard.guard';

/**
 * List of services for the main module
 */
export const dashboardProviders: any[] = [
  DashboardGuard
];

/**
 * List of routes for the main module
 */
export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [DashboardGuard]
  }
];
