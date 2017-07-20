import { Routes } from '@angular/router';
/** Components */
import { DashboardComponent } from './dashboard.component';
/** Services and Resolvers */
import { ServersResolver } from '../servers/servers.resolver';

/**
 * List of routes for the main module
 */
export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    resolve: {
      servers: ServersResolver
    }
  }
];
