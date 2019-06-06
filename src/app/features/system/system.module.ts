import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { SystemMessagesComponent } from './messages/messages.component';
import { systemRoutes } from './system.constants';

@NgModule({
  declarations: [
    SystemMessagesComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(systemRoutes)
  ]
})

export class SystemModule { }
