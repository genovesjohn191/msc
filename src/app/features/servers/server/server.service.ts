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

  private _selectedServerStream: BehaviorSubject<Server>;
  public get selectedServerStream(): BehaviorSubject<Server> {
    return this._selectedServerStream;
  }
  public set selectedServerStream(value: BehaviorSubject<Server>) {
    this._selectedServerStream = value;
  }

  constructor(
    private _seversService: ServersService
  ) {
    this._selectedServerStream = new BehaviorSubject<Server>(undefined);
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
    return this._seversService.patchServer(
      serverId,
      {
        memoryMB: cpuSizeScale.memoryMB,
        cpuCount: cpuSizeScale.cpuCount
      } as ServerUpdate
    );
  }

  /**
   * This will get the server thumbnail data from the respective server
   * @param serverId Server ID
   */
  public getServerThumbnail(serverId: any) {
    // Return the observable of thumbnails
    return this._seversService.getServerThumbnail(serverId);
  }

  public setSelectedServer(serverId: string): void {
    this._seversService.getServer(serverId)
      .subscribe((response) => {
        this._selectedServerStream.next(response.content);
      });
  }
}
