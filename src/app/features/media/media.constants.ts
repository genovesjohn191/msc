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
    path: '',
    component: MediaUploadComponent,
    canActivate: [McsRequiredResourcesGuard],
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.MediaUpload }
  },
  {
    path: '',
    component: MediumComponent,
    data: { routeId: RouteKey.Medium },
    resolve: {
      medium: MediumResolver
    },
    children: [
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
        data: { routeId: RouteKey.MediumOverview }
      },
      {
        path: '',
        component: MediumOverviewComponent,
        data: { routeId: RouteKey.MediumOverview }
      },
      {
        path: '',
        component: MediumServersComponent,
        data: { routeId: RouteKey.MediumServers }
      }
    ]
  }
];
