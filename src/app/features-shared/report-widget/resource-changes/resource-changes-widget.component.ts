import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  throwError
} from 'rxjs';

import { ChartConfig, ChartItem } from '@app/shared';
import {
  coerceNumber
} from '@app/utilities';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { catchError } from 'rxjs/operators';

const maxItemToDisplay = 10;

@Component({
  selector: 'mcs-resource-changes-widget',
  templateUrl: './resource-changes-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class ResourceChangesWidgetComponent implements OnInit {
  public chartConfig: ChartConfig = {
    height: '380px',
    type: 'bar',
    dataLabels: {
      enabled: true,
      formatter: this.dataLabelFormatter
    },
    legend: {
      formatter: this.legendLabelFormatter
    },
    yaxis: {
      showLabel: false,
    },
    xaxis: {
      valueFormatter: this.xAxisLabelFormatter
    },
    tooltip: {
      xValueFormatter: this.tooltipXValueFormatter,
      yValueFormatter: this.tooltipYValueFormatter
    }
  };

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService) { }

  public ngOnInit() {
    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this.data$ = this.dataBehavior.asObservable();

    this.getData();
  }

  public getData(): void {
    this.hasError = false;
    this.processing = true;
    this._changeDetectorRef.markForCheck();

    this._reportingService.getServiceChanges()
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetectorRef.markForCheck();
      return throwError('Service changes endpoint failed.');
    }))
    .subscribe((result) => {
      result = result.slice(0, maxItemToDisplay);
      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  public dataLabelFormatter(val: number, opts?: any): string {
    return  val > 0 ? `+${val}` : val.toString();
  }

  public legendLabelFormatter(val: string, opts?: any): string {
    return val.split('|', 2)[0];
  }

  public xAxisLabelFormatter(val: string, timestamp?: number): string {
    return (coerceNumber(val) > 0) ? `+${val}`: val;
  }

  public tooltipXValueFormatter(val: number, opts?: any): string {
    let fullLabel = opts.w.globals.labels[opts.dataPointIndex];
    let items = fullLabel.split('|', 2);

    return `${items[0]}`;
  }

  public tooltipYValueFormatter(val: number, opts?: any): string {
    return val > 0 ? `+${val}` : val.toString();
  }
}
