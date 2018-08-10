import { Routes } from '@angular/router';
import {
  CoreRoutes,
  McsRouteKey
} from '../../core';
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
    path: CoreRoutes.getPath(McsRouteKey.Media),
    component: MediaComponent
  },
  {
    path: CoreRoutes.getPath(McsRouteKey.Medium),
    component: MediumComponent,
    children: [
      {
        path: '',
        redirectTo: CoreRoutes.getPath(McsRouteKey.MediumOverview),
        pathMatch: 'full'
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.MediumOverview),
        component: MediumOverviewComponent
      },
      {
        path: CoreRoutes.getPath(McsRouteKey.MediumServers),
        component: MediumServersComponent
      }
    ]
  }
];
