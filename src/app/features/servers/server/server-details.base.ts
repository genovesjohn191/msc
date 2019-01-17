import { ChangeDetectorRef } from '@angular/core';
import {
  Subject,
  Observable
} from 'rxjs';
import {
  takeUntil,
  finalize,
  tap,
  first
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsErrorHandlerService,
  McsLoadingService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import {
  McsJob,
  McsResource,
  McsServer
} from '@app/models';
import {
  McsServersRepository,
  McsResourcesRepository
} from '@app/services';
import { ServerService } from '../server/server.service';

export abstract class ServerDetailsBase {
  public serverResource: McsResource;
  public serverResource$: Observable<McsResource>;

  private _baseJobSubject = new Subject<void>();
  private _serverTextContent: any;

  /**
   * Selected Server
   */
  private _server: McsServer;
  public get server(): McsServer { return this._server; }
  public set server(value: McsServer) {
    if (value !== this._server) {
      this._server = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Selected server job summary information
   */
  public get jobSummaryInfo(): string {
    return this.server.processingText;
  }

  constructor(
    protected _resourcesRespository: McsResourcesRepository,
    protected _serversRepository: McsServersRepository,
    protected _serverService: ServerService,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _textProvider: McsTextContentProvider,
    protected _errorHandlerService: McsErrorHandlerService,
    protected _loadingService: McsLoadingService,
  ) {
    this.server = new McsServer();
    this.serverResource = new McsResource();
  }

  protected initialize(): void {
    this._serverTextContent = this._textProvider.content.servers.server;
    this._listenToServerSelectionChange();
    this._subscribeToServersUpdate();
  }

  /**
   * Contains all the methods you need to execute
   * when the selected server changes
   */
  protected abstract serverSelectionChanged(): void;

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
    if (isNullOrEmpty(job) || isNullOrEmpty(this.server)) { return false; }
    let jobServerId = getSafeProperty(job, (obj) => obj.clientReferenceObject.serverId);
    let selectedServerId = getSafeProperty(this.server, (obj) => obj.id);
    let activeServer = jobServerId === selectedServerId;
    return activeServer;
  }

  /**
   * Refresh the server resource to get the updated result
   */
  protected refreshServerResource(): void {
    let hasSelectedServer = !isNullOrEmpty(getSafeProperty(this.server, (obj) => obj.id));
    if (!hasSelectedServer) {
      throw new Error('Could not get the resource since there is no selected server yet');
    }
    this._getServerResources(false);
  }

  /**
   * Obtain server resources and set resource map
   */
  private _getServerResources(fromCache: boolean = true): void {
    this._loadingService.showLoader(this._serverTextContent.loadingResourceDetails);
    // Delete the record when it needs to refresh
    if (!fromCache) { this._resourcesRespository.deleteById(this.server.platform.resourceId); }

    this._resourcesRespository.getById(this.server.platform.resourceId).pipe(
      tap((response) => {
        this.serverResource = response;
        this.serverSelectionChanged();

      }),
      finalize(() => {
        this._loadingService.hideLoader();
        this._changeDetectorRef.markForCheck();
      }),
      first()
    ).subscribe();
  }

  /**
   * This will listen to selected server
   * and get its value to server variable
   *
   * @deprecated Make the server to observable
   */
  private _listenToServerSelectionChange(): void {
    this._serverService.selectedServerStream
      .pipe(takeUntil(this._baseJobSubject))
      .subscribe((server) => {
        if (!isNullOrEmpty(server) && this.server.id !== server.id) {
          this.server = server;
          this._getServerResources();
        }
      });
  }

  /**
   * Listen to each servers data update
   * so that we could refresh the view of the corresponding component
   */
  private _subscribeToServersUpdate(): void {
    this._serversRepository.dataChange()
      .pipe(takeUntil(this._baseJobSubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
