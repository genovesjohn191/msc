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
  SuspendServerDialogComponent,
  ResumeServerDialogComponent,
  IsSelfManagedServerDirective
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
    DeleteServerDialogComponent,
    SuspendServerDialogComponent,
    ResumeServerDialogComponent,
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
    DeleteNicDialogComponent,
    DetachMediaDialogComponent,
    DeleteServerDialogComponent,
    RenameServerDialogComponent,
    CreateSnapshotDialogComponent,
    DeleteSnapshotDialogComponent,
    InsufficientStorageSnapshotDialogComponent,
    RestoreSnapshotDialogComponent,
    SuspendServerDialogComponent,
    ResumeServerDialogComponent,
    IsSelfManagedServerDirective
  ],
  imports: [
    SharedModule
  ],
  providers: [
    ...serversProviders
  ]
})

export class ServersModule { }
