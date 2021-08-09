import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  EventEmitter,
  Output
} from '@angular/core';
import {
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsReportingService } from '@app/core';
import { McsReportSecurityScore } from '@app/models';

@Component({
  selector: 'mcs-security-widget',
  templateUrl: './security-widget.component.html',
  styleUrls: ['../report-widget.scss', './security-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class SecurityWidgetComponent implements OnInit, OnDestroy {
  public hasError: boolean = false;
  public processing: boolean = true;
  public empty: boolean = false;
  public securityScore: McsReportSecurityScore;

  private _destroySubject = new Subject<void>();

  @Output()
  public dataChange= new EventEmitter<McsReportSecurityScore>(null);

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportingService: McsReportingService
  )
  { }

  public ngOnInit() {
    this.getSecurityScore();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public get securityCenterAzurePortalUrl(): string  {
    return `${CommonDefinition.AZURE_PORTAL_URL}/Microsoft_Azure_Security/SecurityMenuBlade/23`;
  }

  public get recommendationAzurePortalUrl(): string  {
    return `${CommonDefinition.AZURE_PORTAL_URL}/Microsoft_Azure_Security/SecurityMenuBlade/5`;
  }

  public get currentScore(): number {
    return this.securityScore.currentScore < 0 ? 0 : Number(this.securityScore.currentScore.toFixed());
  }

  public get maxScore(): number {
    return this.securityScore.maxScore < 0 ? 0 : Number(this.securityScore.maxScore.toFixed());
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
    this.dataChange.emit(undefined);
    this._reportingService.getSecurityScore()
    .pipe(
      catchError((error) => {
        this.hasError = true;
        this.processing = false;
        this.dataChange.emit(null);
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      }),
      takeUntil(this._destroySubject))
    .subscribe((response) => {
      this.empty = isNullOrEmpty(response) ? true : false;
      this.processing = false;
      this.securityScore = response;
      this.dataChange.emit(this.securityScore);
      this._changeDetectorRef.markForCheck();
    });
  }
}
