import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import {
  ServerServicesView,
  OsUpdatesPatchStatus,
  osUpdatesStatusLabel,
  osUpdatesStatusSubtitleLabel,
  osUpdatesScheduleConfigureHoverLabel,
  McsServerOsUpdatesDetails,
  McsJob,
  DataStatus,
  McsServerOsUpdatesInspectRequest,
  ServerServicesAction,
  JobType
} from '@app/models';
import {
  CommonDefinition,
  isNullOrEmpty,
  replacePlaceholder
} from '@app/utilities';
import {
  McsDateTimeService,
  McsServerPermission
} from '@app/core';
import { ServerServiceDetailBase } from '../server-service-detail.base';
import { ServerServiceActionDetail } from '../../strategy/server-service-action.context';

const OS_UPDATE_TIMEZONE = 'Australia/Sydney';
const OS_UPDATE_DATEFORMAT = `EEEE, d MMMM, yyyy 'at' h:mm a`;

type OsUpdatesStatusDetails = {
  icon: string;
  label: string;
  sublabel: string;
  status: OsUpdatesPatchStatus;
  configureHoverLabel?: string;
};

@Component({
  selector: 'mcs-service-os-updates-patch',
  templateUrl: './os-updates-patch.component.html',
  host: {
    'class': 'block'
  }
})

export class ServiceOsUpdatesPatchComponent extends ServerServiceDetailBase implements OnChanges {

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

  @Output()
  public inspectAvailableUpdates: EventEmitter<ServerServiceActionDetail>;

  public serverPermission: McsServerPermission;

  private _osUpdatesDetails: McsServerOsUpdatesDetails;
  private _osUpdatesStatusDetailsMap: Map<OsUpdatesPatchStatus, OsUpdatesStatusDetails>;
  private _osUpdatesStatusDetails: OsUpdatesStatusDetails;
  private _job: McsJob;
  private _updateStartedDate: Date;

  constructor(
    private _dateTimeService: McsDateTimeService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    super(ServerServicesView.OsUpdatesPatch);
    this.inspectAvailableUpdates = new EventEmitter();
    this._createStatusMap();
    this._setOsUpdateDetailsByStatus(OsUpdatesPatchStatus.Unanalysed);
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
      if (this.isAnalysing) { return; }
      if (!this._wasInspectedBefore(this._osUpdatesDetails.lastInspectDate)) {
        this._setOsUpdateDetailsByStatus(OsUpdatesPatchStatus.Unanalysed);
        return;
      }

      let status = this._hasUpdates(this._osUpdatesDetails.updateCount) ? OsUpdatesPatchStatus.Outdated : OsUpdatesPatchStatus.Updated;
      this._setOsUpdateDetailsByStatus(status);
    }
  }

  /**
   * Returns the icon of the os update status
   */
  public get updatesStatusIcon(): string {
    return this._osUpdatesStatusDetails.icon;
  }

  /**
   * Returns the label of the os update status
   */
  public get updatesStatusLabel(): string {
    return this._osUpdatesStatusDetails.label;
  }

  /**
   * Returns the subtitleLabel of the os update status
   */
  public get updatesStatusSubtitleLabel(): string {

    if (this.isUnAnalysed || this.isAnalysing) {
      return this._osUpdatesStatusDetails.sublabel;
    }

    let dateToFormat: Date;
    if (this.isUpdating) {
      dateToFormat = this._updateStartedDate;
    } else {
      dateToFormat = new Date(this._osUpdatesDetails.lastInspectDate);
    }

    let formattedDate = this._dateTimeService.formatDate(dateToFormat, OS_UPDATE_DATEFORMAT, OS_UPDATE_TIMEZONE);
    return replacePlaceholder(this._osUpdatesStatusDetails.sublabel, 'formattedDate', formattedDate);
  }

  /**
   * Returns true if the update status has Errors
   */
  public get hasErrors(): boolean {
    return this._osUpdatesStatusDetails.status === OsUpdatesPatchStatus.Error;
  }

  /**
   * Returns true if the update status is Updating
   */
  public get isUpdating(): boolean {
    return this._osUpdatesStatusDetails.status === OsUpdatesPatchStatus.Updating;
  }

  /**
   * Returns true if the update status is Analysing
   */
  public get isAnalysing(): boolean {
    return this._osUpdatesStatusDetails.status === OsUpdatesPatchStatus.Analysing;
  }

  /**
   * Returns true if the update status is Updated
   */
  public get isUpdated(): boolean {
    return this._osUpdatesStatusDetails.status === OsUpdatesPatchStatus.Updated;
  }

  /**
   * Returns true if the update status is Outdated
   */
  public get isOutDated(): boolean {
    return this._osUpdatesStatusDetails.status === OsUpdatesPatchStatus.Outdated;
  }

  /**
   * Returns true if the update status is UnAnalysed
   */
  public get isUnAnalysed(): boolean {
    return this._osUpdatesStatusDetails.status === OsUpdatesPatchStatus.Unanalysed;
  }

  /**
   * Returns true if update status is either Unanalysed, Outdated or Updated, false otherwise
   */
  public get inspectButtonShown(): boolean {
    return this.isUnAnalysed || this.isOutDated || this.isUpdated;
  }

  /**
   * Returns true if server status is Outdated or Unanalysed and the update count is atleast 1.
   */
  public get updateNowButtonShown(): boolean {
    return this._hasUpdates(this._osUpdatesDetails.updateCount) && (this.isOutDated || this.isUnAnalysed);
  }

  /**
   * Checks for available os-update/s
   */
  public inspectForAvailableOsUpdates(): void {
    this._setOsUpdateDetailsByStatus(OsUpdatesPatchStatus.Analysing);
    let inspectRequest = new McsServerOsUpdatesInspectRequest();
    inspectRequest.clientReferenceObject = {
      serverId: this.server.id
    };
    this.inspectAvailableUpdates.emit({
      server: this.server,
      action: ServerServicesAction.OsUpdatesInspect,
      payload: inspectRequest
    });
  }

  /**
   * Disable the inspect now button if the server is powered off or processing
   */
  public inspectNowButtonDisabled(): boolean {
    return this.server.isPoweredOff || this.server.isProcessing;
  }

  /**
   * Returns true if the server was already inspected before
   */
  private _wasInspectedBefore(inspectDate: string): boolean {
    let wasInspected = !isNullOrEmpty(inspectDate);
    return wasInspected;
  }

  /**
   * Returns true if the server has available updates
   */
  private _hasUpdates(updateCount: number): boolean {
    let hasUpdates = updateCount > 0;
    return hasUpdates;
  }

  /**
   * Set the os updates details by type of status
   */
  private _setOsUpdateDetailsByStatus(status: OsUpdatesPatchStatus): void {
    this._osUpdatesStatusDetails = this._osUpdatesStatusDetailsMap.get(status);
  }

  /**
   * Listener for the apply os updates on server method call
   * @param job job object reference
   */
  private _onApplyServerOsUpdates(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    if (job.dataStatus === DataStatus.Error) {
      this._setOsUpdateDetailsByStatus(OsUpdatesPatchStatus.Error);
      return;
    }

    if (job.inProgress) {
      this._setOsUpdateDetailsByStatus(OsUpdatesPatchStatus.Updating);
      this._updateStartedDate = job.startedOn;
    } else {
      this._setOsUpdateDetailsByStatus(OsUpdatesPatchStatus.Updated);
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listener for the inspect server for os-updates method call
   * @param job job object reference
   */
  private _onInspectForAvailableOsUpdates(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    if (job.dataStatus === DataStatus.Error) {
      this._setOsUpdateDetailsByStatus(OsUpdatesPatchStatus.Error);
      return;
    }

    if (job.inProgress) {
      this._setOsUpdateDetailsByStatus(OsUpdatesPatchStatus.Analysing);
    } else {
      this._setOsUpdateDetailsByStatus(OsUpdatesPatchStatus.Unanalysed);
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Creates the status map table
   */
  private _createStatusMap(): void {
    this._osUpdatesStatusDetailsMap = new Map();

    this._osUpdatesStatusDetailsMap.set(OsUpdatesPatchStatus.Unanalysed, {
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: osUpdatesStatusLabel[OsUpdatesPatchStatus.Unanalysed],
      sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesPatchStatus.Unanalysed],
      status: OsUpdatesPatchStatus.Unanalysed
    });
    this._osUpdatesStatusDetailsMap.set(OsUpdatesPatchStatus.Analysing, {
      icon: CommonDefinition.ASSETS_GIF_LOADER_ELLIPSIS,
      label: osUpdatesStatusLabel[OsUpdatesPatchStatus.Analysing],
      sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesPatchStatus.Analysing],
      status: OsUpdatesPatchStatus.Analysing,
      configureHoverLabel: osUpdatesScheduleConfigureHoverLabel[OsUpdatesPatchStatus.Analysing]
    });
    this._osUpdatesStatusDetailsMap.set(OsUpdatesPatchStatus.Outdated, {
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: osUpdatesStatusLabel[OsUpdatesPatchStatus.Outdated],
      sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesPatchStatus.Outdated],
      status: OsUpdatesPatchStatus.Outdated
    });
    this._osUpdatesStatusDetailsMap.set(OsUpdatesPatchStatus.Updated, {
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: osUpdatesStatusLabel[OsUpdatesPatchStatus.Updated],
      sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesPatchStatus.Updated],
      status: OsUpdatesPatchStatus.Updated
    });
    this._osUpdatesStatusDetailsMap.set(OsUpdatesPatchStatus.Updating, {
      icon: CommonDefinition.ASSETS_GIF_LOADER_ELLIPSIS,
      label: osUpdatesStatusLabel[OsUpdatesPatchStatus.Updating],
      sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesPatchStatus.Updating],
      status: OsUpdatesPatchStatus.Updating,
      configureHoverLabel: osUpdatesScheduleConfigureHoverLabel[OsUpdatesPatchStatus.Updating]
    });
    this._osUpdatesStatusDetailsMap.set(OsUpdatesPatchStatus.Error, {
      icon: CommonDefinition.ASSETS_SVG_WARNING,
      label: osUpdatesStatusLabel[OsUpdatesPatchStatus.Error],
      status: OsUpdatesPatchStatus.Error,
      sublabel: osUpdatesStatusSubtitleLabel[OsUpdatesPatchStatus.Error]
    });
  }
}
