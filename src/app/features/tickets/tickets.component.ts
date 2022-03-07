import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';

import {
  McsAuthenticationIdentity,
  McsCookieService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsTicketQueryParams,
  McsTicket,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  compareDates,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-tickets',
  templateUrl: './tickets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class TicketsComponent {
  public readonly dataSource: McsTableDataSource2<McsTicket>;
  public readonly dataEvents: McsTableEvents<McsTicket>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  public urlParamSearchKeyword: string;
  public selectedTabIndex: number = 0;
  public isTabChanged: boolean = false;

  private _search: Search;
  public isSorting: boolean;

  private _sortDirection: string;
  private _sortField: string;

  constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _activatedRoute: ActivatedRoute,
    private _cookieService: McsCookieService,
    private _navigationService: McsNavigationService
  ) {
    this.dataSource = new McsTableDataSource2(this._getTickets.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeTickets
    });
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'ticketNumber' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'summary' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdBy' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedOn' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedBy' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'customerReference' })
    ];
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value) && this._search !== value ) {
      this._search = value;
      this.dataSource.registerSearch(value);
    }
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public get addIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get activeCompanyId(): string {
    let companyIdHeader: string = this._cookieService.getEncryptedItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT);
    return companyIdHeader ? companyIdHeader : this._authenticationIdentity.user?.companyId;
  }

  public onTabChanged(): void {
    this.isTabChanged = true;
    this.dataSource.clear();
    this.retryDatasource();
    this._search.clear();
  }

  /**
   * Whether to show attribution text or not in logged by column
   */
  public ticketCreatedByDifferentCompanyId(createdByCompanyId: string, requestor: string): boolean {
    let ticketCreatedBySameCompanyId = this.activeCompanyId === createdByCompanyId;
    let invalidToShowAttributionText = ticketCreatedBySameCompanyId || isNullOrEmpty(requestor);
    if (invalidToShowAttributionText) { return false; }
    return true;
  }

  /**
   * Whether to show attribution text or not in last updated by column
   */
  public ticketUpdatedByDifferentCompanyId(updatedByCompanyId: string, updatedBy: string): boolean {
    let ticketUpdatedBySameCompanyId = this.activeCompanyId === updatedByCompanyId;
    let invalidToShowAttributionText = ticketUpdatedBySameCompanyId || isNullOrEmpty(updatedBy);
    if (invalidToShowAttributionText) { return false; }
    return true;
  }

  public navigateToTicket(ticket: McsTicket): void {
    if (isNullOrEmpty(ticket)) { return; }
    this._navigationService.navigateTo(RouteKey.TicketDetails, [ticket.id]);
  }

  public onClickNewTicket(): void {
    this._navigationService.navigateTo(RouteKey.TicketCreate);
  }

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private _getTickets(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsTicket>> {
    let queryParam = new McsTicketQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    let queryParamSearch = getSafeProperty(param, obj => obj.search.keyword);
    this.urlParamSearchKeyword = this._activatedRoute.snapshot.queryParams.filter || undefined;
    let searchKeyword = isNullOrEmpty(param.search) ? this.urlParamSearchKeyword : queryParamSearch;
    queryParam.keyword = searchKeyword;
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    if(this.selectedTabIndex < 2){
      queryParam.state = this.selectedTabIndex === 0 ? 'open' : 'closed';
    }

    

    return this._apiService.getTickets(queryParam).pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      map(response => {
        this.isSorting = false;
        let sortedCollections: McsTicket[];

        if (isNullOrEmpty(this._sortDirection) && isNullOrEmpty(this._sortField)) {
          let ticketSortPredicate = (firstRecord: McsTicket, secondRecord: McsTicket) =>
            compareDates(secondRecord.updatedOn, firstRecord.updatedOn);
          sortedCollections = response?.collection?.sort(ticketSortPredicate);
        } else {
          sortedCollections = response?.collection;
        }

        this.isTabChanged = false;
        return new McsMatTableContext(sortedCollections, response?.totalCollectionCount);
      })
    );
  }
}
