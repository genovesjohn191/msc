import { NgModule } from '@angular/core';
/** Components */
import { NotificationsComponent } from './notifications.component';
/** Modules */
import { SharedModule } from '../../shared';
/** Services */
import { NotificationsService } from './notifications.service';

@NgModule({
  declarations: [
    NotificationsComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    NotificationsService
  ]
})

export class NotificationsModule { }
