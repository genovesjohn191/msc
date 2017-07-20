import { NgModule } from '@angular/core';
/** Components */
import { NotificationsComponent } from './notifications.component';
/** Modules */
import { SharedModule } from '../../shared';
/** Providers List */
import { notificationsProviders } from './notifications.constants';

@NgModule({
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
