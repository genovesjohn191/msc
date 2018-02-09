import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import {
  McsDialogService,
  McsTextContentProvider,
  CoreDefinition
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

  public textContent: any;
  public serverSnapshotsSubscription: Subscription;
  public createSnapshotSubscription: Subscription;
  public deleteSnapshotSubscription: Subscription;
  public restoreSnapshotSubscription: Subscription;

  /**
   * Spanshot details of the currently selected server
   */
  public get snapshots(): ServerSnapshot[] {
    return !isNullOrEmpty(this.server) ? this.server.snapshots : new Array();
  }

  public get hasSnapshot(): boolean {
    return !isNullOrEmpty(this.snapshots);
  }

  public get enabledActions(): boolean {
    return this.server.serviceType === ServerServiceType.SelfManaged;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    _serversResourcesRepository: ServersResourcesRespository,
    _serversService: ServersService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    private _dialogService: McsDialogService,
    private _serversRepository: ServersRepository,
  ) {
    super(
      _serversResourcesRepository,
      _serversService,
      _serverService,
      _changeDetectorRef,
      _textProvider
    );
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.backups;
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.serverResourceSubscription);
    unsubscribeSafely(this.serverSnapshotsSubscription);
    unsubscribeSafely(this.createSnapshotSubscription);
    unsubscribeSafely(this.deleteSnapshotSubscription);
    unsubscribeSafely(this.restoreSnapshotSubscription);
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
        // Invoke function pointer for the corresponding action
        dialogCallback();
      }
    });
  }

  /**
   * This will get all the snapshots from the server
   */
  private _getServerSnapshots(): void {
    this.serverSnapshotsSubscription = this._serversRepository
      .findAllSnapshots(this.server)
      .subscribe(() => {
        // Subscribe to update the snapshots in server instance
      });
  }
}
