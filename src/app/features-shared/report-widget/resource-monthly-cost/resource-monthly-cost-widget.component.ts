import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { isNullOrEmpty, unsubscribeSafely } from '@app/utilities';
import { ChartConfig, ChartItem } from '@app/shared';

export interface ResourceMonthlyCostWidgetConfig {
  period: Date
}

@Component({
  selector: 'mcs-resource-monthly-cost-widget',
  templateUrl: './resource-monthly-cost-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'widget-box'
  }
})
export class ResourceMonthlyCostWidgetComponent implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'bar',
    stacked: true,
    yaxis: {
      title: 'Total Cost ($)',
      showLabel: true,
      valueFormatter: this.valueYFormatter
    },
    xaxis: {
      title: 'Days'
    },
    tooltip: {
      yValueFormatter: this.tooltipYValueFormatter
    }
  };

  @Input()
  public set subscriptionIds(value: string[]) {
    let subscriptionId = !isNullOrEmpty(value) ? value : [];
    if (JSON.stringify(subscriptionId) === JSON.stringify(this._subscriptionIds)) {
      return;
    }

    this._subscriptionIds = subscriptionId;
    this.getResourceMonthlyCostReport();
  }

  @Output()
  public dataReceived: EventEmitter<ChartItem[]>;

  @Input()
  public set config(value: ResourceMonthlyCostWidgetConfig) {
    let validValue = !isNullOrEmpty(value)
      && JSON.stringify(this._config) !== JSON.stringify(value);
    if (!validValue) { return; }

    this._config = value;
    this._startPeriod = `${value.period.getFullYear()}-${value.period.getMonth() + 1}`;
    this._endPeriod = `${value.period.getFullYear()}-${value.period.getMonth() + 1}`;

    this.getResourceMonthlyCostReport();
  }

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public chartData: ChartItem[];
  public hasError: boolean = false;
  public processing: boolean = true;

  private _config: ResourceMonthlyCostWidgetConfig;
  private _subscriptionIds: string[] = [];
  private _startPeriod: string = '';
  private _endPeriod: string = '';

  public constructor(
    private _changeDetector: ChangeDetectorRef,
    private reportingService: McsReportingService) {
    this.dataReceived = new EventEmitter();
  }

  public ngOnInit() {
    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this.data$ = this.dataBehavior.asObservable();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.dataBehavior);
  }

  public getResourceMonthlyCostReport(): void {
    this.hasError = false;
    this.processing = true;
    this.reportingService.getResourceMonthlyCostReport(this._startPeriod, this._endPeriod, this._subscriptionIds)
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetector.markForCheck();
      return throwError('Resources Monthly Cost endpoint failed.');
    }))
    .subscribe((result) => {
      this.chartData = result;
      this.dataReceived.emit(result);
      if (!isNullOrEmpty(result)) {
        this.dataReceived.complete();
      }
      this.processing = false;
      this._changeDetector.markForCheck();
    });
  }

  public tooltipYValueFormatter(val: number): string {
    return `${val.toFixed(2)}`;
  }

  public valueYFormatter(val: number): string {
    return !Number.isInteger(val) ? `${val.toFixed(2)}` : `${val.toFixed()}`;
  }
}
