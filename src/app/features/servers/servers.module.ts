import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { ServersComponent } from './servers.component';
/** Shared */
import {
  ServerCommandComponent,
  ServerManageStorageComponent,
  ServerManageNetworkComponent,
  ServerManageMediaComponent,
  ServerManageScaleComponent,
  ProvisioningNotificationsComponent,
  ResetPasswordDialogComponent,
  ResetPasswordFinishedDialogComponent,
  DeleteStorageDialogComponent,
  DeleteNicDialogComponent,
  DetachMediaDialogComponent,
  DeleteServerDialogComponent,
  RenameServerDialogComponent,
  CreateSnapshotDialogComponent,
  DeleteSnapshotDialogComponent,
  InsufficientStorageSnapshotDialogComponent,
  RestoreSnapshotDialogComponent,
  DiskConflictSnapshotDialogComponent,
  SuspendServerDialogComponent,
  ResumeServerDialogComponent,
  IsSelfManagedServerDirective,
  AntiMalwareAddOnComponent,
  DisasterRecoveryAddOnComponent,
  SqlServerAddOnComponent,
  InfrastructureMonitoringAddOnComponent,
  HidsAddOnComponent
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
/** Server Provisioning */
import { ServerProvisioningComponent } from './server-provisioning/server-provisioning.component';
/** Create Servers */
import {
  ServerCreateComponent,
  ServerCreateDetailsComponent,
  ServerNewComponent,
  ServerCloneComponent,
  ServerCreateAddOnsComponent,
  ServerCreateConfirmComponent,
  ServerCreateProvisioningComponent
} from './server-create';
/** VDC */
import {
  VdcComponent,
  VdcOverviewComponent,
  VdcStorageComponent
} from './vdc';
import {
  serversProviders,
  serversRoutesComponents
} from './servers.constants';

@NgModule({
  entryComponents: [
    ...serversRoutesComponents,
    ResetPasswordDialogComponent,
    ResetPasswordFinishedDialogComponent,
    DeleteStorageDialogComponent,
    DeleteNicDialogComponent,
    DetachMediaDialogComponent,
    DeleteServerDialogComponent,
    RenameServerDialogComponent,
    CreateSnapshotDialogComponent,
    DeleteSnapshotDialogComponent,
    InsufficientStorageSnapshotDialogComponent,
    RestoreSnapshotDialogComponent,
    DiskConflictSnapshotDialogComponent,
    DeleteServerDialogComponent,
    SuspendServerDialogComponent,
    ResumeServerDialogComponent,
    AntiMalwareAddOnComponent,
    DisasterRecoveryAddOnComponent,
    SqlServerAddOnComponent,
    InfrastructureMonitoringAddOnComponent,
    HidsAddOnComponent
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
    ServerManageStorageComponent,
    ServerManageNetworkComponent,
    ServerManageMediaComponent,
    ServerManageScaleComponent,
    ServerProvisioningComponent,
    ServerCreateComponent,
    ServerCreateDetailsComponent,
    ServerNewComponent,
    ServerCloneComponent,
    ServerCreateAddOnsComponent,
    ServerCreateConfirmComponent,
    ServerCreateProvisioningComponent,
    ProvisioningNotificationsComponent,
    VdcComponent,
    VdcOverviewComponent,
    VdcStorageComponent,
    IsSelfManagedServerDirective,
    AntiMalwareAddOnComponent,
    DisasterRecoveryAddOnComponent,
    SqlServerAddOnComponent,
    InfrastructureMonitoringAddOnComponent,
    HidsAddOnComponent,

    ResetPasswordDialogComponent,
    ResetPasswordFinishedDialogComponent,
    DeleteStorageDialogComponent,
    DeleteNicDialogComponent,
    DetachMediaDialogComponent,
    DeleteServerDialogComponent,
    RenameServerDialogComponent,
    CreateSnapshotDialogComponent,
    DeleteSnapshotDialogComponent,
    InsufficientStorageSnapshotDialogComponent,
    RestoreSnapshotDialogComponent,
    DiskConflictSnapshotDialogComponent,
    SuspendServerDialogComponent,
    ResumeServerDialogComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...serversProviders
  ]
})

export class ServersModule { }
