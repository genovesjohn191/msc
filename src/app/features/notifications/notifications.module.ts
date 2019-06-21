import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import {
  notificationsRoutes,
  notificationProviders
} from './notifications.constants';
import { NotificationsComponent } from './notifications.component';
import { NotificationComponent } from './notification/notification.component';

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(notificationsRoutes)
  ],
  providers: notificationProviders
})

export class NotificationsModule { }
