import { Routes } from '@angular/router';
import {
  CoreRoutes,
  McsRouteKey
} from '../../core';
/** Components */
import { MediaComponent } from './media.component';
/** Services */
import { MediaService } from './media.service';
import { MediaRepository } from './repositories/media.repository';

/**
 * List of services for the main module
 */
export const mediaProviders: any[] = [
  MediaService,
  MediaRepository
];

/**
 * List of all the entry components
 */
export const mediaRoutesComponents: any[] = [
  MediaComponent
];

/**
 * List of routes for the main module
 */
export const mediaRoutes: Routes = [
  {
    path: CoreRoutes.getPath(McsRouteKey.Media),
    component: MediaComponent
  }
];
