import { ChangeDetectorRef } from '@angular/core';
import {
  Subscription,
  Subject
} from 'rxjs';
import {
  takeUntil,
  finalize
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsErrorHandlerService,
  McsApiJob
} from '../../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty,
  unsubscribeSubject
} from '../../../utilities';
import {
  Resource,
  ResourcesRepository
} from '../../resources';
import { Server } from '../models';
import { ServersService } from '../servers.service';
import { ServersRepository } from '../servers.repository';
import { ServerService } from '../server/server.service';

export abstract class ServerDetailsBase {
  public serverResource: Resource;
  public serverResourceSubscription: Subscription;
  private _baseJobSubject = new Subject<void>();

  /**
   * Selected Server
   */
  private _server: Server;
  public get server(): Server { return this._server; }
  public set server(value: Server) {
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

  /**
   * Invalid storage text
   */
  public get invalidStorageText(): string {
    return this._textProvider.content.servers.shared.storageScale.invalidStorage;
  }

  constructor(
    protected _resourcesRespository: ResourcesRepository,
    protected _serversRepository: ServersRepository,
    protected _serversService: ServersService,
    protected _serverService: ServerService,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _textProvider: McsTextContentProvider,
    protected _errorHandlerService: McsErrorHandlerService
  ) {
    this.server = new Server();
    this.serverResource = new Resource();
  }

  protected initialize(): void {
    this._listenToServerSelectionChange();
    this._listenToServersUpdate();
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
    unsubscribeSafely(this.serverResourceSubscription);
    unsubscribeSubject(this._baseJobSubject);
  }

  /**
   * Returns true when the server is activated by job process
   * @param job Emitted job to be checked
   */
  protected serverIsActiveByJob(job: McsApiJob): boolean {
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
    unsubscribeSafely(this.serverResourceSubscription);
    this.serverResourceSubscription = this._resourcesRespository
      .findRecordById(this.server.platform.resourceId, fromCache)
      .pipe(
        finalize(() => {
          this.serverSelectionChanged();
          this._changeDetectorRef.markForCheck();
        })
      )
      .subscribe((resource) => {
        this.serverResource = resource;
      });
  }

  /**
   * This will listen to selected server
   * and get its value to server variable
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
  private _listenToServersUpdate(): void {
    this._serversRepository.dataRecordsChanged
      .pipe(takeUntil(this._baseJobSubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
