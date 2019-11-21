import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
/** Components */
import { NotificationsComponent } from './notifications.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationResolver } from './notification/notification.resolver';

/**
 * List of services for the main module
 */
export const notificationProviders: any[] = [
  NotificationResolver
];

/**
 * List of routes for the main module
 */
export const notificationsRoutes: Routes = [
  {
    path: '',
    component: NotificationsComponent
  },
  {
    path: ':id',
    component: NotificationComponent,
    data: { routeId: RouteKey.Notification },
    resolve: {
      notification: NotificationResolver
    }
  }
];
