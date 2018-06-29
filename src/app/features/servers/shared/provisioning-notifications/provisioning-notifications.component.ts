import {
  Component,
  OnInit,
  DoCheck,
  OnDestroy,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  IterableDiffers,
  IterableDiffer
} from '@angular/core';
import { Router } from '@angular/router';
import {
  timer,
  Subject,
  Subscription
} from 'rxjs';
import {
  takeUntil,
  take
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsApiJob,
  McsApiTask,
  McsTaskType,
  McsDataStatus,
  McsNotificationEventsService
} from '../../../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  unsubscribeSubject,
  addOrUpdateArrayRecord,
  animateFactory
} from '../../../../utilities';

@Component({
  selector: 'mcs-provisioning-notifications',
  templateUrl: './provisioning-notifications.component.html',
  styleUrls: ['./provisioning-notifications.component.scss'],
  animations: [
    animateFactory.fadeIn
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProvisioningNotificationsComponent implements OnInit, DoCheck, OnDestroy {
  public progressValue: number;
  public progressMax: number;
  public progressBarHidden: boolean;
  public textContent: any;

  /**
   * Returns all the jobs of the current provisioning
   */
  @Input()
  public get jobs(): McsApiJob[] { return this._jobs; }
  public set jobs(value: McsApiJob[]) {
    if (value !== this._jobs) {
      this._jobs = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _jobs: McsApiJob[];
  private _jobsDiffer: IterableDiffer<McsApiJob>;

  // Subscription
  private _timerSubscription: Subscription;
  private _destroySubject = new Subject<void>();

  public get isMultiJobs(): boolean {
    return isNullOrEmpty(this.jobs) ? false : this.jobs.length > 1;
  }

  public get hasJobs(): boolean {
    return !isNullOrEmpty(this.jobs);
  }

  public get dataStatusEnum(): any {
    return McsDataStatus;
  }

  // Icons
  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CLOSE;
  }

  public constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _notificationsEvents: McsNotificationEventsService,
    private _iterableDiffers: IterableDiffers
  ) {
    this.progressValue = 0;
    this.progressMax = 0;
    this._jobsDiffer = this._iterableDiffers.find([]).create(null);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content
      .servers.shared.provisioningNotifications;
    this._listenToCurrentUserJob();
  }

  public ngDoCheck() {
    let changes = this._jobsDiffer.diff(this.jobs);
    if (!isNullOrEmpty(changes)) {
      this._resetJob();
      this._updateProgressbarRealTimeAsync();
    }
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._timerSubscription);
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns true when all jobs are completed
   */
  public get allJobsCompleted(): boolean {
    let inProgressJob = this.jobs.find((job) => {
      return job.dataStatus !== McsDataStatus.Success;
    });
    return isNullOrEmpty(inProgressJob) && this.hasJobs;
  }

  /**
   * Returns true when some of the jobs is error
   */
  public get hasErrorJobs(): boolean {
    let errorJob = this.jobs.find((job) => {
      return job.dataStatus === McsDataStatus.Error;
    });
    return !isNullOrEmpty(errorJob) && this.hasJobs;
  }

  /**
   * Returns true when there is ongoing job
   */
  public get hasInProgressJob(): boolean {
    return !this.allJobsCompleted && !this.hasErrorJobs;
  }

  /**
   * Returns the title based on single or multiple deployments status
   */
  public getTitle(): string {
    let title: string;
    if (this.isMultiJobs) {
      title = this.textContent ? this.textContent.deployMultiple : '';
    } else {
      title = isNullOrEmpty(this.jobs) ? '' : this.jobs[0].description;
    }
    return title;
  }

  /**
   * Returns true when the job was completed
   * @param job Job to be checked
   */
  public isJobCompleted(job: McsApiJob): boolean {
    return job.dataStatus !== McsDataStatus.InProgress;
  }

  /**
   * Returns true when the job was successful
   * @param job Job to be checked
   */
  public isJobSuccessful(job: McsApiJob): boolean {
    return job.dataStatus === McsDataStatus.Success;
  }

  /**
   * View the server page based on tasks provided
   * @param tasks Tasks to be checked and navigated to
   */
  public onViewServerPage(tasks: McsApiTask[]): void {
    let serverId = this._getCreatedServerId(tasks);
    let route = !isNullOrEmpty(serverId) ? `/servers/${serverId}` : '/servers';
    this._router.navigate([route]);
  }

  /**
   * Returns the redirection link text based on tasks provided
   * @param tasks Tasks to be checked where the server will get from
   */
  public getRedirectionLinkText(tasks: McsApiTask[]): string {
    let serverId = this._getCreatedServerId(tasks);
    return !isNullOrEmpty(serverId) ?
      this.textContent.viewServerLink : this.textContent.viewServersLink;
  }

  /**
   * Returns the created server id when the job is done
   * @param tasks Tasks to get the server details from
   */
  private _getCreatedServerId(tasks: McsApiTask[]): string {
    if (isNullOrEmpty(tasks)) { return ''; }

    let completedTask = tasks.find((task) => {
      return (task.type === McsTaskType.CreateServer || task.type === McsTaskType.CloneServer)
        && task.dataStatus === McsDataStatus.Success && !isNullOrEmpty(task.referenceObject);
    });
    return !isNullOrEmpty(completedTask) ?
      completedTask.referenceObject.resourceId : '';
  }

  /**
   * Asynchronously update the progressbar in realtime
   */
  private _updateProgressbarRealTimeAsync(): void {
    if (isNullOrEmpty(this.jobs)) { return; }
    let progressMaxWithOffset: number = 0;

    this.jobs.forEach((job) => {
      let hasTasks = !isNullOrEmpty(job) && !isNullOrEmpty(job.tasks);
      if (!hasTasks) { return; }

      job.tasks.forEach((task) => {
        this.progressValue += task.elapsedTimeInSeconds;
        this.progressMax += (task.ectInSeconds + task.elapsedTimeInSeconds);
      });
    });

    // Calculate the 99% of the progreesbar maximum
    progressMaxWithOffset = (this.progressMax * 0.99);

    // Set Inifinity Timer
    this._timerSubscription = timer(0, 1000)
      .pipe(take(Infinity))
      .subscribe(() => {
        let actualProgress = this.progressValue + 1;
        this.progressValue = Math.min(actualProgress, progressMaxWithOffset);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listen to current user job triggered
   */
  private _listenToCurrentUserJob(): void {
    this._notificationsEvents.currentUserJob
      .pipe(takeUntil(this._destroySubject))
      .subscribe((job) => {
        let inProgressJob = isNullOrEmpty(job) || job.dataStatus === McsDataStatus.InProgress;
        if (inProgressJob) { return; }

        // Update the existing job
        addOrUpdateArrayRecord(this.jobs, job, true,
          (_existingJob: McsApiJob) => _existingJob.id === job.id);

        // Exit progressbar
        if (this.allJobsCompleted) { this._removeProgressbar(McsDataStatus.Success); }
        if (this.hasErrorJobs) { this._removeProgressbar(McsDataStatus.Error); }
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Remove the progressbar when all the job was finished
   */
  private _removeProgressbar(status: McsDataStatus): void {
    switch (status) {
      case McsDataStatus.Error:
        this._endTimer(0);
        break;

      case McsDataStatus.Success:
      default:
        this._endTimer(this.progressMax);
        break;
    }
  }

  /**
   * End all the timer to removed the infinity loop and
   * mitigate the problem of possible memory leak
   * @param progressValue Progressbar value
   */
  private _endTimer(progressValue: number): void {
    this.progressValue = progressValue;
    unsubscribeSafely(this._timerSubscription);
  }

  /**
   * Reset job instance to re-calculate the progressbar status
   */
  private _resetJob(): void {
    this.progressValue = 0;
    this.progressMax = 0;
    unsubscribeSafely(this._timerSubscription);
  }
}
