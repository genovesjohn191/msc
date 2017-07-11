import { Routes } from '@angular/router';

import { DefaultPageComponent } from './default-page.component';
import {
  serversRoutes,
  notificationsRoutes,
  networkingRoutes,
  gadgetsRoutes,
  dashboardRoutes,
  catalogRoutes,
  pageNotFoundRoutes
} from '../../features';

export const routes: Routes = [
  {
    path: '',
    component: DefaultPageComponent,
    children: [
      { path: '', redirectTo: 'servers', pathMatch: 'full' },
      ...serversRoutes,
      ...notificationsRoutes,
      ...networkingRoutes,
      ...gadgetsRoutes,
      ...dashboardRoutes,
      ...catalogRoutes,
      ...pageNotFoundRoutes
    ]
  }
];
