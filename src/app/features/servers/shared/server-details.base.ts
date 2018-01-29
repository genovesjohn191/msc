import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import {
  Server,
  ServerResource,
  ServerCatalogItem,
  ServerCatalogItemType,
  ServerStorage,
  ServerNetwork
} from '../models';
import { ServerService } from '../server/server.service';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '../../../utilities';

export abstract class ServerDetailsBase {
  // Subscriptions
  public serverResourceSubscription: Subscription;
  private _notificationsSubscription: Subscription;
  private _serverSubscription: Subscription;

  /**
   * Selected server resource map
   */
  private _resourceMap: Map<string, ServerResource>;

  /**
   * Resource of the the selected server
   */
  private _resource: ServerResource;

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
    return this._serverService.computeAvailableMemoryMB(this._resource);
  }

  /**
   * Selected server resource available cpu
   */
  public get availableCpu(): number {
    return this._serverService.computeAvailableCpu(this._resource);
  }

  /**
   * Selected server resource media
   */
  public get resourceMediaList(): ServerCatalogItem[] {
    let resourceMediaList = new Array<ServerCatalogItem>();

    if (!isNullOrEmpty(this._resource.catalogItems)) {
      this._resource.catalogItems.forEach((catalog) => {
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
   * Selected server resource storage
   */
  public get resourceStorage(): ServerStorage[] {
    return this._resource.storage;
  }

  /**
   * Selected server resource networks
   */
  public get resourceNetworks(): ServerNetwork[] {
    return this._resource.networks;
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

  constructor(
    protected _serverService: ServerService,
    protected _changeDetectorRef: ChangeDetectorRef,
  ) {
    this.server = new Server();
    this._resourceMap = new Map<string, ServerResource>();
    this._resource = new ServerResource();
    this._listenToSelectedServerStream();
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
   * Obtain server resources and set resource map
   */
  private _getServerResources(): void {
    this.serverResourceSubscription = this._serverService.getServerResources(this.server)
      .subscribe((resources) => {
        if (!isNullOrEmpty(resources)) {
          this._resourceMap = this._serverService.convertResourceToMap(resources);
          this._setResourceData();
        }
      });

    this.serverResourceSubscription.add(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Set the resource data based on selected server
   */
  private _setResourceData(): void {
    if (isNullOrEmpty(this.server.platform)) { return; }

    let resourceName = this.server.platform.resourceName;

    if (this._resourceMap.has(resourceName)) {
      this._resource = this._resourceMap.get(resourceName);
    }
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
          this.serverSelectionChanged();
          this._getServerResources();
        }
      });
  }
}
