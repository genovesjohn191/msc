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
  McsAccessControlService,
  McsMatTableContext,
  McsNavigationService,
  McsReportingService,
  McsTableDataSource2
} from '@app/core';
import {
  McsFeatureFlag,
  McsFilterInfo,
  McsReportRecentServiceRequestSlt,
  RouteKey
} from '@app/models';
import { createObject } from '@app/utilities';

const maxTextLength = 9;

@Component({
  selector: 'mcs-recent-service-request-slt-widget',
  templateUrl: './recent-service-request-slt-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class RecentServiceRequestSltWidgetComponent {
  @Output()
  public dataChange= new EventEmitter<McsReportRecentServiceRequestSlt[]>(null);

  public readonly dataSource: McsTableDataSource2<McsReportRecentServiceRequestSlt>;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'orderId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'assignmentTarget' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'submitted' })
  ];

  constructor(
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _reportingService: McsReportingService
    ) {
    this.dataSource = new McsTableDataSource2(this._getRecentServiceRequestSlt.bind(this));
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public descriptionTooltip(text: string): string {
    return (text && (text.length < maxTextLength)) ? '' : text;
  }

  public hasAccessToAzureServiceRequest(): boolean {
    return this._accessControlService.hasAccessToFeature(McsFeatureFlag.OrderingMicrosoftRequestChange) &&
      this._accessControlService.hasPermission(['OrderEdit', 'OrderApprove']);
  }

  public navigateToAzureServiceRequest(): void {
    this._navigationService.navigateTo(RouteKey.OrderMsRequestChange)
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getRecentServiceRequestSlt(): Observable<McsMatTableContext<McsReportRecentServiceRequestSlt>> {
    this.dataChange.emit(undefined);
    return this._reportingService.getRecentServiceRequestSlt().pipe(
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
