import { CoreDefinition } from '@app/core';
import {
  OsUpdatesStatus,
  osUpdatesStatusLabel,
  osUpdatesStatusSubtitleLabel,
  osUpdatesScheduleConfigureHoverLabel,
  McsServerOsUpdatesDetails,
  osUpdatesScheduleSubtitleLabel,
  OsUpdatesScheduleType,
  McsCronUtility
} from '@app/models';
import {
  replacePlaceholder,
  isNullOrEmpty,
  formatTime,
  formatDateTimeZone
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

export type ServerServicesActionDetails = {
  viewMode: ServerServicesView,
  callServerDetails: boolean
};

const INSPECTDATE_TIMEZONE = 'Australia/Sydney';
const INSPECTDATE_FORMAT = 'dddd, Do MMMM, YYYY [at] h:mm A';
export class OsUpdatesStatusConfiguration {
  private _osUpdateStatus: OsUpdatesStatus;
  private _updatesStatusDetailsMap: Map<OsUpdatesStatus, OsUpdatesStatusDetails>;
  private _updatesDetails: McsServerOsUpdatesDetails;

  /**
   * Returns the icon of the os update status
   */
  public get updatesStatusIcon(): string {
    return this._updatesStatusDetailsMap.get(this._osUpdateStatus).icon;
  }

  /**
   * Returns the label of the os update status
   */
  public get updatesStatusLabel(): string {
    return this._updatesStatusDetailsMap.get(this._osUpdateStatus).label;
  }

  /**
   * Returns the subtitleLabel of the os update status
   */
  public get updatesStatusSubtitleLabel(): string {

    let notYetInspected = isNullOrEmpty(this._updatesDetails.lastInspectDate);

    if (notYetInspected && OsUpdatesStatus.Unanalysed === this._osUpdateStatus) {
      return this._updatesStatusDetailsMap.get(this._osUpdateStatus).sublabel;
    }

    if (notYetInspected && OsUpdatesStatus.Analysing === this._osUpdateStatus) {
      return this._updatesStatusDetailsMap.get(this._osUpdateStatus).sublabel;
    }

    if (OsUpdatesStatus.Updating === this._osUpdateStatus) {
      return this._updatesStatusDetailsMap.get(this._osUpdateStatus).sublabel;
    }

    let formattedDate = formatDateTimeZone(
      new Date(this._updatesDetails.lastInspectDate), INSPECTDATE_TIMEZONE, INSPECTDATE_FORMAT
    );
    return replacePlaceholder(
      this._updatesStatusDetailsMap.get(OsUpdatesStatus.Updated).sublabel,
      'lastInspectDate', formattedDate);
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
        icon: CoreDefinition.ASSETS_SVG_STATE_RESTARTING,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Unanalysed],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Unanalysed]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Analysing,
      {
        icon: CoreDefinition.ASSETS_GIF_LOADER_ELLIPSIS,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Analysing],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Analysing],
        configureHoverLabel: osUpdatesScheduleConfigureHoverLabel[OsUpdatesStatus.Analysing]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Outdated,
      {
        icon: CoreDefinition.ASSETS_SVG_STATE_STOPPED,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Outdated],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Outdated]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Updated,
      {
        icon: CoreDefinition.ASSETS_SVG_STATE_RUNNING,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Updated],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Updated]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Updating,
      {
        icon: CoreDefinition.ASSETS_GIF_LOADER_ELLIPSIS,
        label: osUpdatesStatusLabel[OsUpdatesStatus.Updating],
        sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesStatus.Updating],
        configureHoverLabel: osUpdatesScheduleConfigureHoverLabel[OsUpdatesStatus.Updating]
      }
    );
    this._updatesStatusDetailsMap.set(
      OsUpdatesStatus.Error,
      {
        icon: CoreDefinition.ASSETS_SVG_WARNING,
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
    let cronJson = McsCronUtility.parseCronStringToJson(this._updatesDetails.crontab);
    cronJson.dayOfWeek.forEach(
      (day) => convertedDaysArray.push(formatTime(day.toString(), 'd', 'ddd'))
    );
    let time = formatTime(cronJson.hour[0] + ':' + cronJson.minute[0], 'HH:mm', 'h:mm A');
    return convertedDaysArray.join(',') + ' at ' + time;
  }
}
