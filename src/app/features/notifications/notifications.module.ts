import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { NotificationsComponent } from './notifications.component';
/** Providers List */
import {
  notificationsProviders,
  notificationsRoutesComponents
} from './notifications.constants';

@NgModule({
  entryComponents: [
    ...notificationsRoutesComponents
  ],
  declarations: [
    NotificationsComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...notificationsProviders
  ]
})

export class NotificationsModule { }
