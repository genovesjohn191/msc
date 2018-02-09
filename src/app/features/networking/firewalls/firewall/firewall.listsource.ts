import {
  IterableDiffer,
  IterableDiffers
} from '@angular/core';
import {
  Observable,
  Subject,
  BehaviorSubject
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
  private _firewallsSubscription: any;
  private _firewallListStream: BehaviorSubject<FirewallList[]>;
  private _firewallList: FirewallList[];

  private _firewallDiffer: IterableDiffer<Firewall>;

  private _searchMode: boolean;
  public get searchMode(): boolean {
    return this._searchMode;
  }
  public set searchMode(value: boolean) {
    this._searchMode = value;
  }

  public get firewallsSubscription(): any {
    return this._firewallsSubscription;
  }

  constructor(
    private _firewallsRepository: FirewallsRepository,
    private _search: McsSearch,
    private _differs: IterableDiffers
  ) {
    this._searchMode = false;
    this._firewallListStream = new BehaviorSubject<FirewallList[]>([]);
    this._firewallList = new Array<FirewallList>();
    this.dataLoadingStream = new Subject<McsDataStatus>();
    this._firewallDiffer = this._differs.find([]).create(null);
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
            this._firewallList = this._mapFirewallList(content);
            this._firewallListStream.next(this._firewallList);
            return this._firewallList;
          });
      });
  }

  public disconnect() {
    // Disconnect all resources
    unsubscribeSafely(this._firewallsSubscription);
    unsubscribeSafely(this._activeFirewallSubscription);
  }

  public onCompletion(_status: McsDataStatus): void {
    // Do all the completion of pagination, filtering, etc... here
    this._search.showLoading(false);
  }

  private _mapFirewallList(firewalls: Firewall[]): FirewallList[] {
    if (isNullOrEmpty(firewalls)) { return new Array<FirewallList>(); }

    // Check for changes in record
    let changes = this._firewallDiffer.diff(firewalls);
    if (isNullOrEmpty(changes)) { return this._firewallList; }

    firewalls.sort((first: Firewall, second: Firewall) => {
      return compareStrings(first.managementName, second.managementName);
    });

    let firewallList = new Array<FirewallList>();
    firewalls.forEach((firewall) => {
      let firewallListItem = new FirewallList();
      firewallListItem.id = firewall.id;
      firewallListItem.managementName = firewall.managementName;
      firewallListItem.haGroupName = firewall.haGroupName;
      firewallListItem.haRole = firewall.haRole;
      firewallListItem.connectionStatus = firewall.connectionStatus;

      firewallList.push(firewallListItem);
    });

    return firewallList;
  }

}
