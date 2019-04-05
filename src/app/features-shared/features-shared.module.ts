import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
/** Components */
import { AddOnAntiMalwareComponent } from './addon-anti-malware/addon-anti-malware';
import { AddOnInviewComponent } from './addon-inview/addon-inview';
import { AddOnSqlServerComponent } from './addon-sql-server/addon-sql-server';
import { ServerManageMediaComponent } from './server-manage-media/server-manage-media.component';
import { ServerManageNetworkComponent } from './server-manage-network/server-manage-network.component';
import { ServerManageScaleComponent } from './server-manage-scale/server-manage-scale.component';
import { ServerManageStorageComponent } from './server-manage-storage/server-manage-storage.component';
import { StepOrderDetailsComponent } from './step-order-details/step-order-details.component';
import { StepProvisioningComponent } from './step-provisioning/step-provisioning.component';

import { CreateSnapshotDialogComponent } from './server-dialogs/create-snapshot/create-snapshot.dialog';
import { DeleteNicDialogComponent } from './server-dialogs/delete-nic/delete-nic.dialog';
import { DeleteServerDialogComponent } from './server-dialogs/delete-server/delete-server.dialog';
import { DeleteSnapshotDialogComponent } from './server-dialogs/delete-snapshot/delete-snapshot.dialog';
import { DeleteStorageDialogComponent } from './server-dialogs/delete-storage/delete-storage.dialog';
import { DetachMediaDialogComponent } from './server-dialogs/detach-media/detach-media.dialog';
import {
  DiskConflictSnapshotDialogComponent
} from './server-dialogs/disk-conflict-snapshot/disk-conflict-snapshot.dialog';
import {
  InsufficientStorageSnapshotDialogComponent
} from './server-dialogs/insufficient-storage-snapshot/insufficient-storage-snapshot.dialog';
import { RenameServerDialogComponent } from './server-dialogs/rename-server/rename-server.dialog';
import { ResetPasswordDialogComponent } from './server-dialogs/reset-password/reset-password.dialog';
import {
  ResetPasswordFinishedDialogComponent
} from './server-dialogs/reset-password-finished/reset-password-finished.dialog';
import { RestoreSnapshotDialogComponent } from './server-dialogs/restore-snapshot/restore-snapshot.dialog';
import { ResumeServerDialogComponent } from './server-dialogs/resume-server/resume-server.dialog';
import { SuspendServerDialogComponent } from './server-dialogs/suspend-server/suspend-server.dialog';

@NgModule({
  declarations: [
    AddOnAntiMalwareComponent,
    AddOnInviewComponent,
    AddOnSqlServerComponent,
    ServerManageMediaComponent,
    ServerManageNetworkComponent,
    ServerManageScaleComponent,
    ServerManageStorageComponent,
    StepOrderDetailsComponent,
    StepProvisioningComponent,

    CreateSnapshotDialogComponent,
    DeleteNicDialogComponent,
    DeleteServerDialogComponent,
    DeleteSnapshotDialogComponent,
    DeleteStorageDialogComponent,
    DetachMediaDialogComponent,
    DiskConflictSnapshotDialogComponent,
    InsufficientStorageSnapshotDialogComponent,
    RenameServerDialogComponent,
    ResetPasswordDialogComponent,
    ResetPasswordFinishedDialogComponent,
    RestoreSnapshotDialogComponent,
    ResumeServerDialogComponent,
    SuspendServerDialogComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    AddOnAntiMalwareComponent,
    AddOnInviewComponent,
    AddOnSqlServerComponent,
    ServerManageMediaComponent,
    ServerManageNetworkComponent,
    ServerManageScaleComponent,
    ServerManageStorageComponent,
    StepOrderDetailsComponent,
    StepProvisioningComponent,

    CreateSnapshotDialogComponent,
    DeleteNicDialogComponent,
    DeleteServerDialogComponent,
    DeleteSnapshotDialogComponent,
    DeleteStorageDialogComponent,
    DetachMediaDialogComponent,
    DiskConflictSnapshotDialogComponent,
    InsufficientStorageSnapshotDialogComponent,
    RenameServerDialogComponent,
    ResetPasswordDialogComponent,
    ResetPasswordFinishedDialogComponent,
    RestoreSnapshotDialogComponent,
    ResumeServerDialogComponent,
    SuspendServerDialogComponent
  ],
  entryComponents: [
    CreateSnapshotDialogComponent,
    DeleteNicDialogComponent,
    DeleteServerDialogComponent,
    DeleteSnapshotDialogComponent,
    DeleteStorageDialogComponent,
    DetachMediaDialogComponent,
    DiskConflictSnapshotDialogComponent,
    InsufficientStorageSnapshotDialogComponent,
    RenameServerDialogComponent,
    ResetPasswordDialogComponent,
    ResetPasswordFinishedDialogComponent,
    RestoreSnapshotDialogComponent,
    ResumeServerDialogComponent,
    SuspendServerDialogComponent
  ]
})

export class FeaturesSharedModule { }
