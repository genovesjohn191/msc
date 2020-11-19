import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { McsDateTimeService } from '@app/core';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { McsReportMonitoringAndAlerting } from '@app/models';
import { ChartConfig, ChartItem } from '@app/shared';

const DATEFORMAT = `M/DD/YYYY[,] h:mm:ss A`;

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
  public convertedDate: string;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _dateTimeService: McsDateTimeService,
    private _reportingService: McsReportingService
  ) {
  }

  ngOnInit(): void {
    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this.data$ = this.dataBehavior.asObservable();
    this.getData();
  }

  ngOnDestroy(): void {
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
      return throwError('Azure resources endpoint failed.');
    }))
    .subscribe((result) => {
      this.processing = false;
      this.monitoringAlerting = result;
      this.dataBehavior.next(result.alertsChartItem);
      let parseDate = new Date(Date.parse(result.startedOn));
      this.convertedDate = this._dateTimeService.formatDate(parseDate, DATEFORMAT);
      this._changeDetectorRef.markForCheck();
    });
  }
}
