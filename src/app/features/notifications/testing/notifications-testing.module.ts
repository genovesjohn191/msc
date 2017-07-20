import { NgModule } from '@angular/core';
/** Providers list */
import { notificationsProviders } from '../notifications.constants';
/** Modules */
import { CoreTestingModule } from '../../../core/testing';

@NgModule({
  imports: [
    CoreTestingModule
  ],
  providers: [
    /** Notifications Services */
    ...notificationsProviders
  ],
})

export class NotificationsTestingModule { }
