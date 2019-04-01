import { Routes } from '@angular/router';
import {
  CoreRoutes,
  McsNavigateAwayGuard
} from '@app/core';
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
    path: CoreRoutes.getRoutePath(RouteKey.Media),
    component: MediaComponent,
    data: { routeId: RouteKey.Media }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.MediaUpload),
    component: MediaUploadComponent,
    canActivate: [RequiredResourcesGuard],
    canDeactivate: [McsNavigateAwayGuard],
    data: { routeId: RouteKey.MediaUpload }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.Medium),
    component: MediumComponent,
    data: { routeId: RouteKey.Medium },
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getRoutePath(RouteKey.MediumOverview),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.MediumOverview),
        component: MediumOverviewComponent,
        data: { routeId: RouteKey.MediumOverview }
      },
      {
        path: CoreRoutes.getRoutePath(RouteKey.MediumServers),
        component: MediumServersComponent,
        data: { routeId: RouteKey.MediumServers }
      }
    ]
  }
];
