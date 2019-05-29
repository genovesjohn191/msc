import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Modules */
import { SharedModule } from '@app/shared';
/** Components */
import { PageNotificationsComponent } from './page-notifications.component';
import { WebStompComponent } from './web-stomp/web-stomp.component';
import {
  SessionComponent,
  SessionIdleDialogComponent
} from './session';

@NgModule({
  declarations: [
    PageNotificationsComponent,
    WebStompComponent,
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
