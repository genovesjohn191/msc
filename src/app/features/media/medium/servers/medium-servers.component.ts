import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  throwError,
  Subscription,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  tap,
  map
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsDialogService,
  McsTableDataSource,
  CoreEvent,
  McsGuid
} from '@app/core';
import {
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import {
  DialogConfirmationComponent,
  DialogConfirmation
} from '@app/shared';
import {
  McsJob,
  McsResourceMediaServer,
  McsServer,
  McsResourceMedia
} from '@app/models';
import { McsMediaRepository } from '@app/services';
import { MediumService } from '../medium.service';
import { MediumDetailsBase } from '../medium-details.base';
import { MediaManageServers } from '../../shared';

const SERVER_MEDIA_NEW_ID = McsGuid.newGuid().toString();

@Component({
  selector: 'mcs-medium-servers',
  templateUrl: './medium-servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediumServersComponent extends MediumDetailsBase implements OnInit, OnDestroy {
  public serversColumns: string[];
  public serversDataSource: McsTableDataSource<McsResourceMediaServer>;
  public manageServers: MediaManageServers;

  private _newAttachServer: McsResourceMediaServer;
  private _inProgressServerId: string;
  private _serverDatasourceCache: Observable<McsResourceMediaServer[]>;

  private _attachMediaHandler: Subscription;
  private _detachMediaHandler: Subscription;

  constructor(
    _mediumService: MediumService,
    private _eventDispatcher: EventBusDispatcherService,
    private _mediaRepository: McsMediaRepository,
    private _dialogService: McsDialogService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
  ) {
    super(_mediumService);
    this.serversColumns = [];
    this.serversDataSource = new McsTableDataSource();
    this._setDataColumns();
  }

  public ngOnInit() {
    super.initializeBase();
    this._registerEvents();
  }

  public ngOnDestroy() {
    super.destroyBase();
    unsubscribeSafely(this._attachMediaHandler);
    unsubscribeSafely(this._detachMediaHandler);
  }

  /**
   * Event that emits when the selection of the attach server has been changed
   * @param _manageServer Manage Server data to be emitted
   */
  public onChangeManageServers(_manageServer: MediaManageServers): void {
    if (isNullOrEmpty(_manageServer)) { return; }
    this.manageServers = _manageServer;
  }

  /**
   * Shows the detach server dialog
   * @param server Server to be detached
   */
  public showDetachDialog(medium: McsResourceMedia, attachedServer: McsResourceMediaServer): void {
    let dialogMessage = this._translateService.instant(
      'mediaMedium.servers.detachDialog.message', { server_name: attachedServer.name }
    );
    let dialogTitle = this._translateService.instant('mediaMedium.servers.detachDialog.title');

    let dialogData = {
      data: attachedServer,
      type: 'warning',
      title: dialogTitle,
      message: dialogMessage
    } as DialogConfirmation<McsResourceMediaServer>;

    let detachDialogRef = this._dialogService.open(DialogConfirmationComponent, {
      data: dialogData,
      size: 'medium'
    });

    detachDialogRef.afterClosed().subscribe((response) => {
      if (isNullOrEmpty(response)) { return; }
      this._detachServer(medium, response.id);
    });
  }

  /**
   * Returns true when inputted server is currently in-progress
   * @param server SERVER to be checked
   */
  public serverIsInProgress(server: McsResourceMediaServer): boolean {
    if (isNullOrEmpty(server)) { return false; }
    let newServerId = getSafeProperty(this._newAttachServer, (obj) => obj.id);
    return server.id === newServerId || server.id === this._inProgressServerId;
  }

  /**
   * Attach server to the existing media
   */
  public attachServer(medium: McsResourceMedia): void {
    if (isNullOrEmpty(medium) || !this.manageServers.valid) {
      throw new Error(`No selected server to attached`);
    }
    this._attachServer(medium, this.manageServers.server);
  }

  /**
   * Event that will automatically invoked when the medium selection has been changed
   */
  protected mediumSelectionChange(medium: McsResourceMedia): void {
    this._updateTableDataSource(medium);
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.serversColumns = Object.keys(
      this._translateService.instant('mediaMedium.servers.columnHeaders')
    );
    if (isNullOrEmpty(this.serversColumns)) {
      throw new Error('column definition for disks was not defined');
    }
  }

  /**
   * Get attached servers from media API
   */
  private _getAttachedServers(medium: McsResourceMedia) {
    return this._mediaRepository.getMediaServers(medium);
  }

  /**
   * Detaches the server from the media
   */
  private _detachServer(medium: McsResourceMedia, selectedServerId: any): void {
    if (isNullOrEmpty(selectedServerId)) { return; }
    let expectedJobObject = {
      mediaId: medium.id,
      serverId: selectedServerId
    };

    this.setSelectedMediumState(medium, true);
    this._mediaRepository.detachServerMedia(
      selectedServerId, medium.id,
      { clientReferenceObject: expectedJobObject }
    ).pipe(
      catchError((error) => {
        this.setSelectedMediumState(medium, false);
        return throwError(error);
      })
    ).subscribe();
  }

  /**
   * Attaches the server to the current media
   */
  private _attachServer(medium: McsResourceMedia, serverDetails: McsServer): void {
    if (isNullOrEmpty(serverDetails)) { return; }
    let expectedJobObject = {
      mediaId: medium.id,
      serverId: serverDetails.id,
      serverName: serverDetails.name
    };

    this.setSelectedMediumState(medium, true);
    this._mediaRepository.attachServerMedia(
      serverDetails.id,
      {
        name: medium.name,
        clientReferenceObject: expectedJobObject
      }).pipe(
        catchError((error) => {
          this.setSelectedMediumState(medium, false);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Registers jobs/notifications events
   */
  private _registerEvents(): void {
    this._attachMediaHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerMediaAttach, this._onAttachServerMedia.bind(this)
    );

    this._detachMediaHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerMediaDetach, this._onDetachServerMedia.bind(this)
    );

    // Invoke the event initially
    this._eventDispatcher.dispatch(CoreEvent.jobServerMediaAttach);
    this._eventDispatcher.dispatch(CoreEvent.jobServerMediaDetach);
  }

  /**
   * Event that emits when the attach media has an on-going job
   * @param job Job to be checked for an existing process
   */
  private _onAttachServerMedia(job: McsJob): void {
    let mediaIsActive = this.isMediaActiveByJob(job);
    if (!mediaIsActive) { return; }

    // Refresh everything when job is done
    if (!job.inProgress) {
      this._newAttachServer = null;
      this._serverDatasourceCache = null;
      this.initializeBase();
      this._changeDetectorRef.markForCheck();
      return;
    }

    // Add in progress job
    this._newAttachServer = new McsResourceMedia();
    this._newAttachServer.id = SERVER_MEDIA_NEW_ID;
    this._newAttachServer.name = job.clientReferenceObject.serverName;
    this._updateTableDataSource();
  }

  /**
   * Event that emits when the detach media has an on-going job
   * @param job Job to be checked for an existing process
   */
  private _onDetachServerMedia(job: McsJob): void {
    let mediaIsActive = this.isMediaActiveByJob(job);
    if (!mediaIsActive) { return; }

    // Refresh everything when job is done
    if (!job.inProgress) {
      this._inProgressServerId = null;
    }

    // Add in progress jobs
    this._inProgressServerId = job.clientReferenceObject.serverId;
  }

  /**
   * Initializes the data source of the disks table
   * @param medium Media on where to get the data source
   */
  private _updateTableDataSource(medium?: McsResourceMedia): void {
    let tempDataSource: Observable<McsResourceMediaServer[]>;
    if (!isNullOrEmpty(medium)) {
      tempDataSource = this._getAttachedServers(medium).pipe(
        tap((records) => this._serverDatasourceCache = of(records)));
    }
    let tableDataSource = isNullOrEmpty(this._serverDatasourceCache) ?
      tempDataSource : this._serverDatasourceCache;

    let hasNewRecord = !isNullOrEmpty(this._newAttachServer) && !isNullOrEmpty(tableDataSource);
    if (hasNewRecord) {
      tableDataSource = tableDataSource.pipe(
        map((result) => {
          result = addOrUpdateArrayRecord(result, this._newAttachServer, false,
            (item) => item.id === SERVER_MEDIA_NEW_ID);
          return result;
        })
      );
    }
    this.serversDataSource.updateDatasource(tableDataSource);
  }
}
