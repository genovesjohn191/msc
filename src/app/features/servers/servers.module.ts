import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Servers */
import { ServersComponent } from './servers.component';
/** Shared */
import {
  JobProgressComponent,
  ServerListPanelComponent,
  ServerCommandComponent,
  ContextualHelpComponent,
  ContextualHelpDirective,
  ServerPerformanceScaleComponent,
  ServerManageStorageComponent
} from './shared';
/** Server */
import {
  ServerComponent,
  ServerManagementComponent,
  ServerBackupsComponent,
  ServerStorageComponent,
  ServerServicesComponent
} from './server/';
/** Self Managed Servers */
import {
  CreateSelfManagedServerComponent,
  NewSelfManagedServerComponent,
  CopySelfManagedServerComponent,
  CloneSelfManagedServerComponent
} from './self-managed-server';
/** Provisioning Notifications */
import { ProvisioningNotificationsComponent } from './provisioning-notifications';
/** Services and Resolvers */
import { serversProviders } from './servers.constants';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  declarations: [
    ServersComponent,
    JobProgressComponent,
    ServerListPanelComponent,
    ServerCommandComponent,
    ServerComponent,
    ServerManagementComponent,
    ServerServicesComponent,
    ServerStorageComponent,
    ServerBackupsComponent,
    ContextualHelpComponent,
    ContextualHelpDirective,
    ServerPerformanceScaleComponent,
    ServerManageStorageComponent,
    CreateSelfManagedServerComponent,
    NewSelfManagedServerComponent,
    CopySelfManagedServerComponent,
    CloneSelfManagedServerComponent,
    ProvisioningNotificationsComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...serversProviders
  ]
})

export class ServersModule { }
