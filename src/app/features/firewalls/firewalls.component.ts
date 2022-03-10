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
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material/sort';

import {
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsFirewall,
  McsQueryParam,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-firewalls',
  templateUrl: './firewalls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallsComponent {
  public readonly dataSource: McsTableDataSource2<McsFirewall>;
  public readonly dataEvents: McsTableEvents<McsFirewall>;

  public readonly filterPredicate = this._isColumnIncluded.bind(this);
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'firewall' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'serialNumber' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'firmwareVersion' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'ipAddress' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'role' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  public isSorting: boolean;

  private _sortDirection: string;
  private _sortField: string;

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    this.dataSource = new McsTableDataSource2(this._getFirewalls.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeFirewalls
    });
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
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

  public navigateToFirewall(firewall: McsFirewall): void {
    if (isNullOrEmpty(firewall)) { return; }
    this._navigationService.navigateTo(RouteKey.FirewallDetails, [firewall.id]);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private _isColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id !== 'serialNumber') { return true; }
    return this._accessControlService.hasPermission(['FirewallSerialNumberView']);
  }

  private _getFirewalls(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsFirewall>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getFirewalls(queryParam).pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      map(response => {
        this.isSorting = false;
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }
}
