import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  CoreRoutes,
  McsAuthenticationIdentity,
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import {
  CrispOrderState,
  McsFilterInfo,
  McsObjectProjects,
  McsObjectProjectsQueryParams,
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
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-dashboard-projects',
  templateUrl: './dashboard-projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardProjectsComponent implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsObjectProjects>;
  private _state: CrispOrderState = 'OPEN';

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'number' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'temperature' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'customerName' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'shortDescription' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'primaryCrispOrder' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'projectManager' })
  ];

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _identity: McsAuthenticationIdentity,
    private _navigationService: McsNavigationService
  ) {
    this.dataSource = new McsTableDataSource2<McsObjectProjects>(this._getTableData.bind(this))
      .registerConfiguration(new McsMatTableConfig(true));
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
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

  public selectedTabChange(tab: MatTabChangeEvent): void {
    let state: CrispOrderState = tab.index === 0 ? 'OPEN': 'CLOSED';
    if (this._state !== state) {
      this._state = state;
      this.retryDatasource();
    }
  }

  public navigateToCrispOrder(orderId: McsObjectProjects, keyRoute: RouteKey): void {
    this._navigationService.navigateTo(RouteKey.LaunchPadCrispOrderDetails,
      [orderId.primaryCrispOrderId, CoreRoutes.getNavigationPath(keyRoute)]
    );
  }

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsObjectProjects>> {
    let queryParam = new McsObjectProjectsQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.state = this._state;
    queryParam.companyId = this._identity.user.companyId;

    return this._apiService.getProjects(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection, response?.totalCollectionCount)));
  }
}
