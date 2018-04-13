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
  AntiMalwareAddOnComponent
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
  CreateSelfManagedServerComponent,
  CreateSelfManagedServersComponent,
  NewSelfManagedServerComponent,
  CopySelfManagedServerComponent,
  CloneSelfManagedServerComponent,
  ServerProvisioningPageComponent
} from './create-server';
/** VDC */
import {
  VdcComponent,
  VdcOverviewComponent
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
    CreateSelfManagedServerComponent,
    AntiMalwareAddOnComponent
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
    ServerProvisioningPageComponent,
    ProvisioningNotificationsComponent,
    VdcComponent,
    VdcOverviewComponent,
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
    AntiMalwareAddOnComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...serversProviders
  ]
})

export class ServersModule { }
