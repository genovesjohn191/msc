import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import {
  Server,
  ServerResource,
  ServerCatalogItem,
  ServerCatalogItemType
} from '../models';
import { ServersResourcesRespository } from '../servers-resources.repository';
import { ServersService } from '../servers.service';
import { ServersRepository } from '../servers.repository';
import { ServerService } from '../server/server.service';
import { McsTextContentProvider } from '../../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  convertToGb
} from '../../../utilities';

export abstract class ServerDetailsBase {
  public serverResource: ServerResource;
  public serverResourceSubscription: Subscription;
  private _serverSubscription: Subscription;
  private _notificationsSubscription: Subscription;

  /**
   * Selected Server
   */
  private _server: Server;
  public get server(): Server {
    return this._server;
  }
  public set server(value: Server) {
    if (this._server !== value) {
      this._server = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Selected server resource available memory
   */
  public get availableMemoryMB(): number {
    return this._serverService.computeAvailableMemoryMB(this.serverResource);
  }

  /**
   * Selected server resource available cpu
   */
  public get availableCpu(): number {
    return this._serverService.computeAvailableCpu(this.serverResource);
  }

  /**
   * Selected server resource media
   */
  public get resourceMediaList(): ServerCatalogItem[] {
    let resourceMediaList = new Array<ServerCatalogItem>();

    if (!isNullOrEmpty(this.serverResource.catalogItems)) {
      this.serverResource.catalogItems.forEach((catalog) => {
        if (catalog.itemType === ServerCatalogItemType.Media) {
          let resourceMedia = new ServerCatalogItem();

          if (isNullOrEmpty(this.server.media)) {
            resourceMedia = catalog;
          } else {
            let media = this.server.media.find((serverMedia) => {
              return catalog.itemName !== serverMedia.name;
            });

            if (!isNullOrEmpty(media)) {
              resourceMedia.itemName = media.name;
            }
          }

          if (!isNullOrEmpty(resourceMedia.itemName)) {
            resourceMediaList.push(resourceMedia);
          }
        }
      });
    }

    return resourceMediaList;
  }

  /**
   * Flag for ongoing job of selected server
   */
  public get isProcessingJob(): boolean {
    return this.server.isProcessing;
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
    protected _serversResourcesRespository: ServersResourcesRespository,
    protected _serversRepository: ServersRepository,
    protected _serversService: ServersService,
    protected _serverService: ServerService,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _textProvider: McsTextContentProvider
  ) {
    this.server = new Server();
    this.serverResource = new ServerResource();
    this._listenToSelectedServerStream();
    this._listenToNotificationsChanged();
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
    unsubscribeSafely(this._notificationsSubscription);
  }

  /**
   * Will convert MB value to GB
   * and will round down to whole number
   * @param value Disk value to convert
   */
  protected convertDiskToGB(memoryMB: number): number {
    return (memoryMB > 0) ? Math.floor(convertToGb(memoryMB)) : 0;
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
   * Obtain server resources and set resource map
   */
  private _getServerResources(): void {
    unsubscribeSafely(this.serverResourceSubscription);
    this.serverResourceSubscription = this._serversResourcesRespository
      .findRecordById(this.server.platform.resourceId)
      .subscribe((resource) => {
        this.serverResource = resource;
        this.serverSelectionChanged();
        this._changeDetectorRef.markForCheck();
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
   * Listen to each notifications changed in server
   * so that we could refresh the view of the corresponding component
   */
  private _listenToNotificationsChanged(): void {
    this._notificationsSubscription = this._serversRepository.notificationsChanged
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }
}
