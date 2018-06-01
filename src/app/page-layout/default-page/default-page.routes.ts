import { Routes } from '@angular/router';
import { McsAuthenticationGuard } from '../../core';
import { DefaultPageComponent } from './default-page.component';
import {
  serversRoutes,
  ticketsRoutes,
  notificationsRoutes,
  networkingRoutes,
  toolsRoutes,
  productsRoutes,
  mediasRoutes,
  httpErrorPageRoutes
} from '../../features';

export const routes: Routes = [
  {
    path: '',
    component: DefaultPageComponent,
    canActivate: [McsAuthenticationGuard],
    children: [
      { path: '', redirectTo: 'servers', pathMatch: 'full' },
      ...serversRoutes,
      ...ticketsRoutes,
      ...notificationsRoutes,
      ...networkingRoutes,
      ...toolsRoutes,
      ...productsRoutes,
      ...mediasRoutes,

      // New routes must be added on top of pageHttpErrorRoutes
      ...httpErrorPageRoutes
    ]
  }
];
