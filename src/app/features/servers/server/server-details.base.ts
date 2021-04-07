import {
  Observable,
  Subscription
} from 'rxjs';
import {
  catchError,
  shareReplay,
  switchMap,
  take,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectorRef,
  Injector
} from '@angular/core';
import {
  McsAccessControlService,
  McsErrorHandlerService,
  McsServerPermission
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  HttpStatusCode,
  McsApiErrorContext,
  McsJob,
  McsResource,
  McsServer
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import { ServerService } from './server.service';

export abstract class ServerDetailsBase {
  public server$: Observable<McsServer>;
  public resource$: Observable<McsResource>;

  public serverPermission: McsServerPermission;

  protected readonly apiService: McsApiService;
  protected readonly errorHandler: McsErrorHandlerService;
  protected readonly accessControl: McsAccessControlService;
  protected readonly eventDispatcher: EventBusDispatcherService;
  protected readonly serverService: ServerService;

  private _serversDataChangeHandler: Subscription;

  constructor(
    protected injector: Injector,
    protected _changeDetectorRef: ChangeDetectorRef
  ) {
    this.apiService = injector.get(McsApiService);
    this.errorHandler = injector.get(McsErrorHandlerService);
    this.accessControl = injector.get(McsAccessControlService);
    this.eventDispatcher = injector.get(EventBusDispatcherService);
    this.serverService = injector.get(ServerService);

    this._registerDataEvents();
    this._subscribeToServerDetails();
    this._subscribeToResourceDetails();
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
    let hasAccess = this.accessControl.hasAccessToFeature(featureFlag);
    if (!hasAccess) {
      this.errorHandler.redirectToErrorPage(HttpStatusCode.Forbidden);
    }
  }

  /**
   * Event that emits when the selection has been changed
   * @param server Server selected
   */
  protected abstract serverChange(server: McsServer): void;

  /**
   * Disposes the server details based instance
   */
  protected dispose(): void {
    unsubscribeSafely(this._serversDataChangeHandler);
  }

  /**
   * Returns true when the server is activated by job process
   * @param job Emitted job to be checked
   */
  protected serverIsActiveByJob(job: McsJob): boolean {
    if (isNullOrEmpty(job) || isNullOrEmpty(this.serverService.getServerId())) { return false; }
    return getSafeProperty(job, (obj) => obj.clientReferenceObject.serverId) === this.serverService.getServerId();
  }

  /**
   * Refresh the server resource to get the updated result
   */
  protected refreshServerResource(): void {
    this._subscribeToServerDetails();
  }

  /**
   * Subscribe to Server Details
   */
  private _subscribeToServerDetails(): void {
    this.server$ = this.serverService.getServerDetails().pipe(
      take(1),
      tap((serverDetails) => {
        this.serverPermission = new McsServerPermission(serverDetails);
        this.serverChange(serverDetails);
      }),
      shareReplay(1)
    );
  }

  /**
   * Subscribe to Resource Details
   */
  private _subscribeToResourceDetails(): void {
    this.resource$ = this.serverService.getServerDetails().pipe(
      take(1),
      switchMap((selectedServer) => {
        let resourceId = getSafeProperty(selectedServer, (obj) => obj.platform.resourceId);
        return this._getServerResourceByPlatform(resourceId);
      }),
      shareReplay(1)
    );
  }

  /**
   * Gets the server resource based on the server platform data
   * @param platform Platform on what resourceId to be obtained
   */
  private _getServerResourceByPlatform(resourceId: string): Observable<McsResource> {
    if (isNullOrEmpty(resourceId)) {
      throw new Error('Server platform resource id is undefined.');
    }
    return this.apiService.getResource(resourceId).pipe(
      catchError((error) => McsApiErrorContext.throwPartialError(error))
    );
  }

  /**
   * Registers the data events
   */
  private _registerDataEvents(): void {
    this._serversDataChangeHandler = this.eventDispatcher.addEventListener(
      McsEvent.dataChangeServers, this._onServersDataChanged.bind(this));
  }

  /**
   * Event that emits when the server data has been changed
   */
  private _onServersDataChanged(): void {
    this._changeDetectorRef.markForCheck();
  }
}
