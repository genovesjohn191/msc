import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit
} from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { McsServerPermission } from '@app/core';
import {
  ServerServicesView,
  McsServerOsUpdatesDetails,
  McsJob,
  DataStatus,
  osUpdatesScheduleSubtitleLabel,
  OsUpdatesScheduleType,
  osUpdatesScheduleLabel,
  osUpdatesScheduleWarningLabel,
  JobType
} from '@app/models';
import {
  isNullOrEmpty,
  replacePlaceholder,
  parseCronStringToJson,
  formatTime,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import { ServerServiceDetailBase } from '../server-service-detail.base';

type OsUpdatesScheduleDetails = {
  label: string;
  type: OsUpdatesScheduleType;
  sublabel?: string;
  warningLabel?: string;
};

interface OsUpdateScheduleStatus {
  isUpdating: boolean;
  isAnalysing: boolean;
  hasErrors: boolean;
}

@Component({
  selector: 'mcs-service-os-updates-schedule',
  templateUrl: './os-updates-schedule.component.html',
  host: {
    'class': 'block'
  }
})

export class ServiceOsUpdatesScheduleComponent extends ServerServiceDetailBase implements OnChanges, OnInit {

  @Input()
  public set osUpdatesDetails(details: McsServerOsUpdatesDetails) {
    this._osUpdatesDetails = details;
  }
  public get osUpdatesDetails(): McsServerOsUpdatesDetails {
    return this._osUpdatesDetails;
  }

  @Input()
  public set job(job: McsJob) {
    this._job = job;
  }
  public get job(): McsJob {
    return this._job;
  }

  public serverPermission: McsServerPermission;
  public scheduleStatus$: Observable<OsUpdateScheduleStatus>;

  private _osUpdatesDetails: McsServerOsUpdatesDetails;
  private _osUpdatesScheduleDetailsMap: Map<OsUpdatesScheduleType, OsUpdatesScheduleDetails>;
  private _osUpdatesScheduleDetails: OsUpdatesScheduleDetails;
  private _job: McsJob;

  private _scheduleStatusChange: BehaviorSubject<OsUpdateScheduleStatus>;

  constructor(private _translateService: TranslateService) {
    super(ServerServicesView.OsUpdatesSchedule);
    this._scheduleStatusChange = new BehaviorSubject<OsUpdateScheduleStatus>({ hasErrors: false, isAnalysing: false, isUpdating: false });
    this._createScheduleMap();
    this._setOsUpdateScheduleByType(OsUpdatesScheduleType.None);
  }

  public ngOnInit() {
    this._subscribeToScheduleStatus();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let server = changes['server'];
    if (!isNullOrEmpty(server)) {
      this.serverPermission = new McsServerPermission(this.server);
    }

    let job = changes['job'];
    if (!isNullOrEmpty(job) && !isNullOrEmpty(this._job)) {

      if (this._job.type === JobType.PerformServerOsUpdateAnalysis) {
        this._onInspectForAvailableOsUpdates(this._job);
      }

      if (this._job.type === JobType.ApplyServerOsUpdates) {
        this._onApplyServerOsUpdates(this._job);
      }
    }

    let osUpdatesDetails = changes['osUpdatesDetails'];
    if (!isNullOrEmpty(osUpdatesDetails)) {

      if (!this.hasSchedule) {
        this._setOsUpdateScheduleByType(OsUpdatesScheduleType.None);
        return;
      }

      let status = this._osUpdatesDetails.runOnce ? OsUpdatesScheduleType.RunOnce : OsUpdatesScheduleType.Recurring;
      this._setOsUpdateScheduleByType(status);
    }
  }

  /**
   * Returns the clock icon key
   */
  public get clockKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOCK;
  }

  /**
   * Returns true if the schedule is set to RunOnce
   */
  public get isRunOnce(): boolean {
    return getSafeProperty(this._osUpdatesScheduleDetails, (obj) => obj.type === OsUpdatesScheduleType.RunOnce, false);
  }

  /**
   * Returns true if the schedule is set to Recurring
   */
  public get isRecurring(): boolean {
    return getSafeProperty(this._osUpdatesScheduleDetails, (obj) => obj.type === OsUpdatesScheduleType.Recurring, false);
  }

  /**
   * Returns true if a schedule is set, false otherwise
   */
  public get hasSchedule(): boolean {
    let cron = getSafeProperty(this._osUpdatesDetails, (obj) => obj.crontab);
    return !isNullOrEmpty(cron);
  }

  /**
   * Returns the updates schedule label depending if there is schedule set or not
   */
  public get updatesScheduleLabel(): string {
    return getSafeProperty(this._osUpdatesScheduleDetails, (obj) => obj.label);
  }

  /**
   * Returns the updates schedule subtitle label
   */
  public get updatesScheduleSubtitleLabel(): string {
    let scheduleDate = this._buildFormattedScheduleDate(this._osUpdatesDetails.crontab);
    return replacePlaceholder(this._osUpdatesScheduleDetails.sublabel, 'scheduleDate', scheduleDate);
  }

  /**
   * Returns the updates schedule warning label
   */
  public get updatesScheduleWarningLabel(): string {
    return getSafeProperty(this._osUpdatesScheduleDetails, (obj) => obj.warningLabel);
  }

  /**
   * Returns true if server status is Outdated or Unanalysed and the update count is atleast 1.
   */
  public configureScheduleButtonDisabled(scheduleStatus: OsUpdateScheduleStatus): boolean {
    return this.server.isProcessing || scheduleStatus.isUpdating || scheduleStatus.isAnalysing;
  }

  /**
   * Returns the updates schedule configure link hover label
   */
  public updatesScheduleConfigureHoverLabel(scheduleStatus: OsUpdateScheduleStatus): string {
    if (scheduleStatus.isUpdating) {
      return this._translateService.instant('serverServices.operatingSystemUpdates.updatesScheduleConfigureHoverLabel.updating');
    }
    return this._translateService.instant('serverServices.operatingSystemUpdates.updatesScheduleConfigureHoverLabel.analysing');
  }

  /**
   * Set the os updates schedule by type
   */
  private _setOsUpdateScheduleByType(type: OsUpdatesScheduleType): void {
    this._osUpdatesScheduleDetails = this._osUpdatesScheduleDetailsMap.get(type);
  }

  /**
   * Subscribe to the Schedule Status as an observable
   */
  private _subscribeToScheduleStatus(): void {
    this.scheduleStatus$ = this._scheduleStatusChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Listener for the apply os updates on server method call
   * @param job job object reference
   */
  private _onApplyServerOsUpdates(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    if (job.dataStatus === DataStatus.Error) {
      this._scheduleStatusChange.next({ hasErrors: true, isAnalysing: false, isUpdating: false });
      return;
    }

    if (job.inProgress) {
      this._scheduleStatusChange.next({ hasErrors: false, isAnalysing: false, isUpdating: true });
      return;
    }
    this._scheduleStatusChange.next({ hasErrors: false, isAnalysing: false, isUpdating: false });
  }

  /**
   * Listener for the inspect server for os-updates method call
   * @param job job object reference
   */
  private _onInspectForAvailableOsUpdates(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    if (job.dataStatus === DataStatus.Error) {
      this._scheduleStatusChange.next({ hasErrors: true, isAnalysing: false, isUpdating: false });
      return;
    }

    if (job.inProgress) {
      this._scheduleStatusChange.next({ hasErrors: false, isAnalysing: true, isUpdating: false });
      return;
    }
    this._scheduleStatusChange.next({ hasErrors: false, isAnalysing: false, isUpdating: false });
  }

  /**
   * Build schedule date with proper format
   */
  private _buildFormattedScheduleDate(cron: string) {
    let convertedDaysArray = [];
    let cronJson = parseCronStringToJson(cron);
    cronJson.dayOfWeek.forEach(
      (day) => convertedDaysArray.push(formatTime(day.toString(), 'd', 'ddd'))
    );
    let time = formatTime(cronJson.hour[0] + ':' + cronJson.minute[0], 'HH:mm', 'h:mm A');
    return convertedDaysArray.join(',') + ' at ' + time;
  }

  /**
   * Creates the status map table
   */
  private _createScheduleMap(): void {
    this._osUpdatesScheduleDetailsMap = new Map();

    this._osUpdatesScheduleDetailsMap.set(OsUpdatesScheduleType.Recurring, {
      label: osUpdatesScheduleLabel[OsUpdatesScheduleType.Recurring],
      type: OsUpdatesScheduleType.Recurring,
      sublabel: osUpdatesScheduleSubtitleLabel[OsUpdatesScheduleType.Recurring]
    });
    this._osUpdatesScheduleDetailsMap.set(OsUpdatesScheduleType.RunOnce, {
      label: osUpdatesScheduleLabel[OsUpdatesScheduleType.RunOnce],
      type: OsUpdatesScheduleType.RunOnce,
      sublabel: osUpdatesScheduleSubtitleLabel[OsUpdatesScheduleType.RunOnce],
      warningLabel: osUpdatesScheduleWarningLabel[OsUpdatesScheduleType.RunOnce]
    });
    this._osUpdatesScheduleDetailsMap.set(OsUpdatesScheduleType.None, {
      label: osUpdatesScheduleLabel[OsUpdatesScheduleType.None],
      type: OsUpdatesScheduleType.None
    });
  }
}
