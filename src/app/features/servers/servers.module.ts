import { NgModule } from '@angular/core';
/** Servers */
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
/** Create Servers */
import {
  CreateServerComponent,
  NewServerComponent,
  CloneServerComponent,
  ServerProvisioningPageComponent
} from './create-server';
/** VDC */
import {
  VdcComponent,
  VdcOverviewComponent,
  VdcStorageComponent
} from './vdc';
/** Services */
import { serversProviders } from './servers.constants';
/** Modules */
import { SharedModule } from '../../shared';

@NgModule({
  entryComponents: [
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
    ServerProvisioningPageComponent,
    CreateServerComponent,
    NewServerComponent,
    CloneServerComponent,
    ProvisioningNotificationsComponent,
    VdcComponent,
    VdcOverviewComponent,
    VdcStorageComponent,
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
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...serversProviders
  ]
})

export class ServersModule { }
