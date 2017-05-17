import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Servers Feature */
import { routes } from './servers.routes';
/** Servers */
import { ServersComponent } from './servers.component';
import { ServerListPanelComponent } from './server-list-panel.component';
import { ServerComponent } from './server/server.component';
import { ServerManagementComponent } from './server/management/server-management.component';
import { ServerServicesComponent } from './server/services/server-services.component';
import { ServerBackupsComponent } from './server/backups/server-backups.component';
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
