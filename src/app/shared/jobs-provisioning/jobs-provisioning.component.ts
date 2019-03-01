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
  McsNotificationEventsService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  addOrUpdateArrayRecord,
  animateFactory
} from '@app/utilities';
import {
  McsJob,
  DataStatus,
  JobType
} from '@app/models';

@Component({
  selector: 'mcs-jobs-provisioning',
  templateUrl: './jobs-provisioning.component.html',
  animations: [
    animateFactory.fadeIn
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class JobsProvisioningComponent implements OnInit, DoCheck, OnDestroy {
  public progressValue: number;
  public progressMax: number;
  public progressBarHidden: boolean;
  public textContent: any;

  /**
   * Returns all the jobs of the current provisioning
   */
  @Input()
  public get jobs(): McsJob[] { return this._jobs; }
  public set jobs(value: McsJob[]) {
    if (value !== this._jobs) {
      this._jobs = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _jobs: McsJob[];
  private _jobsDiffer: IterableDiffer<McsJob>;

  // Subscription
  private _excludedProgressJobTypes: JobType[];
  private _isProgressbarHidden: boolean;
  private _timerSubscription: Subscription;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _notificationsEvents: McsNotificationEventsService,
    private _iterableDiffers: IterableDiffers
  ) {
    this.progressValue = 0;
    this.progressMax = 0;
    this._excludedProgressJobTypes = new Array();
    this._jobsDiffer = this._iterableDiffers.find([]).create(null);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.shared.jobsProvisioning;
    this._createExcludedProgressJobs();
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
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns true when the inputted jobs are more than 1
   */
  public get isMultiJobs(): boolean {
    return isNullOrEmpty(this.jobs) ? false : this.jobs.length > 1;
  }

  /**
   * Returns true when the job is provided
   */
  public get hasJobs(): boolean {
    return !isNullOrEmpty(this.jobs);
  }

  /**
   * Returns the data status in enum form
   */
  public get dataStatusEnum(): any {
    return DataStatus;
  }

  /**
   * Returns the success icon key
   */
  public get successIconKey(): string {
    return CoreDefinition.ASSETS_SVG_SUCCESS;
  }

  /**
   * Returns the error icon key
   */
  public get errorIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ERROR;
  }

  /**
   * Returns true when all jobs are completed
   */
  public get allJobsCompleted(): boolean {
    let inProgressJob = this.jobs && this.jobs.find((job) => {
      return job.dataStatus !== DataStatus.Success;
    });
    return isNullOrEmpty(inProgressJob) && this.hasJobs;
  }

  /**
   * Returns true when some of the jobs is error
   */
  public get hasErrorJobs(): boolean {
    let errorJob = this.jobs && this.jobs.find((job) => {
      return job.dataStatus === DataStatus.Error;
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
   * Returns true when the progress bar will be hidden
   */
  public get isProgressbarHidden(): boolean {
    return this._isProgressbarHidden || this.hasErrorJobs;
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
   * Returns true when the job was ended
   * @param job Job to be checked
   */
  public isJobEnded(job: McsJob): boolean {
    return job.dataStatus !== DataStatus.InProgress;
  }

  /**
   * Returns true when the job was successful
   * @param job Job to be checked
   */
  public isJobSuccessful(job: McsJob): boolean {
    return job.dataStatus === DataStatus.Success;
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
      this._isProgressbarHidden = !!this._excludedProgressJobTypes
        .find((jobType) => jobType === job.type);
    });

    // Calculate the 99% of the progreesbar maximum
    progressMaxWithOffset = (this.progressMax * 0.99);
    this._isProgressbarHidden = this.progressValue >= this.progressMax;

    // Set Inifinity Timer
    this._timerSubscription = timer(0, 1000)
      .pipe(take(Infinity))
      .subscribe(() => {
        let actualProgress = this.progressValue + 1;
        this.progressValue = Math.min(actualProgress, progressMaxWithOffset);

        // Exit progressbar
        if (this.allJobsCompleted) { this._removeProgressbar(DataStatus.Success); }
        if (this.hasErrorJobs) { this._removeProgressbar(DataStatus.Error); }
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
        let inProgressJob = isNullOrEmpty(job) || job.dataStatus === DataStatus.InProgress;
        if (inProgressJob) { return; }

        // Update the existing job
        addOrUpdateArrayRecord(this.jobs, job, true,
          (_existingJob: McsJob) => _existingJob.id === job.id);
      });
  }

  /**
   * Remove the progressbar when all the job was finished
   */
  private _removeProgressbar(status: DataStatus): void {
    switch (status) {
      case DataStatus.Error:
        this._endTimer(0);
        break;

      case DataStatus.Success:
      default:
        this._endTimer(this.progressMax);
        break;
    }
  }

  /**
   * End all the timer to removed the infinity loop and
   * mitigate the problem of possible memory leak
   * @param value Progressbar value
   */
  private _endTimer(value: number): void {
    this.progressValue = value;
    unsubscribeSafely(this._timerSubscription);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Reset job instance to re-calculate the progressbar status
   */
  private _resetJob(): void {
    this.progressValue = 0;
    this.progressMax = 0;
    unsubscribeSafely(this._timerSubscription);
  }

  /**
   * Creates all the jobs type table
   */
  private _createExcludedProgressJobs(): void {
    this._excludedProgressJobTypes.push(JobType.CreateResourceCatalogItem);
  }
}
