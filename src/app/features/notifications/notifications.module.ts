import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import {
  notificationsRoutes,
  notificationProviders
} from './notifications.constants';
import { ActivityComponent } from './acitivities/activity/activity.component';
import { ActivitiesComponent } from './acitivities/activities.component';
import { NoticesComponent } from './notices/notices.component';
import { NoticeDetailsComponent } from './notices/details/notice-details.component';
import { NoticeOverviewComponent } from './notices/details/overview/notice-overview.component';
import { NoticeAssociatedServiceComponent } from './notices/details/services/notice-associated-service.component';
import { NotificationsComponent } from './notifications.component';

@NgModule({
  declarations: [
    ActivityComponent,
    ActivitiesComponent,
    NoticesComponent,
    NoticeDetailsComponent,
    NoticeOverviewComponent,
    NoticeAssociatedServiceComponent,
    NotificationsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(notificationsRoutes)
  ],
  providers: [
    ...notificationProviders
  ]
})

export class NotificationsModule { }
