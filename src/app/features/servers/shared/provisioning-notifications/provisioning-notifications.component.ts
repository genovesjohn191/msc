import {
  Component,
  OnInit,
  OnDestroy,
  Input
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsApiJob
} from '../../../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../../../utilities';

@Component({
  selector: 'mcs-provisioning-notifications',
  templateUrl: './provisioning-notifications.component.html',
  styles: [require('./provisioning-notifications.component.scss')]
})

export class ProvisioningNotificationsComponent implements OnInit, OnDestroy {
  @Input()
  public jobs: McsApiJob[];

  public progressValue: number;
  public progressMax: number;
  public animateTrigger: string;
  public progressBarVisibility: boolean;
  public textContent: any;

  private _timerSubscription: any;

  public constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.progressValue = 0;
    this.progressMax = 0;
    this.jobs = new Array();
    this.progressBarVisibility = true;
    this.animateTrigger = 'fadeIn';
  }

  public get isMultiJobs(): boolean {
    return this.jobs.length > 1;
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content
      .servers.shared.provisioningNotifications;
    this._updateProgressbar();
  }

  public ngOnDestroy() {
    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }

  public getTitle(): string {
    let title: string;

    if (this.isMultiJobs) {
      title = this.textContent ? this.textContent.deployMultiple : '';
    } else {
      title = isNullOrEmpty(this.jobs) ? '' : this.jobs[0].description;
    }
    return title;
  }

  public isJobCompleted(job: McsApiJob): boolean {
    return job.status !== CoreDefinition.NOTIFICATION_JOB_PENDING &&
      job.status !== CoreDefinition.NOTIFICATION_JOB_ACTIVE;
  }

  public isJobSuccessful(job: McsApiJob): boolean {
    return job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED;
  }

  public getStatusIcon(status: string): { key, color, class } {
    let iconKey: string;
    let iconColor: string;
    let iconClass: string;

    switch (status) {
      case CoreDefinition.NOTIFICATION_JOB_PENDING:
      case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
        iconKey = CoreDefinition.ASSETS_GIF_SPINNER;
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

  public onViewServerPage(): void {
    this._router.navigate(['/servers']);
  }

  private _updateProgressbar(): void {
    if (!isNullOrEmpty(this.jobs)) {
      let progressTolerance: number = 0;

      this.jobs.forEach((job) => {
        this.progressMax += job.ectInSeconds;
      });

      // Calculate the 99% of the progreesbar maximum
      // In case the tolerance is less than 1, set it to 1 instead
      progressTolerance = this.progressMax - (this.progressMax * 0.99);
      if (progressTolerance < 1) { progressTolerance = 1; }

      // Set Inifinity Timer
      this._timerSubscription = Observable.timer(0, 1000)
        .take(Infinity)
        .subscribe((time) => {
          let timeExceedsEstimate = (this.progressMax - this.progressValue) <= progressTolerance;

          // Find active jobs (in case there are) and exit timer in case of completion
          let activeJobExists = this.jobs.find((job) => {
            return job.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE ||
              job.status === CoreDefinition.NOTIFICATION_JOB_PENDING;
          });
          if (!activeJobExists) {
            // Find error jobs and roll back the progressbar
            let errorJobExists = this.jobs.find((job) => {
              return job.status === CoreDefinition.NOTIFICATION_JOB_FAILED ||
                job.status === CoreDefinition.NOTIFICATION_JOB_CANCELLED ||
                job.status === CoreDefinition.NOTIFICATION_JOB_TIMEDOUT;
            });
            if (errorJobExists) {
              this._endTimer(0);
            } else {
              this._endTimer(this.progressMax);
            }
            // Remove progressbar when all the process are done
            this._removeProgressbar();

          } else if (timeExceedsEstimate) {
            // Hold progress bar position to wait for other jobs to finished
          } else if (time <= this.progressMax) {
            this.progressValue = time;
          }
        });
    }
  }

  private _removeProgressbar(): void {
    // Set the animation of the progress bar before removing it to actual DOM
    this.animateTrigger = 'fadeOut';
    refreshView(() => {
      this.progressBarVisibility = false;
    }, 500);
  }

  private _endTimer(progressValue: number): void {
    this.progressValue = progressValue;
    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe();
    }
  }
}
