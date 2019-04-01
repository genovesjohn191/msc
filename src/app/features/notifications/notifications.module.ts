import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { NotificationsComponent } from './notifications.component';
import { NotificationComponent } from './notification/notification.component';

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationComponent
  ],
  imports: [
    SharedModule
  ]
})

export class NotificationsModule { }
