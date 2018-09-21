import { Routes } from '@angular/router';
import {
  McsAuthenticationGuard,
  CoreRoutes
} from '@app/core';
import {
  dashboardRoutes,
  serversRoutes,
  ticketsRoutes,
  notificationsRoutes,
  firewallRoutes,
  toolsRoutes,
  productsRoutes,
  mediaRoutes,
  httpErrorPageRoutes,
  ordersRoutes
} from '@app/features';
import { McsRouteKey } from '@app/models';
import { DefaultPageComponent } from './default-page.component';

export const defaultPageRoutes: Routes = [
  {
    path: '',
    component: DefaultPageComponent,
    canActivate: [McsAuthenticationGuard],
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getRoutePath(McsRouteKey.Dashboard),
        pathMatch: 'full'
      },
      ...dashboardRoutes,
      ...serversRoutes,
      ...ticketsRoutes,
      ...notificationsRoutes,
      ...firewallRoutes,
      ...toolsRoutes,
      ...productsRoutes,
      ...mediaRoutes,
      ...ordersRoutes,

      // New routes must be added on top of this error route page
      ...httpErrorPageRoutes
    ]
  }
];
