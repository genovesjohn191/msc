import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  ViewChildren,
  QueryList,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsApiJob,
  McsApiTask
} from '../../../../core';
import { refreshView } from '../../../../utilities';

@Component({
  selector: 'mcs-provisioning-notifications',
  templateUrl: './provisioning-notifications.component.html',
  styles: [require('./provisioning-notifications.component.scss')]
})

export class ProvisioningNotificationsComponent implements OnInit, OnDestroy {
  @Input()
  public jobs: McsApiJob[];

  @Output()
  public onFinishedJob: EventEmitter<McsApiJob>;

  public progressValue: number;
  public progressMax: number;
  public textContent: any;

  private _timerSubscription: any;

  public constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.progressValue = 0;
    this.progressMax = 100;
    this.onFinishedJob = new EventEmitter<McsApiJob>();
    this.jobs = new Array();
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
      title = 'Deploy Servers';
    } else {
      title = this.jobs.length > 0 ? this.jobs[0].description : '';
    }
    return title;
  }

  public isJobCompleted(job: McsApiJob): boolean {
    return job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED;
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

  public invokeFinishedJobEvent(job: McsApiJob) {
    this.onFinishedJob.emit(job);
  }

  public onViewServerPage(): void {
    this._router.navigate(['/servers']);
  }

  private _updateProgressbar(): void {
    if (this.jobs && this.jobs.length > 0) {
      this.jobs.forEach((job) => {
        this.progressMax += job.ectInSeconds;
      });

      this._timerSubscription = Observable.timer(0, 1000)
        .take(this.progressMax + 1)
        .subscribe((time) => {
          this.progressValue = time;
        });
    }
  }
}
