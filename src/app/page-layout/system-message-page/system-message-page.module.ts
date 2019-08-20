import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { CoreLayoutModule } from '@app/core-layout';
import {
  systemMessagePageRoutes,
  systemMessagePageProviders
} from './system-message-page.constants';
import { SystemMessagePageComponent } from './system-message-page.component';
import { SystemMessageHeaderComponent } from './message-header/message-header.component';
import { SystemMessageUserPanelComponent } from './message-header/message-user-panel/message-user-panel.component';

@NgModule({
  declarations: [
    SystemMessagePageComponent,
    SystemMessageHeaderComponent,
    SystemMessageUserPanelComponent
  ],
  providers: systemMessagePageProviders,
  imports: [
    CoreLayoutModule,
    SharedModule,
    RouterModule.forChild(systemMessagePageRoutes)
  ]
})

export class SystemMessagePageModule { }
