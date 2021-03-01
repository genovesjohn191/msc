import {
  ChangeDetectionStrategy,
  Component,
  OnInit
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

@Component({
  selector: 'mcs-update-management-widget',
  templateUrl: './update-management-widget.component.html',
  styleUrls: ['./update-management-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateManagementWidgetComponent implements OnInit {
  public readonly dataSource: McsTableDataSource2<McsReportUpdateManagement>;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'targetComputer' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'osType' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'subscription' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'resourceGroup' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'lastStartTime' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'lastEndTime' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'lastStatus' })
  ];
  constructor(
    private _reportingService: McsReportingService,
    private _navigationService: McsNavigationService,
  ) {
    this.dataSource = new McsTableDataSource2(this._getUpdateManagement.bind(this));
  }

  ngOnInit(): void {
    this._initializeDataColumns();
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

  private _getUpdateManagement(): Observable<McsMatTableContext<McsReportUpdateManagement>> {
    return this._reportingService.getUpdateManagement().pipe(
      map(response => new McsMatTableContext(response,
        response?.length)),
      catchError(() => {
        return throwError('Update management endpoint failed.');
      })
    );
  }

  private _initializeDataColumns(): void {
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }
}
