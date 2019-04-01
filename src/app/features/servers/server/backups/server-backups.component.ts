import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  OnInit
} from '@angular/core';
import {
  throwError,
  Observable,
  Subscription
} from 'rxjs';
import {
  catchError,
  map,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsDialogService,
  McsDataStatusFactory,
  CoreDefinition,
  McsErrorHandlerService,
  McsLoadingService,
  McsAccessControlService,
  CoreEvent
} from '@app/core';
import {
  isNullOrEmpty,
  getUniqueRecords,
  unsubscribeSafely
} from '@app/utilities';
import {
  StdDateFormatPipe,
  FormMessage
} from '@app/shared';
import {
  McsJob,
  McsServerSnapshot,
  McsServerStorageDevice,
  McsServer,
  McsResource,
  McsResourceStorage,
  McsApiErrorResponse
} from '@app/models';
import {
  McsServersRepository,
  McsResourcesRepository
} from '@app/services';
import {
  ServerSnapshotDialogContent,
  CreateSnapshotDialogComponent,
  DeleteSnapshotDialogComponent,
  RestoreSnapshotDialogComponent,
  InsufficientStorageSnapshotDialogComponent,
  DiskConflictSnapshotDialogComponent
} from '../../shared';
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
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    _resourcesRepository: McsResourcesRepository,
    _serversRepository: McsServersRepository,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _errorHandlerService: McsErrorHandlerService,
    _loadingService: McsLoadingService,
    _accessControl: McsAccessControlService,
    private _translateService: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _serversService: ServersService,
    private _standardDateFormatPipe: StdDateFormatPipe,
    private _dialogService: McsDialogService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serverService,
      _changeDetectorRef,
      _errorHandlerService,
      _loadingService,
      _accessControl
    );
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
          catchError((httpError) => {
            this._serversService.clearServerSpinner(server);
            this._showErrorMessageByResponse(httpError);
            return throwError(httpError);
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
        catchError((httpError) => {
          this._serversService.clearServerSpinner(server);
          this._showErrorMessageByResponse(httpError);
          return throwError(httpError);
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
        catchError((httpError) => {
          this._serversService.clearServerSpinner(server);
          this._showErrorMessageByResponse(httpError);
          return throwError(httpError);
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
        this._serversService.setServerSpinner(server);
        this._changeDetectorRef.markForCheck();
        dialogCallback();
      }
    });
  }

  /**
   * Register jobs events
   */
  private _registerEvents(): void {
    this._createSnapshotHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerSnapshotCreate, this._onCreateServerSnapshot.bind(this)
    );

    this._applySnapshotHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerSnapshotApply, this._onUpdateServerSnapshot.bind(this)
    );

    this._deleteSnapshotHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerSnapshotDelete, this._onUpdateServerSnapshot.bind(this)
    );

    // Invoke the event initially
    this._eventDispatcher.dispatch(CoreEvent.jobServerSnapshotCreate);
    this._eventDispatcher.dispatch(CoreEvent.jobServerSnapshotApply);
    this._eventDispatcher.dispatch(CoreEvent.jobServerSnapshotDelete);

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
    let storage = resourceStorage.find((profile) => {
      return profile.name === storageProfile;
    });
    return !isNullOrEmpty(storage) ? storage.availableMB : 0;
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
      fallbackMessage: this._translateService.instant('serverBackups.formMessageDefaultError')
    });
  }
}
