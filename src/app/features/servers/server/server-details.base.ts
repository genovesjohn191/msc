import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import {
  Server,
  ServerResource,
  ServerCatalogItem,
  ServerCatalogItemType,
  ServerMedia
} from '../models';
import { ServersResourcesRepository } from '../servers-resources.repository';
import { ServersService } from '../servers.service';
import { ServersRepository } from '../servers.repository';
import { ServerService } from '../server/server.service';
import {
  McsTextContentProvider,
  McsErrorHandlerService,
  McsApiJob
} from '../../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  convertMbToGb
} from '../../../utilities';

export abstract class ServerDetailsBase {
  public serverResource: ServerResource;
  public serverResourceSubscription: Subscription;
  private _serverSubscription: Subscription;
  private _serversUpdateSubscription: Subscription;

  /**
   * Selected Server
   */
  private _server: Server;
  public get server(): Server { return this._server; }
  public set server(value: Server) {
    this._server = value;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Selected server resource media
   */
  public get resourceMediaList(): ServerCatalogItem[] {
    let resourceMediaList = new Array<ServerCatalogItem>();

    let noCatalogItems = isNullOrEmpty(this.serverResource)
      || isNullOrEmpty(this.serverResource.catalogItems);
    if (noCatalogItems) { return undefined; }

    this.serverResource.catalogItems.forEach((catalog) => {
      if (catalog.itemType === ServerCatalogItemType.Media) {
        let resourceMedia: ServerCatalogItem;
        let existingMedia: ServerMedia;

        if (!isNullOrEmpty(this.server.media)) {
          existingMedia = this.server.media.find((serverMedia) => {
            return catalog.itemName === serverMedia.name;
          });
        }

        if (isNullOrEmpty(existingMedia)) {
          resourceMedia = catalog;
        }

        if (!isNullOrEmpty(resourceMedia)) {
          resourceMediaList.push(resourceMedia);
        }
      }
    });

    return resourceMediaList;
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
    protected _serversResourcesRespository: ServersResourcesRepository,
    protected _serversRepository: ServersRepository,
    protected _serversService: ServersService,
    protected _serverService: ServerService,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _textProvider: McsTextContentProvider,
    protected _errorHandlerService: McsErrorHandlerService
  ) {
    this.server = new Server();
    this.serverResource = new ServerResource();
    this.serverResourceSubscription = new Subscription();
  }

  protected initialize(): void {
    this._listenToSelectedServerStream();
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
    unsubscribeSafely(this._serverSubscription);
    unsubscribeSafely(this._serversUpdateSubscription);
  }

  /**
   * Will convert MB value to GB
   * and will round down to whole number
   * @param value Disk value to convert
   */
  protected convertDiskToGB(memoryMB: number): number {
    return (memoryMB > 0) ? Math.floor(convertMbToGb(memoryMB)) : 0;
  }

  /**
   * Will append the GB unit in the provided value
   * @param value value where to append GB unit
   */
  protected appendUnitGB(value: number): string {
    let textContent = this._textProvider.content.servers.shared.storageScale;
    return (value > 0) ? `${value} ${textContent.unit}` : textContent.invalidStorage;
  }

  /**
   * Returns true when the server is activated by job process
   * @param job Emitted job to be checked
   */
  protected serverIsActiveByJob(job: McsApiJob): boolean {
    let activeServer = !isNullOrEmpty(job)
      && !isNullOrEmpty(this.server)
      && this.server.id === job.clientReferenceObject.serverId;
    return activeServer;
  }

  /**
   * Refresh the server resource to get the updated result
   */
  protected refreshServerResource(): void {
    let hasSelectedServer = !isNullOrEmpty(this.server) && !isNullOrEmpty(this.server.id);
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
    this.serverResourceSubscription = this._serversResourcesRespository
      .findRecordById(this.server.platform.resourceId, fromCache)
      .finally(() => {
        this.serverSelectionChanged();
        this._changeDetectorRef.markForCheck();
      })
      .subscribe((resource) => {
        this.serverResource = resource;
      });
  }

  /**
   * This will listen to selected server
   * and get its value to server variable
   */
  private _listenToSelectedServerStream(): void {
    this._serverSubscription = this._serverService.selectedServerStream
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
    this._serversUpdateSubscription = this._serversRepository
      .dataRecordsChanged
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
