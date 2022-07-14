import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import {
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsCookieService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsTicket,
  McsTicketQueryParams,
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
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-tickets',
  templateUrl: './tickets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class TicketsComponent extends McsPageBase {
  public readonly dataSource: McsTableDataSource2<McsTicket>;
  public readonly dataEvents: McsTableEvents<McsTicket>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'ticketId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'ticketNumber' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'summary' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdBy' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedOn' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedBy' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'customerReference' })
  ];

  public urlParamSearchKeyword: string;
  public selectedTabIndex: number = 0;
  public isTabChanged: boolean = false;

  public readonly filterPredicate = this._isColumnIncluded.bind(this);

  private _search: Search;

  constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _activatedRoute: ActivatedRoute,
    private _cookieService: McsCookieService,
    private _navigationService: McsNavigationService,
    private _accessControlService: McsAccessControlService,
    private _translateService: TranslateService
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getTickets.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeTickets
    });
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

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public get featureName(): string {
    return 'tickets';
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

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
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
  public ticketCreatedByDifferentCompanyId(requestorCompanyId: string, requestor: string): boolean {
    let ticketCreatedBySameCompanyId = this.activeCompanyId === requestorCompanyId;
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
    let queryParam = new McsTicketQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    let queryParamSearch = getSafeProperty(param, obj => obj.search.keyword);
    this.urlParamSearchKeyword = this._activatedRoute.snapshot.queryParams.filter || undefined;
    let searchKeyword = isNullOrEmpty(param.search) ? this.urlParamSearchKeyword : queryParamSearch;
    queryParam.keyword = searchKeyword;
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    if(this.selectedTabIndex < 2){
      queryParam.state = this.selectedTabIndex === 0 ? 'open' : 'closed';
    }

    return this._apiService.getTickets(queryParam).pipe(

      map(response => {

        let sortedCollections: McsTicket[];

        if (isNullOrEmpty(queryParam.sortDirection) && isNullOrEmpty(queryParam.sortField)) {
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

  private _isColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'ticketId') {
      return this._accessControlService.hasAccessToFeature('EnableTicketId');
    }
    if (filter.id === 'ticketNumber') {
      return !this._accessControlService.hasAccessToFeature('EnableTicketId');
    }
    return true;
  }

  public getLegacyTicketIdTooltipPrefix(ticketNumber): string  {
    return this._translateService.instant('tickets.tooltip.legacyTicketNumber')+ticketNumber;
  }
}
