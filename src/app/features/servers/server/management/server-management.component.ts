import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subscription,
  Subject,
  throwError
} from 'rxjs';
import {
  takeUntil,
  startWith,
  catchError
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsErrorHandlerService,
  CoreDefinition,
  McsDialogService,
  McsNotificationEventsService,
  McsDataStatusFactory,
  CoreRoutes
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  animateFactory,
  unsubscribeSubject,
  getEncodedUrl,
  getSafeProperty
} from '@app/utilities';
import {
  CatalogItemType,
  IpAllocationMode,
  McsJob,
  DataStatus,
  RouteKey,
  McsServerUpdate,
  McsServerMedia
} from '@app/models';
import {
  DetachMediaDialogComponent,
  ServerManageScale
} from '../../shared';
import {
  ServersApiService,
  ServersRepository,
  ResourcesRepository
} from '@app/services';
import { ServerDetailsBase } from '../server-details.base';
import { ServerService } from '../server.service';

// Enumeration
export enum ServerManagementView {
  None = 0,
  ManageScale = 1,
  ManageMedia = 2
}

@Component({
  selector: 'mcs-server-management',
  templateUrl: './server-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'block'
  }
})

export class ServerManagementComponent extends ServerDetailsBase implements OnInit, OnDestroy {
  public textContent: any;
  public manageScale: ServerManageScale;
  public scaleInProgress: boolean;
  public serversTextContent: any;
  public serverThumbnail: string;
  public serverManagementView: ServerManagementView;
  public mediaStatusFactory: McsDataStatusFactory<McsServerMedia[]>;
  public selectedMedia: McsServerMedia;

  private _newMedia: McsServerMedia;
  private _resourceMedias: McsServerMedia[];
  private _serverMediaSubscription: Subscription;
  private _serverThumbnailSubscription: Subscription;
  private _computeSubscription: Subscription;
  private _destroySubject = new Subject<void>();
  private _detachingMediaId: string;

  public get consoleIconKey(): string {
    return CoreDefinition.ASSETS_SVG_DOS_PROMPT_GREY;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
  }

  public get ejectIconKey(): string {
    return CoreDefinition.ASSETS_SVG_EJECT_BLACK;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Returns the enum type of the server management view
   */
  public get serverManagementViewEnum(): any {
    return ServerManagementView;
  }

  /**
   * Returns the enum type of the ip allocation mode
   */
  public get ipAllocationModeEnum(): any {
    return IpAllocationMode;
  }

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    _changeDetectorRef: ChangeDetectorRef,
    _resourcesRepository: ResourcesRepository,
    _serversRepository: ServersRepository,
    _serversService: ServersApiService,
    _serverService: ServerService,
    _textProvider: McsTextContentProvider,
    _errorHandlerService: McsErrorHandlerService,
    private _dialogService: McsDialogService,
    private _notificationEvents: McsNotificationEventsService
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
    this.manageScale = new ServerManageScale();
    this.mediaStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.management;
    this.serversTextContent = this._textProvider.content.servers;
    this.initialize();
    this._registerJobEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSubject(this._destroySubject);
    unsubscribeSafely(this._serverMediaSubscription);
    unsubscribeSafely(this._serverThumbnailSubscription);
    unsubscribeSafely(this._computeSubscription);
  }

  /**
   * Returns the resource media items by catalogs
   *
   * `@Note`: All medias created doesn't have id, be carefull in using them
   */
  public get resourceMedias(): McsServerMedia[] {
    return this._resourceMedias;
  }

  /**
   * Returns all the server medias including the newly created media as a mock data
   */
  public get serverMedia(): McsServerMedia[] {
    return isNullOrEmpty(this._newMedia) ||
      isNullOrEmpty(this.server.media) ?
      this.server.media :
      [...this.server.media, this._newMedia];
  }

  /**
   * Returns true when the attach media button should be enabled
   */
  public get attachMediaEnabled(): boolean {
    return isNullOrEmpty(this.serverMedia)
      && this.server.executable
      && !isNullOrEmpty(this.resourceMedias);
  }

  /**
   * Navigate details tab into given key route
   * @param keyRoute Keyroute where to navigate
   */
  public navigateServerDetailsTo(keyRoute: RouteKey): void {
    this._router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.ServerDetail),
      this.server.id,
      CoreRoutes.getNavigationPath(keyRoute)
    ]);
  }

  /**
   * Event that emits when the scale has been cancelled
   */
  public onCancelScale(): void {
    this.navigateServerDetailsTo(RouteKey.ServerDetailManagement);
    this.setViewMode(ServerManagementView.None);
  }

  /**
   * Event that emits when data in scale component has been changed
   * @param manageScale Manage Scale content
   */
  public onScaleChanged(manageScale: ServerManageScale): void {
    if (isNullOrEmpty(manageScale)) { return; }
    this.manageScale = manageScale;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * View the console page
   */
  public viewConsole(): void {
    let percentOffset = 80 / 100;
    let offsetedScreenHeight = percentOffset * +screen.height;
    let offsetedScreenWidth = percentOffset * +screen.width;
    let windowFeatures = `directories=yes,titlebar=no,toolbar=no,
      status=no,menubar=no,resizable=yes,scrollbars=yes,
      left=0,top=0,
      width=${offsetedScreenWidth},
      height=${offsetedScreenHeight}`;

    window.open(`${CoreRoutes.getNavigationPath(RouteKey.Console)}/${this.server.id}`,
      this.server.id, windowFeatures);
  }

  /**
   * Returns true when the provided media is detaching
   * @param media Media to be checked
   */
  public mediaIsDetaching(media: McsServerMedia): boolean {
    if (isNullOrEmpty(media)) { return false; }
    return media.id === this._detachingMediaId;
  }

  /**
   * Updates the scale of the current server
   */
  public updateScale(): void {
    if (isNullOrEmpty(this.server)) { return; }

    // Set initial server status so that the spinner will show up immediately
    this._serversService.setServerSpinner(this.server);
    this.setViewMode(ServerManagementView.None);
    this._serversService.updateServerCompute(
      this.server.id,
      {
        memoryMB: this.manageScale.memoryMB,
        cpuCount: this.manageScale.cpuCount,
        clientReferenceObject: {
          serverId: this.server.id,
          memoryMB: this.manageScale.memoryMB,
          cpuCount: this.manageScale.cpuCount
        }
      } as McsServerUpdate)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(this.server);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Shows the detach media dialog box
   * @param media Media to be displayed in dialog box
   */
  public showDetachMediaDialog(media: McsServerMedia): void {
    if (isNullOrEmpty(media)) { return; }
    let dialogRef = this._dialogService
      .open(DetachMediaDialogComponent, {
        data: media,
        size: 'medium'
      });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) { this.detachMedia(media); }
    });
  }

  /**
   * Attach media from the selected server
   * @param media Media to be attached
   */
  public attachMedia(media: McsServerMedia): void {
    if (isNullOrEmpty(media)) { return; }
    // Set reference object to be expected
    let expectedJobObject = {
      mediaName: media.name,
      serverId: this.server.id
    };

    // Set initial server status so that the spinner will show up immediately
    this._serversService.setServerSpinner(this.server);
    this.setViewMode(ServerManagementView.None);
    this._serversService.attachServerMedia(
      this.server.id,
      {
        name: media.name,
        clientReferenceObject: expectedJobObject
      })
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(this.server);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Detaches the media from the selected server
   * @param media Media to be detached
   */
  public detachMedia(media: McsServerMedia): void {
    if (isNullOrEmpty(media)) { return; }
    // Set reference object to be expected
    let expectedJobObject = {
      mediaId: media.id,
      serverId: this.server.id
    };

    // Set initial server status so that the spinner will show up immediately
    this._serversService.setServerSpinner(this.server);
    this._serversService.detachServerMedia(
      this.server.id, media.id,
      { clientReferenceObject: expectedJobObject })
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(this.server);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Sets the method type of server management type
   * @param viewMode View mode to be set as displayed
   */
  public setViewMode(viewMode: ServerManagementView) {
    this.serverManagementView = viewMode;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected serverSelectionChanged(): void {
    this._getServerThumbnail();
    this._getResourceCompute();
    this._getResourceMedia();
    this._getServerMedia();
    this._checkScaleParamMode();
  }

  /**
   * Get the current server thumbnail
   */
  private _getServerThumbnail(): void {
    this.serverThumbnail = undefined;
    if (isNullOrEmpty(this.server)) { return; }

    this._serverThumbnailSubscription = this._serversService
      .getServerThumbnail(this.server.id)
      .subscribe((response) => {
        let thumbnailDetails = getSafeProperty(response, (obj) => obj.content);
        if (isNullOrEmpty(thumbnailDetails)) { return; }

        this.serverThumbnail = getEncodedUrl(
          thumbnailDetails.file,
          thumbnailDetails.fileType,
          thumbnailDetails.encoding);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Get the server media
   */
  private _getServerMedia(): void {
    unsubscribeSafely(this._serverMediaSubscription);

    this.mediaStatusFactory.setInProgress();
    this._serverMediaSubscription = this._serversRepository
      .findServerMedias(this.server)
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this.mediaStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe(() => {
        this.mediaStatusFactory.setSuccessful(this.serverMedia);
      });
  }

  /**
   * Get the server resource compute
   */
  private _getResourceCompute(): void {
    let resourceId = getSafeProperty(this.serverResource, (obj) => obj.id);
    if (isNullOrEmpty(resourceId)) { return; }

    this._computeSubscription = this._resourcesRespository
      .findResourceCompute(this.serverResource)
      .subscribe();
  }

  /**
   * Get the resource media list
   */
  private _getResourceMedia(): void {
    let resourceCatalogs = getSafeProperty(this.serverResource, (obj) => obj.catalogItems);
    if (isNullOrEmpty(resourceCatalogs)) { return; }

    this._resourceMedias = new Array();
    resourceCatalogs.forEach((catalog) => {
      if (catalog.itemType !== CatalogItemType.Media) { return; }
      let media = new McsServerMedia();
      media.name = catalog.itemName;
      this._resourceMedias.push(media);
    });
  }

  /**
   * Check scale parameter mode
   */
  private _checkScaleParamMode(): void {
    this._activatedRoute.queryParams
      .pipe(takeUntil(this._destroySubject))
      .subscribe((params: ParamMap) => {
        if (!isNullOrEmpty(params['scale'])) {
          this.setViewMode(ServerManagementView.ManageScale);
        }
      });
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
    this._notificationEvents.attachServerMediaEvent
      .pipe(startWith(null!), takeUntil(this._destroySubject))
      .subscribe(this._onAttachMedia.bind(this));

    this._notificationEvents.detachServerMediaEvent
      .pipe(startWith(null!), takeUntil(this._destroySubject))
      .subscribe(this._onDetachMedia.bind(this));

    this._notificationEvents.updateServerComputeEvent
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onUpdateServerCompute.bind(this));
  }

  /**
   * Event that emits when updating scale server
   * @param job Emitted job content
   */
  private _onUpdateServerCompute(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    switch (job.dataStatus) {
      case DataStatus.InProgress:
        this.scaleInProgress = true;
        break;

      case DataStatus.Success:
        this._updateServerComputeByJob(job);
        this.refreshServerResource();
      case DataStatus.Error:
      default:
        this.scaleInProgress = false;
        break;
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Update the server compute data based on the job
   */
  private _updateServerComputeByJob(job: McsJob): void {
    let referenceObject = getSafeProperty(job, (obj) => obj.clientReferenceObject);
    if (isNullOrEmpty(referenceObject)) { return; }

    this.server.compute.memoryMB = referenceObject.memoryMB;
    if (this.server.compute.cpuCount > 1) {
      this.server.compute.cpuCount = referenceObject.cpuCount;
    } else {
      this.server.compute.coreCount = referenceObject.cpuCount;
    }
  }

  /**
   * Event that emits when attaching media content
   * @param job Emitted job content
   */
  private _onAttachMedia(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }
    switch (job.dataStatus) {
      case DataStatus.InProgress:
        this._addMockMedia(job);
        break;

      case DataStatus.Success:
        this.refreshServerResource();
      case DataStatus.Error:
      default:
        this._newMedia = undefined;
        break;
    }

    // Update the media status factory to see the actual data
    if (!isNullOrEmpty(this.mediaStatusFactory)) {
      this.mediaStatusFactory.setSuccessful(this.serverMedia);
    }
  }

  /**
   * Event that emits when detaching media content
   * @param job Emitted job content
   */
  private _onDetachMedia(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Refresh the data when the detaching media was already completed
    let detachingMediaEnded = !isNullOrEmpty(this._detachingMediaId)
      && job.dataStatus === DataStatus.Success;
    if (detachingMediaEnded) { this.refreshServerResource(); }

    // Set the inprogress media ID to be checked
    this._detachingMediaId = job.dataStatus === DataStatus.InProgress ?
      job.clientReferenceObject.mediaId : undefined;
  }

  /**
   * Add mock media for the server
   * @param job Emitted job content
   */
  private _addMockMedia(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Mock media data based on job response
    this._newMedia = new McsServerMedia();
    this._newMedia.name = job.clientReferenceObject.mediaName;
    this._changeDetectorRef.markForCheck();
  }
}
