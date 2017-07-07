import { Injectable } from '@angular/core';
import { ServersService } from '../servers.service';
import {
  ServerPerformanceScale,
  ServerThumbnail
} from '../models';
import { McsApiRequestServerUpdate } from '../../../core';

@Injectable()
export class ServerService {

  constructor(private _seversService: ServersService) {
    // TODO: add method for snapshot listener here
  }

  /**
   * This method will set the CPU Size Scale based on the given date
   * @param serverId Server ID
   * @param cpuSizeScale CPU Size Scale of the server to be updated
   */
  public setPerformanceScale(serverId: any, cpuSizeScale: ServerPerformanceScale) {
    if (!cpuSizeScale) { return; }

    // Update scaling of server based on cpu size scale
    this._seversService.patchServer(serverId,
      {
        memorySizeInMb: cpuSizeScale.memoryInGb,
        cpuCount: cpuSizeScale.cpuCount
      } as McsApiRequestServerUpdate);
  }

  /**
   * This will get the server thumbnail data from the respective server
   * @param serverId Server ID
   */
  public getServerThumbnail(serverId: any) {
    // Return the observable of thumbnails
    return this._seversService.getServerThumbnail(serverId);
  }
}
