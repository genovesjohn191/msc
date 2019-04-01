import { Routes } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
/** Components */
import { NotificationsComponent } from './notifications.component';
import { NotificationComponent } from './notification/notification.component';

/**
 * List of routes for the main module
 */
export const notificationsRoutes: Routes = [
  {
    path: CoreRoutes.getRoutePath(RouteKey.Notifications),
    component: NotificationsComponent,
    data: { routeId: RouteKey.Notifications }
  },
  {
    path: CoreRoutes.getRoutePath(RouteKey.Notification),
    component: NotificationComponent,
    data: { routeId: RouteKey.Notification }
  }
];
