import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  McsServerBackupVm,
  ServerServicesView,
  backupStatusTypeSubtitleLabel,
  BackupAttemptStatusType,
  backupAttemptStatusTypeMap,
  backupVmStatusTypeLabel,
  backupAttemptStatuLabel
} from '@app/models';
import {
  CommonDefinition,
  replacePlaceholder,
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import { McsDateTimeService } from '@app/core';
import { ServerServiceDetailBase } from '../server-service-detail.base';

// TODO: Extract this when the generic date time service is created
const BACKUP_TIMEZONE = 'Australia/Sydney';
const BACKUP_DATEFORMAT = `EEEE, d MMMM, yyyy 'at' h:mm a`;

type BackupVmStatusDetails = {
  status: BackupAttemptStatusType;
  icon: string;
  label: string;
  sublabel: string;
  detailsLinkFlag: boolean;
};

@Component({
  selector: 'mcs-service-backup-vm',
  templateUrl: './backup-vm.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceBackupVmComponent extends ServerServiceDetailBase implements OnChanges {

  @Input()
  public set serverBackupVm(serverBackupVm: McsServerBackupVm) {
    this._serverBackupVm = serverBackupVm;
  }
  public get serverBackupVm(): McsServerBackupVm {
    return this._serverBackupVm;
  }

  private _backupVmStatusDetailsMap: Map<BackupAttemptStatusType, BackupVmStatusDetails>;
  private _backupVmStatusDetails: BackupVmStatusDetails;
  private _serverBackupVm: McsServerBackupVm;

  constructor(private _dateTimeService: McsDateTimeService) {
    super(ServerServicesView.BackupVm);
    this._createStatusMap();
    this._backupVmStatusDetails = this._backupVmStatusDetailsMap.get(BackupAttemptStatusType.NeverAttempted);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let vmBackupChange = changes['serverBackupVm'];
    if (!isNullOrEmpty(vmBackupChange)) {
      let statusType: BackupAttemptStatusType = backupAttemptStatusTypeMap[this._serverBackupVm.lastBackupAttempt.status];
      this._backupVmStatusDetails = this._backupVmStatusDetailsMap.get(statusType);
    }
  }

  public get statusIcon(): string {
    return getSafeProperty(this._backupVmStatusDetails, (obj) => obj.icon);
  }

  public get statusLabel(): string {
    return getSafeProperty(this._backupVmStatusDetails, (obj) => obj.label);
  }

  public get isStatusUnknown(): boolean {
    return getSafeProperty(this._backupVmStatusDetails, (obj) => obj.status) === BackupAttemptStatusType.Unknown;
  }

  public get statusTooltip(): string {
    return getSafeProperty(this._serverBackupVm, (obj) => backupAttemptStatuLabel[obj.lastBackupAttempt.status]);
  }

  public get statusSublabel(): string {
    let startTime = this._dateTimeService.formatDate(
      this._serverBackupVm.lastBackupAttempt.startedOn,
      BACKUP_DATEFORMAT,
      BACKUP_TIMEZONE
    );
    return getSafeProperty(this._backupVmStatusDetails, (obj) => replacePlaceholder(obj.sublabel, 'formattedDate', startTime));
  }

  public get statusDetailsLinkFlag(): boolean {
    return getSafeProperty(this._backupVmStatusDetails, (obj) => obj.detailsLinkFlag);
  }

  /**
   * Initializes the vm backup status map
   */
  private _createStatusMap(): void {
    this._backupVmStatusDetailsMap = new Map();

    this._backupVmStatusDetailsMap.set(BackupAttemptStatusType.Successful, {
      status: BackupAttemptStatusType.Successful,
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: backupVmStatusTypeLabel[BackupAttemptStatusType.Successful],
      sublabel: backupStatusTypeSubtitleLabel[BackupAttemptStatusType.Successful],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupAttemptStatusType.Failed, {
      status: BackupAttemptStatusType.Failed,
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: backupVmStatusTypeLabel[BackupAttemptStatusType.Failed],
      sublabel: backupStatusTypeSubtitleLabel[BackupAttemptStatusType.Failed],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupAttemptStatusType.InProgress, {
      status: BackupAttemptStatusType.InProgress,
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      label: backupVmStatusTypeLabel[BackupAttemptStatusType.InProgress],
      sublabel: backupStatusTypeSubtitleLabel[BackupAttemptStatusType.InProgress],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupAttemptStatusType.NeverAttempted, {
      status: BackupAttemptStatusType.NeverAttempted,
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: backupVmStatusTypeLabel[BackupAttemptStatusType.NeverAttempted],
      sublabel: backupStatusTypeSubtitleLabel[BackupAttemptStatusType.NeverAttempted],
      detailsLinkFlag: false
    });
  }
}
