import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';
import { serversRoutes } from './servers.constants';
import { ServersComponent } from './servers.component';
/** Shared */
import { ServerCommandComponent } from './shared';
/** Server */
import {
  ServerComponent,
  ServerManagementComponent,
  ServerStorageComponent,
  ServerNicsComponent,
  ServerBackupsComponent,
  ServerServicesComponent,
  OsUpdatesScheduleComponent,
  OsUpdatesApplyNowComponent
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
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ServersComponent,
    ServerCommandComponent,
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
    OsUpdatesScheduleComponent,
    OsUpdatesApplyNowComponent,
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
