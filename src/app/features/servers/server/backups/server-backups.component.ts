import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  Subscription,
  throwError,
  Subject
} from 'rxjs';
import {
  catchError,
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  McsDialogService,
  McsTextContentProvider,
  McsNotificationEventsService,
  McsApiJob,
  McsDataStatusFactory,
  CoreDefinition,
  McsDataStatus,
  McsErrorHandlerService
} from '../../../../core';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  unsubscribeSubject
} from '../../../../utilities';
import { StdDateFormatPipe } from '../../../../shared';
import {
  CreateSnapshotDialogComponent,
  DeleteSnapshotDialogComponent,
  RestoreSnapshotDialogComponent,
  InsufficientStorageSnapshotDialogComponent,
  DiskConflictSnapshotDialogComponent
} from '../../shared';
import { ResourcesRepository } from '../../../resources';
import {
  ServerSnapshotDialogContent,
  ServerSnapshot,
  ServerStorageDevice
} from '../../models';
import { ServerService } from '../server.service';
import { ServersService } from '../../servers.service';
import { ServersRepository } from '../../servers.repository';
import { ServerDetailsBase } from '../server-details.base';

enum SnapshotDialogType {
  None = 0,
  Create,
  Restore,
  Delete,
  InsufficientStorage,
  DiskConflict
}

@Component({
  selector: 'mcs-server-backups',
  templateUrl: './server-backups.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerBackupsComponent extends ServerDetailsBase
  implements OnInit, OnDestroy {

  public dataStatusFactory: McsDataStatusFactory<ServerSnapshot[]>;

  public textContent: any;
  public serverSnapshotsSubscription: Subscription;
  public createSnapshotSubscription: Subscription;
  public deleteSnapshotSubscription: Subscription;
  public restoreSnapshotSubscription: Subscription;

  private _newSnapshot: ServerSnapshot;
  private _destroySubject = new Subject<void>();

  public get hasSnapshot(): boolean {
    return !isNullOrEmpty(this.server.snapshots);
  }

  public get snapshot(): ServerSnapshot {
    return this.hasSnapshot ?
      this.server.snapshots[0] : new ServerSnapshot();
  }

  public get creatingSnapshot(): boolean {
    return !isNullOrEmpty(this._newSnapshot);
  }

  public get enabledActions(): boolean {
    return !isNullOrEmpty(this.server.storageDevices)
      && !this.snapshotProcessing
      && !this.server.isProcessing
      && (!isNullOrEmpty(this.serverSnapshotsSubscription)
        && this.serverSnapshotsSubscription.closed);
  }

  private _snapshotProcessing: boolean = false;
  public get snapshotProcessing(): boolean {
    return this._snapshotProcessing;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  constructor(
    _resourcesRepository: ResourcesRepository,
    _serversRepository: ServersRepository,
    _serversService: ServersService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    _errorHandlerService: McsErrorHandlerService,
    private _standardDateFormatPipe: StdDateFormatPipe,
    private _notificationEvents: McsNotificationEventsService,
    private _dialogService: McsDialogService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serversService,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService
    );
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.backups;
    this.initialize();
    this._registerJobEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.serverResourceSubscription);
    unsubscribeSafely(this.serverSnapshotsSubscription);
    unsubscribeSafely(this.createSnapshotSubscription);
    unsubscribeSafely(this.deleteSnapshotSubscription);
    unsubscribeSafely(this.restoreSnapshotSubscription);
    unsubscribeSubject(this._destroySubject);
    this.dispose();
  }

  /**
   * Create snapshot based on server details
   */
  public createSnapshot(): void {
    let dialogType = this._getSnapshotDialogType();

    // For sufficient storage show the creation dialog
    this._showDialog(dialogType, () => {
      if (dialogType !== SnapshotDialogType.Create) { return; }

      this._serversService.setServerSpinner(this.server);
      this.createSnapshotSubscription = this._serversService
        .createServerSnapshot(this.server.id, {
          preserveState: true,
          preserveMemory: true,
          clientReferenceObject: { serverId: this.server.id }
        })
        .pipe(
          catchError((error) => {
            this._serversService.clearServerSpinner(this.server);
            return throwError(error);
          })
        )
        .subscribe();
    });
  }

  /**
   * Restore snapshot based on server snapshot details
   * @param snapshot Snapshot to be restored
   */
  public restoreSnapshot(snapshot: ServerSnapshot) {
    if (isNullOrEmpty(snapshot)) { return; }

    this._showDialog(SnapshotDialogType.Restore, () => {
      this._serversService.setServerSpinner(this.server);
      this.restoreSnapshotSubscription = this._serversService
        .restoreServerSnapshot(this.server.id, {
          clientReferenceObject: { serverId: this.server.id }
        })
        .pipe(
          catchError((error) => {
            this._serversService.clearServerSpinner(this.server);
            return throwError(error);
          })
        )
        .subscribe();
    }, snapshot);
  }

  /**
   * Delete the existing snapshot of the server
   * @param snapshot Snapshot to be deleted
   */
  public deleteSnapshot(snapshot: ServerSnapshot) {
    if (isNullOrEmpty(snapshot)) { return; }

    this._showDialog(SnapshotDialogType.Delete, () => {
      this._serversService.setServerSpinner(this.server);
      this.deleteSnapshotSubscription = this._serversService
        .deleteServerSnapshot(this.server.id, {
          clientReferenceObject: { serverId: this.server.id }
        })
        .pipe(
          catchError((error) => {
            this._serversService.clearServerSpinner(this.server);
            return throwError(error);
          })
        )
        .subscribe();
    }, snapshot);
  }

  /**
   * Event that triggers when selection of server was changed
   *
   * `@Note:` This is a base class implemenatation
   */
  protected serverSelectionChanged(): void {
    this._getServerSnapshots();
  }

  /**
   * Show the dialog based on invoker type
   * @param dialogType Dialog type to invoke
   * @param dialogCallback Dialog callback were the dialog ended with data
   * @param _snapshot Optional Snapshot to be inputted
   */
  private _showDialog(
    dialogType: SnapshotDialogType,
    dialogCallback: () => void,
    _snapshot?: ServerSnapshot
  ): void {
    if (isNullOrEmpty(dialogType)) { return; }

    let dialogComponent = null;
    let dialogData = new ServerSnapshotDialogContent();
    dialogData.serverName = this.server.name;
    if (!isNullOrEmpty(_snapshot)) {
      dialogData.snapshotName = this._standardDateFormatPipe.transform(_snapshot.createdOn);
    }
    dialogData.vdcName = this.serverResource.name;

    // Set the dialog component instance and the callback function
    switch (dialogType) {
      case SnapshotDialogType.Create:
        dialogComponent = CreateSnapshotDialogComponent;
        break;

      case SnapshotDialogType.Delete:
        dialogComponent = DeleteSnapshotDialogComponent;
        break;

      case SnapshotDialogType.Restore:
        dialogComponent = RestoreSnapshotDialogComponent;
        break;

      case SnapshotDialogType.InsufficientStorage:
        dialogComponent = InsufficientStorageSnapshotDialogComponent;
        break;

      case SnapshotDialogType.DiskConflict:
        dialogComponent = DiskConflictSnapshotDialogComponent;
        break;

      default:
        return;
    }
    // Create dialog and invoke the callback function
    let dialogRef = this._dialogService.open(dialogComponent, {
      data: dialogData,
      size: 'medium'
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        // Set initial server status so that the spinner will show up immediately
        this._serversService.setServerSpinner(this.server, this.snapshot);
        this._changeDetectorRef.markForCheck();
        // Invoke function pointer for the corresponding action
        dialogCallback();
      }
    });
  }

  /**
   * Register disk jobs events
   */
  private _registerJobEvents(): void {
    this._notificationEvents.createServerSnapshot
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onCreateServerSnapshot.bind(this));

    this._notificationEvents.applyServerSnapshot
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onUpdateServerSnapshot.bind(this));

    this._notificationEvents.deleteServerSnapshot
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onUpdateServerSnapshot.bind(this));
  }

  /**
   * Event that emits when creating a snapshot
   * @param job Emitted job content
   */
  private _onCreateServerSnapshot(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    switch (job.dataStatus) {
      case McsDataStatus.InProgress:
        this._onCreatingSnapshot(job);
        break;

      case McsDataStatus.Success:
        this.refreshServerResource();
      case McsDataStatus.Error:
      default:
        this._newSnapshot = undefined;
        break;
    }
  }

  /**
   * Event that emits when either updating or deleting a server snapshot
   * @param job Emitted job content
   */
  private _onUpdateServerSnapshot(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // We need to set the processing flag manually here in order to cater
    // from moving one server to another
    this._snapshotProcessing = job.dataStatus === McsDataStatus.InProgress;
    this.dataStatusFactory.setSuccesfull(this.server.snapshots);

    // Update the server snapshot
    if (job.dataStatus === McsDataStatus.Success) {
      this.refreshServerResource();
    }
  }

  /**
   * Will trigger if currently creating a snapshot
   * @param job Emitted job content
   */
  private _onCreatingSnapshot(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Mock snapshot data based on job response
    this._newSnapshot = new ServerSnapshot();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will get all the snapshots from the server
   */
  private _getServerSnapshots(): void {
    unsubscribeSafely(this.serverSnapshotsSubscription);
    // We need to check the datastatus factory if its not undefined
    // because it was called under base class and for any reason, the instance is undefined.
    if (isNullOrEmpty(this.dataStatusFactory)) {
      this.dataStatusFactory = new McsDataStatusFactory();
    }

    this.dataStatusFactory.setInProgress();
    this.serverSnapshotsSubscription = this._serversRepository
      .findSnapshots(this.server)
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this.dataStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        // Subscribe to update the snapshots in server instance
        this.dataStatusFactory.setSuccesfull(response);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Check if server has disk conflict or
   * has disks with multiple storage profiles
   * @param disks Server disks
   */
  private _hasDiskConflict(disks: ServerStorageDevice[]): boolean {
    if (isNullOrEmpty(disks)) { return false; }

    let storageProfile = disks[0].storageProfile;
    let conflictDisk = disks.find((disk) => {
      return disk.storageProfile !== storageProfile;
    });

    return !isNullOrEmpty(conflictDisk);
  }

  /**
   * Get storage profile available space
   * @param storageProfile Server resource storage profile
   */
  private _getStorageProfileAvailableMB(storageProfile: string): number {
    let storage = this.serverResource.storage.find((profile) => {
      return profile.name === storageProfile;
    });
    return !isNullOrEmpty(storage) ? storage.availableMB : 0;
  }

  /**
   * Get snapshot dialog type
   */
  private _getSnapshotDialogType(): SnapshotDialogType {
    if (isNullOrEmpty(this.server.storageDevices)) { return SnapshotDialogType.None; }

    let dialogType: SnapshotDialogType;
    // Business rule: Customer can't create snapshot if
    // server has disks with multiple storage profiles
    let hasDiskConflict = this._hasDiskConflict(this.server.storageDevices);

    if (hasDiskConflict) {
      dialogType = SnapshotDialogType.DiskConflict;
    } else {
      let storageProfile = this.server.storageDevices[0].storageProfile;
      let availableStorageMB = this._getStorageProfileAvailableMB(storageProfile);
      let snapshotSizeMB = this.hasSnapshot ? this.snapshot.sizeMB : 0;
      let hasSufficientStorage = availableStorageMB >= snapshotSizeMB;

      dialogType = hasSufficientStorage ?
        SnapshotDialogType.Create : SnapshotDialogType.InsufficientStorage;
    }

    return dialogType;
  }
}
