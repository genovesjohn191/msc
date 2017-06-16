import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Servers Feature */
import { routes } from './servers.routes';
/** Shared */
import {
  JobProgressComponent,
  ServerListPanelComponent,
  ContextualHelpComponent,
  ContextualHelpDirective
} from './shared';
/** Servers */
import { ServersComponent } from './servers.component';
import {
  ServerComponent,
  ServerManagementComponent,
  ServerBackupsComponent,
  ServerServicesComponent
} from './server/';
/** Self Managed Servers */
import {
  CreateSelfManagedServerService,
  CreateSelfManagedServerComponent,
  NewSelfManagedServerComponent,
  CopySelfManagedServerComponent,
  CloneSelfManagedServerComponent
} from './self-managed-server';
/** Provisioning Notifications */
import {
  ProvisioningNotificationsService,
  ProvisioningNotificationsComponent
} from './provisioning-notifications';
/** Service */
import { ServersService } from './servers.service';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    ServersComponent,
    JobProgressComponent,
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
    ProvisioningNotificationsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  providers: [
    ServersService,
    CreateSelfManagedServerService,
    ProvisioningNotificationsService
  ]
})

export class ServersModule { }
