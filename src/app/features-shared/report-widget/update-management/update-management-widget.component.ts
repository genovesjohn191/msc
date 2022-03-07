import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';
import {
  McsFilterInfo,
  McsQueryParam,
  McsReportUpdateManagement,
  RouteKey
} from '@app/models';
import {
  McsMatTableContext,
  McsNavigationService,
  McsTableDataSource2,
  McsReportingService
} from '@app/core';
import {
  createObject,
  isNullOrEmpty
} from '@app/utilities';
import { Sort } from '@angular/material/sort';

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

  private _sortDirection: string;
  private _sortField: string;

  @Output()
  public dataChange= new EventEmitter<McsReportUpdateManagement[]>(null);

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

  public onSortChange(sortState: Sort) {
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private _getUpdateManagement(): Observable<McsMatTableContext<McsReportUpdateManagement>> {
    this.dataChange.emit(undefined);

    let queryParam = new McsQueryParam();
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

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
