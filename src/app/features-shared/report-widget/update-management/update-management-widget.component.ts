import {
  throwError,
  Observable
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsReportingService,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsQueryParam,
  McsReportUpdateManagement,
  RouteKey
} from '@app/models';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-update-management-widget',
  templateUrl: './update-management-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class UpdateManagementWidgetComponent {
  public readonly dataSource: McsTableDataSource2<McsReportUpdateManagement>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  @Output()
  public dataChange= new EventEmitter<McsReportUpdateManagement[]>(null);

  private _sortDef: MatSort;

  constructor(
    private _reportingService: McsReportingService,
    private _navigationService: McsNavigationService,
  ) {
    this.dataSource = new McsTableDataSource2(this._getUpdateManagement.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'targetComputer' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'osType' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'subscription' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'resourceGroup' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'lastStartTime' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'lastEndTime' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'lastStatus' })
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public isStatusFailedWithError(resource: McsReportUpdateManagement): boolean {
    return resource.lastStatus === 'Failed' && !isNullOrEmpty(resource.error);
  }

  /**
   * Navigate to azure request change
   */
  public onRequestChange(resource: McsReportUpdateManagement): void {
    return isNullOrEmpty(resource.subscriptionServiceId && resource.azureId) ?
      this._navigationService.navigateTo(RouteKey.OrderMsRequestChange) :
      this._navigationService.navigateTo(
        RouteKey.OrderMsRequestChange, [], { queryParams: { serviceId: resource.subscriptionServiceId, resourceId: resource.azureId}});
  }

  private _getUpdateManagement(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsReportUpdateManagement>> {
    this.dataChange.emit(undefined);

    let queryParam = new McsQueryParam();
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._reportingService.getUpdateManagement(queryParam).pipe(
      map((response) => {
        let dataSourceContext = new McsMatTableContext(response, response?.length);
        this.dataChange.emit(dataSourceContext?.dataRecords);
        return dataSourceContext;
      }),
      catchError((error) => {
        this.dataChange.emit([]);
        return throwError(error);
      })
    );
  }
}
