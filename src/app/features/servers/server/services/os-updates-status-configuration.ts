import {
  OsUpdatesStatus,
  osUpdatesStatusLabel,
  osUpdatesStatusSubtitleLabel,
  osUpdatesScheduleConfigureHoverLabel,
  McsServerOsUpdatesDetails,
  osUpdatesScheduleSubtitleLabel,
  OsUpdatesScheduleType,
  McsServer
} from '@app/models';
import {
  replacePlaceholder,
  isNullOrEmpty,
  formatTime,
  parseCronStringToJson,
  CommonDefinition
} from '@app/utilities';

type OsUpdatesStatusDetails = {
  icon: string;
  label: string;
  sublabel: string;
  configureHoverLabel?: string;
};

export enum ServerServicesView {
  Default = 0,
  Unscheduled = 1,
  Scheduled = 2,
}

export type OsUpdatesActionDetails = {
  server: McsServer,
  requestData?: any
};

export class OsUpdatesStatusConfiguration {
  private _osUpdateStatus: OsUpdatesStatus;
  private _updatesStatusDetailsMap: Map<OsUpdatesStatus, OsUpdatesStatusDetails>;
  private _updatesDetails: McsServerOsUpdatesDetails;
  private _updateStatusDetails: OsUpdatesStatusDetails;

  /**
   * Returns the icon of the os update status
   */
  public get updatesStatusIcon(): string {
    return this._updateStatusDetails.icon;
  }

  /**
   * Returns the label of the os update status
   */
  public get updatesStatusLabel(): string {
    return this._updateStatusDetails.label;
  }

  /**
   * Returns the subtitleLabel of the os update status
   */
  public get updatesStatusSubtitleLabel(): string {
    let isInitialAnalysis =
      !this.hasBeenInspectedBefore && OsUpdatesStatus.Analysing === this._osUpdateStatus;

    if (isInitialAnalysis) {
      return this._updatesStatusDetailsMap.get(OsUpdatesStatus.Analysing).sublabel;
    }

    if (OsUpdatesStatus.Unanalysed === this._osUpdateStatus) {
      return this._updatesStatusDetailsMap.get(OsUpdatesStatus.Unanalysed).sublabel;
    }

    if (OsUpdatesStatus.Updating === this._osUpdateStatus) {
      return this._updatesStatusDetailsMap.get(OsUpdatesStatus.Updating).sublabel;
    }

    return this._updatesStatusDetailsMap.get(OsUpdatesStatus.Updated).sublabel;
  }

  /**
   * Returns the updates schedule configure link hover label
   */
  public get updatesScheduleConfigureHoverLabel(): string {
    return this._updatesStatusDetailsMap.get(this._osUpdateStatus).configureHoverLabel;
  }

  /**
   * Returns the updates schedule subtitle label
   */
  public get updatesScheduleSubtitleLabel(): string {

    let scheduleDate = this._buildFormattedScheduleDate();

    return this._updatesDetails.runOnce ?
      replacePlaceholder(
        osUpdatesScheduleSubtitleLabel[OsUpdatesScheduleType.RunOnce],
        'scheduleDate', scheduleDate) :
      replacePlaceholder(
        osUpdatesScheduleSubtitleLabel[OsUpdatesScheduleType.Recurring],
        'scheduleDate', scheduleDate);
  }

  /**
   * Returns the last inspected date
   */
  public get lastInspectedDate(): string {
    return this._updatesDetails.lastInspectDate;
  }

  /**
   * Returns the current status of the Os Update
   */
  public get status(): OsUpdatesStatus {
    return this._osUpdateStatus;
  }

  /**
   * Returns true if a schedule is set, false otherwise
   */
  public get hasSchedule(): boolean {
    return !isNullOrEmpty(this._updatesDetails.crontab);
  }

  /**
   * Returns true if a schedule is set, false otherwise
   */
  public get isRunOnce(): boolean {
    return this._updatesDetails.runOnce;
  }

  /**
   * Returns true if the server was already inspected before
   */
  public get hasBeenInspectedBefore(): boolean {
    let wasInspected = !isNullOrEmpty(this._updatesDetails.lastInspectDate);
    return wasInspected;
  }

  /**
   * Returns true if the update status has no Errors
   */
  public get updateStatusHasNoErrors(): boolean {
    return this._osUpdateStatus !== OsUpdatesStatus.Error;
  }

  /**
   * Returns true if update status is either Unanalysed, Outdated or Updated, false otherwise
   */
  public get inspectButtonShown(): boolean {
    return this._osUpdateStatus === OsUpdatesStatus.Unanalysed ||
      this._osUpdateStatus === OsUpdatesStatus.Outdated ||
      this._osUpdateStatus === OsUpdatesStatus.Updated;
  }

  /**
   * Returns true if server status is Outdated or Unanalysed and the update count is atleast 1.
   */
  public get configureScheduleButtonDisabled(): boolean {
    return this._osUpdateStatus === OsUpdatesStatus.Analysing ||
      this._osUpdateStatus === OsUpdatesStatus.Updating;
  }

  /**
   * Returns true if server status is Outdated or Unanalysed and the update count is atleast 1.
   */
  public get runNowButtonShown(): boolean {
    let hasAvailableUpdates = this._updatesDetails.updateCount > 0;
    return hasAvailableUpdates && (this._osUpdateStatus === OsUpdatesStatus.Outdated ||
      this._osUpdateStatus === OsUpdatesStatus.Unanalysed);
  }

  /**
   * Returns true if update status has no Error and the schedule is set to run once, false otherwise
   */
  public get updatesScheduleRunOnceWarningLabelShown(): boolean {
    return this.hasSchedule && this.updateStatusHasNoErrors && this._updatesDetails.runOnce;
  }

  constructor(updateDetails?: McsServerOsUpdatesDetails) {
    this._updatesDetails = isNullOrEmpty(updateDetails) ?
      new McsServerOsUpdatesDetails() : updateDetails;
    this._createStatusMapTable();
  }

  /**
   * Set the Os Updates Status
   */
  public setOsUpdateStatus(osUpdateStatus: OsUpdatesStatus) {
    this._osUpdateStatus = osUpdateStatus;
    this._updateStatusDetails = this._updatesStatusDetailsMap.get(this._osUpdateStatus);
  }

  /**
   * Set the Os Updates Details
   */
  public setOsUpdateDetails(updateDetails: McsServerOsUpdatesDetails) {
    this._updatesDetails = updateDetails;
  }

  /**
   * Creates the status icon map table
   */
  private _createStatusMapTable(): void {
    this._updatesStatusDetailsMap = new Map();
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Unanalysed,
      {
        icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Unanalysed],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Unanalysed]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Analysing,
      {
        icon: CommonDefinition.ASSETS_GIF_LOADER_ELLIPSIS,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Analysing],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Analysing],
        configureHoverLabel: osUpdatesScheduleConfigureHoverLabel[OsUpdatesStatus.Analysing]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Outdated,
      {
        icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Outdated],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Outdated]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Updated,
      {
        icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Updated],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Updated]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Updating,
      {
        icon: CommonDefinition.ASSETS_GIF_LOADER_ELLIPSIS,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Updating],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Updating],
        configureHoverLabel: osUpdatesScheduleConfigureHoverLabel[OsUpdatesStatus.Updating]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Error,
      {
        icon: CommonDefinition.ASSETS_SVG_WARNING,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Error],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Error]
      }
    );
  }

  /**
   * Build schedule date with proper format
   */
  private _buildFormattedScheduleDate() {
    let convertedDaysArray = [];
    let cronJson = parseCronStringToJson(this._updatesDetails.crontab);
    cronJson.dayOfWeek.forEach(
      (day) => convertedDaysArray.push(formatTime(day.toString(), 'd', 'ddd'))
    );
    let time = formatTime(cronJson.hour[0] + ':' + cronJson.minute[0], 'HH:mm', 'h:mm A');
    return convertedDaysArray.join(',') + ' at ' + time;
  }
}
