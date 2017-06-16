import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Components */
import { NotificationsComponent } from './notifications.component';
/** Routes */
import { routes } from './notifications.routes';
/** Modules */
import { SharedModule } from '../../shared';
/** Services */
import { NotificationsService } from './notifications.service';

@NgModule({
  declarations: [
    NotificationsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  providers: [
    NotificationsService
  ]
})

export class NotificationsModule { }
