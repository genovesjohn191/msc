import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Servers Feature */
import { routes } from './servers.routes';
/** Servers */
import { ServersComponent } from './servers.component';
import { ServerListPanelComponent } from './server-list-panel/server-list-panel.component';
import {
  ServerComponent,
  ServerManagementComponent,
  ServerBackupsComponent,
  ServerServicesComponent
} from './server/';

/** Service */
import { ServersService } from './servers.service';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    ServersComponent,
    ServerListPanelComponent,
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
    ServerListPanelComponent,
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
