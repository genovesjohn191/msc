import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';

import { PageNotificationsComponent } from './page-notifications.component';
import { WebStompComponent } from './web-stomp/web-stomp.component';
import { ErrorNotificationComponent } from './error-notification/error-notification.component';
import {
  SessionComponent,
  SessionIdleDialogComponent
} from './session';

@NgModule({
  declarations: [
    PageNotificationsComponent,
    WebStompComponent,
    ErrorNotificationComponent,
    SessionComponent,
    SessionIdleDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    PageNotificationsComponent
  ],
  entryComponents: [
    SessionIdleDialogComponent
  ],
})

export class PageNotificationsModule { }
