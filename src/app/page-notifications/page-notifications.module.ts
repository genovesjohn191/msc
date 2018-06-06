import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Modules */
import { SharedModule } from '../shared';
import { SessionModule } from './session';
/** Components */
import { PageNotificationsComponent } from './page-notifications.component';

@NgModule({
  declarations: [
    PageNotificationsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SessionModule
  ],
  exports: [
    PageNotificationsComponent
  ]
})

export class PageNotificationsModule { }
