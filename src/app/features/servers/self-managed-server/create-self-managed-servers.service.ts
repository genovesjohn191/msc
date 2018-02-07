import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { ServersService } from '../servers.service';
import {
  ServerCreate,
  ServerResource,
  ServerStorage,
  ServerClone
} from '../models';
import { ContextualHelpDirective } from '../../../shared';

@Injectable()
export class CreateSelfManagedServersService {

  /**
   * Sub contextual help to all the components which are
   * dynamically created during runtime
   */
  public subContextualHelpStream: Subject<any>;
  private _subContextualHelp: ContextualHelpDirective[];
  public get subContextualHelp(): ContextualHelpDirective[] {
    return this._subContextualHelp;
  }
  public set subContextualHelp(value: ContextualHelpDirective[]) {
    if (this._subContextualHelp !== value) {
      this._subContextualHelp = value;
      this.subContextualHelpStream.next();
    }
  }

  constructor(private _serversService: ServersService) {
    this.subContextualHelpStream = new Subject();
    this._subContextualHelp = new Array();
  }

  /**
   * This will get the server templates data from the API
   */
  public getServersOs() {
    return this._serversService.getServerOs();
  }

  /**
   * This will create the new server based on the inputted information
   * @param serverData Server data to be created
   */
  public createServer(serverData: ServerCreate) {
    return this._serversService.createServer(serverData);
  }

  public computeAvailableMemoryMB(resource: ServerResource): number {
    return this._serversService.computeAvailableMemoryMB(resource);
  }

  public computeAvailableCpu(resource: ServerResource): number {
    return this._serversService.computeAvailableCpu(resource);
  }

  public computeAvailableStorageMB(storage: ServerStorage, memoryMB: number): number {
    return this._serversService.computeAvailableStorageMB(storage, memoryMB);
  }

  /**
   * This will clone an existing server
   * @param id Server id to be cloned
   * @param serverData Server data to be cloned
   */
  public cloneServer(id: string, serverData: ServerClone) {
    return this._serversService.cloneServer(id, serverData);
  }
}
