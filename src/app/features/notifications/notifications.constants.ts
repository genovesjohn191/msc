import { Routes } from '@angular/router';
import {
  CoreRoutes,
  McsRouteKey
} from '../../core';
/** Components */
import { NotificationsComponent } from './notifications.component';
/** Services */
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';

/**
 * List of services for the main module
 */
export const notificationsProviders: any[] = [
  NotificationsService,
  NotificationsRepository
];

/**
 * List of routes for the main module
 */
export const notificationsRoutes: Routes = [
  {
    path: CoreRoutes.getPath(McsRouteKey.Notifications),
    component: NotificationsComponent
  }
];
