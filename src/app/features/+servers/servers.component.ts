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
import { TextContentProvider } from '../../core';
import { ServersService } from './servers.service';
/** Models */
import { Server } from './server';
import { ServerListSearchKey } from './sever-list-search-key';
import {
  McsApiError,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  SharedDefintion
} from '../../core';

// TODO: Set actual count of item to be displayed
const MAX_ITEMS_PER_PAGE = 10;

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
  /** Server Variables */
  public displayServerCount: number;
  public totalServerCount: number;
  public servers: Server[];
  /** Filter Variables */
  public columnSettings: any;
  /** Search Subscription */
  public searchSubscription: any;
  public searchSubject: Subject<ServerListSearchKey>;

  public constructor(
    private _textProvider: TextContentProvider,
    private _serversService: ServersService
  ) {
    this.title = _textProvider.content.servers.title;
    this.isLoaded = false;
    this.page = 1;
    this.searchSubject = new Subject<ServerListSearchKey>();
    this.servers = new Array();
    this.totalServerCount = 0;
    this.displayServerCount = MAX_ITEMS_PER_PAGE;
  }

  public ngOnInit() {
    this.getServers();
  }

  public ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  public getServers(): void {
    this.searchSubscription = Observable.of(new ServerListSearchKey())
      .concat(this.searchSubject)
      .debounceTime(SharedDefintion.SEARCH_TIME)
      .distinctUntilChanged((previous, next) => {
        return previous.isEqual(next);
      })
      .switchMap((searchKey) => {
        // Switch observable items to server list
        return this._serversService.getServers(
          searchKey.page,
          searchKey.maxItemPerPage ? searchKey.maxItemPerPage : MAX_ITEMS_PER_PAGE,
          searchKey.serverNameKeyword
        ).finally(() => this.isLoaded = true);
      })
      .retry(3)
      .catch((error: Response | any) => {
        let apiErrorResponse: McsApiErrorResponse = error.json();
        if (apiErrorResponse) {
          this.errorMessage = apiErrorResponse.message;
        } else {
          this.errorMessage = error.statusText;
        }
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

  public getNextPage(): void {
    this.page += 1;
    this.displayServerCount += MAX_ITEMS_PER_PAGE;
    this.updateServers(this.keyword, this.page);
  }

  public searchServers(key: any): void {
    this.page = 1;
    this.displayServerCount = MAX_ITEMS_PER_PAGE;
    this.keyword = key;
    this.servers.splice(0);
    this.updateServers(this.keyword, this.page);
  }

  public updateServers(key?: string, page?: number) {
    let searchKey: ServerListSearchKey = new ServerListSearchKey();
    // Set server search key
    searchKey.maxItemPerPage = MAX_ITEMS_PER_PAGE;
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
