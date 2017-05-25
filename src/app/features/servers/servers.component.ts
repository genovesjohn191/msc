import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
/** Services */
import {
  McsTextContentProvider,
  McsAssetsProvider,
  McsApiSearchKey
} from '../../core';
import { ServersService } from './servers.service';
/** Models */
import { Server } from './server';
import {
  McsApiError,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  CoreDefinition
} from '../../core';
/** Enum */
import { ServerStatus } from './server-status.enum';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  styles: [require('./servers.component.scss')]
})

export class ServersComponent implements OnInit, OnDestroy {
  public serversTextContent: string;
  public page: number;
  public keyword: string;
  public isLoading: boolean;
  public gear: string;
  /** Server Variables */
  public totalServerCount: number;
  public servers: Server[];
  /** Filter Variables */
  public columnSettings: any;
  /** Search Subscription */
  public searchSubscription: any;
  public searchSubject: Subject<McsApiSearchKey>;

  public actionStatusMap: Map<any, string>;

  public hasError: boolean;
  // Done loading and thrown an error
  public get loadedSuccessfully(): boolean {
    return !this.hasError;
  }

  // Done loading and no servers to display
  public get noServers(): boolean {
    return this.totalServerCount === 0 && !this.hasError && !this.keyword && !this.isLoading;
  }

  // Done loading and no servers found on filter
   public get emptySearchResult(): boolean {
    return this.totalServerCount === 0 && this.keyword && !this.isLoading;
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _serversService: ServersService,
    private _assetsProvider: McsAssetsProvider
  ) {
    this.isLoading = true;
    this.hasError = false;
    this.page = 1;
    this.searchSubject = new Subject<McsApiSearchKey>();
    this.servers = new Array();
    this.totalServerCount = 0;
    this.actionStatusMap = new Map<any, string>();
  }

  public ngOnInit() {
    this.serversTextContent = this._textProvider.content.servers;
    this.getGearClass();
    this.getServers();
  }

  public ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  public executeServerCommand(id: any, type: string) {
    this._serversService.postServerCommand(id, type)
      .subscribe((response) => {
        // console.log(response);
      });

    this.actionStatusMap.set(id, type);
  }

  public getActionStatus(id: any, type: string): any {
    let status: any = null;
    let isExist = this.actionStatusMap.has(id);

    if (isExist) {
      let currentAction = this.actionStatusMap.get(id);
      if (currentAction === type) {
        status = currentAction;
      }
    }
    return status;
  }

  public getGearClass() {
    this.gear = this._assetsProvider.getIcon('gear');
  }

  public getSpinnerClass(): string {
    return this._assetsProvider.getIcon('spinner');
  }

  public getStateIconClass(state: number): string {
    return this._assetsProvider.getIcon('state-' + ServerStatus[state].toLowerCase() + '-large');
  }

  public getServers(): void {
    this.searchSubscription = Observable.of(new McsApiSearchKey())
      .concat(this.searchSubject)
      .debounceTime(CoreDefinition.SEARCH_TIME)
      .distinctUntilChanged((previous, next) => {
        return previous.isEqual(next);
      })
      .switchMap((searchKey) => {
        // Switch observable items to server list
        this.servers.splice(0);
        return this._serversService.getServers(
          searchKey.page,
          // TODO: Display all record temporarily since Max item per page is under confirmation
          // searchKey.maxItemPerPage ? searchKey.maxItemPerPage : MAX_ITEMS_PER_PAGE,
          undefined,
          searchKey.keyword
        ).finally(() => this.isLoading = false);
      })
      .catch((error: McsApiErrorResponse) => {
        this.hasError = true;
        return Observable.throw(error);
      })
      .subscribe((mcsApiResponse) => {
        // Get server response
        if (mcsApiResponse.content) {
          this.hasError = false;
          this.servers = this.servers.concat(mcsApiResponse.content);
          this.totalServerCount = mcsApiResponse.totalCount;
        }
      });
  }

  public onClickMoreEvent(): void {
    this.getNextPage();
  }

  public onSearchEvent(key: any): void {
    this.searchServers(key);
  }

  public onEnterSearchEvent(): void {
    this.searchServers(this.keyword);
  }

  public getNextPage(): void {
    this.page += 1;
    this.updateServers(this.keyword, this.page);
  }

  public getDisplayServerCount(): number {
    return this.page * CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE;
  }

  public searchServers(key: any): void {
    this.page = 1;
    this.keyword = key;
    this.updateServers(this.keyword, this.page);
  }

  public updateServers(key?: string, page?: number) {
    let searchKey: McsApiSearchKey = new McsApiSearchKey();
    // Set server search key
    searchKey.maxItemPerPage = CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE;
    searchKey.page = page;
    searchKey.keyword = key;
    // Set true to loading flag
    this.isLoading = true;
    this.searchSubject.next(searchKey);
  }

  public onUpdateColumnSettings(columns: any): void {
    if (columns) {
      this.columnSettings = columns;
    }
  }
}
