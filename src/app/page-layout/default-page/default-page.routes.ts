import { Routes } from '@angular/router';
import { McsAuthenticationGuard } from '../../core';
import { DefaultPageComponent } from './default-page.component';
import {
  dashboardRoutes,
  serversRoutes,
  ticketsRoutes,
  notificationsRoutes,
  networkingRoutes,
  toolsRoutes,
  productsRoutes,
  mediasRoutes,
  httpErrorPageRoutes,
  ordersRoutes
} from '../../features';

export const routes: Routes = [
  {
    path: '',
    component: DefaultPageComponent,
    canActivate: [McsAuthenticationGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      ...dashboardRoutes,
      ...serversRoutes,
      ...ticketsRoutes,
      ...notificationsRoutes,
      ...networkingRoutes,
      ...toolsRoutes,
      ...productsRoutes,
      ...mediasRoutes,
      ...ordersRoutes,

      // New routes must be added on top of this error route page
      ...httpErrorPageRoutes
    ]
  }
];
