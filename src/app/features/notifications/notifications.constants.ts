import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { McsRouteKey } from '@app/models';
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
 * List of all the entry components
 */
export const notificationsRoutesComponents: any[] = [
  NotificationsComponent
];

/**
 * List of routes for the main module
 */
export const notificationsRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(McsRouteKey.Notifications),
    component: NotificationsComponent,
    data: { routeId: McsRouteKey.Notifications }
  }
];
