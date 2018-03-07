import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  McsDialogService,
  McsTextContentProvider,
  McsNotificationEventsService,
  McsApiJob,
  McsDataStatusFactory,
  CoreDefinition,
  McsDataStatus
} from '../../../../core';
import {
  convertDateToStandardString,
  unsubscribeSafely,
  isNullOrEmpty
} from '../../../../utilities';
import {
  ServerDetailsBase,
  CreateSnapshotDialogComponent,
  DeleteSnapshotDialogComponent,
  RestoreSnapshotDialogComponent,
  InsufficientStorageSnapshotDialogComponent
} from '../../shared';
import {
  ServerSnapshotDialogContent,
  ServerSnapshot,
  ServerServiceType
} from '../../models';
import { ServerService } from '../server.service';
import { ServersService } from '../../servers.service';
import { ServersRepository } from '../../servers.repository';
import { ServersResourcesRespository } from '../../servers-resources.repository';

enum SnapshotDialogType {
  None = 0,
  Create,
  Restore,
  Delete,
  InsufficientStorage
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
  public createJobSnapshotSubscription: Subscription;
  public restoreJobSnapshotSubscription: Subscription;
  public deleteJobSnapshotSubscription: Subscription;

  public get hasSnapshot(): boolean {
    return !isNullOrEmpty(this.server.snapshots);
  }

  public get snapshot(): ServerSnapshot {
    return this.hasSnapshot ?
      this.server.snapshots[0] : new ServerSnapshot();
  }

  public get enabledActions(): boolean {
    return this.server.serviceType === ServerServiceType.SelfManaged
      && !this.snapshotProcessing
      && !this.server.isProcessing
      && (!isNullOrEmpty(this.serverSnapshotsSubscription)
        && this.serverSnapshotsSubscription.closed);
  }

  private _snapshotProcessing: boolean = false;
  public get snapshotProcessing(): boolean {
    return !this.hasSnapshot ? false :
      this.server.snapshots[0].isProcessing ||
      this._snapshotProcessing;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  constructor(
    _serversResourcesRepository: ServersResourcesRespository,
    _serversRepository: ServersRepository,
    _serversService: ServersService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    private _notificationsEventService: McsNotificationEventsService,
    private _dialogService: McsDialogService
  ) {
    super(
      _serversResourcesRepository,
      _serversRepository,
      _serversService,
      _serverService,
      _changeDetectorRef,
      _textProvider
    );
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.backups;
    this.createJobSnapshotSubscription = this._notificationsEventService
      .createServerSnapshot
      .subscribe(this._onUpdateServerSnapshot.bind(this));
    this.restoreJobSnapshotSubscription = this._notificationsEventService
      .applyServerSnapshot
      .subscribe(this._onUpdateServerSnapshot.bind(this));
    this.deleteJobSnapshotSubscription = this._notificationsEventService
      .deleteServerSnapshot
      .subscribe(this._onUpdateServerSnapshot.bind(this));
    this.initialize();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.serverResourceSubscription);
    unsubscribeSafely(this.serverSnapshotsSubscription);
    unsubscribeSafely(this.createSnapshotSubscription);
    unsubscribeSafely(this.deleteSnapshotSubscription);
    unsubscribeSafely(this.restoreSnapshotSubscription);
    unsubscribeSafely(this.createJobSnapshotSubscription);
    unsubscribeSafely(this.restoreJobSnapshotSubscription);
    unsubscribeSafely(this.deleteJobSnapshotSubscription);
    this.dispose();
  }

  /**
   * Convert the given date into standard format of string
   * @param date Date to be converted
   */
  public convertDateToString(date: Date): string {
    return convertDateToStandardString(date);
  }

  /**
   * Create snapshot based on server details
   */
  public createSnapshot(): void {
    // For sufficient storage show the creation dialog
    this._showDialog(SnapshotDialogType.Create, () => {
      this.createSnapshotSubscription = this._serversService
        .createServerSnapshot(this.server.id, {
          preserveState: true,
          preserveMemory: true,
          clientReferenceObject: {
            serverId: this.server.id
          }
        })
        .catch((error) => {
          this._serversService.clearServerSpinner(this.server, this.snapshot);
          return Observable.throw(error);
        })
        .subscribe(() => {
          // Subscribe to execute the service
        });
    });
  }

  /**
   * Restore snapshot based on server snapshot details
   * @param snapshot Snapshot to be restored
   */
  public restoreSnapshot(snapshot: ServerSnapshot) {
    if (isNullOrEmpty(snapshot)) { return; }

    this._showDialog(SnapshotDialogType.Restore, () => {
      this.restoreSnapshotSubscription = this._serversService
        .restoreServerSnapshot(this.server.id, {
          serverId: this.server.id
        })
        .catch((error) => {
          this._serversService.clearServerSpinner(this.server, this.snapshot);
          return Observable.throw(error);
        })
        .subscribe(() => {
          // Subscribe to execute the service
        });
    }, snapshot);
  }

  /**
   * Delete the existing snapshot of the server
   * @param snapshot Snapshot to be deleted
   */
  public deleteSnapshot(snapshot: ServerSnapshot) {
    if (isNullOrEmpty(snapshot)) { return; }

    this._showDialog(SnapshotDialogType.Delete, () => {
      this.deleteSnapshotSubscription = this._serversService
        .deleteServerSnapshot(this.server.id, {
          serverId: this.server.id
        })
        .catch((error) => {
          this._serversService.clearServerSpinner(this.server, this.snapshot);
          return Observable.throw(error);
        })
        .subscribe(() => {
          // Subscribe to execute the service
        });
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
      dialogData.snapshotName = convertDateToStandardString(_snapshot.createdOn);
    }
    dialogData.vdcName = this.server.serviceId;

    // Set the dialog component instance and the callback function
    switch (dialogType) {
      case SnapshotDialogType.Create:
        dialogComponent = CreateSnapshotDialogComponent;
        // TODO: Add checking for insufficient storage here
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
   * Event that emits when either updating or deleting a server snapshot
   * @param job Emitted job content
   */
  private _onUpdateServerSnapshot(job: McsApiJob): void {
    let notTheActiveServer = isNullOrEmpty(job) || this.server.id !==
      job.clientReferenceObject.serverId;
    if (notTheActiveServer) { return; }

    // We need to set the processing flag manually here in order to cater
    // from moving one server to another
    this._snapshotProcessing = job.dataStatus === McsDataStatus.InProgress;

    // Update the server snapshot
    if (job.dataStatus === McsDataStatus.Success) {
      this._getServerSnapshots();
    }
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
      .catch((error) => {
        // Handle common error status code
        this.dataStatusFactory.setError();
        return Observable.throw(error);
      })
      .subscribe((response) => {
        // Subscribe to update the snapshots in server instance
        this.dataStatusFactory.setSuccesfull(response);
        this._changeDetectorRef.markForCheck();
      });
  }
}
