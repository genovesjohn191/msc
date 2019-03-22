import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { FeaturesSharedModule } from '@app/features-shared';
import { ServersComponent } from './servers.component';
/** Shared */
import {
  ServerCommandComponent,
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
    ResumeServerDialogComponent
  ],
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
