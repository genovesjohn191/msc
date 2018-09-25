import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { NotificationsComponent } from './notifications.component';
import { notificationsRoutesComponents } from './notifications.constants';

@NgModule({
  entryComponents: [
    ...notificationsRoutesComponents
  ],
  declarations: [
    NotificationsComponent
  ],
  imports: [
    SharedModule
  ]
})

export class NotificationsModule { }
