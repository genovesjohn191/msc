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
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { unsubscribeSafely } from '@app/utilities';

@Component({
  selector: 'mcs-virtual-machine-usage-breakdown-widget',
  templateUrl: './virtual-machine-usage-breakdown-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class VirtualMachineUsageBreakdownWidgetComponent implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'bar',
    stacked: true,
    yaxis: {
      title: '# VMs by Usage',
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
  public set subscriptionIds(value: string[]) {
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

  private _subscriptionIds: string[] = undefined;
  private _startPeriod: string = '';
  private _endPeriod: string = '';

  public constructor(private _changeDetectorRef: ChangeDetectorRef, private reportingService: McsReportingService) {
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
    this._changeDetectorRef.markForCheck();

    this.reportingService.getVirtualMachineBreakdownReport(this._startPeriod, this._endPeriod, this._subscriptionIds)
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

  private _initializePeriod(): void {
    let from = new Date(new Date().setMonth(new Date().getMonth() - 12));
    let until = new Date(new Date().setMonth(new Date().getMonth()));

    this._startPeriod = `${from.getFullYear()}-${from.getMonth() + 1}`;
    this._endPeriod = `${until.getFullYear()}-${until.getMonth() + 1}`;
  }

  public tooltipYValueFormatter(val: number): string {
    return `${val.toFixed(2)}`;
  }

  public valueYFormatter(val: number): string {
    return !Number.isInteger(val) ? `${val.toFixed(2)}` : `${val.toFixed()}`;
  }
}
