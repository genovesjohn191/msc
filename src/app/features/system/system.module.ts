import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';
import { SystemMessagesComponent } from './messages/messages.component';
import { SystemMessageCreateComponent } from './messages/message-create/message-create.component';
import { SystemMessageEditComponent } from './messages/message-edit/message-edit.component';
import {
  systemRoutes,
  systemMessageProviders
} from './system.constants';

@NgModule({
  declarations: [
    SystemMessagesComponent,
    SystemMessageCreateComponent,
    SystemMessageEditComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(systemRoutes)
  ],
  providers: [
    ...systemMessageProviders
  ]
})

export class SystemModule { }
