import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsDataStatus,
  McsSearch
} from '../../core';
import {
  Server,
  ServerList
} from './models';
import { ServersRepository } from './servers.repository';
import {
  isNullOrEmpty,
  compareStrings
} from '../../utilities';

const SERVER_LIST_GROUP_OTHERS = 'Others';

export class ServersListSource implements McsDataSource<ServerList> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  // Server list information
  private _serverList: ServerList[];

  constructor(
    private _serversRepository: ServersRepository,
    private _search: McsSearch) {
    this._serverList = new Array();
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<ServerList[]> {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._serversRepository.dataRecordsChanged,
      this._search.searchChangedStream,
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap((instance) => {
        // Notify the table that a process is currently in-progress
        // if the user is not searching because the filtering has already a loader
        // and we need to check it here since the component can be recreated during runtime
        let isSearching = !isNullOrEmpty(instance) && instance.searching;
        if (!isSearching) {
          this.dataLoadingStream.next(McsDataStatus.InProgress);
        }

        // Find all records based on settings provided in the input
        return this._serversRepository.findAllRecords(undefined, this._search)
          .map((content) => {
            this._mapToServerList(content);
            return this._serverList;
          });
      });
  }

  /**
   * Destroy all objects from the current connection
   * and return all the record to its original value
   */
  public disconnect() {
    // Release all resources
  }

  /**
   * This will invoke when the data obtainment is completed
   * @param _status Status of the data obtainment
   */
  public onCompletion(_status: McsDataStatus): void {
    // Do all the completion of pagination, filtering, etc... here
    this._search.showLoading(false);
  }

  /**
   * Map servers to server list to display in list-panel
   * @param servers Servers to map
   */
  private _mapToServerList(servers: Server[]): ServerList[] {
    if (isNullOrEmpty(servers)) { return new Array(); }

    // We need to check again if there are added or deleted
    // to notify the list panel that a data should be refreshed
    let hasChangesOnCount = servers.length !== this._serverList.length;
    if (isNullOrEmpty(this._serverList) || hasChangesOnCount) {
      // Set the iterator of the server so that we have reference on the instance itself
      this._serverList = new Array<ServerList>();
      servers.forEach((server) => {
        let hasResourceName = !isNullOrEmpty(server.platform)
          && !isNullOrEmpty(server.platform.resourceName);

        let serverListItem = new ServerList();
        serverListItem.vdcName = (hasResourceName) ?
        server.platform.resourceName : SERVER_LIST_GROUP_OTHERS;
        serverListItem.server = server;
        this._serverList.push(serverListItem);
      });

      // Sort record based on VDC name
      this._serverList.sort((first: ServerList, second: ServerList) => {
        return compareStrings(first.vdcName, second.vdcName);
      });
    } else {
      for (let index = 0; index < servers.length; ++index) {
        this._serverList[index].server = servers[index];
      }
    }

    return this._serverList;
  }
}
