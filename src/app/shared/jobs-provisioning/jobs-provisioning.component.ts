import {
  Component,
  OnInit,
  DoCheck,
  OnDestroy,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  IterableDiffers,
  IterableDiffer,
  ContentChild
} from '@angular/core';
import {
  timer,
  Subscription
} from 'rxjs';
import { take } from 'rxjs/operators';
import { CoreRoutes } from '@app/core';
import { McsEvent } from '@app/events';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  addOrUpdateArrayRecord,
  animateFactory,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import {
  McsJob,
  DataStatus,
  JobType,
  RouteKey
} from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { JobsProvisioningLoadingTextDirective } from './jobs-provisioning-loading-text.directive';

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

  @ContentChild(JobsProvisioningLoadingTextDirective)
  public jobsProvisioningLoadingText: JobsProvisioningLoadingTextDirective;

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
  private _jobReceiveHandler: Subscription;
  private _jobTypeRouteMap: Map<JobType, RouteKey>;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _iterableDiffers: IterableDiffers
  ) {
    this.progressValue = 0;
    this.progressMax = 0;
    this._excludedProgressJobTypes = new Array();
    this._jobsDiffer = this._iterableDiffers.find([]).create(null);
    this._createJobTypeRouteMap();
  }

  public ngOnInit() {
    this._registerEvents();
    this._createExcludedProgressJobs();
  }

  public ngDoCheck() {
    let changes = this._jobsDiffer.diff(this.jobs);
    if (!isNullOrEmpty(changes)) {
      this._resetJob();
      this._updateProgressbarRealTimeAsync();
      this._initializeProgressBarVisibility();
    }
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._timerSubscription);
    unsubscribeSafely(this._jobReceiveHandler);
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
   * Returns the dot icon key
   */
  public get dotIconKey(): string {
    return CommonDefinition.ASSETS_SVG_BULLET;
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
   * Returns if the loading text should be displayed
   */
  public get loadingTextIsDisplay(): boolean {
    return this.hasInProgressJob && !isNullOrEmpty(this.jobsProvisioningLoadingText);
  }

  /**
   * Gets the status icon key by status
   * @param status Status of the job/task, which to get the icon key
   */
  public getStatusIconKey(status: DataStatus): string {
    return status === DataStatus.Success ? CommonDefinition.ASSETS_SVG_SUCCESS : CommonDefinition.ASSETS_SVG_ERROR;
  }

  /**
   * Event that emits when the progress bar has been completed
   */
  public onProgressCompleted(): void {
    this._isProgressbarHidden = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Returns the constructed resource link if available
   */
  public resourceLink(job: McsJob): string {
    if (job.type === JobType.PublicCloudLicenseChangeCount) {
      return CoreRoutes.getNavigationPath(RouteKey.Licenses);
    }

    let completedTask = job.tasks && job.tasks.find((task) => {
      return task.dataStatus === DataStatus.Success && !isNullOrEmpty(task.referenceObject);
    });

    let routeKey = this._jobTypeRouteMap.get(job.type);
    let resourcePath: string;
    if (!isNullOrEmpty(routeKey)) {
      resourcePath = CoreRoutes.getNavigationPath(routeKey);
    }

    let resourceId = getSafeProperty(completedTask, (obj) => obj.referenceObject.resourceId);
    let hasNoResource = isNullOrEmpty(resourceId) || isNullOrEmpty(resourcePath);
    return hasNoResource ? undefined : `${resourcePath}/${resourceId}`;
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

        // Exit progressbar
        if (this.allJobsCompleted) { this._removeProgressbar(DataStatus.Success); }
        if (this.hasErrorJobs) { this._removeProgressbar(DataStatus.Error); }
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listen to current user job triggered
   */
  private _registerEvents(): void {
    this._jobReceiveHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onJobReceived.bind(this));
  }

  /**
   * Event that emits when the job has been received
   * @param job New Job received
   */
  private _onJobReceived(job: McsJob): void {
    let inProgressJob = isNullOrEmpty(job) || job.dataStatus === DataStatus.Active;
    if (inProgressJob) { return; }

    addOrUpdateArrayRecord(this.jobs, job, true, (_existingJob: McsJob) => _existingJob.id === job.id);
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
    this._excludedProgressJobTypes.push(JobType.ResourceCreateCatalogItem);
  }

  /**
   * Initialize progress bar visibility based on the job data
   */
  private _initializeProgressBarVisibility(): void {
    if (isNullOrEmpty(this.jobs)) { return; }

    this._isProgressbarHidden = this.progressValue >= this.progressMax;
    this._isProgressbarHidden = !isNullOrEmpty(
      this.jobs.filter((job) => !job.isEstimable || !job.inProgress)
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Initialize progress bar visibility based on the job data
   */
  private _createJobTypeRouteMap(): void {
    this._jobTypeRouteMap = new Map();
    this._jobTypeRouteMap.set(JobType.SelfManagedServerCreate, RouteKey.ServerDetails);
    this._jobTypeRouteMap.set(JobType.SelfManagedServerClone, RouteKey.ServerDetails);
    this._jobTypeRouteMap.set(JobType.ResourceCreateCatalogItem, RouteKey.Medium);
    this._jobTypeRouteMap.set(JobType.ManagedServerProvision, RouteKey.ServerDetails);
  }
}
