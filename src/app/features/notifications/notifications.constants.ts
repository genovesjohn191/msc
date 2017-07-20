import { Routes } from '@angular/router';
/** Components */
import { NotificationsComponent } from './notifications.component';
/** Services */
import { NotificationsService } from './notifications.service';

/**
 * List of services for the main module
 */
export const notificationsProviders: any[] = [
  NotificationsService
];

/**
 * List of routes for the main module
 */
export const notificationsRoutes: Routes = [
  { path: 'notifications', component: NotificationsComponent }
];
