import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
/** Components */
import { notificationsRoutes } from './notifications.constants';
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
  ]
})

export class NotificationsModule { }
