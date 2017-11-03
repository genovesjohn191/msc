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
import { FirewallsService } from '../firewalls.service';
import {
  isNullOrEmpty,
  compareStrings
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
    private _firewallsService: FirewallsService,
    private _search: McsSearch
  ) {
    this._searchMode = false;
    this._firewallListStream = new BehaviorSubject<FirewallList[]>([]);
    this._setFirewallListData();
    this.dataLoadingStream = new Subject<McsDataStatus>();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<FirewallList[]> {
    const displayDataChanges = [
      this._search.searchChangedStream,
      this._firewallListStream
    ];

    return Observable.merge(...displayDataChanges)
      .map(() => {
        this.dataLoadingStream.next(McsDataStatus.InProgress);
        let firewallList = new Array<FirewallList>();
        this._searchMode = (this._search.keyword) ? true : false ;

        if (!isNullOrEmpty(this._firewallList)) {
          firewallList = this._firewallList.slice().filter((firewall: FirewallList) => {
            let searchStr = (firewall.name + firewall.haGroupName).toLowerCase();
            return searchStr.indexOf(this._search.keyword.toLowerCase()) !== -1;
          });
        }

        return firewallList;
      });
  }

  public disconnect() {
    // Disconnect all resources
    if (this._firewallsSubscription) {
      this._firewallsSubscription.unsubscribe();
    }

    if (this._activeFirewallSubscription) {
      this._activeFirewallSubscription.unsubscribe();
    }
  }

  public onCompletion(_status: McsDataStatus): void {
    // Do all the completion of pagination, filtering, etc... here
    this._search.showLoading(false);
  }

  private _setFirewallListData(): void {
    this._firewallsSubscription = this._firewallsService.getFirewalls()
      .subscribe((response) => {
        this.dataLoadingStream.next(McsDataStatus.InProgress);
        this._firewallList = this._mapFirewallList(response.content);
        this._firewallListStream.next(this._firewallList);
      });
  }

  private _mapFirewallList(firewalls: Firewall[]): FirewallList[] {
    if (isNullOrEmpty(firewalls)) { return; }

    firewalls.sort((first: Firewall, second: Firewall) => {
      return compareStrings(first.managementName, second.managementName);
    });

    let firewallList = new Array<FirewallList>();
    firewalls.forEach((firewall) => {
      let firewallListItem = new FirewallList();
      firewallListItem.id = firewall.id;
      firewallListItem.name = firewall.managementName;
      firewallListItem.haGroupName = firewall.haGroupName;
      firewallListItem.connectionStatus = firewall.connectionStatus;

      firewallList.push(firewallListItem);
    });

    return firewallList;
  }

}
