import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  throwError,
  Subject
} from 'rxjs';
import {
  catchError,
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsDialogService,
  McsErrorHandlerService,
  McsNotificationEventsService,
  CoreDefinition
} from '@app/core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '@app/utilities';
import {
  TableDataSource,
  DialogWarningComponent,
  DialogWarningData
} from '@app/shared';
import {
  McsJob,
  McsDataStatus,
  McsResourceMediaServer,
  McsServer
} from '@app/models';
import {
  MediaApiService,
  MediaRepository
} from '@app/services';
import { MediumService } from '../medium.service';
import { MediumDetailsBase } from '../medium-details.base';
import { MediaManageServers } from '../../shared';

@Component({
  selector: 'mcs-medium-servers',
  templateUrl: './medium-servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediumServersComponent extends MediumDetailsBase implements OnInit, OnDestroy {
  public textContent: any;
  public serversColumns: string[];
  public serversDataSource: TableDataSource<McsResourceMediaServer>;
  public manageServers: MediaManageServers;

  private _inProgressServerId: any;
  private _newAttachServer: McsResourceMediaServer;
  private _destroySubject = new Subject<void>();

  constructor(
    _mediumService: MediumService,
    private _mediaService: MediaApiService,
    private _mediaRepository: MediaRepository,
    private _dialogService: McsDialogService,
    private _errorHandlerService: McsErrorHandlerService,
    private _notificationEvents: McsNotificationEventsService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
  ) {
    super(_mediumService);
    this._newAttachServer = new McsResourceMediaServer();
    this.serversColumns = new Array();
    this.serversDataSource = new TableDataSource([]);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.media.medium.servers;
    super.initializeBase();
    this._setDataColumns();
    this._registerJobEvents();
  }

  public ngOnDestroy() {
    super.destroyBase();
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
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
  public showDetachDialog(attachedServer: McsResourceMediaServer): void {
    let dialogData = {
      data: attachedServer,
      title: this.textContent.detachDialog.title,
      message: replacePlaceholder(
        this.textContent.detachDialog.message,
        'server_name', attachedServer.name)
    } as DialogWarningData<McsResourceMediaServer>;

    let detachDialogRef = this._dialogService
      .open(DialogWarningComponent, {
        data: dialogData,
        size: 'medium'
      });

    detachDialogRef.afterClosed()
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this._detachServer(response.id);
      });
  }

  /**
   * Returns true when inputted server is currently in-progress
   * @param server SERVER to be checked
   */
  public serverIsInProgress(server: McsResourceMediaServer): boolean {
    if (isNullOrEmpty(server)) { return false; }
    return server.id === this._inProgressServerId;
  }

  /**
   * Attach server to the existing media
   */
  public attachServer(): void {
    if (isNullOrEmpty(this.selectedMedium) || !this.manageServers.valid) {
      throw new Error(`No selected server to attached`);
    }
    this._attachServer(this.manageServers.server);
  }

  /**
   * Event that will automatically invoked when the medium selection has been changed
   */
  protected mediumSelectionChange(): void {
    this._initializeDataSource();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.serversColumns = Object.keys(this.textContent.columnHeaders);
    if (isNullOrEmpty(this.serversColumns)) {
      throw new Error('column definition for disks was not defined');
    }
  }

  /**
   * Initializes the data source of the nics table
   */
  private _initializeDataSource(): void {
    this.serversDataSource = new TableDataSource(this._getAttachedServers());
  }

  /**
   * Get attached servers from media API
   */
  private _getAttachedServers() {
    return this._mediaRepository.findMediaServers(this.selectedMedium);
  }

  /**
   * Detaches the server from the media
   */
  private _detachServer(selectedServerId: any): void {
    if (isNullOrEmpty(selectedServerId)) { return; }
    let expectedJobObject = {
      mediaId: this.selectedMedium.id,
      serverId: selectedServerId
    };

    this.setSelectedMediumState(true);
    this._mediaService.detachServerMedia(
      selectedServerId, this.selectedMedium.id,
      { clientReferenceObject: expectedJobObject }
    )
      .pipe(
        catchError((error) => {
          this.setSelectedMediumState(false);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Attaches the server to the current media
   */
  private _attachServer(serverDetails: McsServer): void {
    if (isNullOrEmpty(serverDetails)) { return; }
    let expectedJobObject = {
      mediaId: this.selectedMedium.id,
      serverId: serverDetails.id,
      serverName: serverDetails.name
    };

    this.setSelectedMediumState(true);
    this._mediaService.attachServerMedia(
      serverDetails.id,
      {
        name: this.selectedMedium.name,
        clientReferenceObject: expectedJobObject
      })
      .pipe(
        catchError((error) => {
          this.setSelectedMediumState(false);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Registers jobs/notifications events
   */
  private _registerJobEvents(): void {
    this._notificationEvents.attachServerMediaEvent
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onAttachServerMedia.bind(this));

    this._notificationEvents.detachServerMediaEvent
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onDetachServerMedia.bind(this));
  }

  /**
   * Event that emits when the attach media has an on-going job
   * @param job Job to be checked for an existing process
   */
  private _onAttachServerMedia(job: McsJob): void {
    if (!this.isMediaActive(job)) { return; }

    switch (job.dataStatus) {
      case McsDataStatus.InProgress:
        this._newAttachServer.name = job.clientReferenceObject.serverName;
        this.serversDataSource.addRecord(this._newAttachServer);
        break;

      case McsDataStatus.Success:
        this.mediumSelectionChange();
      case McsDataStatus.Error:
      default:
        this.serversDataSource.deleteRecord(this._newAttachServer);
        break;
    }
  }

  /**
   * Event that emits when the detach media has an on-going job
   * @param job Job to be checked for an existing process
   */
  private _onDetachServerMedia(job: McsJob): void {
    if (!this.isMediaActive(job)) { return; }

    // Refresh the data when the serevr in-progress is already completed
    let inProgressServerId = !isNullOrEmpty(this._inProgressServerId)
      && job.dataStatus === McsDataStatus.Success;
    if (inProgressServerId) { this.mediumSelectionChange(); }

    // Set the inprogress server ID to be checked
    this._inProgressServerId = job.dataStatus === McsDataStatus.InProgress ?
      job.clientReferenceObject.serverId : undefined;
    this._changeDetectorRef.markForCheck();
  }
}
