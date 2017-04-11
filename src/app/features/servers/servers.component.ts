import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Self,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
/** Services */
import {
  TextContentProvider,
  AssetsProvider
} from '../../core';
import { ServersService } from './servers.service';
/** Models */
import { Server } from './server';
import { ServerListSearchKey } from './sever-list-search-key';
import {
  McsApiError,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  CoreDefinition
} from '../../core';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  styles: [require('./servers.component.scss')]
})

export class ServersComponent implements OnInit, OnDestroy {
  public title: string;
  public page: number;
  public keyword: string;
  public isLoaded: boolean;
  public errorMessage: string;
  public gear: string;
  /** Server Variables */
  public totalServerCount: number;
  public servers: Server[];
  /** Filter Variables */
  public columnSettings: any;
  /** Search Subscription */
  public searchSubscription: any;
  public searchSubject: Subject<ServerListSearchKey>;

  public constructor(
    private _textProvider: TextContentProvider,
    private _serversService: ServersService,
    private _assetsProvider: AssetsProvider
  ) {
    this.title = _textProvider.content.servers.title;
    this.isLoaded = false;
    this.page = 1;
    this.searchSubject = new Subject<ServerListSearchKey>();
    this.servers = new Array();
    this.totalServerCount = 0;
  }

  public ngOnInit() {
    this.getGearClass();
    this.getServers();
  }

  public ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  public getGearClass() {
    this.gear = this._assetsProvider.getIcon('gear');
  }

  public getServers(): void {
    this.searchSubscription = Observable.of(new ServerListSearchKey())
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
          searchKey.serverNameKeyword
        ).finally(() => this.isLoaded = true);
      })
      .retry(3)
      .catch((error: McsApiErrorResponse) => {
        this.errorMessage = error.message;
        return Observable.throw(error);
      })
      .subscribe((mcsApiResponse) => {
        // Get server response
        this.servers = this.servers.concat(mcsApiResponse.content);
        this.totalServerCount = mcsApiResponse.totalCount;
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
    let searchKey: ServerListSearchKey = new ServerListSearchKey();
    // Set server search key
    searchKey.maxItemPerPage = CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE;
    searchKey.page = page;
    searchKey.serverNameKeyword = key;
    // Set false to load flag
    this.isLoaded = false;
    this.searchSubject.next(searchKey);
  }

  public onUpdateColumnSettings(columns: any): void {
    if (columns) {
      this.columnSettings = columns;
    }
  }
}
