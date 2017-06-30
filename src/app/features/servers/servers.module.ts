import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Servers Feature */
import { routes } from './servers.routes';
/** Shared */
import {
  JobProgressComponent,
  ServerListPanelComponent,
  ServerCommandComponent,
  ContextualHelpComponent,
  ContextualHelpDirective,
  ServerPerformanceScaleComponent
} from './shared';
/** Servers */
import { ServersComponent } from './servers.component';
import {
  ServerComponent,
  ServerManagementComponent,
  ServerBackupsComponent,
  ServerServicesComponent,
  ServerService
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
    ServerBackupsComponent,
    ContextualHelpComponent,
    ContextualHelpDirective,
    ServerPerformanceScaleComponent,
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
    ServerService,
    ServersService,
    CreateSelfManagedServerService,
    ProvisioningNotificationsService
  ]
})

export class ServersModule { }
