import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { ServersComponent } from './servers.component';
/** Shared */
import {
  ServerCommandComponent,
  ServerManageStorageComponent,
  ServerManageNetworkComponent,
  ServerManageMediaComponent,
  ServerManageScaleComponent,
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
  ServerServicesComponent,
  OsUpdatesScheduleComponent,
  OsUpdatesApplyNowComponent
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
    ServerServicesComponent,
    OsUpdatesScheduleComponent,
    OsUpdatesApplyNowComponent,
    VdcComponent,
    VdcOverviewComponent,
    VdcStorageComponent,
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
