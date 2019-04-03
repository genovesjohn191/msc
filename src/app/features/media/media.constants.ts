import { Routes } from '@angular/router';
import { McsNavigateAwayGuard } from '@app/core';
import { RouteKey } from '@app/models';
import { RequiredResourcesGuard } from '@app/services';
/** Components */
import { MediaComponent } from './media.component';
import {
  MediaUploadService,
  MediaUploadComponent
} from './media-upload';
import {
  MediumComponent,
  MediumOverviewComponent,
  MediumServersComponent
} from './medium';
import { MediumService } from './medium/medium.service';

/**
 * List of services for the main module
 */
export const mediaProviders: any[] = [
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
    canActivate: [RequiredResourcesGuard],
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.MediaUpload }
  },
  {
    path: '',
    component: MediumComponent,
    data: { routeId: RouteKey.Medium },
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
