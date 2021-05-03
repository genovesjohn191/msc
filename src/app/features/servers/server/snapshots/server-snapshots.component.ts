import {
  of,
  throwError,
  Observable,
  Subscription
} from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { McsDataStatusFactory } from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsApiErrorResponse,
  McsFeatureFlag,
  McsJob,
  McsResource,
  McsResourceStorage,
  McsServer,
  McsServerSnapshot,
  McsServerSnapshotCreate,
  McsServerSnapshotDelete,
  McsServerSnapshotRestore,
  McsServerStorageDevice
} from '@app/models';
import {
  DialogConfirmation,
  DialogMessageConfig,
  DialogService,
  FormMessage,
  StdDateFormatPipe
} from '@app/shared';
import {
  getSafeProperty,
  getUniqueRecords,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ServerDetailsBase } from '../server-details.base';

enum SnapshotDialogType {
  None = 0,
  Create,
  Restore,
  Delete,
  InsufficientStorage,
  DiskConflict,
  InvalidDisk
}

@Component({
  selector: 'mcs-server-snapshots',
  templateUrl: './server-snapshots.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerSnapshotsComponent extends ServerDetailsBase
  implements OnInit, OnDestroy {

  public snapshot$: Observable<McsServerSnapshot>;
  public updatingSnapshot: boolean;
  public capturingSnapshot: boolean;
  public dataStatusFactory: McsDataStatusFactory<McsServerSnapshot[]>;

  private _createSnapshotHandler: Subscription;
  private _applySnapshotHandler: Subscription;
  private _deleteSnapshotHandler: Subscription;

  @ViewChild('formMessage')
  private _formMessage: FormMessage;

  public get warningIconKey(): string {
    return CommonDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _standardDateFormatPipe: StdDateFormatPipe,
    private _dialogService: DialogService
  ) {
    super(_injector, _changeDetectorRef);
    this.dataStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._createSnapshotHandler);
    unsubscribeSafely(this._applySnapshotHandler);
    unsubscribeSafely(this._deleteSnapshotHandler);
  }

  public enabledActions(server: McsServer): boolean {
    return !isNullOrEmpty(server.storageDevices)
      && !this.capturingSnapshot
      && !this.updatingSnapshot
      && !server.isProcessing;
  }

  /**
   * Create snapshot based on server details
   */
  public createSnapshot(server: McsServer, resource: McsResource): void {
    let dialogType = this._getDialogTypeByVmStorage(server, resource);

    switch (dialogType) {
      case SnapshotDialogType.Create:
        this._showCreateSnapshotDialog(server);
        break;

      case SnapshotDialogType.DiskConflict:
        this._showDiskConflictDialog();
        break;

      case SnapshotDialogType.InsufficientStorage:
        this._showInsufficientDiskDialog(resource);
        break;

      case SnapshotDialogType.InvalidDisk:
        this._showInvalidDiskDialog(server, resource);
        break;
    }
  }

  /**
   * Restore snapshot based on server snapshot details
   * @param snapshot Snapshot to be restored
   */
  public restoreSnapshot(server: McsServer, snapshot: McsServerSnapshot) {
    if (isNullOrEmpty(snapshot)) { return; }
    this._showRestoreSnapshotDialog(server, snapshot);
  }

  /**
   * Delete the existing snapshot of the server
   * @param snapshot Snapshot to be deleted
   */
  public deleteSnapshot(server: McsServer, snapshot: McsServerSnapshot) {
    if (isNullOrEmpty(snapshot)) { return; }
    this._showDeleteSnapshotDialog(server, snapshot);
  }

  /**
   * Event that emits when the selected server has been changed
   * @param server Server details of the selected record
   */
  protected serverChange(server: McsServer): void {
    this.validateDedicatedFeatureFlag(server, McsFeatureFlag.DedicatedVmSnapshotView);
    this._getServerSnapshots(server);
  }

  /**
   * Shows insufficient disk dialog
   * @param resource Resource to be checked
   */
  private _showInsufficientDiskDialog(resource: McsResource): void {
    let dialogData = {
      data: resource,
      type: 'info',
      title: this._translateService.instant('dialog.snapshotInsufficientStorage.title'),
      message: this._translateService.instant('dialog.snapshotInsufficientStorage.message', { vdc_name: resource.name })
    } as DialogMessageConfig;

    this._dialogService.openMessage(dialogData);
  }

  /**
   * Shows the invalid disk dialog
   * @param server The selected server to which to view the vcloud
   * @param resource The resource group of the server
   */
  private _showInvalidDiskDialog(server: McsServer, resource: McsResource): void {
    let dialogData = {
      data: resource,
      type: 'info',
      title: this._translateService.instant('dialog.snapshotDiskInvalid.title'),
      message: this._translateService.instant('dialog.snapshotDiskInvalid.message', {
        vdc_name: resource.name,
        vCloudUrl: server.portalUrl
      })
    } as DialogMessageConfig;

    this._dialogService.openMessage(dialogData);
  }

  /**
   * Shows create snapshot dialog
   * @param server Server on where to create the snapshot
   */
  private _showCreateSnapshotDialog(server: McsServer): void {
    let dialogData = {
      data: server,
      type: 'info',
      title: this._translateService.instant('dialog.snapshotCreate.title'),
      message: this._translateService.instant('dialog.snapshotCreate.message', { server_name: server.name })
    } as DialogConfirmation<McsServer>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }

        let snapshotDetails = new McsServerSnapshotCreate();
        snapshotDetails.preserveMemory = true;
        snapshotDetails.preserveState = true;
        snapshotDetails.clientReferenceObject = {
          serverId: server.id
        };

        return this.apiService.createServerSnapshot(server.id, snapshotDetails).pipe(
          catchError((httpError) => {
            this._showErrorMessageByResponse(httpError);
            return throwError(httpError);
          })
        );
      })
    ).subscribe();
  }

  /**
   * Shows the disk conflict dialog box
   */
  private _showDiskConflictDialog(): void {
    let dialogData = {
      type: 'info',
      title: this._translateService.instant('dialog.snapshotDiskConflict.title'),
      message: this._translateService.instant('dialog.snapshotDiskConflict.message')
    } as DialogMessageConfig;

    this._dialogService.openMessage(dialogData);
  }

  /**
   * Shows the delete snapshot dialog
   * @param server Server to be snapshot
   * @param snapshot Snapshot to be applied
   */
  private _showDeleteSnapshotDialog(server: McsServer, snapshot: McsServerSnapshot): void {
    let dialogData = {
      data: server,
      type: 'warning',
      title: this._translateService.instant('dialog.snapshotDelete.title'),
      message: this._translateService.instant('dialog.snapshotDelete.message', {
        snapshot_name: this._standardDateFormatPipe.transform(snapshot.createdOn)
      })
    } as DialogConfirmation<McsServer>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        let snapshotDetails = new McsServerSnapshotDelete();
        snapshotDetails.clientReferenceObject = {
          serverId: server.id
        };

        return this.apiService.deleteServerSnapshot(server.id, snapshotDetails).pipe(
          catchError((httpError) => {
            this._showErrorMessageByResponse(httpError);
            return throwError(httpError);
          })
        );
      })
    ).subscribe();
  }

  /**
   * Shows the restore snapshot dialog box
   * @param server Server on where the snapshot to be restored
   * @param snapshot Snapshot to be restored
   */
  private _showRestoreSnapshotDialog(server: McsServer, snapshot: McsServerSnapshot): void {
    let dialogData = {
      data: server,
      type: 'info',
      title: this._translateService.instant('dialog.snapshotRestore.title'),
      message: this._translateService.instant('dialog.snapshotRestore.message', {
        server_name: server.name,
        snapshot_name: this._standardDateFormatPipe.transform(snapshot.createdOn)
      })
    } as DialogConfirmation<McsServer>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }

        let snapshotDetails = new McsServerSnapshotRestore();
        snapshotDetails.clientReferenceObject = {
          serverId: server.id
        };

        return this.apiService.restoreServerSnapshot(server.id, snapshotDetails).pipe(
          catchError((httpError) => {
            this._showErrorMessageByResponse(httpError);
            return throwError(httpError);
          })
        );
      })
    ).subscribe();
  }

  /**
   * Register jobs events
   */
  private _registerEvents(): void {
    this._createSnapshotHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerSnapshotCreate, this._onCreateServerSnapshot.bind(this)
    );

    this._applySnapshotHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerSnapshotApply, this._onUpdateServerSnapshot.bind(this)
    );

    this._deleteSnapshotHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerSnapshotDelete, this._onUpdateServerSnapshot.bind(this)
    );

    // Invoke the event initially
    this.eventDispatcher.dispatch(McsEvent.jobServerSnapshotCreate);
    this.eventDispatcher.dispatch(McsEvent.jobServerSnapshotApply);
    this.eventDispatcher.dispatch(McsEvent.jobServerSnapshotDelete);
  }

  /**
   * Event that emits when creating a snapshot
   * @param job Emitted job content
   */
  private _onCreateServerSnapshot(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when job is done
    if (!job.inProgress) { this.refreshServerResource(); }
    this.capturingSnapshot = job.inProgress;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when either updating or deleting a server snapshot
   * @param job Emitted job content
   */
  private _onUpdateServerSnapshot(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) { this.refreshServerResource(); }
    this.updatingSnapshot = job.inProgress;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will get all the snapshots from the server
   */
  private _getServerSnapshots(server: McsServer): void {
    this.dataStatusFactory.setInProgress();
    this.snapshot$ = this.apiService.getServerSnapshots(server.id).pipe(
      catchError((error) => {
        this.dataStatusFactory.setError();
        return throwError(error);
      }),
      map((snapshots) => getSafeProperty(snapshots, (obj) => obj.collection[0])),
      tap((snapshot) => this.dataStatusFactory.setSuccessful([snapshot]))
    );
  }

  /**
   * Returns true when the disks has multiple storage profiles
   * @param disks Server disks to be checked for storage profiles
   */
  private _hasMultipleStorageProfiles(disks: McsServerStorageDevice[]): boolean {
    if (isNullOrEmpty(disks)) { return false; }

    let uniqueDisks = getUniqueRecords(disks.slice(), (item) => item.storageProfile);
    return uniqueDisks.length > 1;
  }

  /**
   * Get storage profile available space
   * @param resourceStorage Server resource storage
   * @param storageProfile Server resource storage profile
   */
  private _getStorageProfileAvailableMB(
    resourceStorage: McsResourceStorage[],
    storageProfile: string
  ): number {
    let storage = resourceStorage && resourceStorage.find((profile) => {
      return profile.name === storageProfile;
    });
    return storage?.availableMB;
  }

  /**
   * Gets the snapshot dialog type based on the vm storage size
   */
  private _getDialogTypeByVmStorage(server: McsServer, resource: McsResource): SnapshotDialogType {
    if (isNullOrEmpty(server.storageDevices)) { return SnapshotDialogType.None; }

    let dialogType: SnapshotDialogType;
    // Business rule: Customer can't create snapshot if
    // server has disks with multiple storage profiles
    let hasMultipleStorageProfiles = this._hasMultipleStorageProfiles(server.storageDevices);

    if (hasMultipleStorageProfiles) {
      dialogType = SnapshotDialogType.DiskConflict;
    } else {
      let storageProfile = server.storageDevices[0].storageProfile;
      let resourceSizeMb = this._getStorageProfileAvailableMB(resource.storage, storageProfile);
      if (isNullOrUndefined(resourceSizeMb)) {
        dialogType = SnapshotDialogType.InvalidDisk;
        return dialogType;
      }

      let disksSizeMb = server.storageDevices && server.storageDevices
        .map((disk) => disk.sizeMB)
        .reduce((totalSize, currentSize) => totalSize + currentSize);
      let inSufficientStorage = disksSizeMb > resourceSizeMb;

      dialogType = inSufficientStorage ?
        SnapshotDialogType.InsufficientStorage :
        SnapshotDialogType.Create;
    }

    return dialogType;
  }

  /**
   * Shows the error response message on the form field
   * @param httpResponse Http error response to be shown
   */
  private _showErrorMessageByResponse(httpResponse: McsApiErrorResponse): void {
    this._formMessage.showMessage('error', {
      messages: httpResponse.errorMessages,
      fallbackMessage: this._translateService.instant('serverSnapshots.formMessageDefaultError')
    });
  }
}
