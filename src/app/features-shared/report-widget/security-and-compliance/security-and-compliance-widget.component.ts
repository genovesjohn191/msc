import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {
  Subject,
  throwError
} from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { McsReportResourceCompliance, McsReportSecurityScore } from '@app/models';
import { ChartConfig } from '@app/shared';

@Component({
  selector: 'mcs-security-and-compliance-widget',
  templateUrl: './security-and-compliance-widget.component.html',
  styleUrls: ['../report-widget.scss', './security-and-compliance-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class SecurityAndComplianceWidgetComponent implements OnInit, OnDestroy {
  public chartConfig: ChartConfig = {
    type: 'donut',
    labels: ['Compliant', 'Non-Compliant'],
    dataLabels: {
      enabled: true,
      formatter: this.dataLabelFormatter
    }
  };

  public statusIconKey: string = CommonDefinition.ASSETS_SVG_INFO;

  public hasError: boolean = false;
  public hasErrorCompliance: boolean = false;
  public processing: boolean = true;
  public processingCompliance: boolean = true;
  public empty: boolean = false;
  public emptyCompliance: boolean = false;
  public emptyComplianceState: boolean = false;

  private _startPeriod: string = '';
  private _endPeriod: string = '';

  public securityScore: McsReportSecurityScore;
  public resourceCompliance: McsReportResourceCompliance;
  public resources: number[];

  private _destroySubject = new Subject<void>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService)
  {
    this._initializePeriod();
    this.getResourceCompliance();
  }

  public ngOnInit() {
    this.getSecurityScore();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public get currentScore(): number {
    return this.securityScore.currentScore < 0 ? 0 : this.securityScore.currentScore;
  }

  public get maxScore(): number {
    return this.securityScore.maxScore < 0 ? 0 : this.securityScore.maxScore;
  }

  public get securityScorePercentage(): number {
    if (this.maxScore === 0) {
      return 0;
    }

    return Math.ceil((this.currentScore / this.maxScore) * 100);
  }

  public get resouceComplianceScore(): number {
    return this.resourceCompliance.resourceCompliancePercentage < 0 ? 0 : this.resourceCompliance.resourceCompliancePercentage;
  }

  public get resourceCompliancePercentage(): number {
    if (this.resouceComplianceScore === 0) {
      return 0;
    }

    return Math.ceil((this.resouceComplianceScore / 100) * 100);
  }

  public getSecurityScore(): void {
    this.processing = true;
    this.hasError = false;

    this._reportingService.getSecurityScore()
    .pipe(
      catchError(() => {
        this.hasError = true;
        this.processing = false;
        this._changeDetectorRef.markForCheck();
        return throwError('Security Score endpoint failed.');
      }),
      takeUntil(this._destroySubject))
    .subscribe((response) => {
      this.empty = isNullOrEmpty(response) ? true : false;
      this.processing = false;
      this.securityScore = response;
      this._changeDetectorRef.markForCheck();
    });
  }

  public getResourceCompliance(): void {
    this.processingCompliance = true;
    this.hasErrorCompliance = false;

    this._reportingService.getResourceCompliance(this._startPeriod, this._endPeriod)
    .pipe(
      catchError(() => {
        this.hasErrorCompliance = true;
        this.processingCompliance = false;
        this._changeDetectorRef.markForCheck();
        return throwError('Resource Compliance endpoint failed.');
      }),
      takeUntil(this._destroySubject))
    .subscribe((response) => {
      this.processingCompliance = false;
      this.emptyCompliance = isNullOrEmpty(response) ? true : false;
      this.resourceCompliance = response;
      let items: number[] = [];
      response.resources.forEach((resources) => {
        let invalidData = isNullOrEmpty(resources.count) || isNullOrEmpty(resources.state);
        if (invalidData) { return; }
        items.push(resources.count);
      })
      this.emptyComplianceState = isNullOrEmpty(items) ? true : false;
      this.resources = items;
      this._changeDetectorRef.markForCheck();
    });
  }

  public dataLabelFormatter(val: number, opts?: any): string {
    return val > 0 ? `${val.toFixed()}%` : `0`;
  }

  private _initializePeriod(): void {
    let from = new Date(new Date().setMonth(new Date().getMonth()));
    let until = new Date(new Date().setMonth(new Date().getMonth()));

    this._startPeriod = `${from.getFullYear()}-${from.getMonth() + 1}`;
    this._endPeriod = `${until.getFullYear()}-${until.getMonth() + 1}`;
  }
}
