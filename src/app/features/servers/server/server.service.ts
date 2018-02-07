import { Injectable } from '@angular/core';
import { ServersService } from '../servers.service';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  Server,
  ServerPerformanceScale,
  ServerUpdate,
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
  ServerResource,
  ServerStorage,
  ServerPowerState,
  ServerNicSummary,
  ServerManageNetwork,
  ServerManageMedia,
  ServerCommand
} from '../models';
import { McsApiSuccessResponse } from '../../../core/';
import { isNullOrEmpty } from '../../../utilities';

@Injectable()
export class ServerService {

  public activeServerSubscription: any;

  /**
   * This will notify the subscriber everytime the server is selected or
   * everytime there are new data from the selected server
   */
  public selectedServerStream: BehaviorSubject<Server>;

  constructor(private _serversService: ServersService) {
    this.selectedServerStream = new BehaviorSubject<Server>(undefined);
  }

  /**
   * Get Server Data (MCS API Response)
   * @param id Server Identification
   */
  public getServer(id: any): Observable<McsApiSuccessResponse<Server>> {
    return this._serversService.getServer(id);
  }

  /**
   * This method will set the CPU Size Scale based on the given data
   * @param id Server ID
   * @param cpuSizeScale CPU Size Scale of the server to be updated
   */
  public setPerformanceScale(
    id: any,
    cpuSizeScale: ServerPerformanceScale,
    serverPowerState: ServerPowerState,
    command: ServerCommand
  ) {
    if (!cpuSizeScale) { return; }

    // Update scaling of server based on cpu size scale
    return this._serversService.updateServerCompute(
      id,
      {
        memoryMB: cpuSizeScale.memoryMB,
        cpuCount: cpuSizeScale.cpuCount,
        clientReferenceObject: {
          serverId: id,
          memoryMB: cpuSizeScale.memoryMB,
          cpuCount: cpuSizeScale.cpuCount,
          powerState: serverPowerState,
          commandAction: command
        }
      } as ServerUpdate
    );
  }

  /**
   * Get Server Storage Data (MCS API Response)
   */
  public getServerStorage(serverId: any): Observable<McsApiSuccessResponse<ServerStorageDevice[]>> {
    return this._serversService.getServerStorage(serverId);
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
    storageId: any,
    storageData: ServerStorageDeviceUpdate
  ) {

    // Delete a server storage
    return this._serversService.deleteServerStorage(serverId, storageId, storageData);
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
   * Get Server Networks (MCS API Response)
   * @param serverId Server Identification
   */
  public getServerNetworks(
    serverId: any): Observable<McsApiSuccessResponse<ServerNicSummary[]>> {
    return this._serversService.getServerNetworks(serverId);
  }

  /**
   * Add Server Network (MCS API Response)
   * @param serverId Server Identification
   * @param networkData Network Payload
   */
  public addServerNetwork(
    serverId: any,
    networkData: ServerManageNetwork
  ) {
    return this._serversService.addServerNetwork(serverId, networkData);
  }

  /**
   * Add Server Network (MCS API Response)
   * @param serverId Server Identification
   * @param networkId Network Identification
   * @param networkData Network Payload
   */
  public updateServerNetwork(
    serverId: any,
    networkId: any,
    networkData: ServerManageNetwork
  ) {
    return this._serversService.updateServerNetwork(serverId, networkId, networkData);
  }

  /**
   * Add Server Network (MCS API Response)
   * @param serverId Server Identification
   * @param networkIndex Network Index / NIC#
   */
  public deleteServerNetwork(
    serverId: any,
    networkId: any,
    networkData: ServerManageNetwork
  ) {
    return this._serversService.deleteServerNetwork(serverId, networkId, networkData);
  }

  /**
   * Attach Server Media (MCS API Response)
   * @param serverId Server Identification
   * @param mediaData Media Payload
   */
  public attachServerMedia(
    serverId: any,
    mediaData: ServerManageMedia
  ) {
    return this._serversService.attachServerMedia(serverId, mediaData);
  }

  /**
   * Dettach Server Media (MCS API Response)
   * @param serverId Server Identification
   * @param mediaId Media Identification
   * @param mediaData Media Payload
   */
  public detachServerMedia(
    serverId: any,
    mediaId: any,
    mediaData: ServerManageMedia
  ) {
    return this._serversService.detachServerMedia(serverId, mediaId, mediaData);
  }

  /**
   * Set the selected server instance
   * @param server Server to be selected
   */
  public setSelectedServer(server: Server): void {
    this.selectedServerStream.next(server);
  }

  public computeAvailableMemoryMB(resource: ServerResource): number {
    return this._serversService.computeAvailableMemoryMB(resource);
  }

  public computeAvailableCpu(resource: ServerResource): number {
    return this._serversService.computeAvailableCpu(resource);
  }

  public computeAvailableStorageMB(storage: ServerStorage, memoryMB: number): number {
    return this._serversService.computeAvailableStorageMB(storage,
      isNullOrEmpty(memoryMB) ? 0 : memoryMB);
  }

  /**
   * Return the corresponding resouce array to map
   */
  public convertResourceToMap(resources: ServerResource[]): Map<string, ServerResource> {
    let serverResourceMap = new Map<string, ServerResource>();
    if (resources) {
      resources.forEach((resource) => {
        serverResourceMap.set(resource.name, resource);
      });
    }
    return serverResourceMap;
  }

  /**
   * Execute the server command according to inputs
   * @param data Data of the server to process the action
   * @param action Action to be execute
   */
  public executeServerCommand(
    data: { server: Server, result?: any },
    action: ServerCommand
  ) {
    this._serversService.executeServerCommand(data, action);
  }
}
