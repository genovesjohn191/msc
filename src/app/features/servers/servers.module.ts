import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Servers */
import { ServersComponent } from './servers.component';
import { ServersResolver } from './servers.resolver';
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
  ServerServicesComponent,
  ServerService,
  ServerResolver
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
    ServersService,
    ServerService,
    CreateSelfManagedServerService,
    ProvisioningNotificationsService,
    ServersResolver,
    ServerResolver
  ]
})

export class ServersModule { }
