import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
import { InternetComponent } from './internet.component';
import {
  InternetPortManagementComponent,
  InternetPortService,
  InternetPortResolver,
  InternetPortComponent
} from './internet-port';

/**
 * List of services for the main module
 */
export const internetProviders: any[] = [
  InternetPortService,
  InternetPortResolver
];

/**
 * List of routes for the main module
 */
export const internetRoutes: Routes = [
  {
    path: '',
    component: InternetComponent
  },

  {
    path: '',
    component: InternetPortComponent,
    data: { routeId: RouteKey.InternetDetails },
    resolve: {
      internetPort: InternetPortResolver
    },
    children: [
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
        data: { routeId: RouteKey.InternetDetailsManagement }
      },
      {
        path: '',
        component: InternetPortManagementComponent,
        data: { routeId: RouteKey.InternetDetailsManagement }
      }
    ]
  }
];
