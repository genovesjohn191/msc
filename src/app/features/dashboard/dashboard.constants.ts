import { Routes } from '@angular/router';
/** Components */
import { DashboardComponent } from './dashboard.component';

/**
 * List of routes for the main module
 */
export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent
  }
];
