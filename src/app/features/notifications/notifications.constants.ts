import { Routes } from '@angular/router';
import { Provider } from '@angular/core';

import { RouteKey } from '@app/models';
/** Components */
import { NotificationsComponent } from './notifications.component';
import { ActivityComponent } from './acitivities/activity/activity.component';
import { ActivityResolver } from './acitivities/activity/activity.resolver';
import { ActivitiesComponent } from './acitivities/activities.component';
import { NoticesComponent } from './notices/notices.component';
import { NoticeDetailsResolver } from './notices/details/notice-details.component.resolver';
import { NoticeAssociatedServiceComponent } from './notices/details/services/notice-associated-service.component';
import { NoticeOverviewComponent } from './notices/details/overview/notice-overview.component';
import { NoticeDetailsComponent } from './notices/details/notice-details.component';
import { NoticeDetailsService } from './notices/details/notice-details.component.service';
import { NotificationsService } from './notifications.component.service';

/**
 * List of services for the main module
 */
export const notificationProviders: Provider[] = [
  ActivityResolver,
  NoticeDetailsResolver,
  NoticeDetailsService,
  NotificationsService
];

/**
 * List of routes for the main module
 */
export const notificationsRoutes: Routes = [
  {
    path: '',
    component: NotificationsComponent,
    children: [
      {
        path: '',
        redirectTo: 'activities',
        pathMatch: 'full',
        data: { routeId: RouteKey.Activities }
      },
      {
        path: 'activities',
        component: ActivitiesComponent,
        data: { routeId: RouteKey.Activities }
      },
      {
        path: 'notices',
        component: NoticesComponent,
        data: { routeId: RouteKey.Notices }
      }
    ]
  },
  {
    path: 'activities/:id',
    component: ActivityComponent,
    data: { routeId: RouteKey.Activity },
    resolve: {
      activity: ActivityResolver
    }
  },
  {
    path: 'notices/:id',
    component: NoticeDetailsComponent,
    data: { routeId: RouteKey.Notice },
    resolve: {
      notice: NoticeDetailsResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
        data: { routeId: RouteKey.NoticeOverview }
      },
      {
        path: 'overview',
        component: NoticeOverviewComponent,
        data: { routeId: RouteKey.NoticeOverview }
      },
      {
        path: 'associated-service',
        component: NoticeAssociatedServiceComponent,
        data: { routeId: RouteKey.NoticeAssociatedService }
      }
    ]
  }
];
