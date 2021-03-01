import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { McsReportingService } from '@app/core';
import { McsReportMonitoringAndAlerting } from '@app/models';
import {
  ChartConfig,
  ChartItem
} from '@app/shared';
import {
  compareArrays,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

export interface MonitoringAlertingWidgetConfig {
  period: {
    from: Date,
    until: Date
  }
}
@Component({
  selector: 'mcs-monitoring-and-alerting-widget',
  templateUrl: './monitoring-and-alerting-widget.component.html',
  styleUrls: ['./monitoring-and-alerting-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class MonitoringAndAlertingWidgetComponent implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'bar',
    xaxis: {
      title: 'Total Alerts'
    },
    yaxis: {
      title: 'Severity',
      showLabel: true
    }
  }

  @Input()
  public set subscriptionIds(value: string[]) {
    let subscriptionId = !isNullOrEmpty(value) ? value : [];
    let comparisonResult = compareArrays(subscriptionId, this._subscriptionIds);
    if (comparisonResult === 0) { return; }

    this._subscriptionIds = value;
    this.getData();
  }

  @Input()
  public set config(value: MonitoringAlertingWidgetConfig) {
    let validValue = !isNullOrEmpty(value)
      && JSON.stringify(this._config) !== JSON.stringify(value);
    if (!validValue) { return; }

    this._config = value;
    this._startPeriod = `${value.period.from.getFullYear()}-${value.period.from.getMonth() + 1}-${value.period.from.getDate()}`;
    this._endPeriod = `${value.period.until.getFullYear()}-${value.period.until.getMonth() + 1}-${value.period.until.getDate()}`;

    this.getData();
  }

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public monitoringAlerting: McsReportMonitoringAndAlerting;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _config: MonitoringAlertingWidgetConfig;
  private _startPeriod: string = '';
  private _endPeriod: string = '';
  private _subscriptionIds: string[] = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService
  ) { }

  ngOnInit(): void {
    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this.data$ = this.dataBehavior.asObservable();
  }

  ngOnDestroy(): void {
    unsubscribeSafely(this.dataBehavior);
  }

  public getData(): void {
    this.hasError = false;
    this.processing = true;
    this._changeDetectorRef.markForCheck();

    this._reportingService.getMonitoringAndAlerting(this._startPeriod, this._endPeriod, this._subscriptionIds)
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetectorRef.markForCheck();
      return throwError('Monitoring and Alerting endpoint failed.');
    }))
    .subscribe((result) => {
      this.processing = false;
      this.monitoringAlerting = result;
      this.dataBehavior.next(result.alertsChartItem);
      this._changeDetectorRef.markForCheck();
    });
  }
}
