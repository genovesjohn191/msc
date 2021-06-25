import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
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
  McsMatTableContext,
  McsTableDataSource2,
  McsReportingService
} from '@app/core';
import {
  McsFilterInfo,
  McsReportAuditAlerts
} from '@app/models';
import {
  compareArrays,
  createObject,
  isNullOrEmpty
} from '@app/utilities';

export interface AuditAlertsWidgetConfig {
  period: Date
}

@Component({
  selector: 'mcs-audit-alerts-widget',
  templateUrl: './audit-alerts-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class AuditAlertsWidgetComponent implements OnInit {
  @Input()
  public set subscriptionIds(value: string[]) {
    let subscriptionId = !isNullOrEmpty(value) ? value : [];
    let comparisonResult = compareArrays(subscriptionId, this._subscriptionIds);
    if (comparisonResult === 0) { return; }

    this._subscriptionIds = subscriptionId;
    this.retryDatasource();
  }

  @Input()
  public set config(value: AuditAlertsWidgetConfig) {
    let validValue = !isNullOrEmpty(value)
      && JSON.stringify(this._config) !== JSON.stringify(value);
    if (!validValue) { return; }

    this._config = value;
    this._startPeriod = `${value.period.getFullYear()}-${value.period.getMonth() + 1}`;
    this._endPeriod = `${value.period.getFullYear()}-${value.period.getMonth() + 1}`;
    this.retryDatasource();
  }

  @Output()
  public dataChange= new EventEmitter<McsReportAuditAlerts[]>(null);

  public readonly dataSource: McsTableDataSource2<McsReportAuditAlerts>;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'severity' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'operationName' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'time' })
  ];

  private _config: AuditAlertsWidgetConfig;
  private _subscriptionIds: string[] = [];
  private _startPeriod: string = '';
  private _endPeriod: string = '';

  constructor(private _reportingService: McsReportingService) {
    this.dataSource = new McsTableDataSource2(this._getAuditAlerts.bind(this));
  }

  ngOnInit(): void {
    this._initializeDataColumns();
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _initializeDataColumns(): void {
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  private _getAuditAlerts(): Observable<McsMatTableContext<McsReportAuditAlerts>> {
    return this._reportingService.getAuditAlerts(this._startPeriod, this._endPeriod, this._subscriptionIds).pipe(
      map((response) => {
        let dataSourceContext = new McsMatTableContext(response, response?.length);
        this.dataChange.emit(dataSourceContext?.dataRecords);
        return dataSourceContext;
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
