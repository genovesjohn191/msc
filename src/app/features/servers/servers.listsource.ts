import {
  Observable,
  Subject,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsDataStatus,
  McsSearch
} from '../../core';
import {
  Server,
  ServerList,
  ServerClientObject
} from './models';
import { ServersService } from './servers.service';
import {
  isNullOrEmpty,
  compareStrings,
  deleteArrayRecord,
  refreshView
} from '../../utilities';

const SERVER_LIST_GROUP_OTHERS = 'Others';

export class ServersListSource implements McsDataSource<ServerList> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  private _activeServerSubscription: any;
  private _serverList: ServerList[];
  private _serverListStream: BehaviorSubject<ServerList[]>;

  private _searchMode: boolean;
  public get searchMode(): boolean {
    return this._searchMode;
  }
  public set searchMode(value: boolean) {
    this._searchMode = value;
  }

  private _serverListSubscription: any;
  public get serverListSubscription(): any {
    return this._serverListSubscription;
  }
  public set serverListSubscription(value: any) {
    this._serverListSubscription = value;
  }

  constructor(
    private _serversService: ServersService,
    private _search: McsSearch
  ) {
    this._serverList = new Array<ServerList>();
    this._serverListStream = new BehaviorSubject<ServerList[]>(this._serverList);
    this._getServers();
    this._listenToActiveServers();
    this.dataLoadingStream = new Subject<McsDataStatus>();
    this._searchMode = false;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<ServerList[]> {
    const displayDataChanges = [
      this._search.searchChangedStream,
      this._serverListStream
    ];

    return Observable.merge(...displayDataChanges)
      .map(() => {
        this.dataLoadingStream.next(McsDataStatus.InProgress);
        let serverList = new Array<ServerList>();
        this._searchMode = (this._search.keyword) ? true : false ;

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
    if (this.serverListSubscription) {
      this.serverListSubscription.unsubscribe();
    }

    if (this._activeServerSubscription) {
      this._activeServerSubscription.unsubscribe();
    }
  }

  public onCompletion(_status: McsDataStatus): void {
    // Do all the completion of pagination, filtering, etc... here
    this._search.showLoading(false);
  }

  public removeDeletedServer(server: Server): void {
    if (isNullOrEmpty(server)) { return; }

    refreshView(() => {
      this._serverList = deleteArrayRecord(this._serverList, (targetServer) => {
        return targetServer.id === server.id;
      });
      this._serverListStream.next(this._serverList);
    });
  }

  private _mapServerList(servers: Server[]): ServerList[] {
    if (isNullOrEmpty(servers)) { return; }

    servers.sort((first: Server, second: Server) => {
      return compareStrings(first.managementName, second.managementName);
    });

    let serverList = new Array<ServerList>();
    servers.forEach((server) => {
      let serverListItem = new ServerList();
      serverListItem.id = server.id;
      serverListItem.name = server.managementName;
      serverListItem.powerState = this._getServerPowerState(server);

      let hasResource = !isNullOrEmpty(server.environment)
        && !isNullOrEmpty(server.environment.resource);

      serverListItem.vdcName = (hasResource) ?
        server.environment.resource.name : SERVER_LIST_GROUP_OTHERS ;

      serverList.push(serverListItem);
    });

    serverList.sort((first: ServerList, second: ServerList) => {
      return compareStrings(first.vdcName, second.vdcName);
    });

    return serverList;
  }

  private _getServers(): void {
    this.serverListSubscription = this._serversService
      .getServers(undefined, undefined, undefined, false)
      .subscribe((response) => {
        this.dataLoadingStream.next(McsDataStatus.InProgress);
        this._serverList = this._mapServerList(response.content);
        this._serverListStream.next(this._serverList);
      });
  }

  /**
   * Return the server powerstate based on the active server status
   * @param server Server to be check
   */
  private _getServerPowerState(server: Server): number {
    let serverPowerstate = server.powerState;

    if (!isNullOrEmpty(this._serversService.activeServers)) {
      for (let active of this._serversService.activeServers) {
        if (active.serverId === server.id) {
          // Update the powerstate of the corresponding server based on the row
          serverPowerstate = this._serversService.getActiveServerPowerState(active);
          server.powerState = serverPowerstate;
          break;
        }
      }
    }

    return serverPowerstate;
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
