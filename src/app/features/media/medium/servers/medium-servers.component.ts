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
  McsTableDataSource
} from '@app/core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '@app/utilities';
import {
  DialogConfirmationComponent,
  DialogConfirmation
} from '@app/shared';
import {
  McsJob,
  DataStatus,
  McsResourceMediaServer,
  McsServer,
  McsResourceMedia
} from '@app/models';
import { McsMediaRepository } from '@app/services';
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
  public serversDataSource: McsTableDataSource<McsResourceMediaServer>;
  public manageServers: MediaManageServers;

  private _inProgressServerId: any;
  private _newAttachServer: McsResourceMediaServer;
  private _selectedMediumInstance: McsResourceMedia;
  private _destroySubject = new Subject<void>();

  constructor(
    _mediumService: MediumService,
    private _mediaRepository: McsMediaRepository,
    private _dialogService: McsDialogService,
    private _errorHandlerService: McsErrorHandlerService,
    private _notificationEvents: McsNotificationEventsService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
  ) {
    super(_mediumService);
    this._newAttachServer = new McsResourceMediaServer();
    this.serversColumns = new Array();
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
    let dialogData = {
      data: attachedServer,
      type: 'warning',
      title: this.textContent.detachDialog.title,
      message: replacePlaceholder(
        this.textContent.detachDialog.message,
        'server_name', attachedServer.name)
    } as DialogConfirmation<McsResourceMediaServer>;

    let detachDialogRef = this._dialogService
      .open(DialogConfirmationComponent, {
        data: dialogData,
        size: 'medium'
      });

    detachDialogRef.afterClosed()
      .subscribe((response) => {
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
    return server.id === this._inProgressServerId;
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
    this._selectedMediumInstance = medium;
    this._initializeDataSource(medium);
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
  private _initializeDataSource(medium: McsResourceMedia): void {
    this.serversDataSource = new McsTableDataSource(this._getAttachedServers(medium));
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
    )
      .pipe(
        catchError((error) => {
          this.setSelectedMediumState(medium, false);
          this._errorHandlerService.redirectToErrorPage(error.status);
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
      })
      .pipe(
        catchError((error) => {
          this.setSelectedMediumState(medium, false);
          this._errorHandlerService.redirectToErrorPage(error.status);
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
    if (!this.isMediaActive(this._selectedMediumInstance, job)) { return; }

    switch (job.dataStatus) {
      case DataStatus.InProgress:
        this._newAttachServer.name = job.clientReferenceObject.serverName;
        this.serversDataSource.addOrUpdateRecord(this._newAttachServer);
        break;

      case DataStatus.Success:
        this.mediumSelectionChange(this._selectedMediumInstance);
      case DataStatus.Error:
      default:
        this.serversDataSource.deleteRecordBy((item) => this._newAttachServer.id === item.id);
        break;
    }
  }

  /**
   * Event that emits when the detach media has an on-going job
   * @param job Job to be checked for an existing process
   */
  private _onDetachServerMedia(job: McsJob): void {
    if (!this.isMediaActive(this._selectedMediumInstance, job)) { return; }

    // Refresh the data when the serevr in-progress is already completed
    let inProgressServerId = !isNullOrEmpty(this._inProgressServerId)
      && job.dataStatus === DataStatus.Success;
    if (inProgressServerId) { this.mediumSelectionChange(this._selectedMediumInstance); }

    // Set the inprogress server ID to be checked
    this._inProgressServerId = job.dataStatus === DataStatus.InProgress ?
      job.clientReferenceObject.serverId : undefined;
    this._changeDetectorRef.markForCheck();
  }
}
