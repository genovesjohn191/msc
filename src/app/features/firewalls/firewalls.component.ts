import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsAccessControlService,
  McsFilterPanelEvents,
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
  public readonly filterPanelEvents: McsFilterPanelEvents;

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
    this.filterPanelEvents = new McsFilterPanelEvents(_injector);
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

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public navigateToFirewall(firewall: McsFirewall): void {
    if (isNullOrEmpty(firewall)) { return; }
    this._navigationService.navigateTo(RouteKey.FirewallDetails, [firewall.id]);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
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
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getFirewalls(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }
}
