import { Injectable } from '@angular/core';
import { ServersService } from '../servers.service';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  Server,
  ServerPerformanceScale,
  ServerThumbnail,
  ServerUpdate,
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
  ServerPlatform
} from '../models';
import {
  McsApiSuccessResponse,
  McsApiJob,
  CoreDefinition
} from '../../../core/';

@Injectable()
export class ServerService {

  public activeServerSubscription: any;

  /**
   * This will notify the subscriber everytime the server is selected or
   * everytime there are new data from the selected server
   */
  private _selectedServerStream: BehaviorSubject<Server>;
  public get selectedServerStream(): BehaviorSubject<Server> {
    return this._selectedServerStream;
  }
  public set selectedServerStream(value: BehaviorSubject<Server>) {
    this._selectedServerStream = value;
  }

  constructor(private _serversService: ServersService) {
    this._selectedServerStream = new BehaviorSubject<Server>(undefined);
    this._listenToActiveServers();
  }

  /**
   * Get Server Data (MCS API Response)
   * @param id Server Identification
   */
  public getServer(id: any): Observable<McsApiSuccessResponse<Server>> {
    return this._serversService.getServer(id);
  }

  /**
   * Get Platform Data (MCS API Response)
   */
  public getPlatformData(): Observable<McsApiSuccessResponse<ServerPlatform>> {
    return this._serversService.getPlatformData();
  }

  /**
   * Get Server Storage Data (MCS API Response)
   */
  public getServerStorage(serverId: any): Observable<McsApiSuccessResponse<ServerStorageDevice[]>> {
    return this._serversService.getServerStorage(serverId);
  }

  /**
   * This method will set the CPU Size Scale based on the given data
   * @param serverId Server ID
   * @param cpuSizeScale CPU Size Scale of the server to be updated
   */
  public setPerformanceScale(
    serverId: any,
    cpuSizeScale: ServerPerformanceScale
  ) {
    if (!cpuSizeScale) { return; }

    // Update scaling of server based on cpu size scale
    return this._serversService.patchServer(
      serverId,
      {
        memoryMB: cpuSizeScale.memoryMB,
        cpuCount: cpuSizeScale.cpuCount,
        clientReferenceObject: {
          activeServerId: serverId
        }
      } as ServerUpdate
    );
  }

  /**
   * This method will create a server storage based on the given data
   * @param serverId Server ID
   * @param storageData storage Data
   */
  public createServerStorage(
    serverId: any,
    storageData: ServerStorageDeviceUpdate
  ) {
    if (!storageData) { return; }

    // Create a server storage
    return this._serversService.createServerStorage(serverId, storageData);
  }

  /**
   * This method will update a server storage based on the given data
   * @param serverId Server ID
   * @param storageId Server Storage ID
   * @param storageData Storage Data
   */
  public updateServerStorage(
    serverId: any,
    storageId: any,
    storageData: ServerStorageDeviceUpdate
  ) {
    if (!storageData) { return; }

    // Update a server storage
    return this._serversService.updateServerStorage(serverId, storageId, storageData);
  }

  /**
   * This method will delete a server storage based on the given data
   * @param serverId Server ID
   * @param storageId Server Storage ID
   * @param storageData Storage Data
   */
  public deleteServerStorage(
    serverId: any,
    storageId: any
  ) {

    // Delete a server storage
    return this._serversService.deleteServerStorage(serverId, storageId);
  }

  /**
   * This will get the server thumbnail data from the respective server
   * @param serverId Server ID
   */
  public getServerThumbnail(serverId: any) {
    // Return the observable of thumbnails
    return this._serversService.getServerThumbnail(serverId);
  }

  /**
   * Set the selected server instance
   * @param server Server to be selected
   */
  public setSelectedServer(server: Server): void {
    this.selectedServerStream.next(server);
  }

  /**
   * Listener for the active server of the servers services
   *
   * `@Note`: This should be included since we want to make sure that any changes
   * on the server data should notify the selectedServer subscribers
   */
  private _listenToActiveServers(): void {
    // Listener for the active servers
    this.activeServerSubscription = this._serversService.activeServersStream
      .subscribe((activeServers) => {
        if (activeServers) {
          let selectedServer: Server;

          selectedServer = this.selectedServerStream.getValue();
          if (selectedServer) {
            for (let activeServer of activeServers) {

              if (selectedServer.id === activeServer.serverId) {
                selectedServer.powerState = this._serversService
                  .getActiveServerPowerState(activeServer);
                this._selectedServerStream.next(selectedServer);
              }
            }
          }
        }
      });
  }
}
