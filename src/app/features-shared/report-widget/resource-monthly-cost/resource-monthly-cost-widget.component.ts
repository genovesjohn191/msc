import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { isNullOrEmpty, unsubscribeSafely } from '@app/utilities';
import { ChartConfig, ChartItem } from '@app/shared';

export interface ResourceMonthlyCostWidgetConfig {
  period: Date,
  subscriptionIds: string[];
}

@Component({
  selector: 'mcs-resource-monthly-cost-widget',
  templateUrl: './resource-monthly-cost-widget.component.html'
})
export class ResourceMonthlyCostWidgetComponent implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    stacked: true,
    yaxis: {
      title: 'Total Cost ($)'
    },
    xaxis: {
      title: 'Days'
    }
  };

  @Input()
  public set config(value: ResourceMonthlyCostWidgetConfig) {
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

  private _config: ResourceMonthlyCostWidgetConfig;
  private _startPeriod: string = '';
  private _endPeriod: string = '';

  public constructor(private _changeDetector: ChangeDetectorRef, private reportingService: McsReportingService) {}

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
    this._changeDetector.markForCheck();

    this.reportingService.getResourceMonthlyCostReport(this._startPeriod, this._endPeriod, this._config.subscriptionIds)
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetector.markForCheck();
      return throwError('Resources Monthly Cost endpoint failed.');
    }))
    .subscribe((result) => {
      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetector.markForCheck();
    });
  }
}
