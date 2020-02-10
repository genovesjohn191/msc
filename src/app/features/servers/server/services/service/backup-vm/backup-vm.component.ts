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
  BackupStatusType,
  backupStatusTypeMap,
  backupVmStatusTypeLabel,
  backupStatusLabel
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
  status: BackupStatusType;
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

  private _backupVmStatusDetailsMap: Map<BackupStatusType, BackupVmStatusDetails>;
  private _backupVmStatusDetails: BackupVmStatusDetails;
  private _serverBackupVm: McsServerBackupVm;

  constructor(private _dateTimeService: McsDateTimeService) {
    super(ServerServicesView.BackupVm);
    this._createStatusMap();
    this._backupVmStatusDetails = this._backupVmStatusDetailsMap.get(BackupStatusType.NeverAttempted);
  }

  public ngOnChanges(changes: SimpleChanges) {
    let vmBackupChange = changes['serverBackupVm'];
    if (!isNullOrEmpty(vmBackupChange)) {
      let statusType: BackupStatusType = backupStatusTypeMap[this._serverBackupVm.lastBackupAttempt.status];
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
    return getSafeProperty(this._backupVmStatusDetails, (obj) => obj.status) === BackupStatusType.Unknown;
  }

  public get statusTooltip(): string {
    return getSafeProperty(this._serverBackupVm, (obj) => backupStatusLabel[obj.lastBackupAttempt.status]);
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

    this._backupVmStatusDetailsMap.set(BackupStatusType.Successful, {
      status: BackupStatusType.Successful,
      icon: CommonDefinition.ASSETS_SVG_STATE_RUNNING,
      label: backupVmStatusTypeLabel[BackupStatusType.Successful],
      sublabel: backupStatusTypeSubtitleLabel[BackupStatusType.Successful],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupStatusType.Failed, {
      status: BackupStatusType.Failed,
      icon: CommonDefinition.ASSETS_SVG_STATE_STOPPED,
      label: backupVmStatusTypeLabel[BackupStatusType.Failed],
      sublabel: backupStatusTypeSubtitleLabel[BackupStatusType.Failed],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupStatusType.InProgress, {
      status: BackupStatusType.InProgress,
      icon: CommonDefinition.ASSETS_SVG_STATE_RESTARTING,
      label: backupVmStatusTypeLabel[BackupStatusType.InProgress],
      sublabel: backupStatusTypeSubtitleLabel[BackupStatusType.InProgress],
      detailsLinkFlag: true
    });
    this._backupVmStatusDetailsMap.set(BackupStatusType.NeverAttempted, {
      status: BackupStatusType.NeverAttempted,
      icon: CommonDefinition.ASSETS_SVG_STATE_SUSPENDED,
      label: backupVmStatusTypeLabel[BackupStatusType.NeverAttempted],
      sublabel: backupStatusTypeSubtitleLabel[BackupStatusType.NeverAttempted],
      detailsLinkFlag: false
    });
  }
}
