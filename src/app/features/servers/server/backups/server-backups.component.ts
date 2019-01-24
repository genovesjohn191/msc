import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  throwError,
  Subject,
  Observable
} from 'rxjs';
import {
  catchError,
  startWith,
  takeUntil,
  map,
  tap
} from 'rxjs/operators';
import {
  McsDialogService,
  McsTextContentProvider,
  McsNotificationEventsService,
  McsDataStatusFactory,
  CoreDefinition,
  McsErrorHandlerService,
  McsLoadingService,
  McsAccessControlService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '@app/utilities';
import { StdDateFormatPipe } from '@app/shared';
import {
  McsJob,
  DataStatus,
  McsServerSnapshot,
  McsServerStorageDevice,
  McsServer,
  McsResource,
  McsResourceStorage
} from '@app/models';
import {
  ServerSnapshotDialogContent,
  CreateSnapshotDialogComponent,
  DeleteSnapshotDialogComponent,
  RestoreSnapshotDialogComponent,
  InsufficientStorageSnapshotDialogComponent,
  DiskConflictSnapshotDialogComponent
} from '../../shared';
import {
  McsServersRepository,
  McsResourcesRepository
} from '@app/services';
import { ServerService } from '../server.service';
import { ServerDetailsBase } from '../server-details.base';
import { ServersService } from '../../servers.service';

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

  public textContent: any;
  public snapshot$: Observable<McsServerSnapshot>;
  public dataStatusFactory: McsDataStatusFactory<McsServerSnapshot[]>;

  private _newSnapshot: McsServerSnapshot;
  private _destroySubject = new Subject<void>();

  public get creatingSnapshot(): boolean {
    return !isNullOrEmpty(this._newSnapshot);
  }

  private _snapshotProcessing: boolean = false;
  public get snapshotProcessing(): boolean {
    return this._snapshotProcessing;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    _resourcesRepository: McsResourcesRepository,
    _serversRepository: McsServersRepository,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    _errorHandlerService: McsErrorHandlerService,
    _loadingService: McsLoadingService,
    _accessControl: McsAccessControlService,
    private _serversService: ServersService,
    private _standardDateFormatPipe: StdDateFormatPipe,
    private _notificationEvents: McsNotificationEventsService,
    private _dialogService: McsDialogService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService,
      _loadingService,
      _accessControl
    );
    this.dataStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.backups;
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
    this.dispose();
  }

  public enabledActions(server): boolean {
    return !isNullOrEmpty(server.storageDevices)
      && !this.snapshotProcessing
      && !server.isProcessing;
  }

  /**
   * Create snapshot based on server details
   */
  public createSnapshot(server: McsServer, resource: McsResource): void {
    let dialogType = this._getSnapshotDialogType(server, resource);

    // For sufficient storage show the creation dialog
    this._showDialog(
      server,
      dialogType,
      () => {
        if (dialogType !== SnapshotDialogType.Create) { return; }

        this._serversService.setServerSpinner(server);
        this._serversRepository.createServerSnapshot(server.id, {
          preserveState: true,
          preserveMemory: true,
          clientReferenceObject: { serverId: server.id }
        }).pipe(
          catchError((error) => {
            this._serversService.clearServerSpinner(server);
            return throwError(error);
          })
        ).subscribe();
      });
  }

  /**
   * Restore snapshot based on server snapshot details
   * @param snapshot Snapshot to be restored
   */
  public restoreSnapshot(server: McsServer, snapshot: McsServerSnapshot) {
    if (isNullOrEmpty(snapshot)) { return; }

    this._showDialog(server, SnapshotDialogType.Restore, () => {
      this._serversService.setServerSpinner(server);
      this._serversRepository.restoreServerSnapshot(server.id, {
        clientReferenceObject: { serverId: server.id }
      }).pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server);
          return throwError(error);
        })
      ).subscribe();
    }, snapshot);
  }

  /**
   * Delete the existing snapshot of the server
   * @param snapshot Snapshot to be deleted
   */
  public deleteSnapshot(server: McsServer, snapshot: McsServerSnapshot) {
    if (isNullOrEmpty(snapshot)) { return; }

    this._showDialog(server, SnapshotDialogType.Delete, () => {
      this._serversService.setServerSpinner(server);
      this._serversRepository.deleteServerSnapshot(server.id, {
        clientReferenceObject: { serverId: server.id }
      }).pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server);
          return throwError(error);
        })
      ).subscribe();
    }, snapshot);
  }

  /**
   * Event that triggers when selection of server was changed
   *
   * `@Note:` This is a base class implemenatation
   */
  protected selectionChange(server: McsServer, _resource: McsResource): void {
    this.validateDedicatedFeatureFlag(server, 'EnableDedicatedVmSnapshotView');
    this._registerJobEvents();
    this._getServerSnapshots(server);
  }

  /**
   * Show the dialog based on invoker type
   * @param dialogType Dialog type to invoke
   * @param dialogCallback Dialog callback were the dialog ended with data
   * @param _snapshot Optional Snapshot to be inputted
   */
  private _showDialog(
    server: McsServer,
    dialogType: SnapshotDialogType,
    dialogCallback: () => void,
    _snapshot?: McsServerSnapshot
  ): void {
    if (isNullOrEmpty(dialogType)) { return; }

    let dialogComponent = null;
    let dialogData = new ServerSnapshotDialogContent();
    dialogData.serverName = server.name;
    if (!isNullOrEmpty(_snapshot)) {
      dialogData.snapshotName = this._standardDateFormatPipe.transform(_snapshot.createdOn);
    }
    dialogData.vdcName = server.resourceName;

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
        this._serversService.setServerSpinner(server);
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
    // Remove the previously subscription
    this._destroySubject.next();

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
  private _onCreateServerSnapshot(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    switch (job.dataStatus) {
      case DataStatus.InProgress:
        this._onCreatingSnapshot(job);
        break;

      case DataStatus.Success:
        this.refreshServerResource();
      case DataStatus.Error:
      default:
        this._newSnapshot = undefined;
        break;
    }
  }

  /**
   * Event that emits when either updating or deleting a server snapshot
   * @param job Emitted job content
   */
  private _onUpdateServerSnapshot(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // We need to set the processing flag manually here in order to cater
    // from moving one server to another
    this._snapshotProcessing = job.dataStatus === DataStatus.InProgress;

    // Update the server snapshot
    if (job.dataStatus === DataStatus.Success) {
      this.refreshServerResource();
    }
  }

  /**
   * Will trigger if currently creating a snapshot
   * @param job Emitted job content
   */
  private _onCreatingSnapshot(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Mock snapshot data based on job response
    this._newSnapshot = new McsServerSnapshot();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will get all the snapshots from the server
   */
  private _getServerSnapshots(server: McsServer): void {
    this.dataStatusFactory.setInProgress();
    this.snapshot$ = this._serversRepository.getSnapshots(server).pipe(
      catchError((error) => {
        this.dataStatusFactory.setError();
        return throwError(error);
      }),
      map((snapshots) => snapshots && snapshots[0]),
      tap((snapshot) => this.dataStatusFactory.setSuccessful([snapshot]))
    );
  }

  /**
   * Check if server has disk conflict or
   * has disks with multiple storage profiles
   * @param disks Server disks
   */
  private _hasDiskConflict(disks: McsServerStorageDevice[]): boolean {
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
  private _getStorageProfileAvailableMB(
    resourceStorage: McsResourceStorage[],
    storageProfile: string
  ): number {
    let storage = resourceStorage.find((profile) => {
      return profile.name === storageProfile;
    });
    return !isNullOrEmpty(storage) ? storage.availableMB : 0;
  }

  /**
   * Get snapshot dialog type
   */
  private _getSnapshotDialogType(server: McsServer, resource: McsResource): SnapshotDialogType {
    if (isNullOrEmpty(server.storageDevices)) { return SnapshotDialogType.None; }

    let dialogType: SnapshotDialogType;
    // Business rule: Customer can't create snapshot if
    // server has disks with multiple storage profiles
    let hasDiskConflict = this._hasDiskConflict(server.storageDevices);

    if (hasDiskConflict) {
      dialogType = SnapshotDialogType.DiskConflict;
    } else {
      let storageProfile = server.storageDevices[0].storageProfile;
      let availableStorageMB = this._getStorageProfileAvailableMB(resource.storage, storageProfile);
      let snapshotSizeMB = !isNullOrEmpty(server.snapshots) ? server.snapshots[0].sizeMB : 0;
      let hasSufficientStorage = availableStorageMB >= snapshotSizeMB;

      dialogType = hasSufficientStorage ?
        SnapshotDialogType.Create : SnapshotDialogType.InsufficientStorage;
    }

    return dialogType;
  }
}
