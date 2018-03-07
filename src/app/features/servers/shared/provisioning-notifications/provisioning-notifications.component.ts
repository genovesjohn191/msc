import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsApiJob,
  McsApiTask,
  McsTaskType,
  McsDataStatus
} from '../../../../core';
import {
  isNullOrEmpty,
  refreshView,
  unsubscribeSafely
} from '../../../../utilities';

@Component({
  selector: 'mcs-provisioning-notifications',
  templateUrl: './provisioning-notifications.component.html',
  styleUrls: ['./provisioning-notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef
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
    unsubscribeSafely(this._timerSubscription);
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
    return job.dataStatus !== McsDataStatus.InProgress;
  }

  public isJobSuccessful(job: McsApiJob): boolean {
    return job.dataStatus === McsDataStatus.Success;
  }

  public getStatusIcon(dataStatus: McsDataStatus): { key, color, class } {
    let iconKey: string;
    let iconColor: string;
    let iconClass: string;

    switch (dataStatus) {
      case McsDataStatus.InProgress:
        iconKey = CoreDefinition.ASSETS_GIF_SPINNER;
        iconColor = 'black';
        iconClass = 'active';
        break;
      case McsDataStatus.Error:
        iconKey = CoreDefinition.ASSETS_FONT_CLOSE;
        iconColor = 'red';
        iconClass = 'failed';
        break;
      case McsDataStatus.Success:
        iconKey = CoreDefinition.ASSETS_FONT_CHECK;
        iconColor = 'green';
        iconClass = 'completed';
        break;
      default:
        break;
    }
    return { key: iconKey, color: iconColor, class: iconClass };
  }

  public onViewServerPage(tasks: McsApiTask[]): void {
    let serverId = this._getCreatedServerId(tasks);
    this._router.navigate(['/servers', serverId]);
  }

  private _getCreatedServerId(tasks: McsApiTask[]): string {
    if (isNullOrEmpty(tasks)) { return ''; }

    let completedTask = tasks.find((task) => {
      return task.type === McsTaskType.CreateServer &&
        task.dataStatus === McsDataStatus.Success &&
        !isNullOrEmpty(task.referenceObject);
    });

    return !isNullOrEmpty(completedTask) ?
      completedTask.referenceObject.resourceId : '';
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
            return job.dataStatus === McsDataStatus.InProgress;
          });
          if (!activeJobExists) {
            // Find error jobs and roll back the progressbar
            let errorJobExists = this.jobs.find((job) => {
              return job.dataStatus === McsDataStatus.Error;
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
          this._changeDetectorRef.markForCheck();
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
    unsubscribeSafely(this._timerSubscription);
  }
}
