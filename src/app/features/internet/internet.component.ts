import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsNavigationService,
  McsTableDataSource2,
  McsMatTableQueryParam,
  McsMatTableContext,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import { McsApiService } from '@app/services';
import {
  RouteKey,
  McsInternetPort,
  McsQueryParam,
  McsFilterInfo
} from '@app/models';
import {
  isNullOrEmpty,
  CommonDefinition,
  getSafeProperty,
  createObject
} from '@app/utilities';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';

@Component({
  selector: 'mcs-internet',
  templateUrl: './internet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InternetComponent {

  public readonly dataSource: McsTableDataSource2<McsInternetPort>;
  public readonly dataEvents: McsTableEvents<McsInternetPort>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'service' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'speed' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'plan' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'zone' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    this.dataSource = new McsTableDataSource2(this._getInternetPorts.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeInternetPorts
    });
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

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public navigateToInternet(internet: McsInternetPort): void {
    if (isNullOrEmpty(internet)) { return; }
    this._navigationService.navigateTo(RouteKey.InternetDetails, [internet.id]);
  }


  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getInternetPorts(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsInternetPort>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getInternetPorts(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount))
    );
  }
}
