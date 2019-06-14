import {
  ChangeDetectorRef,
  Injector
} from '@angular/core';
import {
  Subject,
  Observable,
  Subscription
} from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  McsErrorHandlerService,
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
  HttpStatusCode
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/event-manager';
import { EventBusDispatcherService } from '@app/event-bus';
import { ServerDetails } from './server-details';
import { ServerService } from './server.service';

export abstract class ServerDetailsBase {
  public serverDetails$: Observable<ServerDetails>;
  public serverPermision: McsServerPermission;

  protected readonly apiService: McsApiService;
  protected readonly errorHandler: McsErrorHandlerService;
  protected readonly accessControl: McsAccessControlService;
  protected readonly eventDispatcher: EventBusDispatcherService;
  protected readonly serverService: ServerService;

  private _server: McsServer;
  private _serversDataChangeHandler: Subscription;
  private _baseJobSubject = new Subject<void>();

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
   * @param resource Resource of the server selected
   */
  protected abstract selectionChange(server: McsServer, resource: McsResource): void;

  /**
   * Disposes the server details based instance
   */
  protected dispose(): void {
    unsubscribeSafely(this._baseJobSubject);
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
    this.serverDetails$ = this.serverService.getServerDetails().pipe(
      tap((serverDetails) => {
        this._server = serverDetails.server;
        this.serverPermision = new McsServerPermission(this._server);
        this.selectionChange(serverDetails.server, serverDetails.resource);
      })
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
