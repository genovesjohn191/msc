import { Injectable } from '@angular/core';
import { ServersService } from '../servers.service';
import { BehaviorSubject } from 'rxjs/Rx';
import {
  Server,
  ServerPerformanceScale,
  ServerUpdate,
  ServerResource,
  ServerStorage,
  ServerPowerState,
  ServerCommand
} from '../models';
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
}
