import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { CoreLayoutModule } from '@app/core-layout';
import {
  systemMessagePageRoutes,
  systemMessagePageProviders
} from './system-message-page.constants';
import { SystemMessagePageComponent } from './system-message-page.component';

@NgModule({
  declarations: [
    SystemMessagePageComponent
  ],
  providers: systemMessagePageProviders,
  imports: [
    CoreLayoutModule,
    SharedModule,
    RouterModule.forChild(systemMessagePageRoutes)
  ]
})

export class SystemMessagePageModule { }
