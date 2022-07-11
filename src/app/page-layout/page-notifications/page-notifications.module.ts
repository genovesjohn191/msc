import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';

import { ErrorNotificationComponent } from './error-notification/error-notification.component';
import { PageNotificationsComponent } from './page-notifications.component';
import {
  SessionComponent,
  SessionIdleDialogComponent
} from './session';
import { StateNotificationComponent } from './state-notification/state-notification.component';
import { WebStompComponent } from './web-stomp/web-stomp.component';

@NgModule({
  declarations: [
    PageNotificationsComponent,
    WebStompComponent,
    ErrorNotificationComponent,
    StateNotificationComponent,
    SessionComponent,
    SessionIdleDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    PageNotificationsComponent
  ]
})

export class PageNotificationsModule { }
