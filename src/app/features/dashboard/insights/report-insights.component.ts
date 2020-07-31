import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { ChartItem } from '@app/shared';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'mcs-report-insights',
  templateUrl: './report-insights.component.html',
  styleUrls: ['../report-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'report-insights-wrapper'
  }
})

export class ReportInsightsComponent implements OnInit {
  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;
  public data2$: Observable<ChartItem[]>;
  public dataBehavior2: BehaviorSubject<ChartItem[]>;
  public data3$: Observable<ChartItem[]>;
  public dataBehavior3: BehaviorSubject<ChartItem[]>;

  public constructor(
    private reportingService: McsReportingService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public percentFormatter(val) {
    return val + '%';
  }

  public ngOnInit() {
    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this.dataBehavior2 = new BehaviorSubject<ChartItem[]>(null);
    this.dataBehavior3 = new BehaviorSubject<ChartItem[]>(null);
    this._changeDetectorRef.markForCheck();
    this.data$ = this.dataBehavior.asObservable();
    this.data2$ = this.dataBehavior2.asObservable();
    this.data3$ = this.dataBehavior3.asObservable();

    this.reportingService.getServicesCostOverviewReport().subscribe((result) => {
      this.dataBehavior.next(result);
    });
    this.reportingService.getVirtualMachineBreakdownReport().subscribe((result) => {
      this.dataBehavior2.next(result);
    });
    this.reportingService.getPerformanceReport().subscribe((result) => {
      this.dataBehavior3.next(result);
    });
  }
}
