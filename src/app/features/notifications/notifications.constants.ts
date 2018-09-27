import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
/** Components */
import { NotificationsComponent } from './notifications.component';

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
    path: CoreRoutes.getRoutePath(RouteKey.Notifications),
    component: NotificationsComponent,
    data: { routeId: RouteKey.Notifications }
  }
];
