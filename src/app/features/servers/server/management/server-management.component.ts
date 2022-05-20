import {
  Observable,
  Subject,
  Subscription,
  forkJoin
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  CoreRoutes,
  McsAccessControlService,
  McsNavigationService
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  ServerManageMedia,
  ServerManageScale
} from '@app/features-shared';
import {
  CatalogItemType,
  IpAllocationMode,
  McsFeatureFlag,
  McsJob,
  McsResourceCatalog,
  McsResourceCatalogItem,
  McsServer,
  McsServerAttachMedia,
  McsServerDetachMedia,
  McsServerMedia,
  McsServerThumbnail,
  McsServerUpdate,
  RouteKey
} from '@app/models';
import {
  DialogConfirmation,
  DialogService
} from '@app/shared';
import {
  animateFactory,
  convertGbToMb,
  createObject,
  getEncodedUrl,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  convertMbToGb
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

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

  private _serverPrimaryStorageProfileDisabled: boolean;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
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

  public getMinimumMemoryGB(server: McsServer): number {
    return convertMbToGb(getSafeProperty(server as McsServer, (obj) => obj.compute.memoryMB, 2));
  }

  public getMinimumCpu(server: McsServer): number {
    return getSafeProperty(server as McsServer, (obj) => obj.compute.cpuCount, 2);
  }

  public hassPermissionToViewMediaPanel(isServerDedicated: boolean): boolean {
    let hasAccessToMediaCatalog = this._accessControlService.hasAccessToFeature([McsFeatureFlag.MediaCatalog]);
    if (!hasAccessToMediaCatalog) { return; }
    let hasAccessToDedicatedVmMediaView = this._accessControlService.hasAccessToFeature([McsFeatureFlag.DedicatedVmMediaView]);
    if (!hasAccessToDedicatedVmMediaView && isServerDedicated) { return; }
    return true;
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
    this._navigationService.navigateTo(RouteKey.OrderServerManagedScale, [],
      { queryParams: {
        serverId: server.id
      }}
    );
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
        restartServer: !server.cpuHotPlugEnabled ? true: this.manageScale.restartServer,
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
      title: this._translate.instant('dialog.mediaDetach.title'),
      message: this._translate.instant('dialog.mediaDetach.message', { media_name: media.name })
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
      serverId: server.id,
      mediaId: media.id
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
    this._getServerThumbnail(server);
    this._getServerMedia(server);

    let resourceId = getSafeProperty(server, (obj) => obj.platform.resourceId);
    this._getResourceCompute(resourceId);
    this._getResourceCatalogs(resourceId);

    this._checkScaleParamMode();

    this._validateDisabledStorageProfile(resourceId, server);
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
      map((response) => {
        let catalogs = getSafeProperty(response, (obj) => obj.collection);
        let filteredCatalogs = catalogs.filter((catalog) => !isNullOrEmpty(catalog.items));
        filteredCatalogs.forEach(filteredCatalog => {
          filteredCatalog.items = filteredCatalog.items
            .filter(item => item.type === CatalogItemType.Media);
        });
        return filteredCatalogs;
      }),
      shareReplay(1)
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
   * Check whether server's primary disk resides on a disabled storage profile
   */
  private _validateDisabledStorageProfile(resourceId: string, server: McsServer): void {
      this.apiService.getResourceStorages(resourceId).pipe(
        map((response) => getSafeProperty(response, (obj) => obj))
      ).subscribe((_resourceStorage) => {

      let _serverStorage = server?.storageDevices;
      let _primaryDiskStorageProfileName = _serverStorage.find((disk) => disk.isPrimary)?.storageProfile;
      let _matchingStorageProfile = _resourceStorage.collection.find((storageProfile) => storageProfile?.name === _primaryDiskStorageProfileName);

      this._serverPrimaryStorageProfileDisabled = isNullOrEmpty(_matchingStorageProfile)?
      false : !_matchingStorageProfile?.enabled;

    });
  }

  /**
   * Returns true when server's primary disk resides on a disabled storage profile
   */
  public get isOnDisabledStorageProfile(): boolean {
    return this._serverPrimaryStorageProfileDisabled;
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
