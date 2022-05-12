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
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsMatTableContext,
  McsReportingService,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsReportAuditAlerts,
  McsReportParams
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
  private _sortDef: MatSort;

  constructor(private _reportingService: McsReportingService) {
    this.dataSource = new McsTableDataSource2(this._getAuditAlerts.bind(this));
  }

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
      this._sortDef = value;
    }
  }

  public ngOnInit(): void {
    this._initializeDataColumns();
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _initializeDataColumns(): void {
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  private _getAuditAlerts(): Observable<McsMatTableContext<McsReportAuditAlerts>> {
    this.dataChange.emit(undefined);

    let queryParam = new McsReportParams();
    queryParam.periodStart = this._startPeriod;
    queryParam.periodEnd = this._endPeriod
    queryParam.subscriptionIds = !isNullOrEmpty(this.subscriptionIds) ? this.subscriptionIds.join(): '';
    queryParam.sortDirection = this._sortDef?.direction;
    queryParam.sortField = this._sortDef?.active;

    return this._reportingService.getAuditAlerts(queryParam).pipe(
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
