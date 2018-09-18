import {
  Observable,
  merge,
  of
} from 'rxjs';
import {
  McsListSourceBase,
  McsSearch,
  McsKeyValuePair
} from '../../core';
import {
  compareStrings,
  containsString,
  isNullOrEmpty
} from '../../utilities';
import { Server } from './models';
import { ServersRepository } from './repositories/servers.repository';

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
      of(undefined),
      this._search.searchChangedStream,
    ];
    return merge(...dataStreams);
  }

  /**
   * Get all records from repository
   */
  protected getAllRecords(): Observable<Server[]> {
    return this._serversRepository.findAllRecords();
  }

  /**
   * Filters all the records based on searched keyword
   * @param _record Record to be checked if it is included
   */
  protected filterMethod(_record: Server): boolean {
    if (isNullOrEmpty(_record)) { return true; }
    return containsString(_record.name, this._search.keyword);
  }
}
