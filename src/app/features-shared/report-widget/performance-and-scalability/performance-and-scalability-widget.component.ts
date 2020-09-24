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

import { ChartItem } from '@app/shared';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { ReportPeriod } from '../report-period.interface';

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
  @Input()
  public set period(value: ReportPeriod) {
    if (!isNullOrEmpty(value)) {
      this._startPeriod = `${value.from.getFullYear()}-${value.from.getMonth() + 1}`;
      this._endPeriod = `${value.until.getFullYear()}-${value.until.getMonth() + 1}`;
    }

    this.getData();
  }

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _startPeriod: string = '';
  private _endPeriod: string = '';

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private reportingService: McsReportingService) {
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
    this._changeDetectorRef.markForCheck();

    this.reportingService.getPerformanceReport(this._startPeriod, this._endPeriod)
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

  public percentFormatter(val: number) {
    return val + '%';
  }
}
