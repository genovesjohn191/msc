import { Routes } from '@angular/router';

import { DefaultPageComponent } from './default-page.component';
import {
  serversRoutes,
  ticketsRoutes,
  notificationsRoutes,
  networkingRoutes,
  firewallsRoutes,
  portalsRoutes,
  gadgetsRoutes,
  dashboardRoutes,
  catalogRoutes,
  accessDeniedPageRoutes,
  pageNotFoundRoutes
} from '../../features';

export const routes: Routes = [
  {
    path: '',
    component: DefaultPageComponent,
    children: [
      { path: '', redirectTo: 'servers', pathMatch: 'full' },
      ...serversRoutes,
      ...ticketsRoutes,
      ...notificationsRoutes,
      ...networkingRoutes,
      ...firewallsRoutes,
      ...portalsRoutes,
      ...gadgetsRoutes,
      ...dashboardRoutes,
      ...catalogRoutes,
      ...accessDeniedPageRoutes,

      // New routes must be added on top for pageNotFoundRoutes
      ...pageNotFoundRoutes
    ]
  }
];
