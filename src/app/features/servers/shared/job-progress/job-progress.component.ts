import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Input,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import {
  McsAssetsProvider,
  CoreDefinition,
  McsApiJob
} from '../../../../core';
import { refreshView } from '../../../../utilities';
import { ContextualHelpDirective } from '../contextual-help/contextual-help.directive';

@Component({
  selector: 'mcs-job-progress',
  templateUrl: './job-progress.component.html',
  styles: [require('./job-progress.component.scss')]
})

export class JobProgressComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public job: McsApiJob;

  @Input()
  public contextualHelp: string;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  public progressValue: number;
  public progressMax: number;

  private _timerSubscription: any;
  private _contextualInformations: ContextualHelpDirective[];

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _router: Router
  ) {
    this.progressValue = 80;
    this.progressMax = 100;
    this.job = new McsApiJob();
    this.contextualHelp = '';
  }

  public ngOnInit() {
    this._updateProgressbar();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      if (this.contextualHelpDirectives) {
        this._contextualInformations = this.contextualHelpDirectives
          .map((description) => {
            return description;
          });
      }
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  public ngOnDestroy() {
    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }

  public getContextualInformations(): ContextualHelpDirective[] {
    return this._contextualInformations;
  }

  public isJobActive(): boolean {
    if (!this.job) { return false; }

    return this.job.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE ||
      this.job.status === CoreDefinition.NOTIFICATION_JOB_PENDING;
  }

  public getStatusIconClass(status: string): string {
    let statusIconClass: string = '';

    switch (status) {
      case CoreDefinition.NOTIFICATION_JOB_PENDING:
      case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
        statusIconClass = this._assetsProvider.getIcon('spinner');
        statusIconClass += ' active';
        break;
      case CoreDefinition.NOTIFICATION_JOB_TIMEDOUT:
      case CoreDefinition.NOTIFICATION_JOB_FAILED:
      case CoreDefinition.NOTIFICATION_JOB_CANCELLED:
        statusIconClass = this._assetsProvider.getIcon('close');
        statusIconClass += ' failed';
        break;
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        statusIconClass = this._assetsProvider.getIcon('check');
        statusIconClass += ' completed';
        break;
      default:
        break;
    }
    return statusIconClass;
  }

  public getAlertIconType(status: string): string {
    let alertIconType: string = '';
    // TODO: Temporary set the error to failed alert
    switch (status) {
      case CoreDefinition.NOTIFICATION_JOB_TIMEDOUT:
      case CoreDefinition.NOTIFICATION_JOB_FAILED:
      case CoreDefinition.NOTIFICATION_JOB_CANCELLED:
        alertIconType = 'failed';
        break;
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        alertIconType = 'success';
        break;
      default:
        alertIconType = 'info';
        break;
    }
    return alertIconType;
  }

  public getCircleClass(): string {
    return this._assetsProvider.getIcon('circle');
  }

  public navigateToServerHome(): void {
    this._router.navigate(['./servers']);
  }

  private _updateProgressbar(): void {
    if (this.job && this.job.ectInSeconds) {
      this.progressMax = this.job.ectInSeconds;

      this._timerSubscription = Observable.timer(0, 1000)
        .take(this.progressMax + 1)
        .subscribe((time) => {
          this.progressValue = time;
        });
    }
  }
}
