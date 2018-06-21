import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Modules */
import { SharedModule } from '../shared';
/** Components */
import { PageNotificationsComponent } from './page-notifications.component';
import { WebStompComponent } from './web-stomp/web-stomp.component';
import {
  SessionComponent,
  SessionIdleDialogComponent,
  SessionTimeoutDialogComponent
} from './session';

@NgModule({
  declarations: [
    PageNotificationsComponent,
    WebStompComponent,
    SessionComponent,
    SessionIdleDialogComponent,
    SessionTimeoutDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    PageNotificationsComponent
  ],
  entryComponents: [
    SessionIdleDialogComponent,
    SessionTimeoutDialogComponent
  ],
})

export class PageNotificationsModule { }
