import { ChangeDetectorRef } from '@angular/core';
import {
  Subject,
  Observable,
  of
} from 'rxjs';
import {
  takeUntil,
  finalize,
  tap,
  switchMap,
  concatMap
} from 'rxjs/operators';
import {
  McsErrorHandlerService,
  McsLoadingService,
  McsAccessControlService,
  McsServerPermission
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import {
  McsJob,
  McsResource,
  McsServer,
  HttpStatusCode,
  McsServerPlatform
} from '@app/models';
import {
  McsServersRepository,
  McsResourcesRepository
} from '@app/services';
import { ServerService } from '../server/server.service';

export interface ServerDetails {
  server: McsServer;
  resource: McsResource;
}

export abstract class ServerDetailsBase {
  public serverDetails$: Observable<ServerDetails>;
  protected serverPermision: McsServerPermission;
  private _baseJobSubject = new Subject<void>();
  private _server: McsServer;

  constructor(
    protected _resourcesRespository: McsResourcesRepository,
    protected _serversRepository: McsServersRepository,
    protected _serverService: ServerService,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _errorHandlerService: McsErrorHandlerService,
    protected _loadingService: McsLoadingService,
    protected _accessControlService: McsAccessControlService
  ) {
    this._subscribeToServersDataChange();
    this._subscribeToSelectedServer();
  }

  /**
   * Validates the dedicated feature flag of the VM
   *
   * `@Note` This was implemented for temporary used only
   * @param server Server to be checked if it is applicable for checking
   * @param featureFlag Feature flag to be checked
   */
  protected validateDedicatedFeatureFlag(server: McsServer, featureFlag: string): void {
    if (!server.isDedicated) { return; }
    let hasAccess = this._accessControlService.hasAccessToFeature(featureFlag);
    if (!hasAccess) {
      this._errorHandlerService.redirectToErrorPage(HttpStatusCode.Forbidden);
    }
  }

  /**
   * Contains all the methods you need to execute
   * when the selected server changes
   */
  protected abstract selectionChange(server: McsServer, resource: McsResource): void;

  /**
   * Dispose all of the resource from the datasource including all the subscription
   *
   * `@Note`: This should be call inside the destroy of the component
   */
  protected dispose(): void {
    unsubscribeSafely(this._baseJobSubject);
  }

  /**
   * Returns true when the server is activated by job process
   * @param job Emitted job to be checked
   */
  protected serverIsActiveByJob(job: McsJob): boolean {
    if (isNullOrEmpty(job) || isNullOrEmpty(this._server)) { return false; }
    let jobServerId = getSafeProperty(job, (obj) => obj.clientReferenceObject.serverId);
    let selectedServerId = getSafeProperty(this._server, (obj) => obj.id);
    let activeServer = jobServerId === selectedServerId;
    return activeServer;
  }

  /**
   * Refresh the server resource to get the updated result
   */
  protected refreshServerResource(): void {
    this._subscribeToSelectedServer();
  }

  /**
   * Subscribe to selected server to obtain also the resource details
   */
  private _subscribeToSelectedServer(): void {
    this.serverDetails$ = this._serverService.selectedServer().pipe(
      concatMap((selectedServer) => {
        return this._getServerResourceByPlatform(selectedServer.platform).pipe(
          switchMap((selectedResource) =>
            of({ server: selectedServer, resource: selectedResource } as ServerDetails)
          )
        );
      }),
      tap((serverDetails) => {
        this._server = serverDetails.server;
        this.serverPermision = new McsServerPermission(this._server);
        this.selectionChange(serverDetails.server, serverDetails.resource);
      })
    );
  }

  /**
   * Gets the server resource based on the server platform data
   * @param platform Platform on what resourceId to be obtained
   */
  private _getServerResourceByPlatform(platform: McsServerPlatform): Observable<McsResource> {
    let platformIsEmpty = isNullOrEmpty(platform) || isNullOrEmpty(platform.resourceName);
    if (platformIsEmpty) { return of(new McsResource()); }
    this._loadingService.showLoader();

    return this._resourcesRespository.getById(platform.resourceId).pipe(
      finalize(() => this._loadingService.hideLoader())
    );
  }

  /**
   * Listen to each servers data update
   * so that we could refresh the view of the corresponding component
   */
  private _subscribeToServersDataChange(): void {
    this._serversRepository.dataChange()
      .pipe(takeUntil(this._baseJobSubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
