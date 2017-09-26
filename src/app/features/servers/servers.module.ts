import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
/** Servers */
import { ServersComponent } from './servers.component';
/** Shared */
import {
  ServerCommandComponent,
  ServerPerformanceScaleComponent,
  ServerManageStorageComponent,
  ServerIpAddressComponent,
  ProvisioningNotificationsComponent
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
  CreateSelfManagedServersComponent,
  NewSelfManagedServerComponent,
  CopySelfManagedServerComponent,
  CloneSelfManagedServerComponent
} from './self-managed-server';
/** Services and Resolvers */
import { serversProviders } from './servers.constants';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  entryComponents: [
    CreateSelfManagedServerComponent
  ],
  declarations: [
    ServersComponent,
    ServerCommandComponent,
    ServerComponent,
    ServerManagementComponent,
    ServerServicesComponent,
    ServerStorageComponent,
    ServerBackupsComponent,
    ServerPerformanceScaleComponent,
    ServerManageStorageComponent,
    ServerIpAddressComponent,
    CreateSelfManagedServerComponent,
    CreateSelfManagedServersComponent,
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
