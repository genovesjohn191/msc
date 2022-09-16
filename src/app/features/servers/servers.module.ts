import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';
import { serversRoutes } from './servers.constants';
import { ServersComponent } from './servers.component';
/** Server */
import {
  ServerComponent,
  ServerManagementComponent,
  ServerStorageComponent,
  ServerNicsComponent,
  ServerSnapshotsComponent,
  ServerServicesComponent,
  ServiceOsUpdatesPatchComponent,
  ServiceOsUpdatesPatchDetailsComponent,
  ServiceOsUpdatesScheduleComponent,
  ServiceOsUpdatesScheduleDetailsComponent,
  ServiceBackupServerComponent,
  ServiceBackupServerDetailsComponent,
  ServiceBackupVmComponent,
  ServiceBackupVmDetailsComponent,
  ServiceAntiVirusComponent,
  ServiceAntiVirusDetailsComponent,
  ServiceHidsComponent,
  ServiceHidsDetailsComponent,
  ServiceInviewComponent
} from './server/';
/** Create Servers */
import {
  ServerCreateComponent,
  ServerCreateDetailsComponent,
  ServerNewComponent,
  ServerCloneComponent,
  ServerCreateAddOnsComponent
} from './server-create';

import { serversProviders } from './servers.constants';

@NgModule({
  declarations: [
    ServersComponent,
    ServerComponent,
    ServerManagementComponent,
    ServerStorageComponent,
    ServerNicsComponent,
    ServerSnapshotsComponent,
    ServerCreateComponent,
    ServerCreateDetailsComponent,
    ServerNewComponent,
    ServerCloneComponent,
    ServerCreateAddOnsComponent,
    ServerServicesComponent,
    ServiceOsUpdatesPatchComponent,
    ServiceOsUpdatesPatchDetailsComponent,
    ServiceOsUpdatesScheduleComponent,
    ServiceOsUpdatesScheduleDetailsComponent,
    ServiceBackupServerComponent,
    ServiceBackupServerDetailsComponent,
    ServiceBackupVmComponent,
    ServiceBackupVmDetailsComponent,
    ServiceAntiVirusComponent,
    ServiceAntiVirusDetailsComponent,
    ServiceHidsComponent,
    ServiceHidsDetailsComponent,
    ServiceInviewComponent
  ],
  imports: [
    SharedModule,
    FeaturesSharedModule,
    RouterModule.forChild(serversRoutes)
  ],
  providers: [
    ...serversProviders
  ]
})

export class ServersModule { }
