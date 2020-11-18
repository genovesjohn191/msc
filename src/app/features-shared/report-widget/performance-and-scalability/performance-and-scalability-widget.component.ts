import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  OnDestroy, Input
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ChartConfig, ChartItem } from '@app/shared';
import { truncateDecimals, isNullOrEmpty, unsubscribeSafely } from '@app/utilities';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';

export interface PerformanceAndScalabilityWidgetConfig {
  period: Date,
  subscriptionIds: string[];
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
export class PerformanceAndScalabilityWidgetComponent implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'bar',
    yaxis: {
      title: 'Avg % Used',
      showLabel: true,
      valueFormatter: this.yAxisLabelFormatter
    },
    xaxis: {
      title: 'Days'
    }
  };

  @Input()
  public set subscriptionIds(value: string[]) {
    if (JSON.stringify(value) === JSON.stringify(this._subscriptionIds)) {
      return;
    }

    this._subscriptionIds = value;
    this.getData();
  }

  @Input()
  public set config(value: PerformanceAndScalabilityWidgetConfig) {
    let validValue = !isNullOrEmpty(value)
      && JSON.stringify(this._config) !== JSON.stringify(value);
    if (!validValue) { return; }

    this._config = value;
    this._startPeriod = `${value.period.getFullYear()}-${value.period.getMonth() + 1}`;
    this._endPeriod = `${value.period.getFullYear()}-${value.period.getMonth() + 1}`;

    this.getData();
  }

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _config: PerformanceAndScalabilityWidgetConfig;
  private _subscriptionIds: string[] = undefined;
  private _startPeriod: string = '';
  private _endPeriod: string = '';

  public constructor(private _changeDetectorRef: ChangeDetectorRef, private reportingService: McsReportingService) {}

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
    this._changeDetectorRef.markForCheck();

    this.reportingService.getPerformanceReport(this._startPeriod, this._endPeriod, this._subscriptionIds)
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetectorRef.markForCheck();
      return throwError('Performance and scalability endpoint failed.');
    }))
    .subscribe((result) => {
      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  public yAxisLabelFormatter(val: number, opts?: any): string {
    return truncateDecimals(val, 2) + '%';
  }
}
