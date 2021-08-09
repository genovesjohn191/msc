import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  Subject,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { McsReportingService } from '@app/core';
import { McsReportResourceHealthResources } from '@app/models';
import { ChartConfig } from '@app/shared';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { ReportWidgetBase } from '../report-widget.base';

@Component({
  selector: 'mcs-resource-health-widget',
  templateUrl: './resource-health-widget.component.html',
  styleUrls: ['./resource-health-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class ResourceHealthWidgetComponent extends ReportWidgetBase implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'donut',
    height: '380px',
    dataLabels: {
      enabled: true,
      formatter: this.dataLabelFormatter
    }
  };

  public chartSeries: number[];
  public chartLabels: string[];
  public hasError: boolean = false;
  public empty: boolean = false;
  public processing: boolean = true;

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private reportingService: McsReportingService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getData();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public getData(): void {
    this.hasError = false;
    this.processing = true;
    this.updateChartUri(undefined);
    this._changeDetectorRef.markForCheck();

    this.reportingService.getResourceHealth()
    .pipe(catchError((error) => {
      this.hasError = true;
      this.processing = false;
      this.updateChartUri('');
      this._changeDetectorRef.markForCheck();
      return throwError(error);
    }))
    .subscribe((response) => {
      this.empty = isNullOrEmpty(response) ? true : false;
      if (!this.empty) {
        this.chartSeries = this.healthResourceSeries(response.resources);
        this.chartLabels = this.healthResourceLabels(response.resources);
      }
      if (isNullOrEmpty(response.totalCount)) {
        this.updateChartUri('');
      }
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  public dataLabelFormatter(val: number, opts?: any): string {
    return val > 0 ? `${val.toFixed()}%` : `0`;
  }

  public healthResourceSeries(items: McsReportResourceHealthResources[]): number[] {
    let series: number[] = [];
    items.forEach(item => {
      let invalidData = isNullOrEmpty(item.count) || isNullOrEmpty(item.description) || item.count < 0;
      if (invalidData) { return; }
      series.push(item.count);
    });

    return series;
  }

  public healthResourceLabels(items: McsReportResourceHealthResources[]): string[] {
    let labels: string[] = [];
    items.forEach(item => {
      let invalidData = isNullOrEmpty(item.count) || isNullOrEmpty(item.description);
      if (invalidData) { return; }
      labels.push(item.description);
    });

    return labels;
  }
}
