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
  unsubscribeSafely
} from '@app/utilities';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { McsReportSecurityScore } from '@app/models';

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
  public hasError: boolean = false;
  public processing: boolean = true;

  public securityScore: McsReportSecurityScore;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService) { }

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
      this.processing = false;
      this.securityScore = response;
      this._changeDetectorRef.markForCheck();
    });
  }
}
