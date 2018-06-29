import { Injectable } from '@angular/core';
import { ServersService } from '../servers.service';
import { BehaviorSubject } from 'rxjs';
import {
  Server,
  ServerPerformanceScale,
  ServerUpdate,
  ServerPowerState,
  ServerCommand
} from '../models';

@Injectable()
export class ServerService {
  /**
   * This will notify the subscriber everytime the server is selected or
   * everytime there are new data from the selected server
   */
  public selectedServerStream: BehaviorSubject<Server>;
  public selectedServer: Server;

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
    if (this.selectedServer !== server) {
      this.selectedServer = server;
      this.selectedServerStream.next(server);
    }
  }
}
