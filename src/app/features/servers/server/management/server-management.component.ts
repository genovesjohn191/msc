import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
  Injector,
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subject,
  Observable,
  Subscription
} from 'rxjs';
import {
  takeUntil,
  map
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreRoutes,
  McsServerPermission,
  McsNavigationService
} from '@app/core';
import {
  isNullOrEmpty,
  animateFactory,
  getEncodedUrl,
  unsubscribeSafely,
  convertGbToMb,
  getSafeProperty,
  CommonDefinition,
  createObject
} from '@app/utilities';
import {
  IpAllocationMode,
  McsJob,
  RouteKey,
  McsServerUpdate,
  McsServerMedia,
  McsServer,
  McsResource,
  McsResourceCatalogItem,
  McsServerThumbnail,
  McsResourceCatalog,
  McsServerAttachMedia,
  McsServerDetachMedia
} from '@app/models';
import {
  ServerManageScale,
  ServerManageMedia
} from '@app/features-shared';
import { McsEvent } from '@app/events';
import {
  DialogConfirmation,
  DialogService
} from '@app/shared';
import { ServerDetailsBase } from '../server-details.base';

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
  public serverThumbnail$: Observable<string>;
  public serverMedia$: Observable<McsServerMedia[]>;
  public resourceCatalogs$: Observable<McsResourceCatalog[]>;
  public serverPermission: McsServerPermission;

  public manageScale: ServerManageScale;
  public manageMedia: ServerManageMedia;
  public scaleInProgress: boolean;
  public serverManagementView: ServerManagementView;

  private _newMedia: McsServerMedia;
  private _destroySubject = new Subject<void>();
  private _detachingMediaId: string;

  private _attachMediaHandler: Subscription;
  private _detachMediaHandler: Subscription;
  private _updateComputeHandler: Subscription;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _dialogService: DialogService
  ) {
    super(_injector, _changeDetectorRef);
    this.manageScale = new ServerManageScale();
  }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._attachMediaHandler);
    unsubscribeSafely(this._detachMediaHandler);
    unsubscribeSafely(this._updateComputeHandler);
  }

  public get consoleIconKey(): string {
    return CommonDefinition.ASSETS_SVG_DOS_PROMPT_GREY;
  }

  public get ejectIconKey(): string {
    return CommonDefinition.ASSETS_SVG_EJECT_BLACK;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get serverManagementViewEnum(): any {
    return ServerManagementView;
  }

  public get ipAllocationModeEnum(): any {
    return IpAllocationMode;
  }

  /**
   * Navigate details tab into given key route
   * @param keyRoute Keyroute where to navigate
   */
  public navigateServerDetailsTo(server: McsServer, keyRoute: RouteKey): void {
    this._navigationService.navigateTo(RouteKey.ServerDetails,
      [server.id, CoreRoutes.getNavigationPath(keyRoute)]);
  }

  /**
   * Navigate to scale managed server page
   * @param server selected server object reference
   */
  public scaleServer(server: McsServer): void {
    if (server.isSelfManaged) {
      this.setViewMode(ServerManagementView.ManageScale);
      return;
    }
    this.eventDispatcher.dispatch(McsEvent.serverScaleManageSelected, server);
    this._navigationService.navigateTo(RouteKey.OrderServerManagedScale);
  }

  /**
   * Event that emits when the scale has been cancelled
   */
  public onCancelScale(): void {
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

  public onMediaChanged(manageMedia: ServerManageMedia): void {
    if (isNullOrEmpty(manageMedia)) { return; }
    this.manageMedia = manageMedia;
  }

  /**
   * View the console page
   */
  public viewConsole(server: McsServer): void {
    let percentOffset = 80 / 100;
    let offsetedScreenHeight = percentOffset * +screen.height;
    let offsetedScreenWidth = percentOffset * +screen.width;
    let windowFeatures = `directories=yes,titlebar=no,toolbar=no,
      status=no,menubar=no,resizable=yes,scrollbars=yes,
      left=0,top=0,
      width=${offsetedScreenWidth},
      height=${offsetedScreenHeight}`;

    window.open(
      `${CoreRoutes.getNavigationPath(RouteKey.Console)}/${server.id}`,
      server.id,
      windowFeatures
    );
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
  public updateScale(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }

    // Set initial server status so that the spinner will show up immediately
    this.setViewMode(ServerManagementView.None);

    this.apiService.updateServerCompute(
      server.id,
      createObject(McsServerUpdate, {
        memoryMB: convertGbToMb(this.manageScale.memoryGB),
        cpuCount: this.manageScale.cpuCount,
        clientReferenceObject: {
          serverId: server.id,
          memoryMB: convertGbToMb(this.manageScale.memoryGB),
          cpuCount: this.manageScale.cpuCount
        }
      })
    ).subscribe();
  }

  /**
   * Shows the detach media dialog box
   * @param media Media to be displayed in dialog box
   */
  public showDetachMediaDialog(server: McsServer, media: McsServerMedia): void {
    if (isNullOrEmpty(media)) { return; }
    let dialogData = {
      data: media,
      type: 'warning',
      title: this._translate.instant('dialogDetachMedia.title'),
      message: this._translate.instant('dialogDetachMedia.message', { media_name: media.name })
    } as DialogConfirmation<McsServerMedia>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) { this.detachMedia(server, media); }
    });
  }

  /**
   * Attach media from the selected server
   * @param catalog Catalog to be attached
   */
  public attachMedia(server: McsServer, catalog: McsResourceCatalogItem): void {
    if (isNullOrEmpty(catalog)) { return; }
    let mediaDetails = new McsServerAttachMedia();
    mediaDetails.name = catalog.name;
    mediaDetails.clientReferenceObject = {
      serverId: server.id
    };

    // Set initial server status so that the spinner will show up immediately
    this.setViewMode(ServerManagementView.None);
    this.apiService.attachServerMedia(server.id, mediaDetails).subscribe();
  }

  /**
   * Detaches the media from the selected server
   * @param server current server selected
   * @param media Media to be detached
   */
  public detachMedia(server: McsServer, media: McsServerMedia): void {
    if (isNullOrEmpty(media)) { return; }
    let mediaDetails = new McsServerDetachMedia();
    mediaDetails.clientReferenceObject = {
      serverId: server.id
    };

    // Set initial server status so that the spinner will show up immediately
    this.apiService.detachServerMedia(server.id, media.id, mediaDetails).subscribe();
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
   * Event that emits when the selected server has been changed
   * @param server Server details of the selected record
   */
  protected serverChange(server: McsServer): void {
    this.setViewMode(ServerManagementView.None);
    this.serverPermission = new McsServerPermission(server);
    this._getServerThumbnail(server);
    this._getServerMedia(server);

    let resourceId = getSafeProperty(server, (obj) => obj.platform.resourceId);
    this._getResourceCompute(resourceId);
    this._getResourceCatalogs(resourceId);

    this._checkScaleParamMode();
  }

  /**
   * Get the current server thumbnail
   */
  private _getServerThumbnail(server: McsServer): void {
    this.serverThumbnail$ = this.apiService.getServerThumbnail(server.id).pipe(
      map((thumbnailDetails) => {
        if (isNullOrEmpty(thumbnailDetails)) {
          thumbnailDetails = new McsServerThumbnail();
        }
        return getEncodedUrl(
          thumbnailDetails.file,
          thumbnailDetails.fileType,
          thumbnailDetails.encoding
        );
      })
    );
  }

  /**
   * Get the server media
   */
  private _getServerMedia(server: McsServer): void {
    this.serverMedia$ = this.apiService.getServerMedia(server.id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection))
    );
  }

  /**
   * Get the server resource compute
   */
  private _getResourceCompute(resourceId: string): void {
    if (isNullOrEmpty(resourceId)) { return; }

    this.apiService.getResourceCompute(resourceId).subscribe();
  }

  /**
   * Get the resource media list
   */
  private _getResourceCatalogs(resourceId: string): void {
    if (isNullOrEmpty(resourceId)) { return; }

    this.resourceCatalogs$ = this.apiService.getResourceCatalogs(resourceId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection))
    );
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
  private _registerEvents(): void {
    this._attachMediaHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerMediaAttach, this._onAttachMedia.bind(this)
    );

    this._detachMediaHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerMediaDetach, this._onDetachMedia.bind(this)
    );

    this._updateComputeHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobServerComputeUpdate, this._onUpdateServerCompute.bind(this)
    );

    // Invoke the event initially
    this.eventDispatcher.dispatch(McsEvent.jobServerMediaAttach);
    this.eventDispatcher.dispatch(McsEvent.jobServerMediaDetach);
    this.eventDispatcher.dispatch(McsEvent.jobServerComputeUpdate);
  }

  /**
   * Event that emits when updating scale server
   * @param job Emitted job content
   */
  private _onUpdateServerCompute(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) { this.refreshServerResource(); }
    this.scaleInProgress = job.inProgress;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when attaching media content
   * @param job Emitted job content
   */
  private _onAttachMedia(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._newMedia = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._newMedia = new McsServerMedia();
    this._newMedia.name = job.clientReferenceObject.mediaName;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when detaching media content
   * @param job Emitted job content
   */
  private _onDetachMedia(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._detachingMediaId = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._detachingMediaId = job.clientReferenceObject.mediaId;
  }
}
