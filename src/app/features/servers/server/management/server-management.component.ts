import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subject,
  throwError,
  Observable,
  Subscription
} from 'rxjs';
import {
  takeUntil,
  catchError,
  map
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsErrorHandlerService,
  CoreDefinition,
  McsDialogService,
  CoreRoutes,
  McsAccessControlService,
  CoreEvent
} from '@app/core';
import {
  isNullOrEmpty,
  animateFactory,
  getEncodedUrl,
  unsubscribeSafely
} from '@app/utilities';
import {
  IpAllocationMode,
  McsJob,
  RouteKey,
  McsServerUpdate,
  McsServerMedia,
  McsServer,
  McsResource,
  McsResourceCompute,
  McsResourceCatalogItem,
  McsServerThumbnail
} from '@app/models';
import {
  ServerManageScale,
  DetachMediaDialogComponent
} from '@app/features-shared';
import {
  McsServersRepository,
  McsResourcesRepository
} from '@app/services';
import { ServerDetailsBase } from '../server-details.base';
import { ServerService } from '../server.service';
import { ServersService } from '../../servers.service';

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
  public resourceCompute$: Observable<McsResourceCompute>;
  public resourceCatalogs$: Observable<McsResourceCatalogItem[]>;

  public manageScale: ServerManageScale;
  public scaleInProgress: boolean;
  public serverManagementView: ServerManagementView;
  public selectedCatalog: McsServerMedia;

  private _newMedia: McsServerMedia;
  private _destroySubject = new Subject<void>();
  private _detachingMediaId: string;

  private _attachMediaHandler: Subscription;
  private _detachMediaHandler: Subscription;
  private _updateComputeHandler: Subscription;

  constructor(
    _changeDetectorRef: ChangeDetectorRef,
    _resourcesRepository: McsResourcesRepository,
    _serversRepository: McsServersRepository,
    _serverService: ServerService,
    _errorHandlerService: McsErrorHandlerService,
    _accessControl: McsAccessControlService,
    private _router: Router,
    private _eventDispatcher: EventBusDispatcherService,
    private _serversService: ServersService,
    private _activatedRoute: ActivatedRoute,
    private _dialogService: McsDialogService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serverService,
      _changeDetectorRef,
      _errorHandlerService,
      _accessControl
    );
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
    return CoreDefinition.ASSETS_SVG_DOS_PROMPT_GREY;
  }

  public get ejectIconKey(): string {
    return CoreDefinition.ASSETS_SVG_EJECT_BLACK;
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
    this._router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.ServerDetails),
      server.id,
      CoreRoutes.getNavigationPath(keyRoute)
    ]);
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
    this._serversService.setServerSpinner(server);
    this.setViewMode(ServerManagementView.None);
    this._serversRepository.updateServerCompute(
      server.id,
      {
        memoryMB: this.manageScale.memoryGB,
        cpuCount: this.manageScale.cpuCount,
        clientReferenceObject: {
          serverId: server.id,
          memoryMB: this.manageScale.memoryGB,
          cpuCount: this.manageScale.cpuCount
        }
      } as McsServerUpdate)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server);
          this._errorHandlerService.redirectToErrorPage(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Shows the detach media dialog box
   * @param media Media to be displayed in dialog box
   */
  public showDetachMediaDialog(server: McsServer, media: McsServerMedia): void {
    if (isNullOrEmpty(media)) { return; }
    let dialogRef = this._dialogService
      .open(DetachMediaDialogComponent, {
        data: media,
        size: 'medium'
      });

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
    // Set reference object to be expected
    let expectedJobObject = {
      mediaName: catalog.itemName,
      serverId: server.id
    };

    // Set initial server status so that the spinner will show up immediately
    this._serversService.setServerSpinner(server);
    this.setViewMode(ServerManagementView.None);
    this._serversRepository.attachServerMedia(
      server.id,
      {
        name: catalog.itemName,
        clientReferenceObject: expectedJobObject
      })
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server);
          this._errorHandlerService.redirectToErrorPage(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Detaches the media from the selected server
   * @param media Media to be detached
   */
  public detachMedia(server: McsServer, media: McsServerMedia): void {
    if (isNullOrEmpty(media)) { return; }
    // Set reference object to be expected
    let expectedJobObject = {
      mediaId: media.id,
      serverId: server.id
    };

    // Set initial server status so that the spinner will show up immediately
    this._serversService.setServerSpinner(server);
    this._serversRepository.detachServerMedia(
      server.id, media.id,
      { clientReferenceObject: expectedJobObject })
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server);
          this._errorHandlerService.redirectToErrorPage(error.status);
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
  protected selectionChange(server: McsServer, resource: McsResource): void {
    this.setViewMode(ServerManagementView.None);
    this._getServerThumbnail(server);
    this._getServerMedia(server);

    this._getResourceCompute(resource);
    this._getResourceCatalogs(resource);
    this._checkScaleParamMode();
  }

  /**
   * Get the current server thumbnail
   */
  private _getServerThumbnail(server: McsServer): void {
    this.serverThumbnail$ = this._serversRepository.getServerThumbnail(server.id).pipe(
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
    this.serverMedia$ = this._serversRepository.getServerMedia(server);
  }

  /**
   * Get the server resource compute
   */
  private _getResourceCompute(resource: McsResource): void {
    this.resourceCompute$ = this._resourcesRespository.getResourceCompute(resource);
    this.resourceCompute$.subscribe();
  }

  /**
   * Get the resource media list
   */
  private _getResourceCatalogs(resource: McsResource): void {
    this.resourceCatalogs$ = this._resourcesRespository.getResourceCatalogItems(resource);
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
    this._attachMediaHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerMediaAttach, this._onAttachMedia.bind(this)
    );

    this._detachMediaHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerMediaDetach, this._onDetachMedia.bind(this)
    );

    this._updateComputeHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerComputeUpdate, this._onUpdateServerCompute.bind(this)
    );

    // Invoke the event initially
    this._eventDispatcher.dispatch(CoreEvent.jobServerMediaAttach);
    this._eventDispatcher.dispatch(CoreEvent.jobServerMediaDetach);
    this._eventDispatcher.dispatch(CoreEvent.jobServerComputeUpdate);
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
