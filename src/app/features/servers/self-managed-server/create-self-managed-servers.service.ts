import { Injectable } from '@angular/core';
import { ServersService } from '../servers.service';
import {
  Server,
  ServerCreate
} from '../models';
import {
  ContextualHelpDirective
} from '../shared/contextual-help/contextual-help.directive';

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
   * This will get the platform data from the servers service
   */
  public getPlatformData() {
    return this._serversService.getPlatformData();
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
  public getServerTemplates() {
    return this._serversService.getServerTemplates();
  }

  /**
   * This will create the new server based on the inputted information
   * @param serverData Server data to be created
   */
  public createServer(serverData: ServerCreate) {
    return this._serversService.createServer(serverData);
  }
}
