import { Injectable } from '@angular/core';
import { ServersService } from '../servers.service';
import {
  ServerCreate,
  ServerResource,
  ServerResourceStorage,
  ServerClone
} from '../models';
import { ContextualHelpDirective } from '../../../shared';

@Injectable()
export class CreateSelfManagedServersService {

  /**
   * Sub contextual help to all the components which are
   * dynamically created during runtime
   */
  private _subContextualHelp: ContextualHelpDirective[];
  public get subContextualHelp(): ContextualHelpDirective[] {
    return this._subContextualHelp;
  }
  public set subContextualHelp(value: ContextualHelpDirective[]) {
    this._subContextualHelp = value;
  }

  constructor(private _serversService: ServersService) {
    this._subContextualHelp = new Array();
  }

  /**
   * This will get the resources data from the servers service
   */
  public getResources() {
    return this._serversService.getResources();
  }

  /**
   * This will get all the servers from the servers service
   */
  public getAllServers() {
    return this._serversService.getServers();
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

  public computeAvailableStorageMB(storage: ServerResourceStorage): number {
    return this._serversService.computeAvailableStorageMB(storage);
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
