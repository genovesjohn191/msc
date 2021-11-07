import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
  McsQueryParam,
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
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'loggedBy' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'loggedOn' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'lastUpdatedDate' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'lastUpdatedBy' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'customerReference' })
    ];
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
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

  private _getTickets(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsTicket>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    let queryParamSearch = getSafeProperty(param, obj => obj.search.keyword);
    this.urlParamSearchKeyword = this._activatedRoute.snapshot.queryParams.filter || undefined;
    let searchKeyword = isNullOrEmpty(param.search) ? this.urlParamSearchKeyword : queryParamSearch;
    queryParam.keyword = searchKeyword;

    let ticketSortPredicate = (firstRecord: McsTicket, secondRecord: McsTicket) =>
      compareDates(secondRecord.updatedOn, firstRecord.updatedOn);

    return this._apiService.getTickets(queryParam).pipe(
      map(response => {
        let sortedCollections = response?.collection?.sort(ticketSortPredicate);
        return new McsMatTableContext(sortedCollections, response?.totalCollectionCount);
      })
    );
  }
}
