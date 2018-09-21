import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { McsServer } from '@app/models';

@Injectable()
export class ServerService {
  /**
   * This will notify the subscriber everytime the server is selected or
   * everytime there are new data from the selected server
   */
  public selectedServerStream: BehaviorSubject<McsServer>;
  public selectedServer: McsServer;

  constructor() {
    this.selectedServerStream = new BehaviorSubject<McsServer>(undefined);
  }

  /**
   * Set the selected server instance
   * @param server Server to be selected
   */
  public setSelectedServer(server: McsServer): void {
    if (this.selectedServer !== server) {
      this.selectedServer = server;
      this.selectedServerStream.next(server);
    }
  }
}
