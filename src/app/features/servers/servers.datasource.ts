import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsDataStatus,
  McsPaginator,
  McsSearch
} from '../../core';
import { isNullOrEmpty } from '../../utilities';
import { Server } from './models';
import { ServersRepository } from './servers.repository';

export class ServersDataSource implements McsDataSource<Server> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  constructor(
    private _serversRepository: ServersRepository,
    private _paginator: McsPaginator,
    private _search: McsSearch
  ) {
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /**
   * Connect function called by the table to retrieve
   * one stream containing the data to render.
   */
  public connect(): Observable<Server[]> {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._serversRepository.dataRecordsChanged,
      this._paginator.pageChangedStream,
      this._search.searchChangedStream,
    ];

    return Observable.merge(...displayDataChanges)
      .switchMap(() => {
        // Notify the table that a process is currently in-progress
        this.dataLoadingStream.next(McsDataStatus.InProgress);

        // Find all records based on settings provided in the input
        return this._serversRepository.findAllRecords(
          this._paginator, this._search,
          (_item: Server) => {
            return _item.name
              + _item.serviceType
              + _item.operatingSystem && _item.operatingSystem.edition
              + _item.managementIpAddress
              + _item.platform && _item.platform.resourceName;
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
   * @param servers Data to be provided when the datasource is connected
   */
  public onCompletion(_status: McsDataStatus, _record: Server[]): void {
    // Execute all data from completion
    this._search.showLoading(false);
    this._paginator.showLoading(false);
  }

  /**
   * Remove the server from the datasource
   * @param serverId Server to be renamed
   */
  public removeDeletedServer(serverId: string): void {
    if (isNullOrEmpty(serverId)) { return; }
    this._serversRepository.deleteRecordById(serverId);
  }

  /**
   * Rename the displayed server on the table itself
   * @param serverId Server to be renamed
   * @param newName New name of the server
   */
  public renameServer(serverId: string, newName: string): void {
    if (isNullOrEmpty(serverId)) { return; }
    let renamedServer = this._serversRepository.dataRecords
      .find((serverItem) => {
        return serverItem.id === serverId;
      });
    if (!isNullOrEmpty(renamedServer)) {
      renamedServer.name = newName;
    }
    this._serversRepository.updateRecord(renamedServer);
  }

  /**
   * Get the displayed server by ID
   * @param serverId Server Id to obtained
   */
  public getDisplayedServerById(serverId: any): Server {
    if (isNullOrEmpty(this._serversRepository.dataRecords)) { return; }
    return this._serversRepository.dataRecords
      .find((server) => server.id === serverId);
  }
}
