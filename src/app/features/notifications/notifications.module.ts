import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Components */
import { NotificationsComponent } from './notifications.component';
/** Routes */
import { routes } from './notifications.routes';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    NotificationsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: [
    NotificationsComponent,
    RouterModule
  ]
})

export class NotificationsModule { }
