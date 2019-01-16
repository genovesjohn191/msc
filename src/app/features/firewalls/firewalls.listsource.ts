import {
  Observable,
  of,
  merge
} from 'rxjs';
import { McsListSourceBase } from '@app/core';
import {
  compareStrings,
  isNullOrEmpty,
  containsString
} from '@app/utilities';
import { Search } from '@app/shared';
import {
  McsKeyValuePair,
  McsFirewall
} from '@app/models';
import { McsFirewallsRepository } from '@app/services';

export class FirewallsListSource extends McsListSourceBase<McsFirewall> {

  constructor(
    private _firewallsRepository: McsFirewallsRepository,
    private _search: Search) {
    super();
  }

  /**
   * Firewalls listing Group sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public firewallGroupSortMethod(first: McsKeyValuePair, second: McsKeyValuePair): number {
    return compareStrings(first.key, second.key);
  }

  /**
   * Firewalls listing sort method
   * @param first First record of the list
   * @param second Second record of the list
   */
  public firewallSortMethod(first: McsFirewall, second: McsFirewall): number {
    return compareStrings(first.managementName, second.managementName);
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
  protected getAllRecords(): Observable<McsFirewall[]> {
    return this._firewallsRepository.getAll();
  }

  /**
   * Filters all the records based on searched keyword
   * @param _record Record to be checked if it is included
   */
  protected filterMethod(_record: McsFirewall): boolean {
    if (isNullOrEmpty(_record)) { return true; }
    return containsString(_record.managementName, this._search.keyword);
  }
}
