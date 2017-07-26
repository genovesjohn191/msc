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
  ServerUpdate
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
   * This method will set the CPU Size Scale based on the given date
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
   * This will get the server thumbnail data from the respective server
   * @param serverId Server ID
   */
  public getServerThumbnail(serverId: any) {
    // Return the observable of thumbnails
    return this._serversService.getServerThumbnail(serverId);
  }

  /**
   * Set the selected server instance
   * @param serverId Server ID to be selected
   */
  public setSelectedServer(serverId: string): void {
    this._serversService.getServer(serverId)
      .subscribe((response) => {
        let server: Server = response.content;

        if (server) {
          let activeServer = this._serversService.activeServers
            .find((active) => {
              return active.serverId === server.id;
            });

          if (activeServer) {
            server.powerState = this._serversService.getActiveServerPowerState(activeServer);
          }
          this._selectedServerStream.next(server);
        }
      });
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
