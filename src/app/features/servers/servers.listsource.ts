import {
  Observable,
  merge,
  of
} from 'rxjs';
import { McsListSourceBase } from '@app/core';
import {
  compareStrings,
  containsString,
  isNullOrEmpty
} from '@app/utilities';
import { Search } from '@app/shared';
import {
  McsKeyValuePair,
  McsServer
} from '@app/models';
import { ServersRepository } from '@app/services';

export class ServersListSource extends McsListSourceBase<McsServer> {

  constructor(
    private _serversRepository: ServersRepository,
    private _search: Search) {
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
  public serversSortMethod(first: McsServer, second: McsServer): number {
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
  protected getAllRecords(): Observable<McsServer[]> {
    return this._serversRepository.findAllRecords();
  }

  /**
   * Filters all the records based on searched keyword
   * @param _record Record to be checked if it is included
   */
  protected filterMethod(_record: McsServer): boolean {
    if (isNullOrEmpty(_record)) { return true; }
    return containsString(_record.name, this._search.keyword);
  }
}
