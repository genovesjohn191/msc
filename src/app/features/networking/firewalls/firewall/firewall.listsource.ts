import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsDataStatus,
  McsSearch
} from '../../../../core';
import {
  Firewall,
  FirewallList
} from '../models';
import { FirewallsRepository } from '../firewalls.repository';
import {
  isNullOrEmpty,
  compareStrings,
  unsubscribeSafely
} from '../../../../utilities';

export class FirewallListSource implements McsDataSource<FirewallList> {
  /**
   * This will notify the subscribers of the datasource that the obtainment is InProgress
   */
  public dataLoadingStream: Subject<McsDataStatus>;

  private _activeFirewallSubscription: any;
  private _firewallList: FirewallList[];

  constructor(
    private _firewallsRepository: FirewallsRepository,
    private _search: McsSearch
  ) {
    this._firewallList = new Array<FirewallList>();
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<FirewallList[]> {
    const displayDataChanges = [
      Observable.of(undefined), // Add undefined observable to make way of retry when error occured
      this._firewallsRepository.dataRecordsChanged,
      this._search.searchChangedStream
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
        return this._firewallsRepository.findAllRecords(undefined, this._search)
          .map((content) => {
            this._mapFirewallList(content);
            return this._firewallList;
          });
      });
  }

  public disconnect() {
    // Disconnect all resources
    unsubscribeSafely(this._activeFirewallSubscription);
  }

  public onCompletion(_status: McsDataStatus): void {
    // Do all the completion of pagination, filtering, etc... here
    this._search.showLoading(false);
  }

  /**
   * Map firewalls to firewall list to display in list-panel
   * @param firewalls Firewalls to map
   */
  private _mapFirewallList(firewalls: Firewall[]): void {
    if (isNullOrEmpty(firewalls)) { return; }

    // We need to check again if there are added or deleted
    // to notify the list panel that a data should be refreshed
    let hasChangesOnCount = firewalls.length !== this._firewallList.length;
    if (isNullOrEmpty(this._firewallList) || hasChangesOnCount) {
      // Set the iterator of the firewalls so that we have reference on the instance itself
      this._firewallList = new Array<FirewallList>();
      firewalls.forEach((firewall) => {
        let firewallListItem = new FirewallList();
        firewallListItem.haGroupName = firewall.haGroupName;
        firewallListItem.firewall = firewall;
        this._firewallList.push(firewallListItem);
      });

      // Sort record by firewall name per haGroup
      this._firewallList.sort((first: FirewallList, second: FirewallList) => {
        return compareStrings(first.firewall.managementName, second.firewall.managementName)
          || compareStrings(first.haGroupName, second.haGroupName);
      });
    } else {
      // Update the corresponding firewall instance so that the
      // Iterable differ in the list panel will not determine it as changed.
      firewalls.forEach((firewall) => {
        let existingRecord = this._firewallList.find((listItem) => {
          return listItem.firewall.id === firewall.id;
        });
        if (!isNullOrEmpty(existingRecord)) {
          existingRecord.firewall = firewall;
        }
      });
    }
  }
}
