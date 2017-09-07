import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsSearch
} from '../../../core';
import {
  Server,
  ServerList,
  ServerClientObject
} from '../models';
import { ServersService } from '../servers.service';
import { isNullOrEmpty } from '../../../utilities';

const SERVER_LIST_GROUP_OTHERS = 'Others';

export class ServerListSource implements McsDataSource<ServerList> {
  private _activeServerSubscription: any;
  private _serversSubscription: any;
  private _serverListStream: BehaviorSubject<ServerList[]> = new BehaviorSubject<ServerList[]>([]);
  private _serverList: ServerList[];

  constructor(
    private _serversService: ServersService,
    private _search: McsSearch
  ) {
    this._serversSubscription = this._serversService.getServers()
      .subscribe((response) => {
        this._serverList = this._mapServerList(response.content);
        this._serverListStream.next(this._serverList);
      });

    this._listenToActiveServers();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<ServerList[]> {
    const displayDataChanges = [
      this._search.searchChangedStream,
      this._serverListStream
    ];

    return Observable.merge(...displayDataChanges)
      .map(() => {
        let serverList = new Array<ServerList>();

        if (!isNullOrEmpty(this._serverList)) {
          serverList = this._serverList.slice().filter((server: ServerList) => {
            let searchStr = (server.name + server.vdcName).toLowerCase();
            return searchStr.indexOf(this._search.keyword.toLowerCase()) !== -1;
          });
        }

        return serverList;
      });
  }

  public disconnect() {
    // Disconnect all resources
    if (this._serversSubscription) {
      this._serversSubscription.unsubscribe();
    }

    if (this._activeServerSubscription) {
      this._activeServerSubscription.unsubscribe();
    }
  }

  public onCompletion(): void {
    // Do all the completion of pagination, filtering, etc... here
  }

  private _mapServerList(servers: Server[]): ServerList[] {
    if (isNullOrEmpty(servers)) { return; }

    let serverList = new Array<ServerList>();
    servers.forEach((server) => {
      let serverListItem = new ServerList();
      serverListItem.id = server.id;
      serverListItem.name = server.managementName;
      serverListItem.powerState = server.powerState;
      serverListItem.vdcName = (!isNullOrEmpty(server.vdcName)) ?
        server.vdcName : SERVER_LIST_GROUP_OTHERS ;

      serverList.push(serverListItem);
    });

    return serverList;
  }

  /**
   * Listener to all the active servers for real time update of status
   *
   * `@Note`: This should be listen to the servers service since their powerstate
   * status should be synchronise
   */
  private _listenToActiveServers(): void {
    this._activeServerSubscription = this._serversService.activeServersStream
      .subscribe((activeServers) => {
        this._updateServerBasedOnActive(activeServers);
      });
  }

  private _updateServerBasedOnActive(activeServers: ServerClientObject[]): void {
    if (!activeServers || !this._serverList) { return; }

    // This will update the server list based on the active servers
    activeServers.forEach((activeServer) => {
      // Update server list
      for (let server of this._serverList) {
        if (server.id === activeServer.serverId) {
          server.powerState = this._serversService.getActiveServerPowerState(activeServer);
          break;
        }
      }
    });
  }
}
