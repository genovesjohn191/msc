import { Observable } from 'rxjs/Rx';
import {
  McsListSourceBase,
  McsSearch,
  McsKeyValuePair
} from '../../core';
import { compareStrings } from '../../utilities';
import { Server } from './models';
import { ServersRepository } from './servers.repository';

export class ServersListSource extends McsListSourceBase<Server> {

  constructor(
    private _serversRepository: ServersRepository,
    private _search: McsSearch) {
    super();
  }

  /**
   * Resource listing sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public sortResourceMethod(first: McsKeyValuePair, second: McsKeyValuePair): number {
    return compareStrings(first.key.resourceName, second.key.resourceName);
  }

  /**
   * Servers listing sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public serversSortMethod(first: Server, second: Server): number {
    return compareStrings(first.name, second.name);
  }

  /**
   * Streams to be considered when to get/find all the records from listing
   */
  protected getStreams(): Observable<any> {
    const dataStreams = [
      Observable.of(undefined),
      this._serversRepository.dataRecordsChanged,
      this._search.searchChangedStream,
    ];
    return Observable.merge(...dataStreams);
  }

  /**
   * Get all records from repository
   */
  protected getAllRecords(): Observable<Server[]> {
    return this._serversRepository.findAllRecords(undefined, this._search);
  }
}
