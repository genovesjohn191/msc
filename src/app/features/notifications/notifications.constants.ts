import { Routes } from '@angular/router';
import { RouteKey } from '@app/models';
/** Components */
import { NotificationsComponent } from './notifications.component';
import { NotificationComponent } from './notification/notification.component';

/**
 * List of routes for the main module
 */
export const notificationsRoutes: Routes = [
  {
    path: '',
    component: NotificationsComponent
  },
  {
    path: '',
    component: NotificationComponent,
    data: { routeId: RouteKey.Notification }
  }
];
