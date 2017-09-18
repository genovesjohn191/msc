import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  McsDataSource,
  McsSearch,
  McsListPanelItem
} from '../../../core';
import {
  Firewall,
  FirewallList
} from '../models';
import { FirewallsService } from '../firewalls.service';
import { FirewallService } from './firewall.service';
import {
  isNullOrEmpty,
  refreshView
} from '../../../utilities';

const SERVER_LIST_GROUP_OTHERS = 'Others';

export class FirewallListSource implements McsDataSource<FirewallList> {
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

  private _selectedElement: McsListPanelItem;
  public get selectedElement(): McsListPanelItem {
    return this._selectedElement;
  }
  public set selectedElement(value: McsListPanelItem) {
    this._selectedElement = value;
  }

  constructor(
    private _firewallsService: FirewallsService,
    private _firewallService: FirewallService,
    private _search: McsSearch
  ) {
    this._searchMode = false;
    this._firewallListStream = new BehaviorSubject<FirewallList[]>([]);
    this._setFirewallListData();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<FirewallList[]> {
    const displayDataChanges = [
      this._search.searchChangedStream,
      this._firewallListStream
    ];

    return Observable.merge(...displayDataChanges)
      .map(() => {
        let firewallList = new Array<FirewallList>();
        this._searchMode = (this._search.keyword) ? true : false ;

        if (!isNullOrEmpty(this._firewallList)) {
          firewallList = this._firewallList.slice().filter((firewall: FirewallList) => {
            let searchStr = (firewall.name + firewall.haGroupName).toLowerCase();
            return searchStr.indexOf(this._search.keyword.toLowerCase()) !== -1;
          });
        }

        if (this._firewallService.selectedFirewall) {
          let selectedFirewall = this._firewallService.selectedFirewall;
          refreshView(() => {
            this.selectedElement = {
              itemId: selectedFirewall.id,
              groupName: selectedFirewall.haGroupName
            } as McsListPanelItem;
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

  public onCompletion(data?: any): void {
    // Do all the completion of pagination, filtering, etc... here
  }

  public onError(status?: number): void {
    // Do all the error handling error, on what to display in the view
  }

  private _setFirewallListData(): void {
    this._firewallsSubscription = this._firewallsService.getFirewalls()
      .subscribe((response) => {
        this._firewallList = this._mapFirewallList(response.content);
        this._firewallListStream.next(this._firewallList);
      });
  }

  private _mapFirewallList(firewalls: Firewall[]): FirewallList[] {
    if (isNullOrEmpty(firewalls)) { return; }

    let firewallList = new Array<FirewallList>();
    firewalls.forEach((firewall) => {
      let firewallListItem = new FirewallList();
      firewallListItem.id = firewall.id;
      firewallListItem.name = firewall.managementName;
      firewallListItem.haGroupName = firewall.haGroupName;

      firewallList.push(firewallListItem);
    });

    return firewallList;
  }

}
