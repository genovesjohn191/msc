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

/** Context Information */
import { ContextualHelpComponent } from './contextual-help/contextual-help.component';
import { ContextualHelpDirective } from './contextual-help/contextual-help.directive';
/** Self Managed Servers */
import {
  CreateSelfManagedServerService,
  CreateSelfManagedServerComponent,
  NewSelfManagedServerComponent,
  CopySelfManagedServerComponent,
  CloneSelfManagedServerComponent
} from './self-managed-server';
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
    ServerBackupsComponent,
    ContextualHelpComponent,
    ContextualHelpDirective,
    CreateSelfManagedServerComponent,
    NewSelfManagedServerComponent,
    CopySelfManagedServerComponent,
    CloneSelfManagedServerComponent
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
    ContextualHelpComponent,
    ContextualHelpDirective,
    CreateSelfManagedServerComponent,
    NewSelfManagedServerComponent,
    CopySelfManagedServerComponent,
    CloneSelfManagedServerComponent,
    RouterModule
  ],
  providers: [
    ServersService,
    CreateSelfManagedServerService
  ]
})

export class ServersModule { }
