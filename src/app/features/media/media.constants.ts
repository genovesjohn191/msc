import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { McsRouteKey } from '@app/models';
/** Components */
import { MediaComponent } from './media.component';
import {
  MediumComponent,
  MediumOverviewComponent,
  MediumServersComponent
} from './medium';
/** Services */
import { MediaService } from './media.service';
import { MediaRepository } from './repositories/media.repository';
import { MediumService } from './medium/medium.service';

/**
 * List of services for the main module
 */
export const mediaProviders: any[] = [
  MediaService,
  MediaRepository,
  MediumService
];

/**
 * List of all the entry components
 */
export const mediaRoutesComponents: any[] = [
  MediaComponent,
  MediumComponent,
  MediumOverviewComponent,
  MediumServersComponent
];

/**
 * List of routes for the main module
 */
export const mediaRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.Media),
    component: MediaComponent,
    data: { routeId: McsRouteKey.Media }
  },
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.Medium),
    component: MediumComponent,
    data: { routeId: McsRouteKey.Medium },
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getRoutePath(McsRouteKey.MediumOverview),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.MediumOverview),
        component: MediumOverviewComponent,
        data: { routeId: McsRouteKey.MediumOverview }
      },
      {
        path: CoreRoutes.getRoutePath(McsRouteKey.MediumServers),
        component: MediumServersComponent,
        data: { routeId: McsRouteKey.MediumServers }
      }
    ]
  }
];
