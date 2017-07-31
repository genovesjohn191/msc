import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import {
  CoreDefinition,
  McsApiJob
} from '../../../../core';
import { refreshView } from '../../../../utilities';

@Component({
  selector: 'mcs-job-progress',
  templateUrl: './job-progress.component.html',
  styles: [require('./job-progress.component.scss')]
})

export class JobProgressComponent implements OnInit, OnDestroy {
  @Input()
  public job: McsApiJob;

  public progressValue: number;
  public progressMax: number;

  private _timerSubscription: any;

  public get circleIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CIRCLE;
  }

  public constructor(private _router: Router) {
    this.progressValue = 80;
    this.progressMax = 100;
    this.job = new McsApiJob();
  }

  public ngOnInit() {
    this._updateProgressbar();
  }

  public ngOnDestroy() {
    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }

  public isJobActive(): boolean {
    if (!this.job) { return false; }

    return this.job.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE ||
      this.job.status === CoreDefinition.NOTIFICATION_JOB_PENDING;
  }

  public getStatusIcon(status: string): { key, color, class } {
    let iconKey: string;
    let iconColor: string;
    let iconClass: string;

    switch (status) {
      case CoreDefinition.NOTIFICATION_JOB_PENDING:
      case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
        iconKey = CoreDefinition.ASSETS_FONT_SPINNER;
        iconColor = 'black';
        iconClass = 'active';
        break;
      case CoreDefinition.NOTIFICATION_JOB_TIMEDOUT:
      case CoreDefinition.NOTIFICATION_JOB_FAILED:
      case CoreDefinition.NOTIFICATION_JOB_CANCELLED:
        iconKey = CoreDefinition.ASSETS_FONT_CLOSE;
        iconColor = 'red';
        iconClass = 'failed';
        break;
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        iconKey = CoreDefinition.ASSETS_FONT_CHECK;
        iconColor = 'green';
        iconClass = 'completed';
        break;
      default:
        break;
    }
    return { key: iconKey, color: iconColor, class: iconClass };
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
