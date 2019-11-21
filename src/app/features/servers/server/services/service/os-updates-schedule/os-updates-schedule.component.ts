import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
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

@Component({
  selector: 'mcs-service-os-updates-schedule',
  templateUrl: './os-updates-schedule.component.html',
  host: {
    'class': 'block'
  }
})

export class ServiceOsUpdatesScheduleComponent extends ServerServiceDetailBase implements OnChanges {

  @Input()
  public set osUpdatesDetails(details: McsServerOsUpdatesDetails) {
    this._osUpdatesDetails = details;
  }
  public get osUpdatesDetails(): McsServerOsUpdatesDetails {
    return this._osUpdatesDetails;
  }

  @Input()
  public set jobsMap(jobsMap: Map<JobType, McsJob>) {
    this._jobsMap = jobsMap;
  }
  public get jobsMap(): Map<JobType, McsJob> {
    return this._jobsMap;
  }

  public serverPermission: McsServerPermission;

  private _osUpdatesDetails: McsServerOsUpdatesDetails;
  private _osUpdatesScheduleDetailsMap: Map<OsUpdatesScheduleType, OsUpdatesScheduleDetails>;
  private _osUpdatesScheduleDetails: OsUpdatesScheduleDetails;
  private _jobsMap: Map<JobType, McsJob>;
  private _isUpdating: boolean = false;
  private _isAnalysing: boolean = false;
  private _hasErrors: boolean = false;

  constructor(
    private _translateService: TranslateService
  ) {
    super(ServerServicesView.OsUpdatesSchedule);
    this._createScheduleMap();
    this._setOsUpdateScheduleByType(OsUpdatesScheduleType.None);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let server = changes['server'];
    if (!isNullOrEmpty(server)) {
      this.serverPermission = new McsServerPermission(this.server);
    }

    let jobsMap = changes['jobsMap'];
    if (!isNullOrEmpty(jobsMap)) {

      if (this._jobsMap.has(JobType.PerformServerOsUpdateAnalysis)) {
        let job = this._jobsMap.get(JobType.PerformServerOsUpdateAnalysis);
        this._onInspectForAvailableOsUpdates(job);
      }

      if (this._jobsMap.has(JobType.ApplyServerOsUpdates)) {
        let job = this._jobsMap.get(JobType.ApplyServerOsUpdates);
        this._onApplyServerOsUpdates(job);
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
   * Returns the updates schedule configure link hover label
   */
  public get updatesScheduleConfigureHoverLabel(): string {
    if (this._isUpdating) {
      return this._translateService.instant('serverServices.operatingSystemUpdates.updatesScheduleConfigureHoverLabel.updating');
    }
    return this._translateService.instant('serverServices.operatingSystemUpdates.updatesScheduleConfigureHoverLabel.analysing');
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
   * Returns true if the server is in the process of running an update
   */
  public get isUpdating(): boolean {
    return this._isUpdating;
  }

  /**
   * Returns true if the server is in the process of inspecting available updates
   */
  public get isAnalysing(): boolean {
    return this._isAnalysing;
  }

  /**
   * Returns true if any of the jobs have errors
   */
  public get hasErrors(): boolean {
    return this._hasErrors;
  }

  /**
   * Returns true if server status is Outdated or Unanalysed and the update count is atleast 1.
   */
  public get configureScheduleButtonDisabled(): boolean {
    return this.server.isProcessing || this._isUpdating || this._isAnalysing;
  }

  /**
   * Returns true if a schedule is set, false otherwise
   */
  public get hasSchedule(): boolean {
    let cron = getSafeProperty(this._osUpdatesDetails, (obj) => obj.crontab);
    return !isNullOrEmpty(cron);
  }

  /**
   * Set the os updates schedule by type
   */
  private _setOsUpdateScheduleByType(type: OsUpdatesScheduleType): void {
    this._osUpdatesScheduleDetails = this._osUpdatesScheduleDetailsMap.get(type);
  }

  /**
   * Listener for the apply os updates on server method call
   * @param job job object reference
   */
  private _onApplyServerOsUpdates(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    if (job.dataStatus === DataStatus.Error) {
      this._hasErrors = true;
      this._isUpdating = false;
      return;
    }

    if (job.inProgress) {
      this._isUpdating = true;
      this._hasErrors = false;
      return;
    }
    this._isUpdating = false;
    this._hasErrors = false;
  }

  /**
   * Listener for the inspect server for os-updates method call
   * @param job job object reference
   */
  private _onInspectForAvailableOsUpdates(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    if (job.dataStatus === DataStatus.Error) {
      this._hasErrors = true;
      this._isAnalysing = false;
      return;
    }

    if (job.inProgress) {
      this._isAnalysing = true;
      this._hasErrors = false;
      return;
    }
    this._isAnalysing = false;
    this._hasErrors = false;
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
