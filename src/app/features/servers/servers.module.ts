import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Servers Feature */
import { routes } from './servers.routes';
import {
  ServersComponent,
  ServerComponent,
  ServerManagementComponent,
  ServerServicesComponent,
  ServerBackupsComponent,
  ServersService
} from './';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    ServersComponent,
    ServerComponent,
    ServerManagementComponent,
    ServerServicesComponent,
    ServerBackupsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: [
    ServersComponent,
    ServerComponent,
    ServerManagementComponent,
    ServerServicesComponent,
    ServerBackupsComponent,
    RouterModule
  ],
  providers: [
    ServersService
  ]
})

export class ServersModule { }
