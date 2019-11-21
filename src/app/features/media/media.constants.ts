import { Routes } from '@angular/router';
import {
  McsNavigateAwayGuard,
  McsRequiredResourcesGuard
} from '@app/core';
import { RouteKey } from '@app/models';

import { MediaComponent } from './media.component';
import {
  MediaUploadService,
  MediaUploadComponent
} from './media-upload';
import {
  MediumResolver,
  MediumService,
  MediumComponent,
  MediumOverviewComponent,
  MediumServersComponent
} from './medium';

/**
 * List of services for the main module
 */
export const mediaProviders: any[] = [
  MediumResolver,
  MediumService,
  MediaUploadService
];

/**
 * List of routes for the main module
 */
export const mediaRoutes: Routes = [
  {
    path: '',
    component: MediaComponent
  },
  {
    path: 'upload',
    component: MediaUploadComponent,
    canActivate: [McsRequiredResourcesGuard],
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.MediaUpload }
  },
  {
    path: ':id',
    component: MediumComponent,
    data: { routeId: RouteKey.Medium },
    resolve: {
      medium: MediumResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.MediumOverview }
      },
      {
        path: 'overview',
        component: MediumOverviewComponent,
        data: { routeId: RouteKey.MediumOverview }
      },
      {
        path: 'servers',
        component: MediumServersComponent,
        data: { routeId: RouteKey.MediumServers }
      }
    ]
  }
];
