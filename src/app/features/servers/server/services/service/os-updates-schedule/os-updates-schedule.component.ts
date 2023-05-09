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
import {
  McsDateTimeService,
  McsServerPermission } from '@app/core';
import {
  ServerServicesView,
  McsServerOsUpdatesDetails,
  McsJob,
  DataStatus,
  osUpdatesScheduleSubtitleLabel,
  OsUpdatesScheduleType,
  osUpdatesScheduleLabel,
  JobType,
  McsServerOsUpdatesScheduleDetails,
  weekText
} from '@app/models';
import {
  isNullOrEmpty,
  replacePlaceholder,
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

  @Input()
  public validToUpdateOs: boolean;

  public serverPermission: McsServerPermission;
  public scheduleStatus$: Observable<OsUpdateScheduleStatus>;

  private _osUpdatesDetails: McsServerOsUpdatesDetails;
  private _osUpdatesScheduleDetailsMap: Map<OsUpdatesScheduleType, OsUpdatesScheduleDetails>;
  private _osUpdatesScheduleDetails: OsUpdatesScheduleDetails;
  private _job: McsJob;

  private _scheduleStatusChange: BehaviorSubject<OsUpdateScheduleStatus>;

  constructor(
    private _dateTimeService: McsDateTimeService,
    private _translateService: TranslateService
  ) {
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

      if (this._job.type === JobType.ManagedServerPerformOsUpdateAnalysis) {
        this._onInspectForAvailableOsUpdates(this._job);
      }

      if (this._job.type === JobType.ManagedServerApplyOsUpdates) {
        this._onApplyServerOsUpdates(this._job);
      }
    }

    let osUpdatesDetails = changes['osUpdatesDetails'];
    if (!isNullOrEmpty(osUpdatesDetails)) {

      if (!this.hasSchedule) {
        this._setOsUpdateScheduleByType(OsUpdatesScheduleType.None);
        return;
      }

      let status = null;
      switch(this._osUpdatesDetails.schedule?.type) {
        case OsUpdatesScheduleType.Weekly:
          status = OsUpdatesScheduleType.Weekly;
          break;
        case OsUpdatesScheduleType.Monthly:
          status = OsUpdatesScheduleType.Monthly;
          break;
        case OsUpdatesScheduleType.Custom:
          status = OsUpdatesScheduleType.Custom;
          break;
      }
      
      this._setOsUpdateScheduleByType(status);
    }
  }

  public get clockKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOCK;
  }

  public get isWeekly(): boolean {
    return getSafeProperty(this._osUpdatesScheduleDetails, (obj) => obj.type === OsUpdatesScheduleType.Weekly, false);
  }

  public get isMonthly(): boolean {
    return getSafeProperty(this._osUpdatesScheduleDetails, (obj) => obj.type === OsUpdatesScheduleType.Monthly, false);
  }

  public get isCustom(): boolean {
    return getSafeProperty(this._osUpdatesScheduleDetails, (obj) => obj.type === OsUpdatesScheduleType.Custom, false);
  }

  public get hasSchedule(): boolean {
    let schedule = getSafeProperty(this._osUpdatesDetails, (obj) => obj.schedule);
    return !isNullOrEmpty(schedule);
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
    let scheduleDate = this._buildFormattedScheduleDate(this._osUpdatesDetails.schedule);
    return replacePlaceholder(this._osUpdatesScheduleDetails.sublabel, 'scheduleDate', scheduleDate);
  }

  public get configureButtonLabel(): string {
    if (this.validToUpdateOs) {
      return this._translateService.instant('serverServices.operatingSystemUpdates.validToUpdateOs.updatesScheduleConfigureLink');
    }
    return this._translateService.instant('serverServices.operatingSystemUpdates.invalidToUpdateOs.updatesScheduleConfigureLink');
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

  public hideConfigureLink(): boolean {
    return !this.validToUpdateOs && !this.hasSchedule;
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
  private _buildFormattedScheduleDate(schedule: McsServerOsUpdatesScheduleDetails) {
    let convertedDaysArray = [];

    let time = formatTime(schedule?.time, 'HH:mm', 'h:mm A');
    let subLabel = '';
    switch(schedule?.type) {
      case OsUpdatesScheduleType.Weekly:
        if (schedule.weekdays?.length <= 3) {
          schedule.weekdays.forEach((day) => convertedDaysArray.push(formatTime((day - 1).toString(), 'd', 'ddd')));
          subLabel = `Every ${convertedDaysArray.join(', ')} at ${time}, Sydney time`;
        } else {
          subLabel = `Multiple days each week at ${time}`;
        }
        break;
      case OsUpdatesScheduleType.Monthly:
        if (schedule.weekdayOrdinals?.length <= 3 && schedule.weekdays?.length <= 3) {
          let convertedWeeksArray = [];

          schedule.weekdayOrdinals.forEach((week) => convertedWeeksArray.push(weekText[week]));
          schedule.weekdays.forEach((day) => convertedDaysArray.push(formatTime((day - 1).toString(), 'd', 'ddd')));
          
          if (convertedWeeksArray?.length === 2) {
            subLabel += `${convertedWeeksArray[0]} and ${convertedWeeksArray[1]} `;
          } else {
            subLabel += `${convertedWeeksArray.join(', ')} `;
          }
          if (convertedDaysArray?.length === 2) {
            subLabel += `${convertedDaysArray[0]} and ${convertedDaysArray[1]} `;
          } else {
            subLabel += `${convertedDaysArray.join(', ')} `;
          }
          subLabel += `of each month at ${time}, Sydney time`;
        } else {
          subLabel = `Custom schedule`;
        }
        break;
      case OsUpdatesScheduleType.Custom:
        if (schedule.dates?.length === 1) {
          let dateString = new Date(schedule.dates[0]).toUTCString();
          dateString = dateString.split(' ').slice(0, 5).join(' '); // remove GMT in time
          let formattedDate = this._dateTimeService.formatDate(new Date(dateString), 'fullDate');
          let formattedTime = this._dateTimeService.formatDate(new Date(dateString), 'shortTime');
          subLabel = `${formattedDate} at ${formattedTime}, Sydney time`;
        } else {
          subLabel = `Custom update schedule`;
        }
        break;
    }
    return subLabel;
  }

  private _createScheduleMap(): void {
    this._osUpdatesScheduleDetailsMap = new Map();

    this._osUpdatesScheduleDetailsMap.set(OsUpdatesScheduleType.Monthly, {
      label: osUpdatesScheduleLabel[OsUpdatesScheduleType.Monthly],
      type: OsUpdatesScheduleType.Monthly,
      sublabel: osUpdatesScheduleSubtitleLabel[OsUpdatesScheduleType.Monthly]
    });
    this._osUpdatesScheduleDetailsMap.set(OsUpdatesScheduleType.Weekly, {
      label: osUpdatesScheduleLabel[OsUpdatesScheduleType.Weekly],
      type: OsUpdatesScheduleType.Weekly,
      sublabel: osUpdatesScheduleSubtitleLabel[OsUpdatesScheduleType.Weekly]
    });
    this._osUpdatesScheduleDetailsMap.set(OsUpdatesScheduleType.Custom, {
      label: osUpdatesScheduleLabel[OsUpdatesScheduleType.Custom],
      type: OsUpdatesScheduleType.Custom,
      sublabel: osUpdatesScheduleSubtitleLabel[OsUpdatesScheduleType.Custom]
    });
    this._osUpdatesScheduleDetailsMap.set(OsUpdatesScheduleType.None, {
      label: osUpdatesScheduleLabel[OsUpdatesScheduleType.None],
      type: OsUpdatesScheduleType.None
    });
  }
}
