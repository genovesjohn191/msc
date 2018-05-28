import { Observable } from 'rxjs/Rx';
import {
  McsListSourceBase,
  McsSearch,
  McsKeyValuePair
} from '../../../core';
import { Firewall } from './models';
import { FirewallsRepository } from './firewalls.repository';
import { compareStrings } from '../../../utilities';

export class FirewallsListSource extends McsListSourceBase<Firewall> {

  constructor(
    private _firewallsRepository: FirewallsRepository,
    private _search: McsSearch) {
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
  public firewallSortMethod(first: Firewall, second: Firewall): number {
    return compareStrings(first.managementName, second.managementName);
  }

  /**
   * Streams to be considered when to get/find all the records from listing
   */
  protected getStreams(): Observable<any> {
    const dataStreams = [
      Observable.of(undefined),
      this._search.searchChangedStream,
    ];
    return Observable.merge(...dataStreams);
  }

  /**
   * Get all records from repository
   */
  protected getAllRecords(): Observable<Firewall[]> {
    return this._firewallsRepository.findAllRecords(undefined, this._search);
  }
}
