import { Routes } from '@angular/router';

import { RouteKey } from '@app/models';

import { ResourceOverviewComponent } from './resource/overview/resource-overview.component';
import { ResourceComponent } from './resource/resource.component';
import { ResourceResolver } from './resource/resource.resolver';
import { ResourceService } from './resource/resource.service';
import { ResourceStorageComponent } from './resource/storage/resource-storage.component';
import { ResourcesComponent } from './resources.component';

/**
 * List of services for the main module
 */
export const resourcesProviders: any[] = [
  ResourceService,
  ResourceResolver
];

/**
 * List of routes for the main module
 */
export const resourcesRoutes: Routes = [
  {
    path: '',
    component: ResourcesComponent
  },
  {
    path: ':id',
    component: ResourceComponent,
    data: { routeId: RouteKey.ResourceDetails },
    resolve: {
      resource: ResourceResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.ResourceDetailsOverview }
      },
      {
        path: 'overview',
        component: ResourceOverviewComponent,
        data: { routeId: RouteKey.ResourceDetailsOverview }
      },
      {
        path: 'storage',
        component: ResourceStorageComponent,
        data: { routeId: RouteKey.ResourceDetailsStorage }
      }
    ]
  }
];
