import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  Input
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ChartConfig,
  ChartItem
} from '@app/shared';
import { unsubscribeSafely } from '@app/utilities';
import { McsReportingService } from '@app/core';
import { ReportWidgetBase } from '../report-widget.base';

export interface PerformanceAndScalabilityWidgetConfig {
  period: Date,
  subscriptionIds: string;
}

@Component({
  selector: 'mcs-performance-and-scalability-widget',
  templateUrl: './performance-and-scalability-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class PerformanceAndScalabilityWidgetComponent extends ReportWidgetBase implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'bar',
    yaxis: {
      title: 'Avg % Used',
      showLabel: true,
      valueFormatter: this.valueYFormatter
    },
    xaxis: {
      title: 'Months'
    },
    tooltip: {
      yValueFormatter: this.tooltipYValueFormatter
    }
  };

  @Input()
  public set subscriptionIds(value: string) {
    if (JSON.stringify(value) === JSON.stringify(this._subscriptionIds)) {
      return;
    }

    this._subscriptionIds = value;
    this.getData();
  }

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _subscriptionIds: string = undefined;
  private _startPeriod: string = '';
  private _endPeriod: string = '';

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private reportingService: McsReportingService)
  {
    super();
    this._initializePeriod();
  }

  public ngOnInit() {
    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this.data$ = this.dataBehavior.asObservable();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.dataBehavior);
  }

  public getData(): void {
    this.hasError = false;
    this.processing = true;
    this.updateChartUri(undefined);
    this._changeDetectorRef.markForCheck();

    this.reportingService.getPerformanceReport(this._startPeriod, this._endPeriod, this._subscriptionIds)
    .pipe(catchError((error) => {
      this.hasError = true;
      this.processing = false;
      this.updateChartUri('');
      this._changeDetectorRef.markForCheck();
      return throwError(error);
    }))
    .subscribe((result) => {
      if (result.length === 0) {
        this.updateChartUri('');
      };
      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  public tooltipYValueFormatter(val: number, opts?: any): string {
    return `${val.toFixed(2)}%`;
  }

  public valueYFormatter(val: number): string {
    return !Number.isInteger(val) ? `${val.toFixed(2)}%` : `${val.toFixed()}%`;
  }

  private _initializePeriod(): void {
    let from = new Date(new Date().setMonth(new Date().getMonth() - 12));
    let until = new Date(new Date().setMonth(new Date().getMonth()));

    this._startPeriod = `${from.getFullYear()}-${from.getMonth() + 1}`;
    this._endPeriod = `${until.getFullYear()}-${until.getMonth() + 1}`;
  }
}
