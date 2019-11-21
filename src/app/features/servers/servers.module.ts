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
  ServerBackupsComponent,
  ServerServicesComponent,
  ServiceOsUpdatesPatchComponent,
  ServiceOsUpdatesPatchDetailsComponent,
  ServiceOsUpdatesScheduleComponent,
  ServiceOsUpdatesScheduleDetailsComponent,
  ServiceBackupServerComponent,
  ServiceBackupVmComponent,
  ServiceAntiVirusComponent,
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
/** VDC */
import {
  VdcComponent,
  VdcOverviewComponent,
  VdcStorageComponent
} from './vdc';
import { serversProviders } from './servers.constants';

@NgModule({
  declarations: [
    ServersComponent,
    ServerComponent,
    ServerManagementComponent,
    ServerStorageComponent,
    ServerNicsComponent,
    ServerBackupsComponent,
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
    ServiceBackupVmComponent,
    ServiceAntiVirusComponent,
    ServiceHidsComponent,
    ServiceHidsDetailsComponent,
    ServiceInviewComponent,
    VdcComponent,
    VdcOverviewComponent,
    VdcStorageComponent
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
