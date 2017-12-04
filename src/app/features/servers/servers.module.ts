import { NgModule } from '@angular/core';
/** Servers */
import { ServersComponent } from './servers.component';
/** Shared */
import {
  ServerCommandComponent,
  ServerPerformanceScaleComponent,
  ServerManageStorageComponent,
  ServerIpAddressComponent,
  ProvisioningNotificationsComponent,
  ResetPasswordDialogComponent,
  ResetPasswordFinishedDialogComponent,
  DeleteStorageDialogComponent,
  DeleteNetworkDialogComponent,
  DetachMediaDialogComponent,
  DeleteServerDialogComponent
} from './shared';
/** Server */
import {
  ServerComponent,
  ServerManagementComponent,
  ServerStorageComponent,
  ServerNicsComponent,
  ServerBackupsComponent,
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
/** VDC */
import {
  VdcComponent,
  VdcOverviewComponent
} from './vdc';
/** Services and Resolvers */
import { serversProviders } from './servers.constants';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  entryComponents: [
    ResetPasswordDialogComponent,
    ResetPasswordFinishedDialogComponent,
    DeleteStorageDialogComponent,
    DeleteNetworkDialogComponent,
    DetachMediaDialogComponent,
    DeleteServerDialogComponent,
    CreateSelfManagedServerComponent
  ],
  declarations: [
    ServersComponent,
    ServerCommandComponent,
    ServerComponent,
    ServerManagementComponent,
    ServerStorageComponent,
    ServerNicsComponent,
    ServerServicesComponent,
    ServerBackupsComponent,
    ServerPerformanceScaleComponent,
    ServerManageStorageComponent,
    ServerIpAddressComponent,
    CreateSelfManagedServerComponent,
    CreateSelfManagedServersComponent,
    NewSelfManagedServerComponent,
    CopySelfManagedServerComponent,
    CloneSelfManagedServerComponent,
    ProvisioningNotificationsComponent,
    VdcComponent,
    VdcOverviewComponent,
    ResetPasswordDialogComponent,
    ResetPasswordFinishedDialogComponent,
    DeleteStorageDialogComponent,
    DeleteNetworkDialogComponent,
    DetachMediaDialogComponent,
    DeleteServerDialogComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...serversProviders
  ]
})

export class ServersModule { }
