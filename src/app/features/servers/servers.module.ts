import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';
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
  HidsAddOnComponent,
  InviewAddOnComponent
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
    HidsAddOnComponent,
    InviewAddOnComponent
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
    VdcStorageComponent,
    AntiMalwareAddOnComponent,
    DisasterRecoveryAddOnComponent,
    SqlServerAddOnComponent,
    InfrastructureMonitoringAddOnComponent,
    HidsAddOnComponent,
    InviewAddOnComponent,

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
    SharedModule,
    FeaturesSharedModule
  ],
  providers: [
    ...serversProviders
  ]
})

export class ServersModule { }
