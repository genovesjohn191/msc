import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';
import { SystemMessagesComponent } from './messages/messages.component';
import { SystemMessageCreateComponent } from './messages/message-create/message-create.component';
import { systemRoutes } from './system.constants';

@NgModule({
  declarations: [
    SystemMessagesComponent,
    SystemMessageCreateComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(systemRoutes)
  ]
})

export class SystemModule { }
