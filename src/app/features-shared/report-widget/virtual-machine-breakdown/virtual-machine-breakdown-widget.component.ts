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
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { unsubscribeSafely } from '@app/utilities';
import { ReportPeriod } from '../report-period.interface';

@Component({
  selector: 'mcs-virtual-machine-breakdown-widget',
  templateUrl: './virtual-machine-breakdown-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class VirtualMachineBreakdownWidgetComponent implements OnInit, OnDestroy {
  @Input()
  public set period(value: ReportPeriod) {
    this._startPeriod = `${value.from.getFullYear()}-${value.from.getMonth() + 1}`;
    this._endPeriod = `${value.until.getFullYear()}-${value.until.getMonth() + 1}`;
    this.getData();
  }

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public hasError: boolean = false;
  public processing: boolean = true;

  private _startPeriod: string;
  private _endPeriod: string;

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

    this.reportingService.getVirtualMachineBreakdownReport(this._startPeriod, this._endPeriod)
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetectorRef.markForCheck();
      return throwError('Virtual machine breakdown endpoint failed.');
    }))
    .subscribe((result) => {
      this.dataBehavior.next(result);
      this.processing = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
