import {
  of,
  throwError,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsJob,
  McsResourceMedia,
  McsResourceMediaServer,
  McsServer
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogConfirmation,
  DialogService
} from '@app/shared';
import {
  addOrUpdateArrayRecord,
  createObject,
  deleteArrayRecord,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  Guid
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { MediaManageServers } from '../../shared';
import { MediumDetailsBase } from '../medium-details.base';
import { MediumService } from '../medium.service';

const SERVER_MEDIA_NEW_ID = Guid.newGuid().toString();

@Component({
  selector: 'mcs-medium-servers',
  templateUrl: './medium-servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediumServersComponent extends MediumDetailsBase implements OnInit, OnDestroy {
  public readonly serversDataSource: McsTableDataSource2<McsResourceMediaServer>;
  public readonly serversColumns: McsFilterInfo[];

  public manageServers: MediaManageServers;

  private _newAttachServer: McsResourceMediaServer;
  private _detachedServer: McsResourceMediaServer;
  private _inProgressServerId: string;
  private _mediaInProgressByJob: boolean = false;

  private _destroySubject = new Subject<void>();
  private _serverDatasourceChange = new BehaviorSubject<McsResourceMediaServer[]>(null);
  private _serverDatasourceCache: Observable<McsResourceMediaServer[]>;

  private _attachMediaHandler: Subscription;
  private _detachMediaHandler: Subscription;

  constructor(
    _mediumService: MediumService,
    private _eventDispatcher: EventBusDispatcherService,
    private _apiService: McsApiService,
    private _dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
  ) {
    super(_mediumService);

    this.serversDataSource = new McsTableDataSource2(this._getMediaServers.bind(this));
    this.serversColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'name' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'action' })
    ];
    this.serversDataSource.registerColumnsFilterInfo(this.serversColumns);
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

  public mediaIsProcessing(media: McsResourceMedia): boolean {
    return (media.isProcessing && this._mediaInProgressByJob) ||
      !media.isReady;
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
      'mediaServers.detachDialog.message', { server_name: attachedServer.name }
    );
    let dialogTitle = this._translateService.instant('mediaServers.detachDialog.title');

    let dialogData = {
      data: attachedServer,
      type: 'warning',
      title: dialogTitle,
      message: dialogMessage
    } as DialogConfirmation<McsResourceMediaServer>;

    let detachDialogRef = this._dialogService.openConfirmation(dialogData);

    detachDialogRef.afterClosed().pipe(
      tap((response) => {
        if (isNullOrEmpty(response)) { return; }
        this._detachServer(medium, response.id);
      })
    ).subscribe();
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
   * Get attached servers from media API
   */
  private _getAttachedServers(medium: McsResourceMedia) {
    return this._apiService.getMediaServers(medium.id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection))
    );
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
    this._apiService.detachServerMedia(
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
    this._apiService.attachServerMedia(
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
      McsEvent.jobServerMediaAttach, this._onAttachServerMedia.bind(this)
    );

    this._detachMediaHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobServerMediaDetach, this._onDetachServerMedia.bind(this)
    );

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.jobServerMediaAttach);
    this._eventDispatcher.dispatch(McsEvent.jobServerMediaDetach);
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
      this._mediaInProgressByJob = false;
      this._changeDetectorRef.markForCheck();
      return;
    }

    // Add in progress job
    this._newAttachServer = new McsResourceMedia();
    this._newAttachServer.id = SERVER_MEDIA_NEW_ID;
    this._newAttachServer.name = job.clientReferenceObject.serverName;
    this._updateTableDataSource();
    this._mediaInProgressByJob = true;
    this._changeDetectorRef.markForCheck();
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
      this._updateTableDataSource();
      this._detachedServer = null;
      this._inProgressServerId = null;
      this._mediaInProgressByJob = false;
      this._changeDetectorRef.markForCheck();
      return;
    }

    // Add in progress jobs
    this._inProgressServerId = job.clientReferenceObject.serverId;
    this._detachedServer = new McsResourceMedia();
    this._detachedServer.id = this._inProgressServerId;
    this._detachedServer.name = job.clientReferenceObject.serverName;
    this._mediaInProgressByJob = true;
    this._changeDetectorRef.markForCheck();
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
      tableDataSource = this._addAttachedServerInDataSource(tableDataSource);
    }

    let hasDetachedRecord = !isNullOrEmpty(this._detachedServer) && !isNullOrEmpty(tableDataSource);
    if (hasDetachedRecord) {
      tableDataSource = this._removeDetachedServerInDataSource(tableDataSource);
    }

    tableDataSource.pipe(
      take(1),
      tap(dataRecords => this._serverDatasourceChange.next(dataRecords || []))
    ).subscribe();
  }

  private _addAttachedServerInDataSource(tableDataSource: Observable<McsResourceMediaServer[]>):
    Observable<McsResourceMediaServer[]> {
    return tableDataSource.pipe(
      map((servers) => {
        servers = addOrUpdateArrayRecord(servers, this._newAttachServer, false,
          (item) => item.id === SERVER_MEDIA_NEW_ID);
        return servers;
      })
    );
  }

  private _removeDetachedServerInDataSource(tableDataSource: Observable<McsResourceMediaServer[]>):
    Observable<McsResourceMediaServer[]> {
    return tableDataSource.pipe(
      map((servers) => {
        servers = deleteArrayRecord(servers, (item) => item.id === this._detachedServer.id);
        return servers;
      })
    );
  }

  private _getMediaServers(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsResourceMediaServer>> {
    return this._serverDatasourceChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => new McsMatTableContext(response, response?.length))
    );
  }
}
