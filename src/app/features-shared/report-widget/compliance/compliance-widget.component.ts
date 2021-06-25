import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';
import { McsReportingService } from '@app/core';
import {
  McsReportResourceCompliance,
  McsReportResourceComplianceState
} from '@app/models';
import { ChartConfig } from '@app/shared';
import {
  coerceNumber,
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { ReportWidgetBase } from '../report-widget.base';

@Component({
  selector: 'mcs-compliance-widget',
  templateUrl: './compliance-widget.component.html',
  styleUrls: ['./compliance-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class ComplianceWidgetComponent extends ReportWidgetBase implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'donut',
    height: '125px',
    dataLabels: {
      enabled: true,
      formatter: this.dataLabelFormatter
    },
    colors: ['#4CAF50', '#F44336', '#EFC225', '#0A97E5']
  };

  @Input()
  public set subscriptionIds(value: string[]) {
    if (JSON.stringify(value) === JSON.stringify(this._subscriptionIds)) {
      return;
    }

    this._subscriptionIds = value;
    this.getResourceCompliance();
  }

  @Output()
  public dataChange= new EventEmitter<McsReportResourceCompliance>(null);

  public statusIconKey: string = CommonDefinition.ASSETS_SVG_INFO;

  private _period: string = '';
  private _subscriptionIds: string[] = undefined;

  public hasError: boolean = false;
  public processing: boolean = true;
  public empty: boolean = false;
  public emptyComplianceState: boolean = false;

  public resourceCompliance: McsReportResourceCompliance;
  public resources: number[];
  public chartLabels: string[];

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService
  ) {
    super();
  }

  ngOnInit(): void {
    this._initializePeriod();
  }

  ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public get resourceCompliancePercentage(): number {
    if (this.resourceCompliance.resourceCompliancePercentage <= 0) {
      return 0;
    }

    return coerceNumber(this.resourceCompliance.resourceCompliancePercentage.toFixed());
  }

  public getResourceCompliance(): void {
    this.processing = true;
    this.hasError = false;

    this._reportingService.getResourceCompliance(this._period, this._subscriptionIds)
    .pipe(
      catchError((error) => {
        this.hasError = true;
        this.processing = false;
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      }),
      takeUntil(this._destroySubject))
    .subscribe((response) => {
      this.processing = false;
      this.dataChange.emit(response);
      this.empty = isNullOrEmpty(response) ? true : false;
      if (!this.empty) {
        let series = this.complianceSeries(response.resources);
        this.chartLabels = this.complianceLabels(response.resources);
        this.resources = series;
        this.resourceCompliance = response;
        this.emptyComplianceState = isNullOrEmpty(series) ? true : false;
        if (this.emptyComplianceState) {
          this.updateChartUri('');
        }
      }
      this._changeDetectorRef.markForCheck();
    });
  }

  public dataLabelFormatter(val: number): string {
    return val > 0 ? `${val.toFixed()}%` : `0`;
  }

  public complianceSeries(items: McsReportResourceComplianceState[]): number[] {
    let series: number[] = [];
    items.forEach(item => {
      let invalidData = isNullOrEmpty(item.count) || isNullOrEmpty(item.state) || item.count < 0;
      if (invalidData) { return; }
      series.push(item.count);
    });

    return series;
  }

  public complianceLabels(items: McsReportResourceComplianceState[]): string[] {
    let labels: string[] = [];
    items.forEach(item => {
      let invalidData = isNullOrEmpty(item.count) || isNullOrEmpty(item.state);
      if (invalidData) { return; }
      labels.push(item.state);
    });

    return labels;
  }

  private _initializePeriod(): void {
    let currentMonth = new Date(new Date().setMonth(new Date().getMonth()));
    this._period = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`;
  }
}
