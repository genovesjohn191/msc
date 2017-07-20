import { Routes } from '@angular/router';
/** Components */
import { GadgetsComponent } from './gadgets.component';
/** Services and Resolvers */
import { ServersResolver } from '../servers/servers.resolver';

/**
 * List of routes for the main module
 */
export const gadgetsRoutes: Routes = [
  {
    path: 'gadgets',
    component: GadgetsComponent,
    resolve: {
      servers: ServersResolver
    }
  }
];
