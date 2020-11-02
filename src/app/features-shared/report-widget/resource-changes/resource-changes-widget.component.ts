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

import { ChartItem } from '@app/shared';
import {
  coerceNumber,
  currencyFormat
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
    let fullLabel = opts.w.globals.labels[opts.dataPointIndex];
    let items = fullLabel.split('|', 2);
    let amount = currencyFormat(items[1]);
    if ((items[1] as number) > 0) {
      amount = '+' + currencyFormat(items[1]);
    }

    return amount;
  }

  public legendLabelFormatter(val: string, opts?: any): string {
    let items = val.split('|', 2);

    return items[0];
  }

  public xAxisLabelFormatter(val: string, timestamp?: number): string {
    return (coerceNumber(val) > 0) ? `+${val}`: val;
  }

  public tooltipXValueFormatter(val: string, opts?: any): string {
    let fullLabel = opts.w.globals.labels[opts.dataPointIndex];
    let items = fullLabel.split('|', 2);
    let amount = currencyFormat(items[1]);
    if ((items[1] as number) > 0) {
      amount = '+' + currencyFormat(items[1]);
    }

    return `${items[0]} (${amount})`;
  }

  public tooltipYValueFormatter(val: number, opts?: any): string {
    return val > 0 ? `+${val}` : val.toString();
  }
}
