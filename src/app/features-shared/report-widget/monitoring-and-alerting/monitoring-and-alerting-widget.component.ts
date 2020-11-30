import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { McsReportMonitoringAndAlerting } from '@app/models';
import { ChartConfig, ChartItem } from '@app/shared';
import { isNullOrEmpty, unsubscribeSafely } from '@app/utilities';

@Component({
  selector: 'mcs-monitoring-and-alerting-widget',
  templateUrl: './monitoring-and-alerting-widget.component.html',
  styleUrls: ['./monitoring-and-alerting-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class MonitoringAndAlertingWidgetComponent implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'bar',
    xaxis: {
      title: 'Total Alerts'
    },
    yaxis: {
      title: 'Severity',
      showLabel: true
    }
  }

  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public monitoringAlerting: McsReportMonitoringAndAlerting;
  public hasError: boolean = false;
  public processing: boolean = true;
  public empty: boolean = true;
  public convertedDate: string;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService
  ) {
  }

  ngOnInit(): void {
    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this.data$ = this.dataBehavior.asObservable();
    this.getData();
  }

  ngOnDestroy(): void {
    unsubscribeSafely(this.dataBehavior);
  }

  public getData(): void {
    this.hasError = false;
    this.processing = true;
    this._changeDetectorRef.markForCheck();

    this._reportingService.getMonitoringAndAlerting()
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;
      this._changeDetectorRef.markForCheck();
      return throwError('Monitoring and Alerting endpoint failed.');
    }))
    .subscribe((result) => {
      this.processing = false;
      this.monitoringAlerting = result;
      this.empty = isNullOrEmpty(result) ? true : false;
      this.dataBehavior.next(result.alertsChartItem);
      this._changeDetectorRef.markForCheck();
    });
  }
}
